package dto

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
)

type AdminListWithdrawalsRequest struct {
	model.Pagination
	Status string `form:"status"`
}

type AdminWithdrawalResponse struct {
	ID            uuid.UUID       `json:"id"`
	Tutor         AdminTutor      `json:"tutor"`
	Amount        decimal.Decimal `json:"amount"`
	Status        string          `json:"status"`
	BankName      string          `json:"bank_name"`
	AccountNumber string          `json:"account_number"`
	AccountName   string          `json:"account_name"`
	AdminNote     string          `json:"admin_note,omitempty"`
	ProcessedAt   *time.Time      `json:"processed_at,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type ApproveWithdrawalRequest struct {
	ID uuid.UUID `json:"-"`
}

type RejectWithdrawalRequest struct {
	ID   uuid.UUID `json:"-"`
	Note string    `json:"note"`
}

func (r *RejectWithdrawalRequest) Validate() error {
	if strings.TrimSpace(r.Note) == "" {
		return errors.New("note is required")
	}
	return nil
}

func ToAdminWithdrawalResponse(w model.WithdrawalRequest, tutor model.Tutor) AdminWithdrawalResponse {
	return AdminWithdrawalResponse{
		ID: w.ID,
		Tutor: AdminTutor{
			ID:          tutor.ID,
			UserID:      tutor.UserID,
			Name:        tutor.User.Name,
			PhoneNumber: tutor.User.PhoneNumber,
			Email:       tutor.User.Email,
			Status:      tutor.StatusLabel(),
			CreatedAt:   tutor.CreatedAt,
			UpdatedAt:   tutor.UpdatedAt,
		},
		Amount:        w.Amount,
		Status:        string(w.Status),
		BankName:      w.BankName,
		AccountNumber: w.AccountNumber,
		AccountName:   w.AccountName,
		AdminNote:     w.AdminNote,
		ProcessedAt:   w.ProcessedAt,
		CreatedAt:     w.CreatedAt,
		UpdatedAt:     w.UpdatedAt,
	}
}
