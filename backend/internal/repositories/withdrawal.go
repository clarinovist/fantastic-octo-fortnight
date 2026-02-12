package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"gorm.io/gorm"
)

type WithdrawalRepository struct {
	db *gorm.DB
}

func NewWithdrawalRepository(db *gorm.DB) *WithdrawalRepository {
	return &WithdrawalRepository{
		db: db,
	}
}

func (r *WithdrawalRepository) Create(ctx context.Context, w *model.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Create(w).Error
}

func (r *WithdrawalRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.WithdrawalRequest, error) {
	var w model.WithdrawalRequest
	if err := r.db.WithContext(ctx).Preload("Tutor.User").First(&w, id).Error; err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WithdrawalRepository) ListByTutor(ctx context.Context, tutorID uuid.UUID, status string, filter model.Pagination) ([]model.WithdrawalRequest, model.Metadata, error) {
	var (
		withdrawals []model.WithdrawalRequest
		total       int64
		metadata    = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	query := r.db.WithContext(ctx).Model(&model.WithdrawalRequest{}).
		Where("tutor_id = ?", tutorID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query = query.Order("created_at DESC")

	if err := query.Count(&total).Error; err != nil {
		return nil, metadata, err
	}

	if err := query.Limit(filter.Limit()).Offset(filter.Offset()).Find(&withdrawals).Error; err != nil {
		return nil, metadata, err
	}

	metadata.Total = total
	return withdrawals, metadata, nil
}

func (r *WithdrawalRepository) ListAll(ctx context.Context, status string, filter model.Pagination) ([]model.WithdrawalRequest, model.Metadata, error) {
	var (
		withdrawals []model.WithdrawalRequest
		total       int64
		metadata    = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	query := r.db.WithContext(ctx).Model(&model.WithdrawalRequest{}).
		Preload("Tutor.User").
		Order("created_at DESC")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, metadata, err
	}

	if err := query.Limit(filter.Limit()).Offset(filter.Offset()).Find(&withdrawals).Error; err != nil {
		return nil, metadata, err
	}

	metadata.Total = total
	return withdrawals, metadata, nil
}

func (r *WithdrawalRepository) Update(ctx context.Context, w *model.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Save(w).Error
}
