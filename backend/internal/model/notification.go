package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
)

type BroadcastNotificationType string

const (
	EmailBroadcastNotificationType        BroadcastNotificationType = "email"
	NotificationBroadcastNotificationType BroadcastNotificationType = "notification"
)

const (
	NotificationTitleTutorProfile = "Tutor Profile"
)

type NotificationType string

const (
	NotificationTypeError   NotificationType = "error"
	NotificationTypeWarning NotificationType = "warning"
	NotificationTypeInfo    NotificationType = "info"
	NotificationTypeSuccess NotificationType = "success"
)

type Notification struct {
	ID           uuid.UUID        `gorm:"type:char(36);primary_key"`
	UserID       uuid.UUID        `gorm:"type:char(36);not null"`
	Type         NotificationType `gorm:"type:varchar(255);not null"`
	Title        string           `gorm:"type:varchar(255);not null"`
	Message      string           `gorm:"type:text;not null"`
	Link         string           `gorm:"type:varchar(255)"`
	IsRead       bool             `gorm:"not null default false"`
	IsDismissed  bool             `gorm:"not null default false"`
	IsDeleteable bool             `gorm:"not null default true"`
	CreatedAt    time.Time        `gorm:"not null default now()"`
	UpdatedAt    time.Time        `gorm:"not null default now() on update now()"`
	DeletedAt    null.Time        `gorm:"index"`
	CreatedBy    uuid.UUID        `gorm:"type:char(36)"`
	UpdatedBy    uuid.UUID        `gorm:"type:char(36)"`
	DeletedBy    uuid.NullUUID    `gorm:"type:char(36)"`
}

type NotificationFilter struct {
	Pagination
	Sort
	UserID          uuid.UUID
	Title           string
	IsDismissed     null.Bool
	IsRead          null.Bool
	IsDeleted       null.Bool
	CreatedAtBefore null.Time
}
