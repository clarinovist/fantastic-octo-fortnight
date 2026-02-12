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
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
)

// ApproveCourse
// @Summary Approve a course
// @Description Approves a course and applies changes to the live course
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Param request body dto.ApproveCourseRequest false "Approval request with optional notes"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses/{id}/approve [post]
func (a *Api) ApproveCourse(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.ApproveCourseRequest
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	// Parse and validate ID
	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", idStr).
			Msg("[ApproveCourse] Invalid ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	err = a.course.ApproveCourse(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// RejectCourse
// @Summary Reject a course
// @Description Rejects a course with optional review notes
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Param request body dto.RejectCourseRequest true "Rejection request with notes"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses/{id}/reject [post]
func (a *Api) RejectCourse(w http.ResponseWriter, r *http.Request) {
	var (
		req   dto.RejectCourseRequest
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	// Parse and validate ID
	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", idStr).
			Msg("[RejectCourse] Invalid ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	req.ID = id
	err = a.course.RejectCourse(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// GetCourses
// @Summary Get list of courses for admin
// @Description Get list of all courses with id, updated_at, tutor name, course title, class type, and is_free_first_course
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(10)
// @Param sortBy query string false "Sort by field"
// @Param sortOrder query string false "Sort order (asc/desc)"
// @Param classType query string false "Filter by class type (all/online/offline)"
// @Param isFreeFirstCourse query bool false "Filter by free first course"
// @Param status query string false "Filter by status (Draft/Waiting for Approval/Accepted/Rejected)"
// @Success 200 {object} base.Base{data=[]dto.AdminCourseListResponse,metadata=model.Metadata}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses [get]
func (a *Api) GetCourses(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.AdminGetCoursesRequest
		ctx = r.Context()
	)

	// Decode query parameters
	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Failed to decode query parameters")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid query parameters"), base.SetError(err.Error()))
		return
	}

	// Get courses from service
	courses, metadata, err := a.course.GetCoursesForAdmin(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform to response DTO
	resp := dto.NewAdminCourseListResponses(courses)

	response.Success(w, http.StatusOK, resp, base.SetMetadata(metadata))
}

// GetCourseDetail
// @Summary Get course detail for admin
// @Description Get detailed information about a specific course including tutor info, schedules, prices, and reviews
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Success 200 {object} base.Base{data=dto.AdminCourseDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses/{id} [get]
func (a *Api) GetCourseDetail(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	// Get course ID from path parameter
	idStr := r.PathValue("id")
	if idStr == "" {
		logger.ErrorCtx(ctx).Msg("[GetCourseDetail] Course ID is required")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Course ID is required"))
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourseDetail] Invalid course ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid course ID format"), base.SetError(err.Error()))
		return
	}

	// Get course detail from service
	course, err := a.course.GetCourseDetailForAdmin(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform to response DTO
	resp := dto.NewAdminCourseDetail(course)

	response.Success(w, http.StatusOK, resp)
}

// CreateCourse
// @Summary Create a course as admin
// @Description Allows admin to create a course for any tutor. This will create a draft and set the course status to Draft.
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.AdminCreateCourseRequest true "Course create request"
// @Success 201 {object} base.Base{data=dto.AdminCourseDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses [post]
func (a *Api) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.AdminCreateCourseRequest
		ctx = r.Context()
	)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	req.AdminID = middleware.GetUserID(ctx)

	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Validation failed")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Validation failed"), base.SetError(err.Error()))
		return
	}

	course, err := a.course.CreateCourseForAdmin(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := dto.NewAdminCourseDetail(course)

	logger.InfoCtx(ctx).
		Str("course_id", course.ID.String()).
		Str("admin_id", req.AdminID.String()).
		Str("tutor_id", req.TutorID.String()).
		Msg("[CreateCourse] Course created successfully by admin")

	response.Success(w, http.StatusCreated, resp)
}

// UpdateCourse
// @Summary Update a course as admin
// @Description Allows admin to update any course details. This will create a draft and set the course status to Draft.
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Param request body dto.AdminUpdateCourseRequest true "Course update request"
// @Success 200 {object} base.Base{data=dto.AdminCourseDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses/{id} [put]
func (a *Api) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	var (
		req dto.AdminUpdateCourseRequest
		ctx = r.Context()
	)

	// Get course ID from path parameter
	idStr := r.PathValue("id")
	if idStr == "" {
		logger.ErrorCtx(ctx).Msg("[UpdateCourse] Course ID is required")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Course ID is required"))
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateCourse] Invalid course ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid course ID format"), base.SetError(err.Error()))
		return
	}

	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateCourse] Failed to decode JSON request")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Set IDs from context and path
	req.ID = id
	req.AdminID = middleware.GetUserID(ctx)

	// Validate request
	if err := req.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateCourse] Validation failed")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Validation failed"), base.SetError(err.Error()))
		return
	}

	// Update course via service
	_, err = a.course.UpdateCourseForAdmin(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Get updated course detail
	updatedCourse, err := a.course.GetCourseDetailForAdmin(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform to response DTO
	resp := dto.NewAdminCourseDetail(updatedCourse)

	logger.InfoCtx(ctx).
		Str("course_id", id.String()).
		Str("admin_id", req.AdminID.String()).
		Msg("[UpdateCourse] Course updated successfully by admin")

	response.Success(w, http.StatusOK, resp)
}

// DeleteCourse
// @Summary Delete a course as admin
// @Description Allows admin to soft delete any course by ID
// @Tags admin-course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/courses/{id} [delete]
func (a *Api) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		logger.ErrorCtx(ctx).Msg("[DeleteCourse] Course ID is required")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Course ID is required"))
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteCourse] Invalid course ID format")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid course ID format"), base.SetError(err.Error()))
		return
	}

	err = a.course.DeleteCourseForAdmin(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	logger.InfoCtx(ctx).
		Str("course_id", id.String()).
		Str("admin_id", middleware.GetUserID(ctx).String()).
		Msg("[DeleteCourse] Course deleted successfully by admin")

	response.Success(w, http.StatusOK, "success")
}
