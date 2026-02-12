package services

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
)

type WebhookXenditFunc func(ctx context.Context, request dto.WebhookXenditRequest) error

type WebhookService struct {
	subscription *repositories.SubscriptionRepository
	payment      *repositories.PaymentRepository
	student      *repositories.StudentRepository
	notification *NotificationService
	xendit       map[string]WebhookXenditFunc
	config       *config.Config
}

func NewWebhookService(
	subscription *repositories.SubscriptionRepository,
	payment *repositories.PaymentRepository,
	student *repositories.StudentRepository,
	notification *NotificationService,
	config *config.Config,
) *WebhookService {
	s := &WebhookService{
		subscription: subscription,
		payment:      payment,
		student:      student,
		notification: notification,
		config:       config,
		xendit:       make(map[string]WebhookXenditFunc),
	}

	s.xendit[dto.WebhookXenditEventTypeRecurringCycleSucceeded] = s.handleWebhookXenditRecurringCycleSucceeded
	s.xendit[dto.WebhookXenditEventTypeRecurringCycleFailed] = s.handleWebhookXenditRecurringCycleFailed
	s.xendit[dto.WebhookXenditEventTypePaymentSessionCompleted] = s.handleWebhookXenditPaymentSessionCompleted
	s.xendit[dto.WebhookXenditEventTypePaymentSessionExpired] = s.handleWebhookXenditPaymentSessionExpired

	return s
}

func (s *WebhookService) HandleWebhookXendit(ctx context.Context, req dto.WebhookXenditRequest) error {
	if req.WebhookKey != s.config.Xendit.WebhookKey {
		logger.WarnCtx(ctx).Msgf("[HandleWebhookXendit] invalid webhook key: %s", req.WebhookKey)
		return shared.MakeError(ErrBadRequest, "invalid webhook key")
	}

	if _, ok := s.xendit[req.Event]; !ok {
		logger.WarnCtx(ctx).Msgf("[HandleWebhookXendit] unhandled webhook type: %s", req.Event)
		return nil
	}

	return s.xendit[req.Event](ctx, req)
}

func (s *WebhookService) handleWebhookXenditRecurringCycleSucceeded(ctx context.Context, request dto.WebhookXenditRequest) error {
	payload, err := json.Marshal(request.Data)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditRecurringCycleSucceeded] failed to marshal data")
		return err
	}

	data := dto.WebhookXenditRecurringCycle{}
	if err = json.Unmarshal(payload, &data); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditRecurringCycleSucceeded] failed to unmarshal data")
		return err
	}

	subscription, err := s.subscription.GetByReferenceID(ctx, data.PlanID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msgf("[handleWebhookXenditRecurringCycleSucceeded] failed to get subscription by reference id: %s", data.PlanID)
		return err
	}

	if subscription == nil {
		logger.WarnCtx(ctx).Msgf("[handleWebhookXenditRecurringCycleSucceeded] subscription not found by reference id: %s", data.PlanID)
		return shared.MakeError(ErrEntityNotFound, "subscription")
	}

	if subscription.Status == model.SubscriptionStatusActive {
		switch subscription.Interval {
		case model.SubscriptionIntervalMonthly:
			subscription.EndDate = subscription.EndDate.AddDate(0, subscription.IntervalCount, 0)
		case model.SubscriptionIntervalYearly:
			subscription.EndDate = subscription.EndDate.AddDate(subscription.IntervalCount, 0, 0)
		}
	}

	subscription.Status = model.SubscriptionStatusActive
	subscription.UpdatedAt = time.Now()
	subscription.UpdatedBy = uuid.MustParse(model.SystemID)

	student := subscription.Student
	student.PremiumUntil = null.TimeFrom(subscription.EndDate)

	err = s.subscription.Update(ctx, subscription)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msgf("[handleWebhookXenditRecurringCycleSucceeded] failed to update subscription by reference id: %s", data.PlanID)
		return err
	}

	err = s.student.Update(ctx, &student)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msgf("[handleWebhookXenditRecurringCycleSucceeded] failed to update student by reference id: %s", data.PlanID)
		return err
	}

	return nil
}

