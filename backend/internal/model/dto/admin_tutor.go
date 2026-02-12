package dto

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/internal/model"
)

type GetAdminTutorsRequest struct {
	Name          string `form:"name"`
	Email         string `form:"email"`
	CreatedAtFrom string `form:"createdAtFrom"`
	CreatedAtTo   string `form:"createdAtTo"`
	Query         string `form:"q"`
	model.Pagination
	model.Sort
}

type AdminTutor struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"userId"`
	Name        string    `json:"name"`
	PhoneNumber string    `json:"phoneNumber"`
	Email       string    `json:"email"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type GetAdminTutorsResponse struct {
	Data     []AdminTutor
	Metadata model.Metadata
}

type AdminDetailTutor struct {
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
	LevelPoint           uint                `json:"levelPoint"`
	Level                string              `json:"level"`
	Status               string              `json:"status"`
}

type CreateAdminTutorRequest struct {
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

func (r *CreateAdminTutorRequest) Validate() error {
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

type UpdateAdminTutorRequest struct {
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
	LevelPoint       uint                `json:"levelPoint"`
}

func (r *UpdateAdminTutorRequest) Validate() error {
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

type DeleteAdminTutorRequest struct {
	IDs []uuid.UUID `json:"ids"`
}

func (r *DeleteAdminTutorRequest) Validate() error {
	if len(r.IDs) == 0 {
		return errors.New("ids is required")
	}

	return nil
}

type AdminTutorCourse struct {
	ID     uuid.UUID `json:"id"`
	Title  string    `json:"title"`
	Status string    `json:"status"`
}
