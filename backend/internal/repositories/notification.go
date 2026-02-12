package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type NotificationRepository struct {
	db *infras.MySQL
}

func NewNotificationRepository(db *infras.MySQL) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Get(ctx context.Context, filter model.NotificationFilter) ([]model.Notification, model.Metadata, error) {
	var (
		notifications []model.Notification
		metadata      model.Metadata
		count         int64
	)
	db := r.db.Read.WithContext(ctx).Model(&model.Notification{})

	if filter.UserID != uuid.Nil {
		db = db.Where("user_id = ?", filter.UserID)
	}

	if filter.Title != "" {
		db = db.Where("title = ?", filter.Title)
	}

	if filter.IsDismissed.Valid {
		db = db.Where("is_dismissed = ?", filter.IsDismissed.Bool)
	}

	if filter.IsRead.Valid {
		db = db.Where("is_read = ?", filter.IsRead.Bool)
	}

	if filter.IsDeleted.Valid {
		if filter.IsDeleted.Bool {
			db = db.Where("deleted_at IS NOT NULL")
		} else {
			db = db.Where("deleted_at IS NULL")
		}
	}

	if filter.CreatedAtBefore.Valid {
		db = db.Where("created_at <= ?", filter.CreatedAtBefore.Time)
	}

	err := db.Count(&count).Error
	if err != nil {
		return nil, metadata, err
	}

	metadata = model.Metadata{
		Page:     filter.Page,
		PageSize: filter.PageSize,
		Total:    count,
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		db = db.Order(filter.Sort.String())
	}

	err = db.Find(&notifications).Error
	if err != nil {
		return nil, metadata, err
	}

	return notifications, metadata, nil
}

func (r *NotificationRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Notification, error) {
	var notification model.Notification
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).First(&notification).Error
	if err != nil {
		return nil, err
	}

	return &notification, nil
}

func (r *NotificationRepository) Update(ctx context.Context, notification *model.Notification) error {
	return r.db.Write.WithContext(ctx).Save(notification).Error
}

func (r *NotificationRepository) Create(ctx context.Context, notification *model.Notification) error {
	return r.db.Write.WithContext(ctx).Create(notification).Error
}

func (r *NotificationRepository) BulkCreate(ctx context.Context, notifications []model.Notification) error {
	return r.db.Write.WithContext(ctx).Create(&notifications).Error
}

func (r *NotificationRepository) BulkDelete(ctx context.Context, notifications []model.Notification) error {
	return r.db.Write.WithContext(ctx).Delete(notifications).Error
}
