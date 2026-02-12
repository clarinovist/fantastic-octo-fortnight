package v1

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetCourses GetCourses
// @Summary GetCourses
// @Description GetCourses
// @Tags courses
// @Param courseCategoryId query string false "id of course category"
// @Param locationId query string false "id of location"
// @Param classType query string false "class type"
// @Param maxPrice query int false "max price"
// @Param rating query int false "rating"
// @Param freeFirstCourse query bool false "free first course"
// @Param latitude query string false "latitude"
// @Param longitude query string false "longitude"
// @Param radius query int false "radius"
// @Param maxResponseTime query int false "max response time"
// @Param levelEducationCourse query string false "level education course"
// @Param page query int false "page"
// @Param pageSize query int false "page size"
// @Param sort query string false "sort"
// @Param sortDirection query string false "sort direction"
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.Course}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/courses [get]
func (a *Api) GetCourses(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetCoursesRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	request.Pagination.SetDefault()
	request.Sort.SetDefault()

	result, metadata, err := a.course.GetCourses(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewCourses(result), base.SetMetadata(metadata))
}

// GetDetailCourse
// @Summary GetDetailCourse
// @Description GetDetailCourse
// @Tags courses
// @Param id path string true "id of course"
// @Produce json
// @Success 200 {object} base.Base{data=dto.CourseDetail}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/courses/{id} [get]
func (a *Api) GetDetailCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	result, err := a.course.GetCourse(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	go func() {
		userID := uuid.Nil
		if uid := r.Context().Value("user_id"); uid != nil {
			if parsedUID, ok := uid.(uuid.UUID); ok {
				userID = parsedUID
			}
		}

		ipAddress := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			ipAddress = forwarded
		}

		userAgent := r.Header.Get("User-Agent")

		_ = a.courseView.RecordView(context.Background(), result.TutorID, result.ID, result.CourseCategoryID, userID, ipAddress, userAgent)
	}()

	response.Success(w, http.StatusOK, dto.NewCourseDetail(result))
}

// GetRelatedCourse
// @Summary GetRelatedCourse
// @Description GetRelatedCourse
// @Tags courses
// @Param id path string true "id of course"
// @Param page query int false "page"
// @Param pageSize query int false "page size"
// @Param sort query string false "sort"
// @Param sortDirection query string false "sort direction"
// @Produce json
// @Success 200 {object} base.Base{data=dto.Course}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/courses/{id}/related [get]
func (a *Api) GetRelatedCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetCoursesRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	request.Pagination.SetDefault()
	request.Sort.SetDefault()

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	request.ID = id

	result, metadata, err := a.course.GetRelatedCourse(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewCourses(result), base.SetMetadata(metadata))
}

// GetBookingCourse
// @Summary GetBookingCourse
// @Description GetBookingCourse
// @Tags courses
// @Param id path string true "id of course"
// @Param startDate query string true "start date"
// @Param endDate query string true "end date"
// @Produce json
// @Success 200 {object} base.Base{data=dto.Course}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/courses/{id}/booking [get]
func (a *Api) GetBookingCourse(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetBookingCourseRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	if err = request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validate request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	request.ID = id
	schedules, bookings, err := a.course.GetBookingCourse(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := dto.NewBookingCourseResponse(ctx, schedules, bookings, request)
	response.Success(w, http.StatusOK, resp)
}
