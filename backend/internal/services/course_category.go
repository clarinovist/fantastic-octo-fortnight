package services

import (
	"context"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type CourseCategoryService struct {
	config           *config.Config
	courseCategories *repositories.CourseCategoryRepository
}

func NewCourseCategoryService(
	c *config.Config,
	courseCategories *repositories.CourseCategoryRepository,
) *CourseCategoryService {
	return &CourseCategoryService{
		config:           c,
		courseCategories: courseCategories,
	}
}

func (s CourseCategoryService) GetCourseCategories(ctx context.Context, request dto.GetCourseCategoriesRequest) ([]model.CourseCategory, model.Metadata, error) {
	filter := model.CourseCategoryFilter{
		Pagination: request.Pagination,
		Query:      request.Query,
	}
	categories, metadata, err := s.courseCategories.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourseCategories] Error getting course categories")
		return nil, model.Metadata{}, err
	}

	return categories, metadata, nil
}

func (s CourseCategoryService) GetTrendingCourseCategories(ctx context.Context) ([]model.CourseCategory, error) {
	filter := model.CourseCategoryFilter{
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 4,
		},
		Sort: model.Sort{
			Sort:          "RAND()",
			SortDirection: "ASC",
		},
	}
	categories, _, err := s.courseCategories.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTrendingCourseCategories] Error getting trending course categories")
		return nil, err
	}

	return categories, nil
}
