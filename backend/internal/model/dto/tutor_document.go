package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
)

type CreateTutorDocumentRequest struct {
	URL  string `json:"document"`
	Name string `json:"name"`
	Type string `json:"type"`
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
	Name      string                    `json:"name"`
	Type      string                    `json:"type"`
	Status    model.TutorDocumentStatus `json:"status"`
	CreatedAt time.Time                 `json:"created_at"`
	UpdatedAt time.Time                 `json:"updated_at"`
}
