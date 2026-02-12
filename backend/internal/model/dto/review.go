package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
)

type ListReviewRequest struct {
	model.Pagination
	model.Sort
}

type Review struct {
	ID                 uuid.UUID   `json:"id"`
	CourseTitle        string      `json:"courseTitle"`
	Name               string      `json:"name"`
	Email              string      `json:"email"`
	PhotoProfile       null.String `json:"photoProfile"`
	Review             null.String `json:"review"`
	Rate               null.Int    `json:"rate"`
	IsReviewed         bool        `json:"isReviewed"`
	RecommendByStudent null.String `json:"recommendByStudent,omitempty"`
	CreatedAt          time.Time   `json:"createdAt"`
	UpdatedAt          time.Time   `json:"updatedAt"`
}

type UpdateReviewRequest struct {
	ID                 uuid.UUID   `json:"-"`
	Review             string      `json:"review"`
	Rate               int         `json:"rate"`
	RecommendByStudent null.String `json:"recommendByStudent,omitempty"`
}

func (r *UpdateReviewRequest) Validate() error {
	if r.Review == "" {
		return errors.New("review is required")
	}

	if r.Rate < 1 || r.Rate > 5 {
		return errors.New("rate must be between 1 and 5")
	}

	return nil
}

type UpdateStudentReviewAdminRequest struct {
	ID     uuid.UUID `json:"-"`
	Review string    `json:"review"`
	Rate   int       `json:"rate"`
}

func (r *UpdateStudentReviewAdminRequest) Validate() error {
	if r.Review == "" {
		return errors.New("review is required")
	}

	if r.Rate < 1 || r.Rate > 5 {
		return errors.New("rate must be between 1 and 5")
	}

	return nil
}

type UpdateTutorReviewAdminRequest struct {
	ID                 uuid.UUID   `json:"-"`
	Review             string      `json:"review"`
	Rate               int         `json:"rate"`
	RecommendByStudent null.String `json:"recommendByStudent,omitempty"`
}

func (r *UpdateTutorReviewAdminRequest) Validate() error {
	if r.Review == "" {
		return errors.New("review is required")
	}

	if r.Rate < 1 || r.Rate > 5 {
		return errors.New("rate must be between 1 and 5")
	}

	return nil
}
