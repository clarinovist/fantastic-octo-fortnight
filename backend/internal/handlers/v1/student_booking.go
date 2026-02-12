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

// CreateBookingStudent create booking student
// @Summary Create booking student
// @Description Create a new booking for student
// @Tags student-booking
// @Accept json
// @Produce json
// @Param request body dto.CreateStudentBookingRequest true "create booking student request"
// @Success 201 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/booking [post]
func (a *Api) CreateStudentBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.CreateStudentBookingRequest
	)

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Request validation failed")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Validation failed"
		})
		return
	}

	metadata, err := a.studentBooking.Create(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error create booking student")
		response.Failure(w, base.CustomError(services.Error(err)), base.SetMetadata(metadata))
		return
	}

	response.Success(w, http.StatusCreated, "success")
}

// ListStudentBooking list booking student
// @Summary List booking student
// @Description List a new booking for student
// @Tags student-booking
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
// @Router /v1/students/booking [get]
func (a *Api) ListStudentBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.ListStudentBookingRequest
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

	bookings, metadata, err := a.studentBooking.List(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] Error list booking student")
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
			Status:            b.GetStatus(),
			ExpiredAt:         b.ExpiredAt,
		}
	}

	response.Success(w, http.StatusOK, resp, base.SetMetadata(metadata))
}

// GetStudentBooking list booking student
// @Summary Get booking student
// @Description Get a new booking for student
// @Tags student-booking
// @Accept json
// @Produce json
// @Param id path string true "id of booking"
// @Success 200 {object} base.Base{data=dto.BookingDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/booking/{id} [get]
func (a *Api) GetStudentBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	booking, err := a.studentBooking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentBooking] Error get booking student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := dto.NewBookingDetail(booking)
	response.Success(w, http.StatusOK, resp)
}

// ReportStudentBooking report booking student
// @Summary Report booking student
// @Description Report booking for student
// @Tags student-booking
// @Accept json
// @Produce json
// @Param id path string true "id of booking"
// @Param request body dto.ReportStudentBookingRequest true "report student booking request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/booking/{id}/report [post]
func (a *Api) ReportStudentBooking(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request = dto.ReportStudentBookingRequest{}
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Error parse id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.ID = id
	err = a.studentBooking.ReportBooking(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudetBooking] Error report booking student")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
