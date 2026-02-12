package dto

import (
	"errors"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/internal/model"
)

type AdminSubscriptionPriceResponse struct {
	ID       string                     `json:"id"`
	Name     string                     `json:"name"`
	Interval model.SubscriptionInterval `json:"interval"`
	Price    decimal.Decimal            `json:"price"`
}

type UpdateAdminSubscriptionPriceRequest struct {
	ID       uuid.UUID                  `json:"-"`
	Name     string                     `json:"name"`
	Interval model.SubscriptionInterval `json:"interval"`
	Price    decimal.Decimal            `json:"price"`
}

func (r *UpdateAdminSubscriptionPriceRequest) Validate() error {
	if r.Name == "" {
		return errors.New("name is required")
	}
	if r.Interval == "" {
		return errors.New("interval is required")
	}
	if r.Price.IsZero() || r.Price.IsNegative() {
		return errors.New("price must be greater than 0")
	}
	return nil
}
