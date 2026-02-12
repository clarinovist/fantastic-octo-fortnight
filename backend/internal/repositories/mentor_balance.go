package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type MentorBalanceRepository struct {
	db *gorm.DB
}

func NewMentorBalanceRepository(db *gorm.DB) *MentorBalanceRepository {
	return &MentorBalanceRepository{
		db: db,
	}
}

func (r *MentorBalanceRepository) GetOrCreate(ctx context.Context, tutorID uuid.UUID) (*model.MentorBalance, error) {
	var mb model.MentorBalance
	err := r.db.WithContext(ctx).
		Where("tutor_id = ?", tutorID).
		FirstOrCreate(&mb, model.MentorBalance{
			ID:      uuid.New(),
			TutorID: tutorID,
			Balance: decimal.NewFromInt(0),
		}).Error
	return &mb, err
}

func (r *MentorBalanceRepository) UpdateBalance(ctx context.Context, tutorID uuid.UUID, amount decimal.Decimal) error {
	// Use atomic update: balance = balance + amount
	return r.db.WithContext(ctx).Model(&model.MentorBalance{}).
		Where("tutor_id = ?", tutorID).
		Update("balance", gorm.Expr("balance + ?", amount)).Error
}

func (r *MentorBalanceRepository) CreateTransaction(ctx context.Context, tx *model.BalanceTransaction) error {
	return r.db.WithContext(ctx).Create(tx).Error
}

func (r *MentorBalanceRepository) ListTransactions(ctx context.Context, tutorID uuid.UUID, filter model.Pagination) ([]model.BalanceTransaction, model.Metadata, error) {
	var (
		transactions []model.BalanceTransaction
		total        int64
		metadata     = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	query := r.db.WithContext(ctx).Model(&model.BalanceTransaction{}).
		Where("tutor_id = ?", tutorID).
		Order("created_at DESC")

	if err := query.Count(&total).Error; err != nil {
		return nil, metadata, err
	}

	if err := query.Limit(filter.Limit()).Offset(filter.Offset()).Find(&transactions).Error; err != nil {
		return nil, metadata, err
	}

	metadata.Total = total
	return transactions, metadata, nil
}
