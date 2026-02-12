package model

import (
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
)

type ReviewFilter struct {
	StudentID       uuid.UUID
	TutorID         uuid.UUID
	DeletedAtIsNull null.Bool
	Pagination
	Sort
}
