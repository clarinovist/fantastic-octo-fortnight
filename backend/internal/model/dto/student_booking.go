package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
)

type CreateStudentBookingRequest struct {
	CourseID    uuid.UUID       `json:"courseID"`
	ClassType   model.ClassType `json:"classType"`
	BookingDate string          `json:"bookingDate"`
	BookingTime string          `json:"bookingTime"`
	Notes       null.String     `json:"notes"`
	Latitude    decimal.Decimal `json:"latitude"`
	Longitude   decimal.Decimal `json:"longitude"`
}

func (r *CreateStudentBookingRequest) Validate() error {
	if r.CourseID == uuid.Nil {
		return errors.New("courseID is required")
	}

	if r.BookingDate == "" {
		return errors.New("bookingDate is required")
	}

	if r.BookingTime == "" {
		return errors.New("bookingTime is required")
	}

	if r.ClassType == model.OfflineClassType && r.Latitude.IsZero() {
		return errors.New("latitude are required")
	}

	if r.ClassType == model.OfflineClassType && r.Longitude.IsZero() {
		return errors.New("longitude are required")
	}

	if r.ClassType == "" {
		return errors.New("classType is required")
	}

	bookingDate, err := time.Parse(time.DateOnly, r.BookingDate)
	if err != nil {
		return err
	}

	if bookingDate.Before(time.Now()) {
		return errors.New("booking date must be in the future")
	}

	return nil
}

type ListStudentBookingRequest struct {
	model.Pagination
	model.Sort
}

type ReportStudentBookingRequest struct {
	ID    uuid.UUID `json:"-"`
	Topic string    `json:"topic"`
	Body  string    `json:"notes"`
}
