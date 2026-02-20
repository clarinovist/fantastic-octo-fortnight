package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
		First(&mb).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			newMb := model.MentorBalance{
				ID:      uuid.New(),
				TutorID: tutorID,
				Balance: decimal.NewFromInt(0),
			}
			// Use OnConflict DoNothing to handle race conditions gracefully
			err = r.db.WithContext(ctx).
				Clauses(clause.OnConflict{DoNothing: true}).
				Create(&newMb).Error
			if err != nil {
				return nil, err
			}
			// Fetch again to ensure we have the correct record (created by us or concurrently)
			err = r.db.WithContext(ctx).Where("tutor_id = ?", tutorID).First(&mb).Error
			return &mb, err
		}
		return nil, err
	}

	return &mb, nil
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

func (r *MentorBalanceRepository) ListAllTransactions(ctx context.Context, filter model.Pagination, tutorName string, txType string) ([]model.BalanceTransaction, model.Metadata, error) {
	var (
		transactions []model.BalanceTransaction
		total        int64
		metadata     = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	query := r.db.WithContext(ctx).Model(&model.BalanceTransaction{}).
		Joins("JOIN tutors ON balance_transactions.tutor_id = tutors.id").
		Joins("JOIN users ON tutors.user_id = users.id").
		Order("balance_transactions.created_at DESC")

	if tutorName != "" {
		query = query.Where("users.name LIKE ?", "%"+tutorName+"%")
	}

	if txType != "" {
		query = query.Where("balance_transactions.type = ?", txType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, metadata, err
	}

	if err := query.Preload("Tutor.User").Limit(filter.Limit()).Offset(filter.Offset()).Find(&transactions).Error; err != nil {
		return nil, metadata, err
	}

	metadata.Total = total
	return transactions, metadata, nil
}
