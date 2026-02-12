package dto

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/internal/model"
)

// RegisterRequest represents the request payload for user registration
type RegisterRequest struct {
	Name        string `json:"name" form:"name"`
	Email       string `json:"email" form:"email"`
	Password    string `json:"password" form:"password"`
	PhoneNumber string `json:"phoneNumber" form:"phoneNumber"`
	RoleName    string `json:"roleName" form:"roleName"`
}

func (r *RegisterRequest) Validate() error {
	// Validate name
	if strings.TrimSpace(r.Name) == "" {
		return errors.New("name is required")
	}
	if len(r.Name) < 2 || len(r.Name) > 100 {
		return errors.New("name must be between 2 and 100 characters")
	}

	// Validate email
	if strings.TrimSpace(r.Email) == "" {
		return errors.New("email is required")
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(r.Email) {
		return errors.New("invalid email format")
	}

	// Validate password
	if strings.TrimSpace(r.Password) == "" {
		return errors.New("password is required")
	}
	if len(r.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	// Validate phone number
	if strings.TrimSpace(r.PhoneNumber) == "" {
		return errors.New("phone number is required")
	}
	// Basic phone number validation (digits, spaces, hyphens, plus sign)
	phoneRegex := regexp.MustCompile(`^[+]?[0-9\s\-()]{10,20}$`)
	if !phoneRegex.MatchString(r.PhoneNumber) {
		return errors.New("invalid phone number format")
	}

	// Validate role name
	if strings.TrimSpace(r.RoleName) == "" {
		return errors.New("role name is required")
	}
	// Validate role name against allowed values
	allowedRoles := []string{"student", "tutor"}
	roleValid := false
	for _, role := range allowedRoles {
		if r.RoleName == role {
			roleValid = true
			break
		}
	}
	if !roleValid {
		return errors.New("invalid role name. Allowed roles: student, tutor")
	}

	return nil
}

// RegisterResponse represents the response payload for user registration
type RegisterResponse struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Email       string            `json:"email"`
	PhoneNumber string            `json:"phoneNumber"`
	LoginSource model.LoginSource `json:"loginSource"`
	CreatedAt   time.Time         `json:"createdAt"`
}

func NewRegisterResponse(user model.User) RegisterResponse {
	return RegisterResponse{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		LoginSource: user.LoginSource,
		CreatedAt:   user.CreatedAt,
	}
}

// LoginRequest represents the request payload for user login
type LoginRequest struct {
	Email    string `json:"email" form:"email"`
	Password string `json:"password" form:"password"`
}

// LoginResponse represents the response payload for user login
type LoginResponse struct {
	ID               uuid.UUID         `json:"id"`
	Name             string            `json:"name"`
	Email            string            `json:"email"`
	LoginSource      model.LoginSource `json:"loginSource"`
	AccessToken      string            `json:"accessToken"`
	RefreshToken     string            `json:"refreshToken"`
	TokenType        string            `json:"tokenType"`
	ExpiresIn        int64             `json:"expiresIn"`
	RefreshExpiresIn int64             `json:"refreshExpiresIn"`
}

// RefreshTokenRequest represents the request payload for token refresh
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" form:"refreshToken"`
}

// Validate validates the refresh token request
func (r *RefreshTokenRequest) Validate() error {
	if strings.TrimSpace(r.RefreshToken) == "" {
		return errors.New("refresh token is required")
	}
	return nil
}

// RefreshTokenResponse represents the response payload for token refresh
type RefreshTokenResponse struct {
	AccessToken      string `json:"accessToken"`
	RefreshToken     string `json:"refreshToken"`
	TokenType        string `json:"tokenType"`
	ExpiresIn        int64  `json:"expiresIn"`
	RefreshExpiresIn int64  `json:"refreshExpiresIn"`
}

// VerifyEmailRequest represents the request payload for email verification
type VerifyEmailRequest struct {
	Token string `json:"token" form:"token"`
}

// Validate validates the verify email request
func (r *VerifyEmailRequest) Validate() error {
	if strings.TrimSpace(r.Token) == "" {
		return errors.New("verification token is required")
	}
	return nil
}

// VerifyEmailResponse represents the response payload for email verification
type VerifyEmailResponse struct {
	Message  string `json:"message"`
	Verified bool   `json:"verified"`
}

// GoogleLoginRequest represents the request payload for Google SSO login
type GoogleLoginRequest struct {
	IDToken  string      `json:"idToken" form:"idToken"`
	RoleName null.String `json:"roleName" form:"roleName"`
}

// Validate validates the Google login request
func (r *GoogleLoginRequest) Validate() error {
	if strings.TrimSpace(r.IDToken) == "" {
		return errors.New("Google ID token is required")
	}

	// Validate role name if provided
	if r.RoleName.Valid {
		roleName := strings.TrimSpace(r.RoleName.String)
		if roleName == "" {
			return errors.New("role name cannot be empty when provided")
		}
		// Validate role name against allowed values
		allowedRoles := []string{"student", "tutor"}
		roleValid := false
		for _, role := range allowedRoles {
			if roleName == role {
				roleValid = true
				break
			}
		}
		if !roleValid {
			return errors.New("invalid role name. Allowed roles: student, tutor, admin")
		}
	}

	return nil
}

// GoogleLoginResponse represents the response payload for Google SSO login
type GoogleLoginResponse struct {
	ID               uuid.UUID         `json:"id"`
	Name             string            `json:"name"`
	Email            string            `json:"email"`
	LoginSource      model.LoginSource `json:"loginSource"`
	AccessToken      string            `json:"accessToken"`
	RefreshToken     string            `json:"refreshToken"`
	TokenType        string            `json:"tokenType"`
	ExpiresIn        int64             `json:"expiresIn"`
	RefreshExpiresIn int64             `json:"refreshExpiresIn"`
	IsNewUser        bool              `json:"isNewUser"`
}

type CheckUserRequest struct {
	IDToken string `json:"idToken" form:"idToken"`
}

func (r *CheckUserRequest) Validate() error {
	if strings.TrimSpace(r.IDToken) == "" {
		return errors.New("Google ID token is required")
	}

	return nil
}

type CheckUserResponse struct {
	Email     string `json:"email"`
	IsNewUser bool   `json:"isNewUser"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" form:"email"`
}

func (r *ForgotPasswordRequest) Validate() error {
	if strings.TrimSpace(r.Email) == "" {
		return errors.New("email is required")
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(r.Email) {
		return errors.New("invalid email format")
	}
	return nil
}

type ForgotPasswordResponse struct {
	Message string `json:"message"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" form:"token"`
	NewPassword string `json:"newPassword" form:"newPassword"`
}

func (r *ResetPasswordRequest) Validate() error {
	if strings.TrimSpace(r.Token) == "" {
		return errors.New("reset token is required")
	}
	if strings.TrimSpace(r.NewPassword) == "" {
		return errors.New("new password is required")
	}
	if len(r.NewPassword) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	return nil
}

type ResetPasswordResponse struct {
	Message string `json:"message"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" form:"oldPassword"`
	NewPassword string `json:"newPassword" form:"newPassword"`
}

func (r *ChangePasswordRequest) Validate() error {
	if strings.TrimSpace(r.OldPassword) == "" {
		return errors.New("old password is required")
	}
	if strings.TrimSpace(r.NewPassword) == "" {
		return errors.New("new password is required")
	}
	if len(r.NewPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}
	if r.OldPassword == r.NewPassword {
		return errors.New("new password cannot be the same as the old password")
	}
	return nil
}
