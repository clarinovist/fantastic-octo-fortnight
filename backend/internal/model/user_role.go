package model

import (
	"github.com/google/uuid"
)

// UserRole represents the many-to-many relationship between users and roles
type UserRole struct {
	UserID uuid.UUID `json:"userId" gorm:"type:char(36);primaryKey;index"`
	RoleID uuid.UUID `json:"roleId" gorm:"type:char(36);primaryKey;index"`

	// Foreign key relationships
	User User `json:"user" gorm:"foreignKey:UserID;"`
	Role Role `json:"role" gorm:"foreignKey:RoleID;"`
}

// TableName returns the table name for the UserRole model
func (UserRole) TableName() string {
	return "user_roles"
}
