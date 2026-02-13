package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

const (
	StudentStatusActive   = "active"
	StudentStatusInactive = "inactive"
)

type Student struct {
	ID              uuid.UUID           `gorm:"type:char(36);primary_key" json:"id"`
	UserID          uuid.UUID           `gorm:"type:char(36);not null" json:"user_id"`
	CustomerID      null.String         `gorm:"type:varchar(255);not null" json:"customer_id"`
	User            User                `gorm:"foreignKey:UserID" json:"user"`
	PhotoProfile    null.String         `gorm:"type:varchar(255)" json:"photo_profile"`
	Gender          null.String         `gorm:"type:varchar(50)" json:"gender"`
	DateOfBirth     null.Time           `gorm:"type:date" json:"date_of_birth"`
	PhoneNumber     null.String         `gorm:"type:varchar(20)" json:"phone_number"`
	SocialMediaLink []SocialMediaLink   `gorm:"serializer:social_media_link" json:"social_media_link"`
	Latitude        decimal.NullDecimal `json:"latitude"`
	Longitude       decimal.NullDecimal `json:"longitude"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
	DeletedAt       null.Time           `gorm:"index" json:"deleted_at"`
	CreatedBy       uuid.NullUUID       `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy       uuid.NullUUID       `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy       uuid.NullUUID       `gorm:"type:char(36)" json:"deleted_by"`
	PremiumUntil    null.Time           `json:"premium_until"`
	Status          null.String         `gorm:"type:enum('active','inactive');default:'active'" json:"status"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (s *Student) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (s *Student) IsPremium() bool {
	return s.PremiumUntil.Valid && s.PremiumUntil.Time.After(time.Now())
}

type StudentFilter struct {
	IDs           []uuid.UUID
	UserID        uuid.UUID
	Query         string
	Name          string
	Email         string
	CreatedAtFrom time.Time
	CreatedAtTo   time.Time
	DeletedIsNull null.Bool
	Pagination
	Sort
}
