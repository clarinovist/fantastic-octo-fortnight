package model

import (
	"time"

	"github.com/google/uuid"
)

type MentorStudent struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	TutorID   uuid.UUID `gorm:"type:char(36);not null;uniqueIndex:idx_tutor_student" json:"tutor_id"`
	StudentID uuid.UUID `gorm:"type:char(36);not null;uniqueIndex:idx_tutor_student" json:"student_id"`
	JoinedAt  time.Time `gorm:"autoCreateTime" json:"joined_at"`
	Status    string    `gorm:"type:enum('active','inactive');default:'active'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Virtual fields
	TotalSessions int64 `gorm:"-" json:"total_sessions"`

	Tutor   Tutor   `gorm:"foreignKey:TutorID" json:"tutor"`
	Student Student `gorm:"foreignKey:StudentID" json:"student"`
}

func (MentorStudent) TableName() string {
	return "mentor_students"
}
