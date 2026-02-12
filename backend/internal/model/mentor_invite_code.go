package model

import (
	"time"

	"github.com/google/uuid"
)

type MentorInviteCode struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	TutorID   uuid.UUID `gorm:"type:char(36);not null;uniqueIndex" json:"tutor_id"`
	Code      string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"code"`
	CreatedAt time.Time `json:"created_at"`

	Tutor Tutor `gorm:"foreignKey:TutorID" json:"tutor"`
}

func (MentorInviteCode) TableName() string {
	return "mentor_invite_codes"
}
