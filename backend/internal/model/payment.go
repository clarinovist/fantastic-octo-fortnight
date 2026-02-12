package model

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
)

type Payment struct {
	ID            uuid.UUID
	ReferenceID   string
	StudentID     uuid.UUID
	InvoiceNumber string
	Interval      SubscriptionInterval
	IntervalCount int
	StartDate     time.Time
	EndDate       time.Time
	Amount        decimal.Decimal
	PaidAt        null.Time
	URL           string
	Status        SubscriptionStatus
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     null.Time
	CreatedBy     uuid.UUID
	UpdatedBy     uuid.UUID
	DeletedBy     uuid.NullUUID

	Student Student `gorm:"foreignKey:StudentID"`
}

func (p *Payment) Name() string {
	switch p.Interval {
	case SubscriptionIntervalMonthly:
		return "Premium Bulanan"
	case SubscriptionIntervalYearly:
		return "Premium Tahunan"
	default:
		return ""
	}
}

func (p *Payment) GenerateInvoiceNumber() {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 5

	randomCode := make([]byte, length)
	for i := range randomCode {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		randomCode[i] = charset[num.Int64()]
	}

	p.InvoiceNumber = fmt.Sprintf("INV%s%s", time.Now().Format("060102"), string(randomCode))
}

func (p *Payment) VatAmount() decimal.Decimal {
	return p.Amount.Mul(decimal.NewFromFloat(0.11))
}

func (p *Payment) StatusLabel() SubscriptionStatus {
	if time.Now().After(p.EndDate) {
		return SubscriptionStatusInActive
	}

	return p.Status
}

type PaymentFilter struct {
	StudentID uuid.UUID
	StatusIn  []string

	Pagination
	Sort
}
