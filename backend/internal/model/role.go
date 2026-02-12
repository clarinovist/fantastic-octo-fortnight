package model

import (
	"time"

	"github.com/google/uuid"
)

const (
	RoleNameAdmin   = "admin"
	RoleNameStudent = "student"
	RoleNameTutor   = "tutor"
)

// Role represents a role in the system
type Role struct {
	ID        uuid.UUID  `json:"id" gorm:"type:char(36);primaryKey"`
	Name      string     `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" gorm:"index"`
}

// TableName returns the table name for the Role model
func (Role) TableName() string {
	return "roles"
}
