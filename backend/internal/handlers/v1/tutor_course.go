package v1

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

// CreateTutorCourse creates a new course
// @Summary Create Course
// @Description Create a new course with all its relationships
// @Tags tutor-course
// @Accept json
// @Produce json
// @Param request body dto.TutorCourseRequest true "Course creation request"
// @Success 201 {object} base.Base{data=dto.TutorCourseResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/courses [post]
func (a *Api) CreateTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.TutorCourseRequest
	)

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Request validation failed")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Validation failed"
		})
		return
	}

	request.UserID = middleware.GetUserID(ctx)
	course, err := a.course.CreateCourse(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Error creating course")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	logger.InfoCtx(ctx).
		Str("course_id", course.ID.String()).
		Str("user_id", request.UserID.String()).
		Msg("[CreateCourse] Course created successfully")

	response.Success(w, http.StatusCreated, dto.NewTutorCourseResponse(course))
}

// ListTutorCourses
// @Summary List courses for authenticated tutor with draft status indicators
// @Description Retrieves all courses for the authenticated tutor including draft status information
// @Tags tutor-course
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by course status"
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10)
// @Param sort query string false "Sort by field"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=[]dto.TutorCourseListResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/tutors/courses [get]
func (a *Api) ListTutorCourses(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	// Parse query parameters
	var req dto.ListTutorCoursesRequest
	if err := decoder.Decode(&req, r.URL.Query()); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorCourses] Error decoding query parameters")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Message = "invalid query parameters"
			b.Error = err.Error()
		})
		return
	}

	req.UserID = middleware.GetUserID(ctx)
	courses, metadata, err := a.course.ListCoursesForTutor(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	courseResponses := make([]dto.TutorCourseListResponse, len(courses))
	for i, course := range courses {
		courseResponses[i] = dto.NewTutorCourseListResponse(course)
	}

	response.Success(w, http.StatusOK, courseResponses, base.SetMetadata(metadata))
}

// GetTutorCourse
// @Summary get detail tutor course
// @Description get detail tutor course
// @Tags tutor-course
// @Produce json
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Success 200 {object} base.Base{data=[]dto.TutorCourseListResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/tutors/courses/{id} [get]
func (a *Api) GetTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("id", idStr).Msg("Invalid course ID format")
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("Invalid course ID format"),
		)
		return
	}

	req := dto.GetTutorCourseRequest{
		ID:     id,
		UserID: middleware.GetUserID(ctx),
	}

	courses, err := a.course.GetCoursesForTutor(ctx, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewTutorCourseResponse(courses))
}

// UpdateTutorCourse updates an existing course through the draft system
// @Summary Update Course
// @Description Update an existing course. If course status is Draft, updates existing draft. If not Draft, creates new draft with edited data.
// @Tags tutor-course
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param request body dto.TutorCourseRequest true "Course update request"
// @Success 200 {object} base.Base{data=dto.TutorCourseResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/courses/{id} [put]
func (a *Api) UpdateTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.TutorCourseRequest
	)

	// Get course ID from URL parameter
	courseIDStr := chi.URLParam(r, "id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseIDStr).Msg("[UpdateTutorCourse] Invalid course ID format")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "invalid_course_id"
			b.Message = "Invalid course ID format"
		})
		return
	}

	if err = json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorCourse] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "invalid_request"
			b.Message = "Invalid request body"
		})
		return
	}

	if err = request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorCourse] Request validation failed")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "validation_error"
			b.Message = err.Error()
		})
		return
	}

	request.ID = courseID
	request.UserID = middleware.GetUserID(ctx)
	course, err := a.course.UpdateCourse(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewTutorCourseResponse(course))
}

// DeleteTutorCourse Delete course
// @Summary Delete course
// @Description Delete course
// @Tags tutor-course
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/courses/{id} [delete]
func (a *Api) DeleteTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	// Get course ID from URL parameter
	courseIDStr := chi.URLParam(r, "id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseIDStr).Msg("[DeleteTutorCourse] Invalid course ID format")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "invalid_course_id"
			b.Message = "Invalid course ID format"
		})
		return
	}

	err = a.course.DeleteCourse(ctx, courseID)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}

// SubmitTutorCourse submits a course for admin review
// @Summary Submit Course for Review
// @Description Submit a course for admin review. Updates course status to "Waiting for Approval" and draft status to "Pending Approval"
// @Tags tutor-course
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/courses/{id}/submit [post]
func (a *Api) SubmitTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	courseIDStr := chi.URLParam(r, "id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseIDStr).Msg("[SubmitTutorCourse] Invalid course ID format")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "invalid_course_id"
			b.Message = "Invalid course ID format"
		})
		return
	}

	userID := middleware.GetUserID(ctx)
	err = a.course.SubmitCourseForReview(ctx, courseID, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[SubmitTutorCourse] Error submitting course for review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	logger.InfoCtx(ctx).
		Str("course_id", courseID.String()).
		Str("user_id", userID.String()).
		Msg("[SubmitTutorCourse] Course submitted for review successfully")

	response.Success(w, http.StatusOK, "success")
}

// PublishTutorCourse publish a course
// @Summary Publish Course
// @Description Puslibh a course for admin review
// @Tags tutor-course
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param request body dto.PublishTutorCourseRequest true "Course publish request"
// @Success 200 {object} base.Base
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/courses/{id}/publish [put]
func (a *Api) PublishTutorCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx    = r.Context()
		userID = middleware.GetUserID(ctx)
	)

	courseIDStr := chi.URLParam(r, "id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseIDStr).Msg("[PublishTutorCourse] Invalid course ID format")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = "invalid_course_id"
			b.Message = "Invalid course ID format"
		})
		return
	}

	var request dto.PublishTutorCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.ID = courseID
	err = a.course.PublishCourse(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[PublishTutorCourse] Error submitting course for review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
