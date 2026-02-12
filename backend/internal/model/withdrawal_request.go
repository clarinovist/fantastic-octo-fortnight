package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type WithdrawalStatus string

const (
	WithdrawalStatusPending    WithdrawalStatus = "pending"
	WithdrawalStatusProcessing WithdrawalStatus = "processing"
	WithdrawalStatusCompleted  WithdrawalStatus = "completed"
	WithdrawalStatusRejected   WithdrawalStatus = "rejected"
)

type WithdrawalRequest struct {
	ID            uuid.UUID        `gorm:"type:char(36);primaryKey" json:"id"`
	TutorID       uuid.UUID        `gorm:"type:char(36);not null;index" json:"tutor_id"`
	Amount        decimal.Decimal  `gorm:"type:decimal(15,2);not null" json:"amount"`
	BankName      string           `gorm:"type:varchar(100)" json:"bank_name"`
	AccountNumber string           `gorm:"type:varchar(50)" json:"account_number"`
	AccountName   string           `gorm:"type:varchar(100)" json:"account_name"`
	Status        WithdrawalStatus `gorm:"type:enum('pending','processing','completed','rejected');default:'pending'" json:"status"`
	AdminNote     string           `gorm:"type:varchar(500)" json:"admin_note"`
	ProcessedAt   *time.Time       `json:"processed_at"`
	ProcessedBy   uuid.NullUUID    `gorm:"type:char(36)" json:"processed_by"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`

	Tutor Tutor `gorm:"foreignKey:TutorID" json:"tutor"`
}

func (WithdrawalRequest) TableName() string {
	return "withdrawal_requests"
}
