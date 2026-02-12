package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/internal/model"
)

type GetAdminStudentsRequest struct {
	Name          string `form:"name"`
	Email         string `form:"email"`
	CreatedAtFrom string `form:"createdAtFrom"`
	CreatedAtTo   string `form:"createdAtTo"`
	Query         string `form:"q"`
	model.Pagination
	model.Sort
}

type AdminStudent struct {
	ID                  uuid.UUID `json:"id"`
	UserID              uuid.UUID `json:"userId"`
	Name                string    `json:"name"`
	PhoneNumber         string    `json:"phoneNumber"`
	Email               string    `json:"email"`
	PremiumSubscription string    `json:"premiumSubscription"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

type GetAdminStudentsResponse struct {
	Data     []AdminStudent
	Metadata model.Metadata
}

type AdminReview struct {
	ID                 uuid.UUID   `json:"id"`
	Name               string      `json:"name"`
	CourseTitle        string      `json:"courseTitle"`
	CourseDescription  string      `json:"courseDescription"`
	Review             null.String `json:"review"`
	Rating             null.Int    `json:"rating"`
	RecommendByStudent null.String `json:"recommendByStudent,omitempty"`
}

type AdminDetailStudent struct {
	ID                   uuid.UUID           `json:"id"`
	Name                 string              `json:"name"`
	Gender               null.String         `json:"gender"`
	DateOfBirth          null.Time           `json:"dateOfBirth"`
	Email                string              `json:"email"`
	PhoneNumber          string              `json:"phoneNumber"`
	SocialMediaLinks     map[string]string   `json:"socialMediaLinks"`
	Latitude             decimal.NullDecimal `json:"latitude"`
	Longitude            decimal.NullDecimal `json:"longitude"`
	StudentToTutorReview []AdminReview       `json:"studentToTutorReview"`
	TutorToStudentReview []AdminReview       `json:"tutorToStudentReview"`
	PhotoProfile         null.String         `json:"photoProfile"`
	Rating               float64             `json:"rating"`
	PremiumUntil         null.Time           `json:"premiumUntil"`
}

type CreateAdminStudentRequest struct {
	Name             string              `json:"name"`
	Gender           null.String         `json:"gender"`
	DateOfBirth      null.String         `json:"dateOfBirth"`
	Email            string              `json:"email"`
	PhoneNumber      string              `json:"phoneNumber"`
	Password         string              `json:"password"`
	SocialMediaLinks map[string]string   `json:"socialMediaLinks"`
	Latitude         decimal.NullDecimal `json:"latitude"`
	Longitude        decimal.NullDecimal `json:"longitude"`
	PhotoProfile     null.String         `json:"photoProfile"`
}

func (r *CreateAdminStudentRequest) Validate() error {
	if r.Name == "" {
		return errors.New("name is required")
	}

	if r.PhoneNumber == "" {
		return errors.New("phone number is required")
	}

	if r.Password == "" {
		return errors.New("password is required")
	}

	if r.Email == "" {
		return errors.New("email is required")
	}

	return nil
}

type UpdateAdminStudentRequest struct {
	ID               uuid.UUID           `json:"-"`
	Name             string              `json:"name"`
	Gender           null.String         `json:"gender"`
	DateOfBirth      null.String         `json:"dateOfBirth"`
	Email            string              `json:"email"`
	PhoneNumber      string              `json:"phoneNumber"`
	Password         string              `json:"password"`
	SocialMediaLinks map[string]string   `json:"socialMediaLinks"`
	Latitude         decimal.NullDecimal `json:"latitude"`
	Longitude        decimal.NullDecimal `json:"longitude"`
	PhotoProfile     null.String         `json:"photoProfile"`
	PremiumUntil     null.String         `json:"premiumUntil"`
}

func (r *UpdateAdminStudentRequest) Validate() error {
	if r.Name == "" {
		return errors.New("name is required")
	}

	if r.PhoneNumber == "" {
		return errors.New("phone number is required")
	}

	if r.Email == "" {
		return errors.New("email is required")
	}

	return nil
}

type DeleteAdminStudentRequest struct {
	IDs []uuid.UUID `json:"ids"`
}

func (r *DeleteAdminStudentRequest) Validate() error {
	if len(r.IDs) == 0 {
		return errors.New("ids is required")
	}

	return nil
}
