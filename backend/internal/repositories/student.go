package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type StudentRepository struct {
	db *infras.MySQL
}

func NewStudentRepository(db *infras.MySQL) *StudentRepository {
	return &StudentRepository{
		db: db,
	}
}

func (r *StudentRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*model.Student, error) {
	var student model.Student
	err := r.db.Read.WithContext(ctx).
		Preload("User").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		First(&student).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.ErrorCtx(ctx).Err(err).Str("user_id", userID.String()).Msg("Student not found for user_id")
			return nil, nil
		}

		logger.ErrorCtx(ctx).Err(err).Str("user_id", userID.String()).Msg("Failed to get student by user_id")
		return nil, fmt.Errorf("failed to get student by user_id %s: %w", userID, err)
	}

	logger.InfoCtx(ctx).Str("user_id", userID.String()).Str("student_id", student.ID.String()).Msg("Successfully retrieved student by user_id")
	return &student, nil
}

func (r *StudentRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Student, error) {
	var student model.Student
	err := r.db.Read.WithContext(ctx).
		Preload("User").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&student).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.ErrorCtx(ctx).Err(err).Str("student_id", id.String()).Msg("Student not found")
			return nil, nil
		}
		logger.ErrorCtx(ctx).Err(err).Str("student_id", id.String()).Msg("Failed to get student by id")
		return nil, fmt.Errorf("failed to get student by id %s: %w", id, err)
	}

	logger.InfoCtx(ctx).Str("student_id", id.String()).Msg("Successfully retrieved student by id")
	return &student, nil
}

func (r *StudentRepository) Create(ctx context.Context, student *model.Student) error {
	err := r.db.Write.WithContext(ctx).Create(student).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("user_id", student.UserID.String()).Msg("Failed to create student")
		return fmt.Errorf("failed to create student for user_id %s: %w", student.UserID, err)
	}

	logger.InfoCtx(ctx).Str("student_id", student.ID.String()).Str("user_id", student.UserID.String()).Msg("Successfully created student")
	return nil
}

func (r *StudentRepository) Update(ctx context.Context, student *model.Student) error {
	err := r.db.Write.WithContext(ctx).Save(student).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("student_id", student.ID.String()).Msg("Failed to update student")
		return fmt.Errorf("failed to update student with id %s: %w", student.ID, err)
	}

	logger.InfoCtx(ctx).Str("student_id", student.ID.String()).Msg("Successfully updated student")
	return nil
}

func (r *StudentRepository) Delete(ctx context.Context, student model.Student) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		err := tx.
			Model(&model.Student{}).
			Where("id = ?", student.ID).
			Updates(map[string]interface{}{
				"deleted_at": student.DeletedAt,
				"deleted_by": student.DeletedBy,
			}).Error

		if err != nil {
			return fmt.Errorf("failed to delete student with id %s: %w", student.ID, err)
		}

		err = tx.Model(&model.User{}).
			Where("id = ?", student.UserID).
			Updates(map[string]interface{}{
				"deleted_at": student.User.DeletedAt,
				"deleted_by": student.User.DeletedBy,
			}).Error

		if err != nil {
			return fmt.Errorf("failed to delete user with id %s: %w", student.User.ID, err)
		}

		return nil
	})
}

