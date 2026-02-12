package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type SubCourseCategory struct {
	ID               uuid.UUID     `gorm:"type:char(36);primary_key" json:"id"`
	CourseCategoryID uuid.UUID     `gorm:"type:char(36);not null" json:"course_category_id"`
	Name             string        `gorm:"type:varchar(255);not null" json:"name"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
	DeletedAt        null.Time     `gorm:"index" json:"deleted_at,omitempty"`
	CreatedBy        uuid.NullUUID `gorm:"type:char(36)" json:"created_by,omitempty"`
	UpdatedBy        uuid.NullUUID `gorm:"type:char(36)" json:"updated_by,omitempty"`
	DeletedBy        uuid.NullUUID `gorm:"type:char(36)" json:"deleted_by,omitempty"`

	// Relationships
	CourseCategory *CourseCategory `gorm:"foreignKey:CourseCategoryID" json:"course_category,omitempty"`
}

// BeforeCreate generates UUID for new records
func (scc *SubCourseCategory) BeforeCreate(tx *gorm.DB) error {
	if scc.ID == uuid.Nil {
		scc.ID = uuid.New()
	}
	return nil
}

type SubCourseCategoryFilter struct {
	Pagination
	Sort
	CourseCategoryID uuid.UUID `json:"course_category_id"`
	Name             string    `json:"name"`
}
