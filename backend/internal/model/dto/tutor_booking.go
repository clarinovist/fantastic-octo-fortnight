package dto

import (
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
)

type ListTutorBookingRequest struct {
	model.Pagination
	model.Sort
}

type ApproveTutorBookingRequest struct {
	ID    uuid.UUID   `json:"-"`
	Notes null.String `json:"notes"`
}

type DeclineTutorBookingRequest struct {
	ID    uuid.UUID   `json:"-"`
	Notes null.String `json:"notes"`
}
