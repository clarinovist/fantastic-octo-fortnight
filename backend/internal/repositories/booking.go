package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
	"gorm.io/gorm"
)

type BookingRepository struct {
	db *infras.MySQL
}

func NewBookingRepository(db *infras.MySQL) *BookingRepository {
	return &BookingRepository{
		db: db,
	}
}

func (r *BookingRepository) Get(ctx context.Context, filter model.BookingFilter) ([]model.Booking, model.Metadata, error) {
	var (
		results  []model.Booking
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.Booking{}).Preload("Student.User").Preload("Tutor.User").Preload("Course")

	if len(filter.NotIDs) > 0 {
		db = db.Where("id NOT IN (?)", filter.NotIDs)
	}

	if filter.CourseID != uuid.Nil {
		db = db.Where("course_id = ?", filter.CourseID)
	}

	if len(filter.CourseIDs) > 0 {
		db = db.Where("course_id IN (?)", filter.CourseIDs)
	}

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if filter.TutorID != uuid.Nil {
		db = db.Where("tutor_id = ?", filter.TutorID)
	}

	if filter.StudentName != "" {
		studentSubQuery := r.db.Read.Model(&model.Student{}).
			Select("students.id").
			Joins("JOIN users ON users.id = students.user_id").
			Where("LOWER(users.name) LIKE ?", "%"+filter.StudentName+"%")
		db = db.Where("student_id IN (?)", studentSubQuery)
	}

	if filter.TutorName != "" {
		tutorSubQuery := r.db.Read.Model(&model.Tutor{}).
			Select("tutors.id").
			Joins("JOIN users ON users.id = tutors.user_id").
			Where("LOWER(users.name) LIKE ?", "%"+filter.TutorName+"%")
		db = db.Where("tutor_id IN (?)", tutorSubQuery)
	}

	if filter.CourseCategoryID != uuid.Nil {
		subQuery := r.db.Read.Model(&model.Course{}).Select("id").
			Where("course_category_id = ?", filter.CourseCategoryID)
		db = db.Where("course_id IN (?)", subQuery)
	}

	if filter.Status != "" {
		db = db.Where("bookings.status = ?", filter.Status)
	}

	if len(filter.StatusIn) > 0 {
		db = db.Where("bookings.status IN (?)", filter.StatusIn)
	}

	if !filter.DateCreatedAt.IsZero() {
		db = db.Where("date(created_at) = ?", filter.DateCreatedAt.Format(time.DateOnly))
	}

	if len(filter.BookingDateBetween) > 1 {
		db = db.Where("booking_date BETWEEN ? AND ?", filter.BookingDateBetween[0], filter.BookingDateBetween[1])
	}

	if !filter.BookingDate.IsZero() {
		db = db.Where("booking_date = ?", filter.BookingDate.Format(time.DateOnly))
	}

	if !filter.BookingTime.IsZero() {
		db = db.Where("booking_time = ?", filter.BookingTime.Format(time.TimeOnly))
	}

	if !filter.ExpiredAtBefore.IsZero() {
		db = db.Where("expired_at < ?", filter.ExpiredAtBefore)
	}

	if len(filter.ExpiredAtBetween) > 1 {
		db = db.Where("expired_at BETWEEN ? and ?", filter.ExpiredAtBetween[0], filter.ExpiredAtBetween[1])
	}

	if len(filter.BookingDateTimeBetween) > 1 {
		db = db.Where("STR_TO_DATE(concat(booking_date, ' ', booking_time), '%Y-%m-%d %H:%i:%s') between ? and ?", filter.BookingDateTimeBetween[0], filter.BookingDateTimeBetween[1])
	}

	if filter.BookingDateTimeAdd.Seconds() > 0 {
		db = db.Where("DATE_ADD(STR_TO_DATE(concat(booking_date, ' ', booking_time), '%Y-%m-%d %H:%i:%s'), INTERVAL ? SECOND) <= CURRENT_TIMESTAMP", filter.BookingDateTimeAdd.Seconds())
	}

	if filter.IsFreeFirstCourse.Valid {
		db = db.Where("is_free_first_course = ?", filter.IsFreeFirstCourse.Bool)
	}

	if filter.IsReviewed.Valid {
		db = db.Where("is_reviewed = ?", filter.IsReviewed.Bool)
	}

	if filter.DeletedAtIsNil.Valid {
		if filter.DeletedAtIsNil.Bool {
			db = db.Where("bookings.deleted_at IS NULL")
		} else {
			db = db.Where("bookings.deleted_at IS NOT NULL")
		}
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting bookings")
		return []model.Booking{}, model.Metadata{}, err
	}

	metadata.Total = int64(total)

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(sort)
	}

	err = db.Find(&results).Error
	return results, metadata, err
}

