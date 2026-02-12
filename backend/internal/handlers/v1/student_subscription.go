package v1

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetPricesStudentSubscription get subscription student
// @Summary Get subscription student
// @Description Get subscription for student
// @Tags student-subscription
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.GetPriceStudentSubscriptionResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/subscriptions/prices [get]
func (a *Api) GetPricesStudentSubscription(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	prices, err := a.studentSubscription.GetPrices(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentSubscription] Error get subscription prices student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.GetPriceStudentSubscriptionResponse, 0)
	for _, price := range prices {
		resp = append(resp, dto.GetPriceStudentSubscriptionResponse{
			ID:       price.ID,
			Name:     price.Name,
			Price:    price.Price,
			Interval: price.Interval,
		})
	}

	response.Success(w, http.StatusOK, resp)
}

// CreateStudentSubscription create subscription student
// @Summary Create subscription student
// @Description Create a new subscription for student
// @Tags student-subscription
// @Accept json
// @Produce json
// @Param request body dto.CreateStudentSubscriptionRequest true "create subscription student request"
// @Success 201 {object} base.Base{data=dto.CreateStudentSubscriptionResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/subscriptions [post]
func (a *Api) CreateStudentSubscription(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.CreateStudentSubscriptionRequest
	)

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Request validation failed")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Validation failed"
		})
		return
	}

	resp, err := a.studentSubscription.RegularPayment(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentSubscription] Error create subscription student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusCreated, resp)
}

// GetStudentSubscription get subscription student
// @Summary get subscription student
// @Description get subscription for student
// @Tags student-subscription
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "page"
// @Param pageSize query int false "pageSize"
// @Success 200 {object} base.Base{data=dto.GetStudentSubscriptionResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/students/subscriptions [get]
func (a *Api) GetStudentSubscription(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetStudentSubscriptionCreateRequest
	)

	if err := decoder.Decode(&request, r.URL.Query()); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentSubscription] Error decoding query parameters")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Message = "invalid query parameters"
			b.Error = err.Error()
		})
		return
	}

	request.Pagination.SetDefault()
	payments, err := a.studentSubscription.GetPayment(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentSubscription] Error create subscription student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.GetStudentSubscriptionResponse, 0)
	for _, payment := range payments {
		resp = append(resp, dto.GetStudentSubscriptionResponse{
			ID:            payment.ID,
			Name:          payment.Name(),
			Price:         payment.Amount,
			Interval:      payment.Interval,
			IntervalCount: payment.IntervalCount,
			URL:           payment.URL,
			StartAt:       payment.StartDate,
			EndAt:         payment.EndDate,
			Status:        payment.StatusLabel(),
		})
	}

	response.Success(w, http.StatusOK, resp)
}

// CancelStudentSubscription create subscription student
// @Summary Create subscription student
// @Description Create a new subscription for student
// @Tags student-subscription
// @Accept json
// @Produce json
// @Param id path string true "subscription id"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/subscriptions/{id}/cancel [post]
func (a *Api) CancelStudentSubscription(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelStudentSubscription] Error parsing subscription id")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	err = a.studentSubscription.CancelPayment(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CancelStudentSubscription] Error cancel subscription student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// CreateInvoiceStudentSubscription create invoice subscription student
// @Summary Create invoice subscription student
// @Description Create invoice subscription for student
// @Tags student-subscription
// @Accept json
// @Produce json
// @Param id path string true "subscription id"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/subscriptions/{id}/invoice [post]
func (a *Api) CreateInvoiceStudentSubscription(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoiceStudentSubscription] Error parsing subscription id")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	buf, filename, err := a.studentSubscription.CreateInvoice(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateInvoiceStudentSubscription] Error cancel subscription student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.File(w, filename, buf)
}
