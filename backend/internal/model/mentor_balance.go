package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type MentorBalance struct {
	ID        uuid.UUID       `gorm:"type:char(36);primaryKey" json:"id"`
	TutorID   uuid.UUID       `gorm:"type:char(36);not null;uniqueIndex" json:"tutor_id"`
	Balance   decimal.Decimal `gorm:"type:decimal(15,2);default:0" json:"balance"`
	UpdatedAt time.Time       `json:"updated_at"`

	Tutor Tutor `gorm:"foreignKey:TutorID" json:"tutor"`
}

func (MentorBalance) TableName() string {
	return "mentor_balances"
}

type BalanceTransactionType string

const (
	BalanceTransactionCredit BalanceTransactionType = "credit"
	BalanceTransactionDebit  BalanceTransactionType = "debit"
)

type BalanceTransaction struct {
	ID            uuid.UUID              `gorm:"type:char(36);primaryKey" json:"id"`
	TutorID       uuid.UUID              `gorm:"type:char(36);not null;index" json:"tutor_id"`
	Type          BalanceTransactionType `gorm:"type:enum('credit','debit');not null" json:"type"`
	Amount        decimal.Decimal        `gorm:"type:decimal(15,2);not null" json:"amount"`
	Commission    decimal.Decimal        `gorm:"type:decimal(15,2);default:0" json:"commission"`
	ReferenceType string                 `gorm:"type:varchar(50)" json:"reference_type"` // 'booking_payment', 'withdrawal'
	ReferenceID   uuid.UUID              `gorm:"type:char(36)" json:"reference_id"`
	Description   string                 `gorm:"type:varchar(255)" json:"description"`
	CreatedAt     time.Time              `json:"created_at"`
}

func (BalanceTransaction) TableName() string {
	return "balance_transactions"
}
