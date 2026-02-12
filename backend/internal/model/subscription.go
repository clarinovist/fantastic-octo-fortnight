package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
)

const (
	SubscriptionMonthlyID = "30e88d1b-2ed9-4ec3-81a3-f55e8b1df669"
	SubscriptionYearlyID  = "95698aaf-2bd6-4f4f-abb2-a360d735718d"
)

type SubscriptionInterval string

const (
	SubscriptionIntervalMonthly SubscriptionInterval = "monthly"
	SubscriptionIntervalYearly  SubscriptionInterval = "yearly"
)

type SubscriptionStatus string

func (s SubscriptionStatus) InvoiceLabel() string {
	switch s {
	case SubscriptionStatusActive,
		SubscriptionStatusInActive:
		return "Paid"
	default:
		return "Unpaid"
	}
}

const (
	SubscriptionStatusActive   SubscriptionStatus = "active"
	SubscriptionStatusInActive SubscriptionStatus = "in_active"
	SubscriptionStatusPending  SubscriptionStatus = "pending"
	SubscriptionStatusCanceled SubscriptionStatus = "canceled"
	SubscriptionStatusExpired  SubscriptionStatus = "expired"
)

type Subscription struct {
	ID            uuid.UUID            `gorm:"type:char(36);primary_key" json:"id"`
	ReferenceID   string               `gorm:"type:varchar(255);not null" json:"reference_id"`
	StudentID     uuid.UUID            `gorm:"type:char(36);not null" json:"student_id"`
	Interval      SubscriptionInterval `gorm:"type:varchar(255);not null" json:"interval"`
	IntervalCount int                  `json:"interval_count"`
	StartDate     time.Time            `json:"start_date"`
	EndDate       time.Time            `json:"end_date"`
	Currency      string               `gorm:"type:char(3);not null" json:"currency"`
	Amount        decimal.Decimal      `gorm:"type:decimal(12,2);not null" json:"amount"`
	Status        SubscriptionStatus   `gorm:"type:varchar(255);not null" json:"status"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
	DeletedAt     null.Time            `json:"deleted_at"`
	CreatedBy     uuid.UUID            `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy     uuid.UUID            `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy     uuid.NullUUID        `gorm:"type:char(36)" json:"deleted_by"`

	Student       Student `gorm:"foreignKey:StudentID;references:ID"`
	InvoiceNumber string  `gorm:"-"`
}

func (s Subscription) Name() string {
	switch s.Interval {
	case SubscriptionIntervalMonthly:
		return "Premium Bulanan"
	case SubscriptionIntervalYearly:
		return "Premium Tahunan"
	default:
		return ""
	}
}

func (s Subscription) VatAmount() decimal.Decimal {
	return s.Amount.Mul(decimal.NewFromFloat(0.11))
}

type SubscriptionFilter struct {
	StudentID uuid.UUID
	Status    SubscriptionStatus
	Pagination
}