func (r *StudentRepository) Get(ctx context.Context, filter model.StudentFilter) ([]model.Student, model.Metadata, error) {
	var (
		results  []model.Student
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	// Build base query with raw JOIN for filtering on user fields only
	baseQuery := r.db.Read.WithContext(ctx).Model(&model.Student{})

	// Only add the JOIN if we actually need to filter by user fields
	needsUserJoin := filter.Query != "" || filter.Name != "" || filter.Email != ""
	if needsUserJoin {
		baseQuery = baseQuery.Joins("LEFT JOIN users ON users.id = students.user_id")
	}

	if filter.UserID != uuid.Nil {
		baseQuery = baseQuery.Where("students.user_id = ?", filter.UserID)
	}

	if filter.Query != "" {
		baseQuery = baseQuery.Where("(LOWER(users.name) LIKE LOWER(?) OR LOWER(users.email) LIKE LOWER(?))", "%"+filter.Query+"%", "%"+filter.Query+"%")
	}

	if len(filter.IDs) > 0 {
		baseQuery = baseQuery.Where("students.id IN (?)", filter.IDs)
	}

	if filter.Name != "" {
		baseQuery = baseQuery.Where("LOWER(users.name) LIKE LOWER(?)", "%"+filter.Name+"%")
	}

	if filter.Email != "" {
		baseQuery = baseQuery.Where("LOWER(users.email) LIKE LOWER(?)", "%"+filter.Email+"%")
	}

	if !filter.CreatedAtFrom.IsZero() {
		baseQuery = baseQuery.Where("students.created_at >= ?", filter.CreatedAtFrom)
	}

	if !filter.CreatedAtTo.IsZero() {
		baseQuery = baseQuery.Where("students.created_at <= ?", filter.CreatedAtTo)
	}

	if filter.DeletedIsNull.Valid {
		if filter.DeletedIsNull.Bool {
			baseQuery = baseQuery.Where("students.deleted_at IS NULL")
		} else {
			baseQuery = baseQuery.Where("students.deleted_at IS NOT NULL")
		}
	}

	// Count
	err := baseQuery.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting student")
		return []model.Student{}, model.Metadata{}, err
	}
	metadata.Total = total

	// Fetch with Preload("User") for data loading (separate query, no scan conflict)
	findQuery := baseQuery.Preload("User")

	if !filter.Pagination.IsEmpty() {
		findQuery = findQuery.Limit(filter.Pagination.Limit()).Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		findQuery = findQuery.Order(filter.Sort.String())
	}

	err = findQuery.Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Failed to get students")
		return nil, metadata, err
	}

	return results, metadata, nil
}

func (r *StudentRepository) CountTotal(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.Read.WithContext(ctx).
		Model(&model.Student{}).
		Where("deleted_at IS NULL").
		Count(&count).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CountTotal] Error counting total students")
		return 0, fmt.Errorf("failed to count total students: %w", err)
	}

	logger.InfoCtx(ctx).Int64("count", count).Msg("[CountTotal] Successfully counted total students")
	return count, nil
}

func (r *StudentRepository) CountPremium(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.Read.WithContext(ctx).
		Model(&model.Student{}).
		Where("deleted_at IS NULL AND premium_until IS NOT NULL").
		Count(&count).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CountPremium] Error counting premium students")
		return 0, fmt.Errorf("failed to count premium students: %w", err)
	}

	logger.InfoCtx(ctx).Int64("count", count).Msg("[CountPremium] Successfully counted premium students")
	return count, nil
}

func (r *StudentRepository) GetStudentsCreatedPerDay(ctx context.Context, startDate, endDate time.Time) ([]model.UserCreatedPerDay, error) {
	var results []model.UserCreatedPerDay

	err := r.db.Read.WithContext(ctx).
		Model(&model.Student{}).
		Select("DATE(students.created_at) as date, COUNT(*) as count").
		Where("DATE(students.created_at) >= ?", startDate.Format("2006-01-02")).
		Where("DATE(students.created_at) <= ?", endDate.Format("2006-01-02")).
		Where("students.deleted_at IS NULL").
		Group("DATE(students.created_at)").
		Order("date ASC").
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentsCreatedPerDay] Error getting students created per day")
		return nil, fmt.Errorf("failed to get students created per day: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("count", len(results)).
		Str("start_date", startDate.Format("2006-01-02")).
		Str("end_date", endDate.Format("2006-01-02")).
		Msg("[GetStudentsCreatedPerDay] Successfully retrieved students created per day")
	return results, nil
}
