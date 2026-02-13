package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type UserRepository struct {
	db *infras.MySQL
}

func NewUserRepository(db *infras.MySQL) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	return r.db.Write.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.Read.WithContext(ctx).Where("email = ?", email).Preload("Roles").First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var user model.User
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).Preload("Roles").First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
	return r.db.Write.WithContext(ctx).Save(user).Error
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.Write.WithContext(ctx).Delete(&model.User{}, id).Error
}

func (r *UserRepository) UpdateVerifiedAt(ctx context.Context, userID uuid.UUID, verifiedAt time.Time) error {
	return r.db.Write.WithContext(ctx).Model(&model.User{}).
		Where("id = ?", userID).
		Update("verified_at", verifiedAt).Error
}

func (r *UserRepository) CreateWithRole(ctx context.Context, user *model.User, roleID uuid.UUID) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create the user
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		// Create the user-role relationship
		userRole := &model.UserRole{
			UserID: user.ID,
			RoleID: roleID,
		}
		if err := tx.Create(userRole).Error; err != nil {
			return err
		}

		return nil
	})
}

// CreateWithRoleAndRecord creates a user with role assignment and role-specific record in a single transaction
func (r *UserRepository) CreateWithRoleAndRecord(ctx context.Context, user *model.User, roleID uuid.UUID, roleSpecificRecord interface{}) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Create the user
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		// Create the user-role relationship
		userRole := &model.UserRole{
			UserID: user.ID,
			RoleID: roleID,
		}
		if err := tx.Create(userRole).Error; err != nil {
			return err
		}

		// Create role-specific record if provided
		if roleSpecificRecord != nil {
			if err := tx.Create(roleSpecificRecord).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *UserRepository) UpdateProfile(ctx context.Context, user *model.User, profile any) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(user).Error; err != nil {
			return err
		}

		if err := tx.Save(profile).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *UserRepository) Get(ctx context.Context, filter model.UserFilter) ([]model.User, model.Metadata, error) {
	var (
		results  []model.User
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	db := r.db.Read.WithContext(ctx).Model(&model.User{})

	if len(filter.IDs) > 0 {
		db = db.Where("id IN (?)", filter.IDs)
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
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting user")
		return []model.User{}, model.Metadata{}, err
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
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Failed to get user")
		return nil, metadata, err
	}

	return results, metadata, nil
}

func (r *UserRepository) ChangeRole(ctx context.Context, student *model.Student, tutor *model.Tutor, userRole *model.UserRole) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		err := tx.Save(student).Error
		if err != nil {
			return err
		}

		err = tx.Save(tutor).Error
		if err != nil {
			return err
		}

		err = tx.Where("user_id = ?", userRole.UserID).Delete(&model.UserRole{}).Error
		if err != nil {
			return err
		}

		err = tx.Create(userRole).Error
		if err != nil {
			return err
		}

		return nil
	})
}

func (r *UserRepository) GetUsersCreatedPerDay(ctx context.Context, days int) ([]model.UserCreatedPerDay, error) {
	var results []model.UserCreatedPerDay

	err := r.db.Read.WithContext(ctx).
		Model(&model.User{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)", days).
		Where("deleted_at IS NULL").
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&results).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetUsersCreatedPerDay] Error getting users created per day")
		return nil, err
	}

	logger.InfoCtx(ctx).Int("count", len(results)).Msg("[GetUsersCreatedPerDay] Successfully retrieved users created per day")
	return results, nil
}
