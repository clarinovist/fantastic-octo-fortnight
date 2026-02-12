package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type SubCourseCategoryService struct {
	config              *config.Config
	subCourseCategories *repositories.SubCourseCategoryRepository
	courseCategories    *repositories.CourseCategoryRepository
}

func NewSubCourseCategoryService(
	c *config.Config,
	subCourseCategories *repositories.SubCourseCategoryRepository,
	courseCategories *repositories.CourseCategoryRepository,
) *SubCourseCategoryService {
	return &SubCourseCategoryService{
		config:              c,
		subCourseCategories: subCourseCategories,
		courseCategories:    courseCategories,
	}
}

func (s *SubCourseCategoryService) GetSubCourseCategories(ctx context.Context, courseCategoryID uuid.UUID, request dto.GetSubCourseCategoriesRequest) ([]model.SubCourseCategory, model.Metadata, error) {
	// Validate that the course category exists
	_, err := s.courseCategories.GetByID(ctx, courseCategoryID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_category_id", courseCategoryID.String()).Msg("[GetSubCourseCategories] Course category not found")
		return nil, model.Metadata{}, err
	}

	filter := model.SubCourseCategoryFilter{
		CourseCategoryID: courseCategoryID,
		Pagination:       request.Pagination,
		Sort:             request.Sort,
		Name:             request.Name,
	}

	subCategories, metadata, err := s.subCourseCategories.GetByCourseCategoryID(ctx, courseCategoryID, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_category_id", courseCategoryID.String()).Msg("[GetSubCourseCategories] Error getting sub course categories")
		return nil, model.Metadata{}, err
	}

	return subCategories, metadata, nil
}
