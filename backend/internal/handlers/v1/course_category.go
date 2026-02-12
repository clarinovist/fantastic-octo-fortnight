package v1

import (
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetCourseCategories get all course categories
// @Summary Get all course categories
// @Description get all course categories
// @Tags course-category
// @Param q query string false "search query"
// @Param page query int false "page number"
// @Param pageSize query int false "page size"
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.CourseCategory}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/course-categories [get]
func (a *Api) GetCourseCategories(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetCourseCategoriesRequest
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

	categories, metadata, err := a.courseCategory.GetCourseCategories(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewCourseCategories(categories), base.SetMetadata(metadata))
}

// GetTrendingCourseCategories get trending course categories
// @Summary Get trending course categories
// @Description get trending course categories
// @Tags course-category
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.CourseCategory}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/course-categories/trending [get]
func (a *Api) GetTrendingCourseCategories(w http.ResponseWriter, r *http.Request) {
	var (
		ctx = r.Context()
	)

	categories, err := a.courseCategory.GetTrendingCourseCategories(ctx)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewCourseCategories(categories))
}
