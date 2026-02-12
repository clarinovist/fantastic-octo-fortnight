package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type Lookup struct {
	gorm.Model

	ID          uuid.UUID
	Type        string
	Code        string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   null.Time
}

type LookupFilter struct {
	Pagination
	Sort

	Type string
}