func (s *WebhookService) handleWebhookXenditPaymentSessionCompleted(ctx context.Context, request dto.WebhookXenditRequest) error {
	payload, err := json.Marshal(request.Data)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditPaymentSessionCompleted] failed to marshal data")
		return err
	}

	data := dto.WebhookXenditPaymentSessionCompleted{}
	if err = json.Unmarshal(payload, &data); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditPaymentSessionCompleted] failed to unmarshal data")
		return err
	}

	payment, err := s.payment.GetByInvoiceNumber(ctx, data.ReferenceID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionCompleted] failed to get payment by id")
		return err
	}

	if payment == nil {
		logger.WarnCtx(ctx).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionCompleted] payment not found by id")
		return shared.MakeError(ErrEntityNotFound, "payment")
	}

	if payment.Status == model.SubscriptionStatusActive {
		logger.WarnCtx(ctx).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionCompleted] payment already active")
		return nil
	}

	payment.PaidAt = null.TimeFrom(time.Now())
	payment.Status = model.SubscriptionStatusActive
	payment.UpdatedAt = time.Now()
	payment.UpdatedBy = uuid.MustParse(model.SystemID)

	student := payment.Student
	student.PremiumUntil = null.TimeFrom(payment.EndDate)

	err = s.payment.Update(ctx, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionCompleted] failed to update subscription by id")
		return err
	}

	err = s.student.Update(ctx, &student)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Interface("data", data).Msgf("[handleWebhookXenditPaymentSessionCompleted] failed to update student by id")
		return err
	}

	go func() {
		err = s.notification.PaymentCompleted(context.Background(), student, *payment)
		if err != nil {
			logger.ErrorCtx(context.Background()).Err(err).Msg("[handleWebhookXenditPaymentSessionCompleted] Error sending payment completed notification")
		}
	}()

	return nil
}

func (s *WebhookService) handleWebhookXenditRecurringCycleFailed(ctx context.Context, request dto.WebhookXenditRequest) error {
	payload, err := json.Marshal(request.Data)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditRecurringCycleFailed] failed to marshal data")
		return err
	}

	data := dto.WebhookXenditRecurringCycle{}
	if err = json.Unmarshal(payload, &data); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditRecurringCycleFailed] failed to unmarshal data")
		return err
	}

	subscription, err := s.subscription.GetByReferenceID(ctx, data.PlanID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msgf("[handleWebhookXenditRecurringCycleFailed] failed to get subscription by reference id: %s", data.PlanID)
		return err
	}

	if subscription == nil {
		logger.WarnCtx(ctx).Msgf("[handleWebhookXenditRecurringCycleFailed] subscription not found by reference id: %s", data.PlanID)
		return shared.MakeError(ErrEntityNotFound, "subscription")
	}

	subscription.Status = model.SubscriptionStatusInActive
	subscription.UpdatedAt = time.Now()
	subscription.UpdatedBy = uuid.MustParse(model.SystemID)

	err = s.subscription.Update(ctx, subscription)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msgf("[handleWebhookXenditRecurringCycleFailed] failed to update subscription by reference id: %s", data.PlanID)
		return err
	}

	return nil
}

func (s *WebhookService) handleWebhookXenditPaymentSessionExpired(ctx context.Context, request dto.WebhookXenditRequest) error {
	payload, err := json.Marshal(request.Data)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditPaymentSessionExpired] failed to marshal data")
		return err
	}

	data := dto.WebhookXenditPaymentSessionCompleted{}
	if err = json.Unmarshal(payload, &data); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[handleWebhookXenditPaymentSessionExpired] failed to unmarshal data")
		return err
	}

	payment, err := s.payment.GetByInvoiceNumber(ctx, data.ReferenceID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionExpired] failed to get payment by id")
		return err
	}

	if payment == nil {
		logger.WarnCtx(ctx).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionExpired] payment not found by id")
		return shared.MakeError(ErrEntityNotFound, "payment")
	}

	if payment.Status == model.SubscriptionStatusActive {
		logger.WarnCtx(ctx).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionExpired] payment already active")
		return nil
	}

	payment.Status = model.SubscriptionStatusExpired
	payment.UpdatedAt = time.Now()
	payment.UpdatedBy = uuid.MustParse(model.SystemID)

	err = s.payment.Update(ctx, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Interface("data", data).Msg("[handleWebhookXenditPaymentSessionExpired] failed to update subscription by id")
		return err
	}

	return nil
}
