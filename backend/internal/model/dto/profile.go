package dto

import (
	"errors"
	"fmt"
	"slices"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
)

// UpdateProfileRequest represents the request payload for updating user profile
type UpdateProfileRequest struct {
	PhotoProfile    string            `json:"photoProfile"`
	Name            string            `json:"name"`
	Gender          string            `json:"gender"`
	DateOfBirth     string            `json:"dateOfBirth"`
	PhoneNumber     string            `json:"phoneNumber"`
	SocialMediaLink map[string]string `json:"socialMediaLink"`
}

// Validate validates the update profile request
func (r *UpdateProfileRequest) Validate() error {
	if r.DateOfBirth != "" {
		_, err := time.Parse("2006-01-02", r.DateOfBirth)
		if err != nil {
			return fmt.Errorf("invalid date_of_birth format, expected YYYY-MM-DD")
		}
	}

	// Validate gender if provided
	if r.Gender != "" {
		validGenders := []string{"Pria", "Wanita"}
		if !slices.Contains(validGenders, r.Gender) {
			return fmt.Errorf("invalid gender, must be one of: Pria, Wanita")
		}
	}

	return nil
}

type UpdateProfileLocationRequest struct {
	Latitude  decimal.Decimal `json:"latitude"`
	Longitude decimal.Decimal `json:"longitude"`
}

func (r *UpdateProfileLocationRequest) Validate() error {
	if r.Latitude.IsZero() || r.Longitude.IsZero() {
		return errors.New("latitude and longitude are required")
	}

	return nil
}

// ProfileResponse represents the response after updating user profile
type ProfileResponse struct {
	ID                  uuid.UUID           `json:"id"`
	Name                string              `json:"name"`
	Role                string              `json:"role"`
	Email               string              `json:"email"`
	PhotoProfile        null.String         `json:"photo_profile"`
	Gender              null.String         `json:"gender"`
	DateOfBirth         null.String         `json:"date_of_birth"`
	PhoneNumber         null.String         `json:"phone_number"`
	SocialMediaLink     map[string]string   `json:"social_media_link"`
	Latitude            decimal.NullDecimal `json:"latitude"`
	Longitude           decimal.NullDecimal `json:"longitude"`
	LevelPoint          uint                `json:"level_point"`
	Level               null.String         `json:"level,omitempty"`
	FinishUpdateProfile bool                `json:"finish_update_profile"`
	Location            Location            `json:"location"`
	IsPremium           bool                `json:"isPremium"`
}
