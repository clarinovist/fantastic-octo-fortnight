package v1

import (
	"context"
	"net/http"

	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// ExpiredBooking expired booking
// @Summary expired booking
// @Description expired booking
// @Tags internal
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 413 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/internal/booking/expired [post]
func (a *Api) ExpiredBooking(w http.ResponseWriter, r *http.Request) {
	go func() {
		ctx := context.Background()
		err := a.booking.ExpiredBooking(ctx)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ExpiredBooking] Error expired booking")
		}
	}()

	response.Success(w, http.StatusOK, "success")
}

// ReminderExpiredBooking reminder expired booking
// @Summary reminder expired booking
// @Description reminder expired booking
// @Tags internal
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 413 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/internal/booking/reminder-expired [post]
func (a *Api) ReminderExpiredBooking(w http.ResponseWriter, r *http.Request) {
	go func() {
		ctx := context.Background()
		err := a.booking.ReminderExpiredBooking(ctx)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ExpiredBooking] Error expired booking")
		}
	}()

	response.Success(w, http.StatusOK, "success")
}

// ReminderCourseBooking reminder course booking
// @Summary reminder course booking
// @Description reminder course booking
// @Tags internal
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 413 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/internal/booking/reminder-course [post]
func (a *Api) ReminderCourseBooking(w http.ResponseWriter, r *http.Request) {
	go func() {
		ctx := context.Background()
		err := a.booking.ReminderCourseBooking(ctx)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ExpiredBooking] Error expired booking")
		}
	}()

	response.Success(w, http.StatusOK, "success")
}

// CreateReviewBooking create review booking
// @Summary create review booking
// @Description create review booking
// @Tags internal
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 413 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/internal/booking/review [post]
func (a *Api) CreateReviewBooking(w http.ResponseWriter, r *http.Request) {
	go func() {
		ctx := context.Background()
		err := a.booking.CreateReviewBooking(ctx)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error create review booking")
		}
	}()

	response.Success(w, http.StatusOK, "success")
}

// RetentionNotification RetentionNotification
// @Summary RetentionNotification
// @Description RetentionNotification
// @Tags internal
// @Produce json
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/internal/notifications/retention [delete]
func (a *Api) RetentionNotification(w http.ResponseWriter, r *http.Request) {
	go func() {
		ctx := context.Background()
		err := a.notification.RetentionNotification(ctx)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("Error retention notification")
		}
	}()

	response.Success(w, http.StatusOK, "success")
}
