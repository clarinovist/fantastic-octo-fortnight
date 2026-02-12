package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/internal/model"
)

type CreateStudentSubscriptionRequest struct {
	SubscriptionID uuid.UUID `json:"subscriptionId"`
	IntervalCount  int       `json:"intervalCount"`
}

func (r *CreateStudentSubscriptionRequest) Validate() error {
	if r.IntervalCount <= 0 {
		return errors.New("intervalCount must be greater than 0")
	}

	if r.SubscriptionID.String() != model.SubscriptionMonthlyID && r.SubscriptionID.String() != model.SubscriptionYearlyID {
		return errors.New("subscriptionId must be 'monthly' or 'yearly'")
	}

	return nil
}

type CreateStudentSubscriptionResponse struct {
	URL string `json:"url"`
}

type GetPriceStudentSubscriptionResponse struct {
	ID       string                     `json:"id"`
	Name     string                     `json:"name"`
	Price    decimal.Decimal            `json:"price"`
	Interval model.SubscriptionInterval `json:"interval"`
}

type GetStudentSubscriptionCreateRequest struct {
	model.Pagination
}

type GetStudentSubscriptionResponse struct {
	ID            uuid.UUID                  `json:"id"`
	Name          string                     `json:"name"`
	Price         decimal.Decimal            `json:"price"`
	Interval      model.SubscriptionInterval `json:"interval"`
	IntervalCount int                        `json:"intervalCount"`
	URL           string                     `json:"url"`
	StartAt       time.Time                  `json:"startAt"`
	EndAt         time.Time                  `json:"endAt"`
	Status        model.SubscriptionStatus   `json:"status"`
}
