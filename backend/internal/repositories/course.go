package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type CourseRepository struct {
	db *infras.MySQL
}

func NewCourseRepository(db *infras.MySQL) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) Get(ctx context.Context, filter model.CourseFilter) ([]model.Course, model.Metadata, error) {
	var (
		results  []model.Course
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	db := r.db.Read.Model(&model.Course{}).Preload("CourseCategory").
		Joins("LEFT JOIN tutors ON tutors.id = courses.tutor_id").
		Preload("SubCourseCategories.SubCourseCategory").
		Preload("LevelEducationCourses").
		Preload("CoursePrices", func(db *gorm.DB) *gorm.DB {
			db = db.Order("duration_in_hour asc")
			return db
		}).
		Preload("TutorReviews", func(db *gorm.DB) *gorm.DB {
			return db.Where("tutor_reviews.is_submitted = ?", 1)
		}).
		Preload("TutorReviews.Student.User").
		Preload("Tutor.User").
		Preload("CourseSchedules")

	if filter.ID != uuid.Nil {
		db = db.Where("courses.id = ?", filter.ID)
	}

	if filter.NotID != uuid.Nil {
		db = db.Where("courses.id <> ?", filter.NotID)
	}

	if len(filter.LevelEducationCourse) > 0 {
		subQuery := r.db.Read.Model(&model.LevelEducationCourse{}).Select("course_id").Where("level_of_education IN ?", filter.LevelEducationCourse)
		db = db.Where("courses.id IN (?)", subQuery)
	}

	if filter.TutorID != uuid.Nil {
		db = db.Where("courses.tutor_id = ?", filter.TutorID)
	}

	if filter.CourseCategoryID != uuid.Nil {
		db = db.Where("course_category_id = ?", filter.CourseCategoryID)
	}

	if filter.LocationID != uuid.Nil {
		db = db.Where("tutors.location_id = ?", filter.LocationID)
	}

	if filter.ClassType != "" {
		db = db.Where("class_type = ?", filter.ClassType)
	}

	if filter.MinRating.Valid {
		db = db.Where("rating >= ?", filter.MinRating)
	}

	if filter.MaxRating.Valid {
		db = db.Where("rating < ?", filter.MaxRating)
	}

	if filter.MaxPrice.GreaterThan(decimal.Zero) {
		db = db.Where("price <= ?", filter.MaxPrice)
	}

	if filter.FreeFirstCourse.Valid {
		db = db.Where("is_free_first_course = ?", filter.FreeFirstCourse)
	}

	if filter.IsPublished.Valid {
		db = db.Where("is_published = ?", filter.IsPublished)
	}

	if filter.Radius > 0 {
		db = db.Where(`(6371 * acos(
			cos(radians(?)) *
			cos(radians(tutors.latitude)) *
			cos(radians(tutors.longitude) - radians(?)) +
			sin(radians(?)) *
			sin(radians(tutors.latitude))
		)) <= ?`, filter.Latitude, filter.Longitude, filter.Latitude, filter.Radius)
	}

	if filter.MaxResponseTime > 0 {
		db = db.Where("tutors.response_time <= ?", filter.MaxResponseTime)
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting courses")
		return []model.Course{}, model.Metadata{}, err
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error getting courses")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}

func (r *CourseRepository) CountStudentByCourseID(ctx context.Context, id uuid.UUID) (int, error) {
	var count int64
	err := r.db.Read.Model(&model.StudentCourse{}).Where("course_id = ?", id).Count(&count).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CountStudentByCourseID] Error counting students by course ID")
		return 0, err
	}

	return int(count), nil
}

func (r *CourseRepository) CreateCourse(ctx context.Context, course model.Course) error {
	return r.db.Write.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&course).Error; err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateCourse] Error creating course")
			return err
		}

		return nil
	})
}

// GetByID gets a course by ID with all relationships
func (r *CourseRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Course, error) {
	var course model.Course
	err := r.db.Read.
		Preload("CourseCategory").
		Preload("SubCourseCategories").
		Preload("LevelEducationCourses").
		Preload("CoursePrices").
		Preload("CourseSchedules").
		Preload("Draft", func(db *gorm.DB) *gorm.DB { return db.Where("status <> ?", model.DraftStatusApproved) }).
		Preload("Tutor").
		Where("id = ?", id).
		First(&course).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.InfoCtx(ctx).
				Str("course_id", id.String()).
				Msg("[GetByID] Course not found")
			return nil, nil
		}

		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", id.String()).
			Msg("[GetByID] Error getting course by ID")
		return nil, err
	}

	return &course, nil
}

// GetTutorCourse gets courses with for tutor management
func (r *CourseRepository) GetTutorCourse(ctx context.Context, filter model.CourseFilter) ([]model.Course, model.Metadata, error) {
	var (
		results  []model.Course
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	// Base query for courses
	db := r.db.Read.Model(&model.Course{}).
		Preload("CourseCategory").
		Preload("CoursePrices", func(db *gorm.DB) *gorm.DB {
			return db.Order("duration_in_hour asc")
		}).
		Preload("Draft", func(db *gorm.DB) *gorm.DB {
			return db.Where("course_drafts.status <> ?", model.DraftStatusApproved)
		})

	filter.TutorCourse(db)

	// Count total results
	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourse] Error counting courses with draft info")
		return []model.Course{}, model.Metadata{}, err
	}

	// Apply sorting
	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourse] Error getting courses with draft info")
		return nil, metadata, err
	}

	metadata.Total = total
	logger.InfoCtx(ctx).
		Int64("total", total).
		Int("count", len(results)).
		Msg("[GetTutorCourse] Retrieved courses with draft info successfully")

	return results, metadata, nil
}

