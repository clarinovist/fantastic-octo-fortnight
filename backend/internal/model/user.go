package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/gorm"
)

type LoginSource string

const (
	LoginSourceEmail  LoginSource = "email"
	LoginSourceGoogle LoginSource = "google"
)

type User struct {
	gorm.Model

	ID          uuid.UUID
	Name        string
	Email       string
	PhoneNumber string
	Password    string
	LoginSource LoginSource `gorm:"type:enum('email','google');default:'email';not null"`
	VerifiedAt  null.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   null.Time
	CreatedBy   uuid.NullUUID
	UpdatedBy   uuid.NullUUID
	DeletedBy   uuid.NullUUID

	// Relationships
	Roles []Role `json:"roles" gorm:"many2many:user_roles;"`
}

func (u *User) FirstRole() Role {
	if len(u.Roles) == 0 {
		return Role{}
	}

	return u.Roles[0]
}

type UserFilter struct {
	IDs             []uuid.UUID
	DeletedAtIsNull null.Bool
	Pagination
	Sort
}
