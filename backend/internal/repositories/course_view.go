package repositories

import (
	"context"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type CourseViewRepository struct {
	db *infras.MySQL
}

func NewCourseViewRepository(db *infras.MySQL) *CourseViewRepository {
	return &CourseViewRepository{db: db}
}

func (r *CourseViewRepository) Create(ctx context.Context, courseView *model.CourseView) error {
	err := r.db.Write.WithContext(ctx).Create(courseView).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", courseView.TutorID.String()).
			Str("course_id", courseView.CourseID.String()).
			Str("course_category_id", courseView.CourseCategoryID.String()).
			Msg("[Create] Error creating course view")
		return err
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", courseView.TutorID.String()).
		Str("course_id", courseView.CourseID.String()).
		Str("course_category_id", courseView.CourseCategoryID.String()).
		Msg("[Create] Course view recorded successfully")

	return nil
}

func (r *CourseViewRepository) Get(ctx context.Context, filter model.CourseViewFilter) ([]model.CourseView, model.Metadata, error) {
	var (
		results  []model.CourseView
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	db := r.db.Read.WithContext(ctx).Model(&model.CourseView{})

	if filter.TutorID.String() != "00000000-0000-0000-0000-000000000000" {
		db = db.Where("tutor_id = ?", filter.TutorID)
	}

	if filter.UserID.String() != "00000000-0000-0000-0000-000000000000" {
		db = db.Where("user_id = ?", filter.UserID)
	}

	if filter.CourseID.String() != "00000000-0000-0000-0000-000000000000" {
		db = db.Where("course_id = ?", filter.CourseID)
	}

	if filter.CourseCategoryID.String() != "00000000-0000-0000-0000-000000000000" {
		db = db.Where("course_category_id = ?", filter.CourseCategoryID)
	}

	if !filter.StartDate.IsZero() {
		db = db.Where("created_at >= ?", filter.StartDate)
	}

	if !filter.EndDate.IsZero() {
		db = db.Where("created_at <= ?", filter.EndDate)
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting course views")
		return []model.CourseView{}, model.Metadata{}, err
	}
	metadata.Total = total

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Failed to get course views")
		return nil, metadata, err
	}

	return results, metadata, nil
}

func (r *CourseViewRepository) CountByTutorID(ctx context.Context, tutorID string) (int64, error) {
	var count int64
	err := r.db.Read.WithContext(ctx).
		Model(&model.CourseView{}).
		Where("tutor_id = ?", tutorID).
		Count(&count).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutorID).
			Msg("[CountByTutorID] Error counting course views")
		return 0, err
	}

	return count, nil
}

func (r *CourseViewRepository) GetTopViewedTutors(ctx context.Context, limit int) ([]model.TutorViewStatistic, error) {
	var results []model.TutorViewStatistic

	err := r.db.Read.WithContext(ctx).
		Table("course_views").
		Select("tutors.id as tutor_id, users.name as tutor_name, tutors.photo_profile, COUNT(course_views.id) as view_count").
		Joins("JOIN tutors ON course_views.tutor_id = tutors.id").
		Joins("JOIN users ON tutors.user_id = users.id").
		Group("tutors.id, users.name, tutors.photo_profile").
		Order("view_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Int("limit", limit).
			Msg("[GetTopViewedTutors] Error getting top viewed tutors")
		return nil, err
	}

	logger.InfoCtx(ctx).
		Int("result_count", len(results)).
		Int("limit", limit).
		Msg("[GetTopViewedTutors] Successfully retrieved top viewed tutors")

	return results, nil
}

func (r *CourseViewRepository) GetTopViewedCategories(ctx context.Context, limit int) ([]model.CategoryViewStatistic, error) {
	var results []model.CategoryViewStatistic

	err := r.db.Read.WithContext(ctx).
		Table("course_views").
		Select("course_categories.id as category_id, course_categories.name as category_name, COUNT(course_views.id) as view_count").
		Joins("JOIN course_categories ON course_views.course_category_id = course_categories.id").
		Group("course_categories.id, course_categories.name").
		Order("view_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Int("limit", limit).
			Msg("[GetTopViewedCategories] Error getting top viewed categories")
		return nil, err
	}

	logger.InfoCtx(ctx).
		Int("result_count", len(results)).
		Int("limit", limit).
		Msg("[GetTopViewedCategories] Successfully retrieved top viewed categories")

	return results, nil
}
