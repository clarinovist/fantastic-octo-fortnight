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

// UpdateStudentReview
// @Summary Update student review
// @Description update student review by admin
// @Tags admin-review
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Review ID"
// @Param request body dto.UpdateStudentReviewAdminRequest true "Update student review request"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/student-reviews/{id} [put]
func (a *Api) UpdateStudentReview(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
		req   dto.UpdateStudentReviewAdminRequest
	)

	// Parse ID from URL
	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("id", idStr).
			Msg("[UpdateStudentReview] Invalid review ID")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid review ID format"), base.SetError(err.Error()))
		return
	}

	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Failed to decode request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Invalid request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Validation failed"), base.SetError(err.Error()))
		return
	}

	// Set ID from URL parameter
	req.ID = id

	// Update student review
	if err := a.studentReview.UpdateByAdmin(ctx, req); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("review_id", id.String()).
			Msg("[UpdateStudentReview] Failed to update student review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, nil)
}

// DeleteStudentReview
// @Summary Delete student review
// @Description delete student review by admin
// @Tags admin-review
// @Produce json
// @Security BearerAuth
// @Param id path string true "Review ID"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/student-reviews/{id} [delete]
func (a *Api) DeleteStudentReview(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("id", idStr).
			Msg("[DeleteStudentReview] Invalid review ID")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid review ID format"), base.SetError(err.Error()))
		return
	}

	if err := a.studentReview.DeleteByAdmin(ctx, id); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("review_id", id.String()).
			Msg("[DeleteStudentReview] Failed to delete student review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, nil)
}
