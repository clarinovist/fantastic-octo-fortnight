package admin

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetStudents
// @Summary Get students
// @Description get students
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param q query string false "Query"
// @Param name query string false "Student name"
// @Param email query string false "Student email"
// @Param createdAtFrom query string false "Student created at from"
// @Param createdAtTo query string false "Student created at to"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param sort query string false "Sort by"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=[]dto.AdminStudent,metadata=model.Metadata}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students [get]
func (a *Api) GetStudents(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.GetAdminStudentsRequest
		ctx = r.Context()
	)

	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Query Param format"), base.SetError(err.Error()))
		return
	}

	req.Pagination.SetDefault()
	resp, err := a.student.GetAdminStudents(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp.Data, base.SetMetadata(resp.Metadata))
}

// GetDetailStudent
// @Summary Get detail student
// @Description get detail student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Student ID"
// @Success 200 {object} base.Base{data=dto.AdminDetailStudent}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id} [get]
func (a *Api) GetDetailStudent(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"), base.SetError(err.Error()))
		return
	}

	resp, err := a.student.GetAdminDetailStudent(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, resp)
}

// CreateStudent
// @Summary create student
// @Description create student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateAdminStudentRequest true "create student request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students [post]
func (a *Api) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.CreateAdminStudentRequest
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

	err := a.student.CreateAdminStudent(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateStudent
// @Summary update student
// @Description update student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Student ID"
// @Param request body dto.UpdateAdminStudentRequest true "update student request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id} [put]
func (a *Api) UpdateStudent(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateAdminStudentRequest
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
	err = a.student.UpdateAdminStudent(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// DeleteStudent
// @Summary delete student
// @Description delete student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.DeleteAdminStudentRequest true "delete student request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students [delete]
func (a *Api) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.DeleteAdminStudentRequest
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

	err := a.student.DeleteAdminStudent(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// ChangeRoleStudent
// @Summary change role student
// @Description change role student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "student id"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id}/change-role [post]
func (a *Api) ChangeRoleStudent(w http.ResponseWriter, r *http.Request) {
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

	err = a.student.ChangeRoleAdminStudent(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateStudentStatus
// @Summary update student status
// @Description update student status to active or inactive
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Student ID"
// @Param request body dto.UpdateStudentStatusRequest true "update student status request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id}/status [put]
func (a *Api) UpdateStudentStatus(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateStudentStatusRequest
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
	err = a.student.UpdateStudentStatus(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// UpdateStudentPremium
// @Summary update student premium
// @Description set or remove premium status for a student
// @Tags admin-student
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Student ID"
// @Param request body dto.UpdateStudentPremiumRequest true "update student premium request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id}/premium [put]
func (a *Api) UpdateStudentPremium(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.UpdateStudentPremiumRequest
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

	req.ID = id
	err = a.student.UpdateStudentPremium(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// GenerateMonthlyReport
// @Summary Generate monthly report
// @Description Generate a PDF monthly report for a student
// @Tags admin-student
// @Accept json
// @Produce application/pdf
// @Security BearerAuth
// @Param id path string true "Student ID"
// @Param month query int true "Month (1-12)"
// @Param year query int true "Year"
// @Success 200 {file} file "Returns the PDF file"
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/students/{id}/reports/monthly [get]
func (a *Api) GenerateMonthlyReport(w http.ResponseWriter, r *http.Request) {
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

	monthStr := r.URL.Query().Get("month")
	yearStr := r.URL.Query().Get("year")

	var month, year int
	if _, err := fmt.Sscanf(monthStr, "%d", &month); err != nil || month < 1 || month > 12 {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid month specified"))
		return
	}
	if _, err := fmt.Sscanf(yearStr, "%d", &year); err != nil || year < 2000 {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid year specified"))
		return
	}

	pdfBytes, filename, err := a.monthlyReport.GenerateMonthlyReport(ctx, id, month, year)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	_, _ = w.Write(pdfBytes)
}
