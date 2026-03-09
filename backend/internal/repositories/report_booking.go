package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
	"gorm.io/gorm"
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

func (r *ReportBookingRepository) GetByBookingID(ctx context.Context, bookingID uuid.UUID) (*model.ReportBooking, error) {
	var result model.ReportBooking
	err := r.db.Read.WithContext(ctx).Where("booking_id = ?", bookingID).First(&result).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", bookingID.String()).Msg("[GetByBookingID] Error getting report")
		return nil, err
	}
	return &result, nil
}

func (r *ReportBookingRepository) Update(ctx context.Context, report *model.ReportBooking) error {
	err := r.db.Write.WithContext(ctx).Save(report).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[Update] Error updating report")
	}
	return err
}
