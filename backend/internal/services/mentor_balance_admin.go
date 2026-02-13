package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
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

func (s *MentorBalanceAdminService) ListAllTransactions(ctx context.Context, filter model.Pagination, tutorName string, txType string) ([]dto.AdminTransactionResponse, model.Metadata, error) {
	txs, metadata, err := s.balance.ListAllTransactions(ctx, filter, tutorName, txType)
	if err != nil {
		return nil, metadata, fmt.Errorf("repo failed to list transactions: %w", err)
	}

	var res []dto.AdminTransactionResponse
	for _, tx := range txs {
		res = append(res, dto.AdminTransactionResponse{
			ID:            tx.ID,
			TutorID:       tx.TutorID,
			TutorName:     tx.Tutor.User.Name,
			TutorEmail:    tx.Tutor.User.Email,
			Type:          string(tx.Type),
			Amount:        tx.Amount,
			Commission:    tx.Commission,
			ReferenceType: tx.ReferenceType,
			ReferenceID:   tx.ReferenceID,
			Description:   tx.Description,
			CreatedAt:     tx.CreatedAt,
		})
	}

	return res, metadata, nil
}

func (s *MentorBalanceAdminService) GetTransactionStats(ctx context.Context) (*dto.AdminTransactionStats, error) {
	// For MVP, we can iterate all or query summary from DB.
	// Let's use ListAllTransactions with a large limit for simplicity or create a specific repo method.
	// Since it's admin dashboard stats, a specific repo method is better.
	// But let's check if we can just reuse ListAllTransactions for now.
	filter := model.Pagination{Page: 1, PageSize: 10000}
	txs, _, err := s.balance.ListAllTransactions(ctx, filter, "", "")
	if err != nil {
		return nil, fmt.Errorf("failed to list all transactions for stats: %w", err)
	}

	var stats dto.AdminTransactionStats
	for _, tx := range txs {
		if tx.Type == model.BalanceTransactionCredit {
			stats.TotalCredit = stats.TotalCredit.Add(tx.Amount)
			stats.TotalCommission = stats.TotalCommission.Add(tx.Commission)
		} else if tx.Type == model.BalanceTransactionDebit {
			stats.TotalDebit = stats.TotalDebit.Add(tx.Amount)
		}
	}
	stats.TotalCount = int64(len(txs))

	return &stats, nil
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
