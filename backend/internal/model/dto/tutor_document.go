package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
)

type CreateTutorDocumentRequest struct {
	URL string `json:"document"`
}

func (r *CreateTutorDocumentRequest) Validate() error {
	if r.URL == "" {
		return errors.New("url is required")
	}

	return nil
}

type ListTutorDocumentRequest struct {
	model.Pagination
}

type TutorDocumentResponse struct {
	ID        uuid.UUID                 `json:"id"`
	URL       string                    `json:"url"`
	Status    model.TutorDocumentStatus `json:"status"`
	CreatedAt time.Time                 `json:"created_at"`
	UpdatedAt time.Time                 `json:"updated_at"`
}
