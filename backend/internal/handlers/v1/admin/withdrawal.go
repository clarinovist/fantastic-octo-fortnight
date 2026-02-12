package admin

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
)

// ListWithdrawals
// @Summary List withdrawals for admin
// @Description List withdrawals with optional status filter
// @Tags admin-withdrawal
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(10)
// @Param status query string false "Filter by status (pending, approved, rejected)"
// @Success 200 {object} base.Base{data=[]dto.AdminWithdrawalResponse,metadata=model.Metadata}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/withdrawals [get]
func (a *Api) ListWithdrawals(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.AdminListWithdrawalsRequest
		ctx = r.Context()
	)

	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListWithdrawals] Failed to decode query parameters")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid query parameters"), base.SetError(err.Error()))
		return
	}

	filter := model.Pagination{
		Page:     req.Page,
		PageSize: req.PageSize,
	}
	filter.SetDefault()

	withdrawals, meta, err := a.mentorBalanceAdmin.ListAllWithdrawals(ctx, req.Status, filter)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Fetch tutors for response construction - ideally handled in service or joined query
	// For now, iterate and fetch (N+1 implementation for simplicity, optimization later)
	var res []dto.AdminWithdrawalResponse
	for _, wd := range withdrawals {
		tutor, err := a.tutor.GetLocalTutor(ctx, wd.TutorID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("tutor_id", wd.TutorID.String()).Msg("Failed to fetch tutor for withdrawal")
			continue
		}
		res = append(res, dto.ToAdminWithdrawalResponse(wd, tutor))
	}

	response.Success(w, http.StatusOK, res, base.SetMetadata(meta))
}

// ApproveWithdrawal
// @Summary Approve a withdrawal request
// @Description Approve a pending withdrawal request
// @Tags admin-withdrawal
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Withdrawal ID"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/withdrawals/{id}/approve [post]
func (a *Api) ApproveWithdrawal(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveWithdrawal] Invalid ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"), base.SetError(err.Error()))
		return
	}

	adminID := middleware.GetUserID(ctx)

	if err := a.mentorBalanceAdmin.ApproveWithdrawal(ctx, id, adminID); err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "Withdrawal approved successfully")
}

// RejectWithdrawal
// @Summary Reject a withdrawal request
// @Description Reject a pending withdrawal request with a note
// @Tags admin-withdrawal
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Withdrawal ID"
// @Param request body dto.RejectWithdrawalRequest true "Rejection request with note"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/withdrawals/{id}/reject [post]
func (a *Api) RejectWithdrawal(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.RejectWithdrawalRequest
		ctx = r.Context()
	)

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RejectWithdrawal] Invalid ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"), base.SetError(err.Error()))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RejectWithdrawal] Failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	adminID := middleware.GetUserID(ctx)

	if err := a.mentorBalanceAdmin.RejectWithdrawal(ctx, id, adminID, req.Note); err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "Withdrawal rejected successfully")
}
