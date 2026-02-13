package admin

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetTutors
// @Summary Get tutors
// @Description get tutors
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param q query string false "Query"
// @Param name query string false "Tutor name"
// @Param email query string false "Tutor email"
// @Param createdAtFrom query string false "Tutor created at from"
// @Param createdAtTo query string false "Tutor created at to"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param sort query string false "Sort by"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=[]dto.AdminTutor,metadata=model.Metadata}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors [get]
func (a *Api) GetTutors(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.GetAdminTutorsRequest
		ctx = r.Context()
	)

	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Query Param format"), base.SetError(err.Error()))
		return
	}

	req.Pagination.SetDefault()
	resp, err := a.tutor.GetAdminTutors(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp.Data, base.SetMetadata(resp.Metadata))
}

// GetDetailTutor
// @Summary Get detail tutor
// @Description get detail tutor
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Tutor ID"
// @Success 200 {object} base.Base{data=dto.AdminDetailTutor}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{id} [get]
func (a *Api) GetDetailTutor(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"), base.SetError(err.Error()))
		return
	}

	resp, err := a.tutor.GetAdminDetailTutor(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp)
}

// CreateTutor
// @Summary create tutor
// @Description create tutor
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateAdminTutorRequest true "create tutor request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors [post]
func (a *Api) CreateTutor(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.CreateAdminTutorRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validating request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Request"), base.SetError(err.Error()))
		return
	}

	err := a.tutor.CreateAdminTutor(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateTutor
// @Summary update tutor
// @Description update tutor
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Tutor ID"
// @Param request body dto.UpdateAdminTutorRequest true "update tutor request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{id} [put]
func (a *Api) UpdateTutor(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateAdminTutorRequest
		idStr = chi.URLParam(r, "id")
		ctx   = r.Context()
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validating request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Request"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	err = a.tutor.UpdateAdminTutor(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateTutorStatus
// @Summary update tutor status
// @Description update tutor status to active or inactive
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Tutor ID"
// @Param request body dto.UpdateTutorStatusRequest true "update tutor status request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{id}/status [put]
func (a *Api) UpdateTutorStatus(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateTutorStatusRequest
		idStr = chi.URLParam(r, "id")
		ctx   = r.Context()
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validating request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Request"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	err = a.tutor.UpdateTutorStatus(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// DeleteTutor
// @Summary delete tutor
// @Description delete tutor
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.DeleteAdminTutorRequest true "delete tutor request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors [delete]
func (a *Api) DeleteTutor(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.DeleteAdminTutorRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validating request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Request"), base.SetError(err.Error()))
		return
	}

	err := a.tutor.DeleteAdminTutor(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// ChangeRoleTutor
// @Summary change role tutor
// @Description change role tutor
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "tutor id"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{id}/change-role [post]
func (a *Api) ChangeRoleTutor(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	err = a.tutor.ChangeRoleAdminTutor(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// GetTutorCourses
// @Summary Get tutor courses
// @Description get courses by tutor ID
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tutorId path string true "Tutor ID"
// @Success 200 {object} base.Base{data=[]dto.AdminTutorCourse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{tutorId}/courses [get]
func (a *Api) GetTutorCourses(w http.ResponseWriter, r *http.Request) {
	var (
		ctx      = r.Context()
		tutorStr = chi.URLParam(r, "tutorId")
	)

	tutorID, err := uuid.Parse(tutorStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourses] Invalid tutor ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid tutor ID format"), base.SetError(err.Error()))
		return
	}

	courses, err := a.tutor.GetTutorCourses(ctx, tutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourses] Failed to get tutor courses")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, courses)
}
