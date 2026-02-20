package v1

import (
	"encoding/json"
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
)

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update user profile data (student or tutor based on role)
// @Tags profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.UpdateProfileRequest true "Profile update data"
// @Success 200 {object} base.Base{data=string} "Profile updated successfully"
// @Failure 400 {object} base.Base "Bad request - validation error"
// @Failure 401 {object} base.Base "Unauthorized - invalid or missing token"
// @Failure 404 {object} base.Base "Not found - user or profile not found"
// @Failure 500 {object} base.Base "Internal server error"
// @Router /v1/profile [put]
func (a *Api) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId := middleware.GetUserID(ctx)

	var req dto.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userId.String()).
			Msg("[UpdateProfile] Failed to decode request body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid request body"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userId.String()).
			Msg("[UpdateProfile] Request validation failed")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	err := a.profile.UpdateProfile(ctx, userId, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateProfileLocation godoc
// @Summary Update user location
// @Description Update user location data (student or tutor based on role)
// @Tags profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.UpdateProfileLocationRequest true "Profile location update data"
// @Success 200 {object} base.Base{data=string} "Profile updated successfully"
// @Failure 400 {object} base.Base "Bad request - validation error"
// @Failure 401 {object} base.Base "Unauthorized - invalid or missing token"
// @Failure 404 {object} base.Base "Not found - user or profile not found"
// @Failure 500 {object} base.Base "Internal server error"
// @Router /v1/profile/location [put]
func (a *Api) UpdateProfileLocation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId := middleware.GetUserID(ctx)

	var req dto.UpdateProfileLocationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userId.String()).
			Msg("[UpdateProfileLocation] Failed to decode request body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid request body"), base.SetError(err.Error()))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userId.String()).
			Msg("[UpdateProfileLocation] Request validation failed")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage(err.Error()), base.SetError(err.Error()))
		return
	}

	err := a.profile.UpdateProfileLocation(ctx, userId, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// GetProfile
// @Summary Get current user information from JWT token
// @Description Returns the current user's information extracted from the JWT token
// @Tags profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} base.Base{data=dto.ProfileResponse}
// @Failure 401 {object} base.Base
// @Router /v1/me [get]
func (a *Api) GetProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId := middleware.GetUserID(ctx)

	profile, err := a.profile.GetProfile(ctx, userId)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, profile)
}

// GetTutorLevel
// @Summary Get tutor level information
// @Description Returns the tutor's current level, points, and next level requirements
// @Tags profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} base.Base{data=dto.TutorLevelInfo}
// @Failure 401 {object} base.Base
// @Router /v1/tutors/level [get]
func (a *Api) GetTutorLevel(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userId := middleware.GetUserID(ctx)

	info, err := a.profile.GetTutorLevel(ctx, userId)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, info)
}
