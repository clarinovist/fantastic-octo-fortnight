package repositories

import (
	"context"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type SubscriptionPriceRepository struct {
	db *infras.MySQL
}

func NewSubscriptionPriceRepository(db *infras.MySQL) *SubscriptionPriceRepository {
	return &SubscriptionPriceRepository{db}
}

func (r *SubscriptionPriceRepository) Get(ctx context.Context) ([]model.SubscriptionPrice, error) {
	var subscriptionPrices []model.SubscriptionPrice
	err := r.db.Read.WithContext(ctx).Find(&subscriptionPrices).Error
	return subscriptionPrices, err
}

func (r *SubscriptionPriceRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SubscriptionPrice, error) {
	var subscriptionPrice model.SubscriptionPrice
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).First(&subscriptionPrice).Error
	return &subscriptionPrice, err
}

func (r *SubscriptionPriceRepository) Update(ctx context.Context, subscriptionPrice *model.SubscriptionPrice) error {
	return r.db.Write.WithContext(ctx).Model(&model.SubscriptionPrice{}).Where("id = ?", subscriptionPrice.ID).Updates(subscriptionPrice).Error
}
