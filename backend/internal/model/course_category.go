package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type CourseCategory struct {
	gorm.Model

	ID        uuid.UUID
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt null.Time
	CreatedBy uuid.NullUUID
	UpdatedBy uuid.NullUUID
	DeletedBy uuid.NullUUID
}

type CourseCategoryFilter struct {
	Pagination
	Sort
	Query string
}
