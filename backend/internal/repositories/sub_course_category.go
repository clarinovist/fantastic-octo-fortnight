package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type SubCourseCategoryRepository struct {
	db *infras.MySQL
}

func NewSubCourseCategoryRepository(db *infras.MySQL) *SubCourseCategoryRepository {
	return &SubCourseCategoryRepository{db: db}
}

func (r *SubCourseCategoryRepository) GetByCourseCategoryID(ctx context.Context, courseCategoryID uuid.UUID, filter model.SubCourseCategoryFilter) ([]model.SubCourseCategory, model.Metadata, error) {
	var (
		results  []model.SubCourseCategory
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	db := r.db.Read.Model(&model.SubCourseCategory{}).Where("course_category_id = ?", courseCategoryID)

	// Apply name filter if provided
	if filter.Name != "" {
		db = db.Where("name LIKE ?", fmt.Sprintf("%%%s%%", filter.Name))
	}

	// Count total records
	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByCourseCategoryID] Error counting sub course categories")
		return []model.SubCourseCategory{}, model.Metadata{}, err
	}

	// Apply sorting
	orderBy := "created_at DESC" // default sorting
	if filter.Sort.Sort != "" {
		direction := "ASC"
		if filter.Sort.SortDirection == "desc" {
			direction = "DESC"
		}

		// Validate allowed sort fields
		allowedFields := map[string]bool{
			"name":       true,
			"created_at": true,
			"updated_at": true,
		}

		if allowedFields[filter.Sort.Sort] {
			orderBy = fmt.Sprintf("%s %s", filter.Sort.Sort, direction)
		}
	}

	// Get paginated results with sorting
	err = db.
		Order(orderBy).
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByCourseCategoryID] Error getting sub course categories")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}

func (r *SubCourseCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SubCourseCategory, error) {
	var result model.SubCourseCategory

	err := r.db.Read.Where("id = ?", id).First(&result).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("id", id.String()).Msg("[GetByID] Error getting sub course category")
		return nil, err
	}

	return &result, nil
}

func (r *SubCourseCategoryRepository) GetByIDs(ctx context.Context, ids []uuid.UUID) ([]model.SubCourseCategory, error) {
	var results []model.SubCourseCategory

	if len(ids) == 0 {
		return results, nil
	}

	err := r.db.Read.Where("id IN ?", ids).Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByIDs] Error getting sub course categories")
		return nil, err
	}

	return results, nil
}

func (r *SubCourseCategoryRepository) Create(ctx context.Context, subCourseCategory *model.SubCourseCategory) error {
	err := r.db.Write.Create(subCourseCategory).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Create] Error creating sub course category")
		return err
	}

	return nil
}

func (r *SubCourseCategoryRepository) Update(ctx context.Context, subCourseCategory *model.SubCourseCategory) error {
	err := r.db.Write.Save(subCourseCategory).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Update] Error updating sub course category")
		return err
	}

	return nil
}

func (r *SubCourseCategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	err := r.db.Write.Delete(&model.SubCourseCategory{}, "id = ?", id).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("id", id.String()).Msg("[Delete] Error deleting sub course category")
		return err
	}

	return nil
}
