package dto

import (
	"errors"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/internal/model"
)

type CreateAdminNotificationRequest struct {
	UserIDs []uuid.UUID                     `json:"userIds"`
	Title   string                          `json:"title"`
	Message string                          `json:"message"`
	Type    model.BroadcastNotificationType `json:"type"`
	Link    null.String                     `json:"link"`
}

func (r *CreateAdminNotificationRequest) Validate() error {
	if len(r.UserIDs) == 0 {
		return errors.New("userIds is empty")
	}

	if r.Title == "" {
		return errors.New("title is empty")
	}

	if r.Message == "" {
		return errors.New("message is empty")
	}

	if r.Type == "" {
		return errors.New("type is empty")
	}

	if r.Type != model.EmailBroadcastNotificationType && r.Type != model.NotificationBroadcastNotificationType {
		return errors.New("type is invalid")
	}

	return nil
}
