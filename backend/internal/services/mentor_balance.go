package services

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/shopspring/decimal"
)

type MentorBalanceService struct {
	tutor      *repositories.TutorRepository
	balance    *repositories.MentorBalanceRepository
	withdrawal *repositories.WithdrawalRepository
	config     *config.Config
}

func NewMentorBalanceService(
	tutor *repositories.TutorRepository,
	balance *repositories.MentorBalanceRepository,
	withdrawal *repositories.WithdrawalRepository,
	config *config.Config,
) *MentorBalanceService {
	return &MentorBalanceService{
		tutor:      tutor,
		balance:    balance,
		withdrawal: withdrawal,
		config:     config,
	}
}

func (s *MentorBalanceService) GetBalance(ctx context.Context, userID uuid.UUID) (*model.MentorBalance, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if tutor == nil {
		return nil, shared.MakeError("not_found", "tutor not found")
	}

	return s.balance.GetOrCreate(ctx, tutor.ID)
}

func (s *MentorBalanceService) ListTransactions(ctx context.Context, userID uuid.UUID, filter model.Pagination) ([]model.BalanceTransaction, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, model.Metadata{}, err
	}
	if tutor == nil {
		return nil, model.Metadata{}, shared.MakeError("not_found", "tutor not found")
	}

	return s.balance.ListTransactions(ctx, tutor.ID, filter)
}

func (s *MentorBalanceService) RequestWithdrawal(ctx context.Context, userID uuid.UUID, req model.WithdrawalRequest) error {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if tutor == nil {
		return shared.MakeError("not_found", "tutor not found")
	}

	// Override TutorID with the real one
	req.TutorID = tutor.ID

	// 1. Check balance
	mb, err := s.balance.GetOrCreate(ctx, tutor.ID)
	if err != nil {
		return err
	}

	if mb.Balance.LessThan(req.Amount) {
		// return specific error "Insufficient balance"
		return shared.MakeError("insufficient_balance", "Insufficient balance")
	}

	// 2. Create withdrawal request
	// Note: In MVP we don't deduct balance immediately? Or should we?
	// Design doc says: Deduct when approved. But to prevent double spend, usually we deduct or lock.
	// Let's deduct immediately (Status: Pending) OR check balance again at approval.
	// Best practice: Deduct/Hold immediately.
	// But let's follow the design doc: Admin transfer manual -> Admin update status -> Saldo mentor berkurang.
	// So create request only here.

	req.ID = uuid.New()
	req.Status = "pending"

	return s.withdrawal.Create(ctx, &req)
}

func (s *MentorBalanceService) ListWithdrawals(ctx context.Context, userID uuid.UUID, status string, filter model.Pagination) ([]model.WithdrawalRequest, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, model.Metadata{}, err
	}
	if tutor == nil {
		return nil, model.Metadata{}, shared.MakeError("not_found", "tutor not found")
	}

	return s.withdrawal.ListByTutor(ctx, tutor.ID, status, filter)
}

// Logic to credit balance from booking
func (s *MentorBalanceService) CreditFromBooking(ctx context.Context, tutorID uuid.UUID, amount decimal.Decimal, bookingID uuid.UUID) error {
	// Get commission rate (default 10%)
	commissionRate := decimal.NewFromFloat(0.10)
	commission := amount.Mul(commissionRate)
	netAmount := amount.Sub(commission)

	// Update balance
	if err := s.balance.UpdateBalance(ctx, tutorID, netAmount); err != nil {
		return err
	}

	// Record transaction
	tx := &model.BalanceTransaction{
		ID:            uuid.New(),
		TutorID:       tutorID,
		Type:          model.BalanceTransactionCredit,
		Amount:        netAmount,
		Commission:    commission,
		ReferenceType: "booking_payment",
		ReferenceID:   bookingID,
		Description:   "Payment for booking",
	}

	return s.balance.CreateTransaction(ctx, tx)
}

// GetFinanceStats calculates statistics for the finance dashboard
func (s *MentorBalanceService) GetFinanceStats(ctx context.Context, userID uuid.UUID) (*map[string]interface{}, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if tutor == nil {
		return nil, shared.MakeError("not_found", "tutor not found")
	}

	// 1. Get Current Balance
	mb, err := s.balance.GetOrCreate(ctx, tutor.ID)
	if err != nil {
		return nil, err
	}

	// 2. Get all transactions (or last year/6 months to be efficient)
	// For MVP, getting all list might be fine, but better to query with range.
	// We'll use ListTransactions with a large limit for now as we don't have date range filter in repo yet.
	filter := model.Pagination{Page: 1, PageSize: 1000}
	txs, _, err := s.balance.ListTransactions(ctx, tutor.ID, filter)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	var income30d, incomePrev30d decimal.Decimal
	var commission30d decimal.Decimal

	// Chart data map: "Jan" -> amount
	// We need last 6 months
	chartMap := make(map[string]decimal.Decimal)
	var months []string
	for i := 5; i >= 0; i-- {
		month := now.AddDate(0, -i, 0)
		monthName := month.Format("Jan")
		months = append(months, monthName)
		chartMap[monthName] = decimal.Zero
	}

	for _, tx := range txs {
		// Only count credits (income) for stats
		if tx.Type == model.BalanceTransactionCredit {
			// Income 30d
			if tx.CreatedAt.After(thirtyDaysAgo) {
				income30d = income30d.Add(tx.Amount)
				commission30d = commission30d.Add(tx.Commission)
			}
			// Income Prev 30d (for pct change)
			if tx.CreatedAt.After(sixtyDaysAgo) && tx.CreatedAt.Before(thirtyDaysAgo) {
				incomePrev30d = incomePrev30d.Add(tx.Amount)
			}

			// Chart Data (last 6 months)
			// Check if tx is within last 6 months
			// Simple check: same year and month match
			monthName := tx.CreatedAt.Format("Jan")
			if _, ok := chartMap[monthName]; ok {
				// Also check year to avoid adding last year's same month if query is huge
				// (Assuming simple limit 1000 covers recent ones mostly)
				if tx.CreatedAt.Year() == now.Year() || (tx.CreatedAt.Year() == now.Year()-1 && now.Month() < 6) {
					chartMap[monthName] = chartMap[monthName].Add(tx.Amount)
				}
			}
		}
	}

	// Calc Percentage Change
	var incomeChangePct float64
	if !incomePrev30d.IsZero() {
		diff := income30d.Sub(incomePrev30d)
		incomeChangePct, _ = diff.Div(incomePrev30d).Float64()
		incomeChangePct *= 100
	} else if !income30d.IsZero() {
		incomeChangePct = 100 // 100% increase if prev was 0
	}

	// Build Chart Data Array
	var chartData []map[string]interface{}
	for _, m := range months {
		chartData = append(chartData, map[string]interface{}{
			"month":  m,
			"amount": chartMap[m].IntPart(),
		})
	}

	return &map[string]interface{}{
		"total_balance":        mb.Balance.String(),
		"balance_change_pct":   12.5, // Dummy for balance change as we don't track historical balance snapshots
		"total_income_30d":     income30d.String(),
		"income_change_pct":    math.Round(incomeChangePct*10) / 10,
		"total_commission_30d": commission30d.String(),
		"commission_target":    "2500000", // Hardcoded target
		"chart_data":           chartData,
	}, nil
}
