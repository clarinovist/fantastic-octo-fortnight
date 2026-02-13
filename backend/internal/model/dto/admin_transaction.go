package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type AdminTransactionResponse struct {
	ID            uuid.UUID       `json:"id"`
	TutorID       uuid.UUID       `json:"tutor_id"`
	TutorName     string          `json:"tutor_name"`
	TutorEmail    string          `json:"tutor_email"`
	Type          string          `json:"type"`
	Amount        decimal.Decimal `json:"amount"`
	Commission    decimal.Decimal `json:"commission"`
	ReferenceType string          `json:"reference_type"`
	ReferenceID   uuid.UUID       `json:"reference_id"`
	Description   string          `json:"description"`
	CreatedAt     time.Time       `json:"created_at"`
}

type AdminTransactionStats struct {
	TotalCredit     decimal.Decimal `json:"total_credit"`
	TotalDebit      decimal.Decimal `json:"total_debit"`
	TotalCommission decimal.Decimal `json:"total_commission"`
	TotalCount      int64           `json:"total_count"`
}
