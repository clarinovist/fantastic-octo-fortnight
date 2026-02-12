package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
)

type MentorBalanceAdminService struct {
	withdrawal *repositories.WithdrawalRepository
	balance    *repositories.MentorBalanceRepository
}

func NewMentorBalanceAdminService(
	withdrawal *repositories.WithdrawalRepository,
	balance *repositories.MentorBalanceRepository,
) *MentorBalanceAdminService {
	return &MentorBalanceAdminService{
		withdrawal: withdrawal,
		balance:    balance,
	}
}

func (s *MentorBalanceAdminService) ListAllWithdrawals(ctx context.Context, status string, filter model.Pagination) ([]model.WithdrawalRequest, model.Metadata, error) {
	return s.withdrawal.ListAll(ctx, status, filter)
}

func (s *MentorBalanceAdminService) ApproveWithdrawal(ctx context.Context, id uuid.UUID, adminID uuid.UUID) error {
	w, err := s.withdrawal.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if w.Status != model.WithdrawalStatusPending {
		return shared.MakeError("invalid_status", "Withdrawal request is not pending")
	}

	// Check balance again
	mb, err := s.balance.GetOrCreate(ctx, w.TutorID)
	if err != nil {
		return err
	}

	if mb.Balance.LessThan(w.Amount) {
		return shared.MakeError("insufficient_balance", "Insufficient balance")
	}

	// 1. Deduct balance
	if err := s.balance.UpdateBalance(ctx, w.TutorID, w.Amount.Neg()); err != nil {
		return err
	}

	// 2. Record debit transaction
	tx := &model.BalanceTransaction{
		ID:            uuid.New(),
		TutorID:       w.TutorID,
		Type:          model.BalanceTransactionDebit,
		Amount:        w.Amount,
		ReferenceType: "withdrawal",
		ReferenceID:   w.ID,
		Description:   "Withdrawal approved",
	}
	if err := s.balance.CreateTransaction(ctx, tx); err != nil {
		return err // TODO: Transaction rollback needed in real implementation
	}

	// 3. Update request status
	w.Status = model.WithdrawalStatusCompleted
	now := time.Now()
	w.ProcessedAt = &now
	w.ProcessedBy = uuid.NullUUID{UUID: adminID, Valid: true}

	return s.withdrawal.Update(ctx, w)
}

func (s *MentorBalanceAdminService) RejectWithdrawal(ctx context.Context, id uuid.UUID, adminID uuid.UUID, note string) error {
	w, err := s.withdrawal.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if w.Status != model.WithdrawalStatusPending {
		return shared.MakeError("invalid_status", "Withdrawal request is not pending")
	}

	w.Status = model.WithdrawalStatusRejected
	w.AdminNote = note
	now := time.Now()
	w.ProcessedAt = &now
	w.ProcessedBy = uuid.NullUUID{UUID: adminID, Valid: true}

	return s.withdrawal.Update(ctx, w)
}
