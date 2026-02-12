package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/internal/model"
)

type GetNotificationsRequest struct {
	IsDismissed null.Bool `form:"isDismissed"`
	IsRead      null.Bool `form:"isRead"`
	IsDeleted   null.Bool `form:"isDeleted"`
	model.Pagination
}

type Notification struct {
	ID           uuid.UUID              `json:"id"`
	Title        string                 `json:"title"`
	Message      string                 `json:"message"`
	Type         model.NotificationType `json:"type"`
	Link         string                 `json:"link"`
	IsRead       bool                   `json:"isRead"`
	IsDismissed  bool                   `json:"isDismissed"`
	IsDeleteable bool                   `json:"isDeletable"`
	CreatedAt    time.Time              `json:"createdAt"`
}
