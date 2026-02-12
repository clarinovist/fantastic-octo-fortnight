package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type ReviewRepository struct {
	db *infras.MySQL
}

func NewReviewRepository(db *infras.MySQL) *ReviewRepository {
	return &ReviewRepository{
		db: db,
	}
}

func (r *ReviewRepository) GetStudentReviews(ctx context.Context, filter model.ReviewFilter) ([]model.StudentReview, model.Metadata, error) {
	var (
		results  []model.StudentReview
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.StudentReview{}).Preload("Student.User").Preload("Tutor.User").Preload("Course")

	if filter.TutorID != uuid.Nil {
		db = db.Where("tutor_id = ?", filter.TutorID)
	}

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if filter.DeletedAtIsNull.Valid {
		if filter.DeletedAtIsNull.Bool {
			db = db.Where("deleted_at IS NULL")
		} else {
			db = db.Where("deleted_at IS NOT NULL")
		}
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentReviews] Error counting reviews")
		return []model.StudentReview{}, model.Metadata{}, err
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.Find(&results).Error
	return results, metadata, err
}

func (r *ReviewRepository) GetTutorReviews(ctx context.Context, filter model.ReviewFilter) ([]model.TutorReview, model.Metadata, error) {
	var (
		results  []model.TutorReview
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.TutorReview{}).Preload("Student.User").Preload("Tutor.User").Preload("Course")

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if filter.TutorID != uuid.Nil {
		db = db.Where("tutor_id = ?", filter.TutorID)
	}

	if filter.DeletedAtIsNull.Valid {
		if filter.DeletedAtIsNull.Bool {
			db = db.Where("deleted_at IS NULL")
		} else {
			db = db.Where("deleted_at IS NOT NULL")
		}
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorReviews] Error counting reviews")
		return []model.TutorReview{}, model.Metadata{}, err
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.Find(&results).Error
	return results, metadata, err
}

func (r *ReviewRepository) GetTutorReviewByID(ctx context.Context, id uuid.UUID) (*model.TutorReview, error) {
	var review model.TutorReview
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).
		Preload("Booking").
		Preload("Tutor.User").
		Preload("Student.User").
		First(&review).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return &review, err
}

func (r *ReviewRepository) GetStudentReviewByID(ctx context.Context, id uuid.UUID) (*model.StudentReview, error) {
	var review model.StudentReview
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).First(&review).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return &review, err
}

func (r *ReviewRepository) UpdateTutorReview(ctx context.Context, review *model.TutorReview) error {
	return r.db.Write.WithContext(ctx).Save(review).Error
}

func (r *ReviewRepository) UpdateStudentReview(ctx context.Context, review *model.StudentReview) error {
	return r.db.Write.WithContext(ctx).Save(review).Error
}

func (r *ReviewRepository) CreateReview(ctx context.Context, students []model.StudentReview, tutors []model.TutorReview) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&students).Error; err != nil {
			return err
		}

		if err := tx.Create(&tutors).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *ReviewRepository) GetTotalRatingStudent(ctx context.Context, studentID uuid.UUID) (float64, error) {
	var rating float64
	err := r.db.Read.WithContext(ctx).Model(&model.StudentReview{}).
		Select("AVG(rate) as rating").
		Where("student_id = ?", studentID).
		Where("rate is not null").
		Group("student_id").
		Find(&rating).Error

	return rating, err
}

func (r *ReviewRepository) GetTotalRatingTutor(ctx context.Context, tutorID uuid.UUID) (float64, error) {
	var rating float64
	err := r.db.Read.WithContext(ctx).Model(&model.TutorReview{}).
		Select("AVG(rate) as rating").
		Where("tutor_id = ?", tutorID).
		Where("rate is not null").
		Group("tutor_id").
		Find(&rating).Error

	return rating, err
}
