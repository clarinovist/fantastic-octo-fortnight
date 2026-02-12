package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type LocationRepository struct {
	db *infras.MySQL
}

func NewLocationRepository(db *infras.MySQL) *LocationRepository {
	return &LocationRepository{db: db}
}

func (r *LocationRepository) Get(ctx context.Context, filter model.LocationFilter) ([]model.Location, model.Metadata, error) {
	var (
		results  []model.Location
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.Location{})

	if filter.ID != uuid.Nil {
		db = db.Where("id = ?", filter.ID)
	}

	if filter.Query != "" {
		db = db.Where("full_name LIKE ?", fmt.Sprintf("%%%s%%", filter.Query))
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting locations")
		return []model.Location{}, model.Metadata{}, err
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(sort)
	}

	err = db.
		Limit(filter.Pagination.Limit()).
		Offset(filter.Pagination.Offset()).
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error getting locations")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}
