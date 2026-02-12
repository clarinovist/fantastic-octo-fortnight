package repositories

import (
	"context"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type LookupRepository struct {
	db *infras.MySQL
}

func NewLookupRepository(db *infras.MySQL) *LookupRepository {
	return &LookupRepository{db: db}
}

func (r *LookupRepository) Get(ctx context.Context, filter model.LookupFilter) ([]model.Lookup, model.Metadata, error) {
	var (
		results  []model.Lookup
		total    int64
		metadata = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)
	db := r.db.Read.Model(&model.Lookup{})

	if filter.Type != "" {
		db = db.Where("type = ?", filter.Type)
	}

	err := db.Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error counting lookups")
		return []model.Lookup{}, model.Metadata{}, err
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(sort)
	}

	err = db.
		Find(&results).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Get] Error getting lookups")
		return nil, metadata, err
	}

	metadata.Total = total
	return results, metadata, nil
}
