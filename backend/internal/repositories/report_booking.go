package repositories

import (
	"context"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type ReportBookingRepository struct {
	db *infras.MySQL
}

func NewReportBookingRepository(db *infras.MySQL) *ReportBookingRepository {
	return &ReportBookingRepository{
		db: db,
	}
}

func (r *ReportBookingRepository) Create(ctx context.Context, report *model.ReportBooking) error {
	err := r.db.Write.WithContext(ctx).Create(&report).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Create] Error creating report")
	}

	return err
}
