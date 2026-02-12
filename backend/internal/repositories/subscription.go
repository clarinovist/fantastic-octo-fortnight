package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type SubscriptionRepository struct {
	db *infras.MySQL
}

func NewSubscriptionRepository(db *infras.MySQL) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

func (r *SubscriptionRepository) Create(ctx context.Context, subscription *model.Subscription) error {
	return r.db.Write.WithContext(ctx).Create(subscription).Error
}

func (r *SubscriptionRepository) GetByReferenceID(ctx context.Context, referenceID string) (*model.Subscription, error) {
	var subscription model.Subscription
	err := r.db.Read.WithContext(ctx).Preload("Student.User").Where("reference_id = ?", referenceID).First(&subscription).Error
	return &subscription, err
}

func (r *SubscriptionRepository) Update(ctx context.Context, subscription *model.Subscription) error {
	return r.db.Write.WithContext(ctx).Save(subscription).Error
}

func (r *SubscriptionRepository) Get(ctx context.Context, filter model.SubscriptionFilter) ([]model.Subscription, error) {
	var subscriptions []model.Subscription
	db := r.db.Read.WithContext(ctx)

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if filter.Status != "" {
		db = db.Where("status = ?", filter.Status)
	}

	err := db.Find(&subscriptions).Error
	return subscriptions, err
}

func (r *SubscriptionRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Subscription, error) {
	var subscription model.Subscription
	err := r.db.Read.WithContext(ctx).Preload("Student").Where("id = ?", id).First(&subscription).Error
	return &subscription, err
}

func (r *SubscriptionRepository) GetSubscriptionsPerDay(ctx context.Context, startDate, endDate time.Time) ([]model.SubscriptionPerDay, error) {
	var results []model.SubscriptionPerDay

	err := r.db.Read.WithContext(ctx).
		Model(&model.Subscription{}).
		Select("DATE(start_date) as date, COUNT(DISTINCT student_id) as count").
		Where("status = ?", "ACTIVE").
		Where("DATE(start_date) >= ?", startDate.Format("2006-01-02")).
		Where("DATE(start_date) <= ?", endDate.Format("2006-01-02")).
		Where("deleted_at IS NULL").
		Group("DATE(start_date)").
		Order("date ASC").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get subscriptions per day: %w", err)
	}

	return results, nil
}

func (r *SubscriptionRepository) GetTotalAmount(ctx context.Context) (float64, error) {
	var totalAmount float64

	err := r.db.Read.WithContext(ctx).
		Model(&model.Subscription{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("deleted_at IS NULL").
		Scan(&totalAmount).Error

	if err != nil {
		return 0, fmt.Errorf("failed to get total subscription amount: %w", err)
	}

	return totalAmount, nil
}

func (r *SubscriptionRepository) GetAmountPerDay(ctx context.Context, startDate, endDate time.Time) ([]model.SubscriptionAmountPerDay, error) {
	var results []model.SubscriptionAmountPerDay

	err := r.db.Read.WithContext(ctx).
		Model(&model.Subscription{}).
		Select("DATE(created_at) as date, COALESCE(SUM(amount), 0) as amount").
		Where("DATE(created_at) >= ?", startDate.Format("2006-01-02")).
		Where("DATE(created_at) <= ?", endDate.Format("2006-01-02")).
		Where("deleted_at IS NULL").
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get subscription amount per day: %w", err)
	}

	return results, nil
}
