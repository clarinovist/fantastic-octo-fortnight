package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseView struct {
	ID               uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	TutorID          uuid.UUID `gorm:"type:char(36);not null;index" json:"tutor_id"`
	UserID           uuid.UUID `gorm:"type:char(36);null;index" json:"user_id"`
	CourseID         uuid.UUID `gorm:"type:char(36);not null;index" json:"course_id"`
	CourseCategoryID uuid.UUID `gorm:"type:char(36);not null;index" json:"course_category_id"`
	IPAddress        string    `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent        string    `gorm:"type:text" json:"user_agent"`
	CreatedAt        time.Time `gorm:"index" json:"created_at"`
}

func (cv *CourseView) BeforeCreate(tx *gorm.DB) error {
	if cv.ID == uuid.Nil {
		cv.ID = uuid.New()
	}
	return nil
}

type CourseViewFilter struct {
	TutorID          uuid.UUID
	UserID           uuid.UUID
	CourseID         uuid.UUID
	CourseCategoryID uuid.UUID
	StartDate        time.Time
	EndDate          time.Time
	Pagination
	Sort
}