func (r *CourseRepository) ApproveCourse(ctx context.Context, course *model.Course, draft *model.CourseDraft) error {
	return r.db.Write.Transaction(func(tx *gorm.DB) error {
		if draft == nil {
			logger.ErrorCtx(ctx).Msg("[ApproveCourse] Course draft is nil")
			return errors.New("course draft is nil")
		}

		err := tx.Model(&model.CourseDraft{}).
			Where("id = ?", draft.ID).
			Updates(map[string]any{
				"status":     draft.Status,
				"updated_by": draft.UpdatedBy,
				"updated_at": draft.UpdatedAt,
			}).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("course_id", course.ID.String()).
				Str("status", string(course.Status)).
				Str("updated_by", course.UpdatedBy.UUID.String()).
				Msg("[UpdateStatus] Error updating course draft status")
			return err
		}

		err = tx.Delete(&model.CoursePrice{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course prices")
			return err
		}

		for _, coursePrice := range course.CoursePrices {
			err = tx.Create(&coursePrice).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course price")
				return err
			}
		}

		err = tx.Unscoped().Delete(&model.CourseSchedule{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course schedules")
			return err
		}

		for _, courseSchedule := range course.CourseSchedules {
			err = tx.Create(&courseSchedule).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course schedule")
				return err
			}
		}

		err = tx.Delete(&model.CourseSubCourseCategory{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course sub course categories")
			return err
		}

		for _, courseSubCategory := range course.SubCourseCategories {
			err = tx.Create(&model.CourseSubCourseCategory{CourseID: course.ID, SubCourseCategoryID: courseSubCategory.SubCourseCategoryID}).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course sub course category")
				return err
			}
		}

		err = tx.Delete(&model.LevelEducationCourse{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting level education course")
			return err
		}

		for _, levelEducationCourse := range course.LevelEducationCourses {
			err = tx.Create(&levelEducationCourse).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating level education course")
				return err
			}
		}

		err = tx.Model(&model.Course{}).
			Where("id = ?", course.ID).
			Updates(course).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error approving course")
			return err
		}

		return nil
	})
}

func (r *CourseRepository) UpdateAll(ctx context.Context, course *model.Course) error {
	return r.db.Write.Transaction(func(tx *gorm.DB) error {
		err := tx.Delete(&model.CoursePrice{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course prices")
			return err
		}

		for _, coursePrice := range course.CoursePrices {
			err = tx.Create(&coursePrice).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course price")
				return err
			}
		}

		err = tx.Unscoped().Delete(&model.CourseSchedule{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course schedules")
			return err
		}

		for _, courseSchedule := range course.CourseSchedules {
			err = tx.Create(&courseSchedule).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course schedule")
				return err
			}
		}

		err = tx.Delete(&model.CourseSubCourseCategory{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting course sub course categories")
			return err
		}

		for _, courseSubCategory := range course.SubCourseCategories {
			err = tx.Create(&model.CourseSubCourseCategory{CourseID: course.ID, SubCourseCategoryID: courseSubCategory.SubCourseCategoryID}).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating course sub course category")
				return err
			}
		}

		err = tx.Delete(&model.LevelEducationCourse{}, "course_id = ?", course.ID).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error deleting level education course")
			return err
		}

		for _, levelEducationCourse := range course.LevelEducationCourses {
			err = tx.Create(&levelEducationCourse).Error
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error creating level education course")
				return err
			}
		}

		err = tx.Model(&model.Course{}).
			Where("id = ?", course.ID).
			Updates(course).Error
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ApproveCourse] Error approving course")
			return err
		}

		return nil
	})
}

// UpdateStatus updates the status of a course
func (r *CourseRepository) UpdateStatus(ctx context.Context, course *model.Course) error {
	err := r.db.Write.Model(&model.Course{}).
		Where("id = ?", course.ID).
		Updates(map[string]any{
			"status":     course.Status,
			"updated_by": course.UpdatedBy,
			"updated_at": course.UpdatedAt,
		}).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Str("status", string(course.Status)).
			Str("updated_by", course.UpdatedBy.UUID.String()).
			Msg("[UpdateStatus] Error updating course status")
		return err
	}

	return nil
}

func (r *CourseRepository) Update(ctx context.Context, course *model.Course) error {
	return r.db.Write.Model(&model.Course{}).
		Where("id = ?", course.ID).
		Updates(course).Error
}

// GetForAdmin gets courses for admin with tutor information
func (r *CourseRepository) GetForAdmin(ctx context.Context, filter model.CourseFilter) ([]model.Course, model.Metadata, error) {
	var (
		results  []model.Course
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	db := r.db.Read.Model(&model.Course{}).
		Preload("Tutor.User").
		Order("updated_at DESC")

	// Apply filters
	if filter.ClassType != "" {
		db = db.Where("class_type = ?", filter.ClassType)
	}

	if filter.FreeFirstCourse.Valid {
		db = db.Where("is_free_first_course = ?", filter.FreeFirstCourse.Bool)
	}

	if filter.Status != "" {
		db = db.Where("status = ?", filter.Status)
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetForAdmin] Error counting courses")
		return []model.Course{}, model.Metadata{}, err
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetForAdmin] Error getting courses")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}

func (r *CourseRepository) GetCourseStatisticsByCategory(ctx context.Context) ([]model.CourseStatisticByCategory, error) {
	var results []model.CourseStatisticByCategory

	err := r.db.Read.Model(&model.Course{}).
		Select("course_categories.id as category_id, course_categories.name as category_name, COUNT(courses.id) as course_count").
		Joins("JOIN course_categories ON course_categories.id = courses.course_category_id").
		Where("courses.deleted_at IS NULL").
		Group("course_categories.id, course_categories.name").
		Order("course_count DESC").
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourseStatisticsByCategory] Error getting course statistics by category")
		return nil, err
	}

	return results, nil
}
