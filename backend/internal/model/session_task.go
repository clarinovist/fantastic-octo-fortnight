package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type SessionTask struct {
	ID            uuid.UUID        `gorm:"type:char(36);primary_key" json:"id"`
	BookingID     uuid.UUID        `gorm:"type:char(36);not null" json:"booking_id"`
	Title         string           `gorm:"type:varchar(255);not null" json:"title"`
	Description   null.String      `gorm:"type:text" json:"description"`
	AttachmentURL null.String      `gorm:"type:varchar(255)" json:"attachment_url"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
	DeletedAt     null.Time        `gorm:"index" json:"deleted_at"`

	TaskSubmissions []TaskSubmission `gorm:"foreignKey:SessionTaskID" json:"task_submissions"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (s *SessionTask) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
