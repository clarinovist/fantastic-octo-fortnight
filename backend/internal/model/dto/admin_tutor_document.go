package dto

import (
	"errors"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
)

type CreateAdminTutorDocumentRequest struct {
	URL string `json:"url"`
}

func (r *CreateAdminTutorDocumentRequest) Validate() error {
	if r.URL == "" {
		return errors.New("url is required")
	}

	return nil
}

type AdminTutorDocument struct {
	ID      uuid.UUID                 `json:"id"`
	TutorID uuid.UUID                 `json:"tutorId"`
	URL     string                    `json:"url"`
	Status  model.TutorDocumentStatus `json:"status"`
}
