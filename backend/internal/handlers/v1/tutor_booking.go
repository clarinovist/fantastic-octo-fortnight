package v1

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// ListTutorBooking list booking tutor
// @Summary List booking tutor
// @Description List a new booking for tutor
// @Tags tutor-booking
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10)
// @Param sort query string false "Sort by field"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/booking [get]
func (a *Api) ListTutorBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.ListTutorBookingRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.Pagination.SetDefault()

	bookings, metadata, err := a.tutorBooking.List(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] Error list booking tutor")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.Booking, len(bookings))
	for i, b := range bookings {
		resp[i] = dto.Booking{
			ID:                b.ID,
			BookingDate:       b.BookingDate.Format(time.DateOnly),
			BookingTime:       b.BookingTime,
			Timezone:          b.Timezone,
			CourseTitle:       b.Course.Title,
			CourseDescription: b.Course.Description,
			Status:            b.Status,
			ExpiredAt:         b.ExpiredAt,
		}
	}

	response.Success(w, http.StatusOK, resp, base.SetMetadata(metadata))
}

// GetTutorBooking list booking tutor
// @Summary Get booking tutor
// @Description Get a new booking for tutor
// @Tags tutor-booking
// @Accept json
// @Produce json
// @Param id path string true "id of booking"
// @Success 200 {object} base.Base{data=dto.BookingDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/booking/{id} [get]
func (a *Api) GetTutorBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	booking, err := a.tutorBooking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorBooking] Error get booking tutor")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := dto.NewBookingDetail(booking)
	response.Success(w, http.StatusOK, resp)
}

// ApproveTutorBooking ApproveTutorBooking
// @Summary ApproveTutorBooking
// @Description Approve tutor booking
// @Tags tutor-booking
// @Accept json
// @Produce json
// @Param id path string true "id of booking"
// @Param request body dto.ApproveTutorBookingRequest true "approve tutor booking request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/booking/{id}/approve [put]
func (a *Api) ApproveTutorBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveTutorBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	var request dto.ApproveTutorBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveTutorBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.ID = id
	err = a.tutorBooking.ApproveBooking(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveTutorBooking] Error approve booking tutor")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// DeclineTutorBooking DeclineTutorBooking
// @Summary DeclineTutorBooking
// @Description Decline tutor booking
// @Tags tutor-booking
// @Accept json
// @Produce json
// @Param id path string true "id of booking"
// @Param request body dto.DeclineTutorBookingRequest true "approve tutor booking request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/booking/{id}/decline [put]
func (a *Api) DeclineTutorBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineTutorBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	var request dto.DeclineTutorBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineTutorBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.ID = id
	err = a.tutorBooking.DeclineBooking(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineTutorBooking] Error approve booking tutor")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
