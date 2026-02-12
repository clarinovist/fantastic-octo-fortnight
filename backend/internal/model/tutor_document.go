package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type TutorDocumentStatus string

const (
	TutorDocumentStatusActive         TutorDocumentStatus = "active"
	TutorDocumentStatusPendingCreated TutorDocumentStatus = "pending_created"
	TutorDocumentStatusPendingDeleted TutorDocumentStatus = "pending_deleted"
	TutorDocumentStatusInactive       TutorDocumentStatus = "inactive"
)

type TutorDocument struct {
	gorm.Model

	ID        uuid.UUID
	TutorID   uuid.UUID
	URL       string
	Status    TutorDocumentStatus
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt null.Time
	CreatedBy uuid.UUID
	UpdatedBy uuid.UUID
	DeletedBy uuid.NullUUID
}

type TutorDocumentFilter struct {
	ID      uuid.UUID
	TutorID uuid.UUID
	Status  TutorDocumentStatus
	Pagination
	Sort
}
