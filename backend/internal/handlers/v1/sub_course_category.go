package v1

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetSubCourseCategories get sub course categories by course category ID
// @Summary Get sub course categories by course category ID
// @Description Get sub course categories filtered by course category ID with optional name filter, pagination and sorting
// @Tags course-category
// @Param courseCategoryId path string true "Course Category ID"
// @Param name query string false "Filter by name"
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param sort query string false "Sort field (name, created_at, updated_at)"
// @Param direction query string false "Sort direction (asc, desc)"
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.SubCourseCategory}
// @Failure 400 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/course-categories/{courseCategoryId}/sub [get]
func (a *Api) GetSubCourseCategories(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetSubCourseCategoriesRequest
	)

	// Extract course category ID from URL path
	courseCategoryIDStr := chi.URLParam(r, "courseCategoryId")
	if courseCategoryIDStr == "" {
		logger.ErrorCtx(ctx).Msg("Course category ID is required")
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("Course category ID is required"),
		)
		return
	}

	courseCategoryID, err := uuid.Parse(courseCategoryIDStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_category_id", courseCategoryIDStr).Msg("Invalid course category ID format")
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("Invalid course category ID format"),
		)
		return
	}

	// Decode query parameters
	err = decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage(err.Error()),
			base.SetError(err.Error()),
		)
		return
	}

	// Set pagination defaults
	request.Pagination.SetDefault()

	// Get sub course categories from service
	subCategories, metadata, err := a.subCourseCategory.GetSubCourseCategories(ctx, courseCategoryID, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_category_id", courseCategoryID.String()).Msg("Error getting sub course categories")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewSubCourseCategories(subCategories), base.SetMetadata(metadata))
}
