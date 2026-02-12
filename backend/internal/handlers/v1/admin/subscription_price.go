package admin

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

// GetSubscriptionPrices
// @Summary Get subscription prices
// @Description Get all subscription prices
// @Tags admin-subscription-price
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} base.Base{data=[]dto.AdminSubscriptionPriceResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/subscription-prices [get]
func (a *Api) GetSubscriptionPrices(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	resp, err := a.subscriptionPrice.GetSubscriptionPrices(ctx)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp)
}

// UpdateSubscriptionPrice
// @Summary Update subscription price
// @Description Update subscription price details
// @Tags admin-subscription-price
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Subscription Price ID"
// @Param request body dto.UpdateAdminSubscriptionPriceRequest true "update subscription price request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/subscription-prices/{id} [put]
func (a *Api) UpdateSubscriptionPrice(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateAdminSubscriptionPriceRequest
		idStr = chi.URLParam(r, "id")
		ctx   = r.Context()
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validating request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Request"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	err = a.subscriptionPrice.UpdateSubscriptionPrice(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
