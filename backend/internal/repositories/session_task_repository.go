package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"gorm.io/gorm"
)

type SessionTaskRepository struct {
	db *gorm.DB
}

func NewSessionTaskRepository(db *gorm.DB) *SessionTaskRepository {
	return &SessionTaskRepository{db: db}
}

func (r *SessionTaskRepository) Create(ctx context.Context, task *model.SessionTask) error {
	return r.db.WithContext(ctx).Create(task).Error
}

func (r *SessionTaskRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SessionTask, error) {
	var task model.SessionTask
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&task).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &task, nil
}

func (r *SessionTaskRepository) CreateSubmission(ctx context.Context, submission *model.TaskSubmission) error {
	return r.db.WithContext(ctx).Create(submission).Error
}

func (r *SessionTaskRepository) GetSubmissionByTaskID(ctx context.Context, taskID uuid.UUID) (*model.TaskSubmission, error) {
	var submission model.TaskSubmission
	err := r.db.WithContext(ctx).Where("session_task_id = ?", taskID).First(&submission).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &submission, nil
}

func (r *SessionTaskRepository) UpdateSubmission(ctx context.Context, submission *model.TaskSubmission) error {
	return r.db.WithContext(ctx).Save(submission).Error
}
