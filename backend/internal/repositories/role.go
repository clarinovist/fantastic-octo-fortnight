package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type RoleRepository struct {
	db *infras.MySQL
}

func NewRoleRepository(db *infras.MySQL) *RoleRepository {
	return &RoleRepository{
		db: db,
	}
}

func (r *RoleRepository) GetByName(ctx context.Context, name string) (*model.Role, error) {
	var role model.Role
	err := r.db.Read.WithContext(ctx).Where("name = ? AND deleted_at IS NULL", name).First(&role).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &role, nil
}

func (r *RoleRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Role, error) {
	var role model.Role
	err := r.db.Read.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) GetAll(ctx context.Context) ([]model.Role, error) {
	var roles []model.Role
	err := r.db.Read.WithContext(ctx).Where("deleted_at IS NULL").Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}
