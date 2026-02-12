package dto

import (
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
)

type ListTutorBookingRequest struct {
	model.Pagination
	model.Sort
}

type ApproveTutorBookingRequest struct {
	ID    uuid.UUID   `json:"-"`
	Notes null.String `json:"notes"`
}

type DeclineTutorBookingRequest struct {
	ID    uuid.UUID   `json:"-"`
	Notes null.String `json:"notes"`
}
<<<<<<< HEAD
=======

type CreateTutorBookingRequest struct {
	StudentID       uuid.UUID   `json:"student_id"`
	ClassType       string      `json:"class_type"`
	CourseID        uuid.UUID   `json:"course_id"`
	BookingDate     string      `json:"booking_date"` // YYYY-MM-DD
	BookingTime     string      `json:"booking_time"` // HH:MM
	DurationMinutes int         `json:"duration_minutes"`
	Latitude        float64     `json:"latitude"`
	Longitude       float64     `json:"longitude"`
	Notes           null.String `json:"notes"`
}
type TutorBookingStats struct {
	Pending   int `json:"pending"`
	Accepted  int `json:"accepted"`
	Rejected  int `json:"rejected"`
	Completed int `json:"completed"`
	Total     int `json:"total"`
}
>>>>>>> 1a19ced (chore: update service folders from local)
