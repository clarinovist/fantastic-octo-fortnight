package services

import (
	"context"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
)

type SubscriptionPriceService struct {
	subscriptionPriceRepo *repositories.SubscriptionPriceRepository
}

func NewSubscriptionPriceService(subscriptionPriceRepo *repositories.SubscriptionPriceRepository) *SubscriptionPriceService {
	return &SubscriptionPriceService{
		subscriptionPriceRepo: subscriptionPriceRepo,
	}
}

func (s *SubscriptionPriceService) GetSubscriptionPrices(ctx context.Context) ([]dto.AdminSubscriptionPriceResponse, error) {
	subscriptionPrices, err := s.subscriptionPriceRepo.Get(ctx)
	if err != nil {
		return nil, err
	}

	return s.toAdminSubscriptionPriceResponses(subscriptionPrices), nil
}

func (s *SubscriptionPriceService) UpdateSubscriptionPrice(ctx context.Context, req dto.UpdateAdminSubscriptionPriceRequest) error {
	subscriptionPrice, err := s.subscriptionPriceRepo.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	subscriptionPrice.Name = req.Name
	subscriptionPrice.Interval = req.Interval
	subscriptionPrice.Price = req.Price

	return s.subscriptionPriceRepo.Update(ctx, subscriptionPrice)
}

func (s *SubscriptionPriceService) toAdminSubscriptionPriceResponses(subscriptionPrices []model.SubscriptionPrice) []dto.AdminSubscriptionPriceResponse {
	responses := make([]dto.AdminSubscriptionPriceResponse, 0, len(subscriptionPrices))
	for _, sp := range subscriptionPrices {
		responses = append(responses, dto.AdminSubscriptionPriceResponse{
			ID:       sp.ID,
			Name:     sp.Name,
			Interval: sp.Interval,
			Price:    sp.Price,
		})
	}
	return responses
}
