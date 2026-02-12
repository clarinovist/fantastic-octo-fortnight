package admin

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetBookings
// @Summary Get bookings
// @Description get list of bookings
// @Tags admin-booking
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param status query string false "Booking status (pending, accepted, declined, expired)"
// @Param tutorName query string false "Filter by tutor name (case-insensitive substring match)"
// @Param studentName query string false "Filter by student name (case-insensitive substring match)"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param sort query string false "Sort by"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=[]dto.AdminBooking,metadata=model.Metadata}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/bookings [get]
func (a *Api) GetBookings(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.GetAdminBookingsRequest
		ctx = r.Context()
	)

	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Query Param format"), base.SetError(err.Error()))
		return
	}

	req.Pagination.SetDefault()
	resp, err := a.booking.GetAdminBookings(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp.Data, base.SetMetadata(resp.Metadata))
}

// GetBookingDetail
// @Summary Get booking detail
// @Description get detailed information of a booking including student, tutor, and booking data
// @Tags admin-booking
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Booking ID (UUID format)"
// @Success 200 {object} base.Base{data=dto.AdminBookingDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/bookings/{id} [get]
func (a *Api) GetBookingDetail(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idParam := chi.URLParam(r, "id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid booking ID format"), base.SetError(err.Error()))
		return
	}

	booking, err := a.booking.GetAdminBookingDetail(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	data := dto.NewAdminBookingDetail(booking)
	response.Success(w, http.StatusOK, data)
}

// SendReminderToStudent
// @Summary Send reminder email to student
// @Description send reminder email to student for a specific booking
// @Tags admin-booking
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Booking ID (UUID format)"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/bookings/{id}/reminder-student [post]
func (a *Api) SendReminderToStudent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idParam := chi.URLParam(r, "id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid booking ID format"), base.SetError(err.Error()))
		return
	}

	err = a.booking.ReminderStudent(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, nil, base.SetMessage("Reminder email sent successfully"))
}

// SendReminderToTutor
// @Summary Send reminder email to tutor
// @Description send reminder email to tutor for a specific booking
// @Tags admin-booking
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Booking ID (UUID format)"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/bookings/{id}/reminder-tutor [post]
func (a *Api) SendReminderToTutor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idParam := chi.URLParam(r, "id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid booking ID format"), base.SetError(err.Error()))
		return
	}

	err = a.booking.ReminderTutor(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, nil, base.SetMessage("Reminder email sent successfully"))
}
