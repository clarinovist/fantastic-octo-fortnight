package repositories

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type TutorRepository struct {
	db *infras.MySQL
}

func NewTutorRepository(db *infras.MySQL) *TutorRepository {
	return &TutorRepository{db: db}
}

// GetByUserID retrieves a tutor by user ID
func (r *TutorRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*model.Tutor, error) {
	var tutor model.Tutor

	err := r.db.Read.WithContext(ctx).
		Preload("User").
		Preload("Location").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		First(&tutor).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		logger.InfoCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[GetByUserID] Tutor not found")
		return nil, nil
	}

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[GetByUserID] Error getting tutor by user ID")
		return nil, err
	}

	return &tutor, nil
}

// GetByID retrieves a tutor by ID
func (r *TutorRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Tutor, error) {
	var tutor model.Tutor

	err := r.db.Read.WithContext(ctx).
		Preload("User").
		Preload("Location").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&tutor).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.InfoCtx(ctx).
				Str("tutor_id", id.String()).
				Msg("[GetByID] Tutor not found")
			return nil, err
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", id.String()).
			Msg("[GetByID] Error getting tutor by ID")
		return nil, err
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", id.String()).
		Msg("[GetByID] Tutor found successfully")

	return &tutor, nil
}

// Create creates a new tutor record
func (r *TutorRepository) Create(ctx context.Context, tutor *model.Tutor) error {
	err := r.db.Write.WithContext(ctx).Create(tutor).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", tutor.UserID.String()).
			Msg("[Create] Error creating tutor")
		return err
	}

	return nil
}

// Update updates an existing tutor record
func (r *TutorRepository) Update(ctx context.Context, tutor *model.Tutor) error {
	err := r.db.Write.WithContext(ctx).Save(tutor).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutor.ID.String()).
			Msg("[Update] Error updating tutor")
		return err
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", tutor.ID.String()).
		Str("user_id", tutor.UserID.String()).
		Msg("[Update] Tutor updated successfully")

	return nil
}

func (r *TutorRepository) Get(ctx context.Context, filter model.TutorFilter) ([]model.Tutor, model.Metadata, error) {
	var (
		results  []model.Tutor
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	baseQuery := r.db.Read.WithContext(ctx).Model(&model.Tutor{})

	// Only add the JOIN if we actually need to filter by user fields
	needsUserJoin := filter.Query != "" || filter.Name != "" || filter.Email != ""
	if needsUserJoin {
		baseQuery = baseQuery.Joins("LEFT JOIN users ON users.id = tutors.user_id")
	}

	if filter.Query != "" {
		baseQuery = baseQuery.Where("(LOWER(users.name) LIKE LOWER(?) OR LOWER(users.email) LIKE LOWER(?))", "%"+filter.Query+"%", "%"+filter.Query+"%")
	}

	if len(filter.IDs) > 0 {
		baseQuery = baseQuery.Where("tutors.id IN (?)", filter.IDs)
	}

	if filter.UserID != uuid.Nil {
		baseQuery = baseQuery.Where("tutors.user_id = ?", filter.UserID)
	}

	if filter.Name != "" {
		baseQuery = baseQuery.Where("LOWER(users.name) LIKE LOWER(?)", "%"+filter.Name+"%")
	}

	if filter.Email != "" {
		baseQuery = baseQuery.Where("LOWER(users.email) LIKE LOWER(?)", "%"+filter.Email+"%")
	}

	if !filter.CreatedAtFrom.IsZero() {
		baseQuery = baseQuery.Where("tutors.created_at >= ?", filter.CreatedAtFrom)
	}

	if !filter.CreatedAtTo.IsZero() {
		baseQuery = baseQuery.Where("tutors.created_at <= ?", filter.CreatedAtTo)
	}

	if filter.DeletedIsNull.Valid {
		if filter.DeletedIsNull.Bool {
			baseQuery = baseQuery.Where("tutors.deleted_at IS NULL")
		} else {
			baseQuery = baseQuery.Where("tutors.deleted_at IS NOT NULL")
		}
	}

	err := baseQuery.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting tutor")
		return []model.Tutor{}, model.Metadata{}, err
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
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Failed to get tutors")
		return nil, metadata, err
	}

	return results, metadata, nil
}

func (r *TutorRepository) Delete(ctx context.Context, tutor model.Tutor) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		err := tx.
			Model(&model.Tutor{}).
			Where("id = ?", tutor.ID).
			Updates(map[string]interface{}{
				"deleted_at": tutor.DeletedAt,
				"deleted_by": tutor.DeletedBy,
			}).Error

		if err != nil {
			return fmt.Errorf("failed to delete tutor with id %s: %w", tutor.ID, err)
		}

		err = tx.Model(&model.User{}).
			Where("id = ?", tutor.UserID).
			Updates(map[string]interface{}{
				"deleted_at": tutor.User.DeletedAt,
				"deleted_by": tutor.User.DeletedBy,
			}).Error

		if err != nil {
			return fmt.Errorf("failed to delete user with id %s: %w", tutor.User.ID, err)
		}

		return nil
	})
}

func (r *TutorRepository) CountTotal(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.Read.WithContext(ctx).
		Model(&model.Tutor{}).
		Where("deleted_at IS NULL").
		Count(&count).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CountTotal] Error counting total tutors")
		return 0, fmt.Errorf("failed to count total tutors: %w", err)
	}

	logger.InfoCtx(ctx).Int64("count", count).Msg("[CountTotal] Successfully counted total tutors")
	return count, nil
}

func (r *TutorRepository) CountActive(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.Read.WithContext(ctx).
		Model(&model.Tutor{}).
		Where("deleted_at IS NULL").
		Where("status = ?", model.TutorStatusActive).
		Count(&count).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CountActive] Error counting active tutors")
		return 0, fmt.Errorf("failed to count active tutors: %w", err)
	}

	logger.InfoCtx(ctx).Int64("count", count).Msg("[CountActive] Successfully counted active tutors")
	return count, nil
}

func (r *TutorRepository) GetTutorsCreatedPerDay(ctx context.Context, startDate, endDate time.Time) ([]model.UserCreatedPerDay, error) {
	var results []model.UserCreatedPerDay

	err := r.db.Read.WithContext(ctx).
		Model(&model.Tutor{}).
		Select("DATE(tutors.created_at) as date, COUNT(*) as count").
		Where("DATE(tutors.created_at) >= ?", startDate.Format("2006-01-02")).
		Where("DATE(tutors.created_at) <= ?", endDate.Format("2006-01-02")).
		Where("tutors.deleted_at IS NULL").
		Group("DATE(tutors.created_at)").
		Order("date ASC").
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorsCreatedPerDay] Error getting tutors created per day")
		return nil, fmt.Errorf("failed to get tutors created per day: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("count", len(results)).
		Str("start_date", startDate.Format("2006-01-02")).
		Str("end_date", endDate.Format("2006-01-02")).
		Msg("[GetTutorsCreatedPerDay] Successfully retrieved tutors created per day")
	return results, nil
}
