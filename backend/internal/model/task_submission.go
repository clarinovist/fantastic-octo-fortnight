package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type TaskSubmission struct {
	ID            uuid.UUID           `gorm:"type:char(36);primary_key" json:"id"`
	SessionTaskID uuid.UUID           `gorm:"type:char(36);not null" json:"session_task_id"`
	SubmissionURL null.String         `gorm:"type:varchar(255)" json:"submission_url"`
	Score         decimal.NullDecimal `gorm:"type:decimal(5,2)" json:"score"` // example: 100.00
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
	DeletedAt     null.Time           `gorm:"index" json:"deleted_at"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (t *TaskSubmission) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
