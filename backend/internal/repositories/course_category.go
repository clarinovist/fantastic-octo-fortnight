package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type CourseCategoryRepository struct {
	db *infras.MySQL
}

func NewCourseCategoryRepository(db *infras.MySQL) *CourseCategoryRepository {
	return &CourseCategoryRepository{db: db}
}

func (r *CourseCategoryRepository) Get(ctx context.Context, filter model.CourseCategoryFilter) ([]model.CourseCategory, model.Metadata, error) {
	var (
		results  []model.CourseCategory
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.CourseCategory{})

	if filter.Query != "" {
		db = db.Where("name LIKE ?", fmt.Sprintf("%%%s%%", filter.Query))
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting course category")
		return []model.CourseCategory{}, model.Metadata{}, err
	}

	err = db.
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error getting course categories")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}

func (r *CourseCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.CourseCategory, error) {
	var result model.CourseCategory

	err := r.db.Read.Where("id = ?", id).First(&result).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("id", id.String()).Msg("[GetByID] Error getting course category")
		return nil, err
	}

	return &result, nil
}