func (r *BookingRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Booking, error) {
	var result model.Booking
	db := r.db.Read.Model(&model.Booking{}).
		Preload("Student.User").
		Preload("Tutor.User").
		Preload("Course.CourseCategory").
		Preload("ReportBooking").
		Preload("SessionTasks").
		Preload("SessionTasks.TaskSubmissions")
	err := db.Where("id = ?", id).First(&result).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("Booking not found")
			return nil, nil
		}
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("Failed to get booking by id")
		return nil, err
	}

	return &result, err
}

func (r *BookingRepository) Count(ctx context.Context, filter model.BookingFilter) (int64, error) {
	var (
		total int64
	)

	db := r.db.Read.Model(&model.Booking{})

	if filter.CourseID != uuid.Nil {
		db = db.Where("course_id = ?", filter.StudentID)
	}

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if filter.CourseCategoryID != uuid.Nil {
		subQuery := r.db.Read.Model(&model.Course{}).Select("id").
			Where("course_category_id = ?", filter.CourseCategoryID)
		db = db.Where("course_id IN (?)", subQuery)
	}

	if filter.Status != "" {
		db = db.Where("bookings.status = ?", filter.Status)
	}

	if len(filter.StatusIn) > 0 {
		db = db.Where("bookings.status IN (?)", filter.StatusIn)
	}

	if !filter.DateCreatedAt.IsZero() {
		db = db.Where("date(created_at) = ?", filter.DateCreatedAt.Format(time.DateOnly))
	}

	if !filter.BookingDate.IsZero() {
		db = db.Where("booking_date = ?", filter.BookingDate.Format(time.DateOnly))
	}

	if !filter.BookingTime.IsZero() {
		db = db.Where("booking_time = ?", filter.BookingTime.Format(time.TimeOnly))
	}

	if filter.IsFreeFirstCourse.Valid {
		db = db.Where("is_free_first_course = ?", filter.IsFreeFirstCourse.Bool)
	}

	if filter.DeletedAtIsNil.Valid {
		if filter.DeletedAtIsNil.Bool {
			db = db.Where("deleted_at IS NULL")
		} else {
			db = db.Where("deleted_at IS NOT NULL")
		}
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Count] Error counting bookings")
		return 0, err
	}

	return total, err
}

func (r *BookingRepository) Create(ctx context.Context, booking *model.Booking) error {
	return r.db.Write.WithContext(ctx).Create(booking).Error
}

func (r *BookingRepository) Update(ctx context.Context, booking *model.Booking) error {
	return r.db.Write.WithContext(ctx).Save(booking).Error
}

func (r *BookingRepository) BulkUpdate(ctx context.Context, bookings []model.Booking) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for i, _ := range bookings {
			if err := tx.Save(&bookings[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *BookingRepository) GetTopBookedTutors(ctx context.Context, limit int) ([]model.TutorBookingStatistic, error) {
	var results []model.TutorBookingStatistic

	err := r.db.Read.Model(&model.Booking{}).
		Select("tutors.id as tutor_id, users.name as tutor_name, tutors.photo_profile, COUNT(bookings.id) as booking_count").
		Joins("JOIN tutors ON tutors.id = bookings.tutor_id").
		Joins("JOIN users ON users.id = tutors.user_id").
		Where("bookings.deleted_at IS NULL").
		Group("tutors.id, users.name, tutors.photo_profile").
		Order("booking_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedTutors] Error getting top booked tutors")
		return nil, err
	}

	return results, nil
}

func (r *BookingRepository) GetTopBookedStudents(ctx context.Context, limit int) ([]model.StudentBookingStatistic, error) {
	var results []model.StudentBookingStatistic

	err := r.db.Read.Model(&model.Booking{}).
		Select("students.id as student_id, users.name as student_name, students.photo_profile, COUNT(bookings.id) as booking_count").
		Joins("JOIN students ON students.id = bookings.student_id").
		Joins("JOIN users ON users.id = students.user_id").
		Where("bookings.deleted_at IS NULL").
		Group("students.id, users.name, students.photo_profile").
		Order("booking_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedStudents] Error getting top booked students")
		return nil, err
	}

	return results, nil
}

func (r *BookingRepository) GetTopBookedCategories(ctx context.Context, limit int) ([]model.CategoryBookingStatistic, error) {
	var results []model.CategoryBookingStatistic

	err := r.db.Read.Model(&model.Booking{}).
		Select("course_categories.id as category_id, course_categories.name as category_name, COUNT(bookings.id) as booking_count").
		Joins("JOIN courses ON courses.id = bookings.course_id").
		Joins("JOIN course_categories ON course_categories.id = courses.course_category_id").
		Where("bookings.deleted_at IS NULL").
		Group("course_categories.id, course_categories.name").
		Order("booking_count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedCategories] Error getting top booked categories")
		return nil, err
	}

	return results, nil
}
