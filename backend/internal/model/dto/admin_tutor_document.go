package dto

import (
	"errors"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
)

type CreateAdminTutorDocumentRequest struct {
	URL  string `json:"url"`
	Name string `json:"name"`
	Type string `json:"type"`
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
	Name    string                    `json:"name"`
	Type    string                    `json:"type"`
	Status  model.TutorDocumentStatus `json:"status"`
}
