package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/shared"
)

type FileService struct {
	config *config.Config
	linode *infras.Linode
}

func NewFileService(config *config.Config, linode *infras.Linode) *FileService {
	return &FileService{
		config: config,
		linode: linode,
	}
}

// UploadFile uploads a file to Linode Object Storage
func (s *FileService) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader) (*dto.UploadResult, error) {
	// Validate file size
	if header.Size > s.config.File.MaxUploadSize {
		return nil, fmt.Errorf("file size %d bytes exceeds maximum allowed size %d bytes", header.Size, s.config.File.MaxUploadSize)
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	key := fmt.Sprintf("uploads/%s", filename)

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		log.Error().Err(err).Msg("failed to read file content")
		return nil, fmt.Errorf("failed to read file content: %w", err)
	}

	// Detect content type
	contentType := s.detectContentType(header.Filename, fileBytes)

	// Upload to Linode Object Storage
	_, err = s.linode.Client.PutObjectWithContext(ctx, &s3.PutObjectInput{
		Bucket:             aws.String(s.config.Linode.BucketName),
		Key:                aws.String(key),
		Body:               bytes.NewReader(fileBytes),
		ContentLength:      aws.Int64(header.Size),
		ContentType:        aws.String(contentType),
		ContentDisposition: aws.String("inline"),
		ACL:                aws.String("public-read"), // Make file publicly accessible
	})
	if err != nil {
		log.Error().Err(err).Str("key", key).Msg("failed to upload file to Linode")
		return nil, shared.MakeError(ErrInternalServer)
	}

	// Generate public URL
	url := fmt.Sprintf("%s/%s", s.config.Linode.BucketURL, key)

	log.Info().
		Str("filename", header.Filename).
		Str("key", key).
		Str("url", url).
		Int64("size", header.Size).
		Msg("file uploaded successfully")

	return &dto.UploadResult{
		URL:      url,
		Key:      key,
		Filename: header.Filename,
		Size:     header.Size,
	}, nil
}

// detectContentType detects the content type based on file extension
func (s *FileService) detectContentType(filename string, content []byte) string {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".pdf":
		return "application/pdf"
	case ".doc":
		return "application/msword"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".txt":
		return "text/plain"
	case ".mp4":
		return "video/mp4"
	case ".mp3":
		return "audio/mpeg"
	default:
		return "application/octet-stream"
	}
}

// ValidateFileType validates if the file type is allowed
func (s *FileService) ValidateFileType(filename string) error {
	ext := strings.ToLower(filepath.Ext(filename))

	allowedTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".pdf":  true,
		".doc":  true,
		".docx": true,
		".txt":  true,
		".mp4":  true,
		".mp3":  true,
	}

	if !allowedTypes[ext] {
		return fmt.Errorf("file type %s is not allowed", ext)
	}

	return nil
}
