package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
)

type ReportBookingStatus string

const (
	ReportBookingStatusPending ReportBookingStatus = "pending"
	ReportBookingStatusDone    ReportBookingStatus = "done"
	ReportBookingStatusCancel  ReportBookingStatus = "cancel"
)

type ReportBooking struct {
	ID        uuid.UUID           `gorm:"type:char(36);primary_key" json:"id"`
	BookingID uuid.UUID           `gorm:"type:char(36);not null" json:"booking_id"`
	StudentID uuid.UUID           `gorm:"type:char(36);not null" json:"report_id"`
	Topic     string              `gorm:"type:varchar(255);not null" json:"topic"`
	Body      string              `gorm:"type:text;not null" json:"body"`
	Status    ReportBookingStatus `gorm:"type:varchar(255);not null" json:"status"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
	DeletedAt null.Time           `json:"deleted_at"`
	CreatedBy uuid.UUID           `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy uuid.UUID           `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy uuid.NullUUID       `gorm:"type:char(36)" json:"deleted_by"`
}
