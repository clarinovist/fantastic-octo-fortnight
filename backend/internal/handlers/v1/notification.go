package v1

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetNotification GetNotification
// @Summary GetNotification
// @Description GetNotification
// @Tags notification
// @Security BearerAuth
// @Param isRead query bool false "isRead"
// @Param isDeleted query bool false "isDeleted"
// @Param page query int false "page"
// @Param pageSize query int false "page size"
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.Notification}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/notifications [get]
func (a *Api) GetNotifications(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetNotificationsRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	request.Pagination.SetDefault()

	result, metadata, err := a.notification.GetNotification(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.Notification, 0)
	for _, item := range result {
		resp = append(resp, dto.Notification{
			ID:           item.ID,
			Title:        item.Title,
			Message:      item.Message,
			Type:         item.Type,
			Link:         item.Link,
			IsRead:       item.IsRead,
			IsDismissed:  item.IsDismissed,
			IsDeleteable: item.IsDeleteable,
			CreatedAt:    item.CreatedAt,
		})
	}

	response.Success(w, http.StatusOK, resp, base.SetMetadata(metadata))
}

// DimissNotification DimissNotification
// @Summary DimissNotification
// @Description DismissNotification
// @Tags notification
// @Security BearerAuth
// @Param id path string true "notification ID"
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/notifications/{id}/dismiss [put]
func (a *Api) DismissNotification(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error parse id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	err = a.notification.DismissNotification(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// ReadNotification ReadNotification
// @Summary ReadNotification
// @Description ReadNotification
// @Tags notification
// @Security BearerAuth
// @Param id path string true "notification ID"
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/notifications/{id}/read [put]
func (a *Api) ReadNotification(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error parse id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	err = a.notification.ReadNotification(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// DeleteNotification DeleteNotification
// @Summary DeleteNotification
// @Description DeleteNotification
// @Tags notification
// @Security BearerAuth
// @Param id path string true "notification ID"
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/notifications/{id} [delete]
func (a *Api) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error parse id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	err = a.notification.DeleteNotification(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
