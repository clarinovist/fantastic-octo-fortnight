package xendit

import (
	"context"
	"errors"
	"net/http"

	"resty.dev/v3"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/shared/logger"
)

type Client struct {
	rc *resty.Client
}

func NewClient(config *config.Config) *Client {
	return &Client{
		rc: resty.New().
			SetBasicAuth(config.Xendit.SecretKey, "").
			SetBaseURL(config.Xendit.BaseURL),
	}
}

func (c *Client) CreateSubscription(ctx context.Context, request CreateSubscriptionRequest) (CreateSubscriptionResponse, error) {
	result := CreateSubscriptionResponse{}
	resp, err := c.rc.R().
		SetContext(ctx).
		SetResult(&result).
		SetBody(request).
		Post("/recurring/plans")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error calling API")
		return CreateSubscriptionResponse{}, err
	}

	if resp.StatusCode() != http.StatusAccepted {
		logger.ErrorCtx(ctx).
			Str("status", resp.Status()).
			Msg("[CreateStudentSubscription] Error calling API")
		return CreateSubscriptionResponse{}, errors.New("error creating subscription")
	}

	return result, nil
}

func (c *Client) CancelSubscription(ctx context.Context, id string) error {
	resp, err := c.rc.R().
		SetContext(ctx).
		SetPathParam("id", id).
		Post("/recurring/plans/{id}/deactivate")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelSubscription] Error calling API")
		return err
	}

	if resp.StatusCode() != http.StatusOK {
		logger.ErrorCtx(ctx).
			Str("status", resp.Status()).
			Msg("[CancelSubscription] Error calling API")
		return errors.New("error cancel subscription")
	}

	return nil
}

func (c *Client) CancelPayment(ctx context.Context, id string) error {
	resp, err := c.rc.R().
		SetContext(ctx).
		SetPathParam("id", id).
		Post("/sessions/{id}/cancel")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelPayment] Error calling API")
		return err
	}

	if resp.StatusCode() != http.StatusOK {
		logger.ErrorCtx(ctx).
			Str("status", resp.Status()).
			Msg("[CancelPayment] Error calling API")
		return errors.New("error cancel subscription")
	}

	return nil
}

func (c *Client) CreatePaymentSession(ctx context.Context, request CreatePaymentSessionRequest) (CreatePaymentSessionResponse, error) {
	result := CreatePaymentSessionResponse{}
	resp, err := c.rc.R().
		SetContext(ctx).
		SetResult(&result).
		SetBody(request).
		Post("/sessions")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreatePaymentSession] Error calling API")
		return CreatePaymentSessionResponse{}, err
	}

	if resp.StatusCode() != http.StatusCreated {
		logger.ErrorCtx(ctx).
			Str("status", resp.Status()).
			Msg("[CreatePaymentSession] Error calling API")
		return CreatePaymentSessionResponse{}, errors.New("error creating subscription")
	}

	return result, nil
}
