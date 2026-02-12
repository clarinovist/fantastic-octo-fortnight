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

type CourseDraftRepository struct {
	db *infras.MySQL
}

func NewCourseDraftRepository(db *infras.MySQL) *CourseDraftRepository {
	return &CourseDraftRepository{db: db}
}

// Create creates a new course draft
func (r *CourseDraftRepository) Create(ctx context.Context, draft *model.CourseDraft) error {
	err := r.db.Write.Create(draft).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", draft.CourseID.String()).
			Str("created_by", draft.CreatedBy.String()).
			Msg("[Create] Error creating course draft")
		return err
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("draft_type", string(draft.DraftType)).
		Msg("[Create] Course draft created successfully")

	return nil
}

// GetByID gets a course draft by ID
func (r *CourseDraftRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.CourseDraft, error) {
	var draft model.CourseDraft
	err := r.db.Read.
		Preload("Course").
		Preload("Creator").
		Preload("Reviewer").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&draft).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.InfoCtx(ctx).
				Str("draft_id", id.String()).
				Msg("[GetByID] Course draft not found")
			return nil, err
		}

		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", id.String()).
			Msg("[GetByID] Error getting course draft by ID")
		return nil, err
	}

	return &draft, nil
}

// GetByCourseID gets the current active draft for a course
func (r *CourseDraftRepository) GetByCourseID(ctx context.Context, courseID uuid.UUID) (*model.CourseDraft, error) {
	var draft model.CourseDraft
	err := r.db.Read.
		Preload("Course").
		Preload("Creator").
		Preload("Reviewer").
		Where("course_id = ? AND status <> ? AND deleted_at IS NULL",
			courseID, model.DraftStatusApproved).
		Order("created_at DESC").
		First(&draft).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.InfoCtx(ctx).
				Str("course_id", courseID.String()).
				Msg("[GetByCourseID] No active course draft found")
			return nil, err
		}

		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[GetByCourseID] Error getting course draft by course ID")
		return nil, err
	}

	return &draft, nil
}

// Update updates an existing course draft
func (r *CourseDraftRepository) Update(ctx context.Context, draft *model.CourseDraft) error {
	err := r.db.Write.Save(draft).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Str("course_id", draft.CourseID.String()).
			Msg("[Update] Error updating course draft")
		return err
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("status", string(draft.Status)).
		Msg("[Update] Course draft updated successfully")

	return nil
}

// Delete soft deletes a course draft
func (r *CourseDraftRepository) Delete(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error {
	now := time.Now()
	err := r.db.Write.Model(&model.CourseDraft{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"deleted_at": now,
			"deleted_by": deletedBy,
			"updated_at": now,
		}).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", id.String()).
			Str("deleted_by", deletedBy.String()).
			Msg("[Delete] Error deleting course draft")
		return err
	}

	logger.InfoCtx(ctx).
		Str("draft_id", id.String()).
		Str("deleted_by", deletedBy.String()).
		Msg("[Delete] Course draft deleted successfully")

	return nil
}

// GetPendingDrafts gets all drafts with pending approval status
func (r *CourseDraftRepository) GetPendingDrafts(ctx context.Context, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	var (
		drafts   []model.CourseDraft
		total    int64
		metadata = model.Metadata{
			Page:     pagination.Page,
			PageSize: pagination.PageSize,
		}
	)

	// Count total pending drafts
	err := r.db.Read.Model(&model.CourseDraft{}).
		Where("status = ? AND deleted_at IS NULL", model.DraftStatusPendingApproval).
		Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetPendingDrafts] Error counting pending drafts")
		return nil, metadata, err
	}

	// Get paginated results
	err = r.db.Read.
		Preload("Course").
		Preload("Creator").
		Where("status = ? AND deleted_at IS NULL", model.DraftStatusPendingApproval).
		Order("submitted_at ASC"). // Oldest submissions first
		Limit(pagination.Limit()).
		Offset(pagination.Offset()).
		Find(&drafts).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetPendingDrafts] Error getting pending drafts")
		return nil, metadata, err
	}

	metadata.Total = total
	logger.InfoCtx(ctx).
		Int64("total", total).
		Int("count", len(drafts)).
		Msg("[GetPendingDrafts] Retrieved pending drafts successfully")

	return drafts, metadata, nil
}

// GetDraftsByStatus gets drafts filtered by status
func (r *CourseDraftRepository) GetDraftsByStatus(ctx context.Context, status model.DraftStatus, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	var (
		drafts   []model.CourseDraft
		total    int64
		metadata = model.Metadata{
			Page:     pagination.Page,
			PageSize: pagination.PageSize,
		}
	)

	// Count total drafts with status
	err := r.db.Read.Model(&model.CourseDraft{}).
		Where("status = ? AND deleted_at IS NULL", status).
		Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("status", string(status)).
			Msg("[GetDraftsByStatus] Error counting drafts by status")
		return nil, metadata, err
	}

	// Get paginated results
	err = r.db.Read.
		Preload("Course").
		Preload("Creator").
		Preload("Reviewer").
		Where("status = ? AND deleted_at IS NULL", status).
		Order("created_at DESC").
		Limit(pagination.Limit()).
		Offset(pagination.Offset()).
		Find(&drafts).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("status", string(status)).
			Msg("[GetDraftsByStatus] Error getting drafts by status")
		return nil, metadata, err
	}

	metadata.Total = total
	logger.InfoCtx(ctx).
		Str("status", string(status)).
		Int64("total", total).
		Int("count", len(drafts)).
		Msg("[GetDraftsByStatus] Retrieved drafts by status successfully")

	return drafts, metadata, nil
}

// GetDraftsByCreator gets drafts created by a specific user
func (r *CourseDraftRepository) GetDraftsByCreator(ctx context.Context, creatorID uuid.UUID, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	var (
		drafts   []model.CourseDraft
		total    int64
		metadata = model.Metadata{
			Page:     pagination.Page,
			PageSize: pagination.PageSize,
		}
	)

	// Count total drafts by creator
	err := r.db.Read.Model(&model.CourseDraft{}).
		Where("created_by = ? AND deleted_at IS NULL", creatorID).
		Count(&total).Error
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("creator_id", creatorID.String()).
			Msg("[GetDraftsByCreator] Error counting drafts by creator")
		return nil, metadata, err
	}

	// Get paginated results
	err = r.db.Read.
		Preload("Course").
		Preload("Reviewer").
		Where("created_by = ? AND deleted_at IS NULL", creatorID).
		Order("created_at DESC").
		Limit(pagination.Limit()).
		Offset(pagination.Offset()).
		Find(&drafts).Error

	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("creator_id", creatorID.String()).
			Msg("[GetDraftsByCreator] Error getting drafts by creator")
		return nil, metadata, err
	}

	metadata.Total = total
	logger.InfoCtx(ctx).
		Str("creator_id", creatorID.String()).
		Int64("total", total).
		Int("count", len(drafts)).
		Msg("[GetDraftsByCreator] Retrieved drafts by creator successfully")

	return drafts, metadata, nil
}
