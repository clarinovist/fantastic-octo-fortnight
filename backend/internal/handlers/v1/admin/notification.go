package admin

import (
	"encoding/json"
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// CreateNotification
// @Summary create notification
// @Description create notification
// @Tags admin-notification
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateAdminNotificationRequest true "create notification request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/notifications [post]
func (a *Api) CreateNotification(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.CreateAdminNotificationRequest
		ctx = r.Context()
	)

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

	err := a.notification.AdminCreateNotification(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
