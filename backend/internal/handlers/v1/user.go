package v1

import (
	"encoding/json"
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
)

// Register
// @Summary Register a new user
// @Description Register a new user with name, email, and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Registration request"
// @Success 201 {object} base.Base{data=dto.RegisterResponse}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/register [post]
func (a *Api) Register(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.RegisterRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	user, err := a.user.Register(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to register user")
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	result := dto.NewRegisterResponse(user)
	response.Success(w, http.StatusCreated, result, base.SetMessage("User registered successfully"))
}

// Login
// @Summary Login user
// @Description Login user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login request"
// @Success 200 {object} base.Base{data=dto.LoginResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/login [post]
func (a *Api) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest

	// Parse JSON request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(r.Context()).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	result, err := a.user.Login(r.Context(), req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(r.Context()).Err(err).Msg("failed to login user")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result, base.SetMessage("Login successful"))
}

// RefreshToken
// @Summary Refresh access token
// @Description Refresh access token using a valid refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} base.Base{data=dto.RefreshTokenResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/refresh [post]
func (a *Api) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.RefreshTokenRequest
		ctx = r.Context()
	)

	// Parse JSON request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	// Refresh token
	result, err := a.user.RefreshToken(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to refresh token")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result, base.SetMessage("Token refreshed successfully"))
}

// VerifyEmail
// @Summary Verify email address
// @Description Verify user email address using verification token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.VerifyEmailRequest true "Email verification request"
// @Success 200 {object} base.Base{data=dto.VerifyEmailResponse}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/verify-email [post]
func (a *Api) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.VerifyEmailRequest
		ctx = r.Context()
	)

	// Parse JSON request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	// Verify email
	result, err := a.user.VerifyEmail(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to verify email")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result, base.SetMessage("Email verification completed"))
}

// ResendVerification
// @Summary Resend verification email
// @Description Resend verification email to the user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.ResendVerificationRequest true "Resend verification request"
// @Success 200 {object} base.Base{data=dto.ResendVerificationResponse}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/resend-verification [post]
func (a *Api) ResendVerification(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.ResendVerificationRequest
		ctx = r.Context()
	)

	// Parse JSON request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	// Resend verification
	err := a.user.ResendVerification(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to resend verification")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, dto.ResendVerificationResponse{
		Message: "Verification email sent successfully",
	}, base.SetMessage("Verification email resent"))
}

// GoogleLogin
// @Summary Login with Google SSO
// @Description Login user using Google OAuth ID token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.GoogleLoginRequest true "Google login request"
// @Success 200 {object} base.Base{data=dto.GoogleLoginResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/google [post]
func (a *Api) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.GoogleLoginRequest
		ctx = r.Context()
	)

	// Parse JSON request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	// Perform Google login
	result, err := a.user.GoogleLogin(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to login with Google")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	var message string
	if result.IsNewUser {
		message = "Google login successful - new user created"
	} else {
		message = "Google login successful"
	}

	response.Success(w, http.StatusOK, result, base.SetMessage(message))
}

// CheckUser
// @Summary CheckUser
// @Description CheckUser
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.CheckUserRequest true "Check User Request"
// @Success 200 {object} base.Base{data=dto.CheckUserResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/check-user [post]
func (a *Api) CheckUser(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.CheckUserRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	result, err := a.user.CheckUser(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to login with Google")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result)
}

// ForgotPassword
// @Summary Request password reset
// @Description Send password reset email to user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.ForgotPasswordRequest true "Forgot password request"
// @Success 200 {object} base.Base{data=dto.ForgotPasswordResponse}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/forgot-password [post]
func (a *Api) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.ForgotPasswordRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	result, err := a.user.ForgotPassword(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to process forgot password request")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result, base.SetMessage(result.Message))
}

// ResetPassword
// @Summary Reset password with token
// @Description Reset user password using reset token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.ResetPasswordRequest true "Reset password request"
// @Success 200 {object} base.Base{data=dto.ResetPasswordResponse}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/reset-password [post]
func (a *Api) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.ResetPasswordRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	result, err := a.user.ResetPassword(ctx, req)
	if err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to reset password")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, result, base.SetMessage(result.Message))
}

// ChangePassword
// @Summary Change user password
// @Description Change user password
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.ChangePasswordRequest true "Change password request"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/auth/password [put]
func (a *Api) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.ChangePasswordRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	claims, ok := middleware.GetUserClaims(ctx)
	if !ok {
		logger.ErrorCtx(ctx).Msg("failed to get claims from context")
		response.Failure(w, base.SetStatusCode(http.StatusUnauthorized), base.SetMessage("Unauthorized"))
		return
	}

	if err := a.user.ChangePassword(ctx, claims.UserID, req); err != nil {
		if serviceErr, ok := err.(base.Error); ok {
			response.Failure(w, base.CustomError(serviceErr))
			return
		}
		logger.ErrorCtx(ctx).Err(err).Msg("failed to change password")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal server error"))
		return
	}

	response.Success(w, http.StatusOK, nil, base.SetMessage("Password changed successfully"))
}
