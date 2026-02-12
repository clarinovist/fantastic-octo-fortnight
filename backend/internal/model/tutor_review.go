package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
)

type TutorReview struct {
	ID                 uuid.UUID     `gorm:"type:char(36);primary_key" json:"id"`
	BookingID          uuid.UUID     `gorm:"type:char(36);not null" json:"booking_id"`
	CourseID           uuid.UUID     `gorm:"type:char(36);not null" json:"course_id"`
	TutorID            uuid.UUID     `gorm:"type:char(36);not null" json:"tutor_id"`
	StudentID          uuid.UUID     `gorm:"type:char(36);not null" json:"student_id"`
	Review             null.String   `gorm:"type:text" json:"review"`
	Rate               null.Int      `json:"rate"`
	RecommendByStudent null.String   `gorm:"type:varchar(255)" json:"recommend_by_student"`
	IsSubmitted        bool          `json:"is_submitted"`
	CreatedAt          time.Time     `json:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at"`
	DeletedAt          null.Time     `json:"deleted_at"`
	CreatedBy          uuid.NullUUID `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy          uuid.NullUUID `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy          uuid.NullUUID `gorm:"type:char(36)" json:"deleted_by"`

	Booking Booking `gorm:"foreignKey:BookingID" json:"booking"`
	Course  Course  `gorm:"foreignKey:CourseID" json:"course"`
	Tutor   Tutor   `gorm:"foreignKey:TutorID" json:"tutor"`
	Student Student `gorm:"foreignKey:StudentID" json:"student"`
}
