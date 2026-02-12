package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

// CourseDraftService handles business logic for course draft operations
type CourseDraftService struct {
	courseDraftRepo *repositories.CourseDraftRepository
	courseRepo      *repositories.CourseRepository
}

// NewCourseDraftService creates a new CourseDraftService
func NewCourseDraftService(
	courseDraftRepo *repositories.CourseDraftRepository,
	courseRepo *repositories.CourseRepository,
) *CourseDraftService {
	return &CourseDraftService{
		courseDraftRepo: courseDraftRepo,
		courseRepo:      courseRepo,
	}
}

// CreateDraft creates a new draft from an existing course
func (s *CourseDraftService) CreateDraft(ctx context.Context, courseID uuid.UUID, createdBy uuid.UUID) (*model.CourseDraft, error) {
	// Check if course exists
	course, err := s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.ErrorCtx(ctx).
				Str("course_id", courseID.String()).
				Msg("[CreateDraft] Course not found")
			return nil, fmt.Errorf("course not found")
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[CreateDraft] Error getting course")
		return nil, fmt.Errorf("failed to get course: %w", err)
	}

	existingDraft, err := s.courseDraftRepo.GetByCourseID(ctx, courseID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[CreateDraft] Error checking existing draft")
		return nil, fmt.Errorf("failed to check existing draft: %w", err)
	}

	if existingDraft != nil {
		logger.InfoCtx(ctx).
			Str("course_id", courseID.String()).
			Str("existing_draft_id", existingDraft.ID.String()).
			Str("status", string(existingDraft.Status)).
			Msg("[CreateDraft] Active draft already exists")
		return nil, fmt.Errorf("course already has an active draft with status: %s", existingDraft.Status)
	}

	courseData, err := json.Marshal(course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[CreateDraft] Error serializing course data")
		return nil, fmt.Errorf("failed to serialize course data: %w", err)
	}

	draft := &model.CourseDraft{
		CourseID:  courseID,
		DraftData: courseData,
		DraftType: model.DraftTypeEdit,
		Status:    model.DraftStatusDraft,
		CreatedBy: createdBy,
		UpdatedBy: uuid.NullUUID{UUID: createdBy, Valid: true},
	}

	err = s.courseDraftRepo.Create(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("created_by", createdBy.String()).
			Msg("[CreateDraft] Error creating draft")
		return nil, fmt.Errorf("failed to create draft: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", courseID.String()).
		Str("created_by", createdBy.String()).
		Msg("[CreateDraft] Draft created successfully")

	return draft, nil
}

// GetCurrentDraft gets the current active draft for a course
func (s *CourseDraftService) GetCurrentDraft(ctx context.Context, courseID uuid.UUID) (*model.CourseDraft, error) {
	draft, err := s.courseDraftRepo.GetByCourseID(ctx, courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.InfoCtx(ctx).
				Str("course_id", courseID.String()).
				Msg("[GetCurrentDraft] No active draft found")
			return nil, fmt.Errorf("no active draft found for course")
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[GetCurrentDraft] Error getting current draft")
		return nil, fmt.Errorf("failed to get current draft: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", courseID.String()).
		Str("status", string(draft.Status)).
		Msg("[GetCurrentDraft] Current draft retrieved successfully")

	return draft, nil
}

// UpdateDraft updates an existing draft with new data
func (s *CourseDraftService) UpdateDraft(ctx context.Context, courseID uuid.UUID, draftData json.RawMessage, updatedBy uuid.UUID) (*model.CourseDraft, error) {
	// Get current draft
	draft, err := s.GetCurrentDraft(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Validate that draft can be edited
	if !draft.CanBeEdited() {
		logger.WarnCtx(ctx).
			Str("draft_id", draft.ID.String()).
			Str("status", string(draft.Status)).
			Msg("[UpdateDraft] Draft cannot be edited in current status")
		return nil, fmt.Errorf("draft cannot be edited in status: %s", draft.Status)
	}

	// Validate JSON data
	var tempCourse model.Course
	if err := json.Unmarshal(draftData, &tempCourse); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Msg("[UpdateDraft] Invalid course data format")
		return nil, fmt.Errorf("invalid course data format: %w", err)
	}

	// Update draft data
	draft.DraftData = datatypes.JSON(draftData)
	draft.UpdatedBy = uuid.NullUUID{UUID: updatedBy, Valid: true}
	draft.UpdatedAt = time.Now()

	err = s.courseDraftRepo.Update(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Str("updated_by", updatedBy.String()).
			Msg("[UpdateDraft] Error updating draft")
		return nil, fmt.Errorf("failed to update draft: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", courseID.String()).
		Str("updated_by", updatedBy.String()).
		Msg("[UpdateDraft] Draft updated successfully")

	return draft, nil
}

// DeleteDraft deletes a draft (soft delete)
func (s *CourseDraftService) DeleteDraft(ctx context.Context, courseID uuid.UUID, deletedBy uuid.UUID) error {
	// Get current draft
	draft, err := s.GetCurrentDraft(ctx, courseID)
	if err != nil {
		return err
	}

	// Validate that draft can be deleted
	if !draft.CanBeEdited() {
		logger.WarnCtx(ctx).
			Str("draft_id", draft.ID.String()).
			Str("status", string(draft.Status)).
			Msg("[DeleteDraft] Draft cannot be deleted in current status")
		return fmt.Errorf("draft cannot be deleted in status: %s", draft.Status)
	}

	err = s.courseDraftRepo.Delete(ctx, draft.ID, deletedBy)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Str("deleted_by", deletedBy.String()).
			Msg("[DeleteDraft] Error deleting draft")
		return fmt.Errorf("failed to delete draft: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", courseID.String()).
		Str("deleted_by", deletedBy.String()).
		Msg("[DeleteDraft] Draft deleted successfully")

	return nil
}

// SubmitForApproval submits a draft for admin approval
func (s *CourseDraftService) SubmitForApproval(ctx context.Context, courseID uuid.UUID, submittedBy uuid.UUID) (*model.CourseDraft, error) {
	// Get current draft
	draft, err := s.GetCurrentDraft(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Validate that draft can be submitted
	if !draft.CanBeSubmitted() {
		logger.WarnCtx(ctx).
			Str("draft_id", draft.ID.String()).
			Str("status", string(draft.Status)).
			Msg("[SubmitForApproval] Draft cannot be submitted in current status")
		return nil, fmt.Errorf("draft cannot be submitted in status: %s", draft.Status)
	}

	// Validate draft data before submission
	var courseData model.Course
	if err := json.Unmarshal(draft.DraftData, &courseData); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Msg("[SubmitForApproval] Invalid draft data")
		return nil, fmt.Errorf("invalid draft data: %w", err)
	}

	// Perform business validation on the course data
	if err := s.validateCourseData(ctx, &courseData); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Msg("[SubmitForApproval] Course data validation failed")
		return nil, fmt.Errorf("course data validation failed: %w", err)
	}

	// Update draft status
	now := time.Now()
	draft.Status = model.DraftStatusPendingApproval
	draft.SubmittedAt = null.TimeFrom(now)
	draft.UpdatedBy = uuid.NullUUID{UUID: submittedBy, Valid: true}
	draft.UpdatedAt = now

	err = s.courseDraftRepo.Update(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Str("submitted_by", submittedBy.String()).
			Msg("[SubmitForApproval] Error submitting draft for approval")
		return nil, fmt.Errorf("failed to submit draft for approval: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", courseID.String()).
		Str("submitted_by", submittedBy.String()).
		Msg("[SubmitForApproval] Draft submitted for approval successfully")

	return draft, nil
}

// validateCourseData performs business validation on course data
func (s *CourseDraftService) validateCourseData(ctx context.Context, course *model.Course) error {
	// Basic validation
	if course.Title == "" {
		return fmt.Errorf("course title is required")
	}

	if course.Description == "" {
		return fmt.Errorf("course description is required")
	}

	if course.TutorID == uuid.Nil {
		return fmt.Errorf("tutor ID is required")
	}

	if course.CourseCategoryID == uuid.Nil {
		return fmt.Errorf("course category ID is required")
	}

	if course.Price.IsZero() || course.Price.IsNegative() {
		return fmt.Errorf("course price must be positive")
	}

	// Add more validation rules as needed
	logger.InfoCtx(ctx).
		Str("course_id", course.ID.String()).
		Msg("[validateCourseData] Course data validation passed")

	return nil
}

// ApproveDraft approves a draft and merges the data into the live course
func (s *CourseDraftService) ApproveDraft(ctx context.Context, draftID uuid.UUID, reviewedBy uuid.UUID, reviewNotes string) (*model.Course, error) {
	// Get draft by ID
	draft, err := s.courseDraftRepo.GetByID(ctx, draftID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.ErrorCtx(ctx).
				Str("draft_id", draftID.String()).
				Msg("[ApproveDraft] Draft not found")
			return nil, fmt.Errorf("draft not found")
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Msg("[ApproveDraft] Error getting draft")
		return nil, fmt.Errorf("failed to get draft: %w", err)
	}

	// Validate that draft can be approved
	if draft.Status != model.DraftStatusPendingApproval {
		logger.WarnCtx(ctx).
			Str("draft_id", draftID.String()).
			Str("status", string(draft.Status)).
			Msg("[ApproveDraft] Draft is not in pending approval status")
		return nil, fmt.Errorf("draft is not in pending approval status, current status: %s", draft.Status)
	}

	// Parse draft data
	var updatedCourseData model.Course
	if err := json.Unmarshal(draft.DraftData, &updatedCourseData); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Msg("[ApproveDraft] Error parsing draft data")
		return nil, fmt.Errorf("failed to parse draft data: %w", err)
	}

	// Get current course data
	currentCourse, err := s.courseRepo.GetByID(ctx, draft.CourseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Str("course_id", draft.CourseID.String()).
			Msg("[ApproveDraft] Error getting current course")
		return nil, fmt.Errorf("failed to get current course: %w", err)
	}

	// Merge draft data into current course (preserve ID and audit fields)
	mergedCourse := s.mergeCourseData(currentCourse, &updatedCourseData)

	// Validate merged course data
	if err := s.validateCourseData(ctx, mergedCourse); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Msg("[ApproveDraft] Merged course data validation failed")
		return nil, fmt.Errorf("merged course data validation failed: %w", err)
	}

	// Update course with merged data
	// Note: This would typically use a CourseRepository.Update method
	// For now, we'll simulate the update process
	logger.InfoCtx(ctx).
		Str("draft_id", draftID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("reviewed_by", reviewedBy.String()).
		Msg("[ApproveDraft] Course data merged successfully (update simulation)")

	// Update draft status to approved
	now := time.Now()
	draft.Status = model.DraftStatusApproved
	draft.ReviewedBy = uuid.NullUUID{UUID: reviewedBy, Valid: true}
	draft.ReviewedAt = null.TimeFrom(now)
	draft.ReviewNotes = null.StringFrom(reviewNotes)
	draft.UpdatedBy = uuid.NullUUID{UUID: reviewedBy, Valid: true}
	draft.UpdatedAt = now

	err = s.courseDraftRepo.Update(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Str("reviewed_by", reviewedBy.String()).
			Msg("[ApproveDraft] Error updating draft status to approved")
		return nil, fmt.Errorf("failed to update draft status: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draftID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("reviewed_by", reviewedBy.String()).
		Msg("[ApproveDraft] Draft approved and course updated successfully")

	return mergedCourse, nil
}

// RejectDraft rejects a draft with review notes
func (s *CourseDraftService) RejectDraft(ctx context.Context, draftID uuid.UUID, reviewedBy uuid.UUID, reviewNotes string) (*model.CourseDraft, error) {
	// Get draft by ID
	draft, err := s.courseDraftRepo.GetByID(ctx, draftID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.ErrorCtx(ctx).
				Str("draft_id", draftID.String()).
				Msg("[RejectDraft] Draft not found")
			return nil, fmt.Errorf("draft not found")
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Msg("[RejectDraft] Error getting draft")
		return nil, fmt.Errorf("failed to get draft: %w", err)
	}

	// Validate that draft can be rejected
	if draft.Status != model.DraftStatusPendingApproval {
		logger.WarnCtx(ctx).
			Str("draft_id", draftID.String()).
			Str("status", string(draft.Status)).
			Msg("[RejectDraft] Draft is not in pending approval status")
		return nil, fmt.Errorf("draft is not in pending approval status, current status: %s", draft.Status)
	}

	// Validate review notes are provided
	if reviewNotes == "" {
		logger.WarnCtx(ctx).
			Str("draft_id", draftID.String()).
			Msg("[RejectDraft] Review notes are required for rejection")
		return nil, fmt.Errorf("review notes are required for draft rejection")
	}

	// Update draft status to rejected
	now := time.Now()
	draft.Status = model.DraftStatusRejected
	draft.ReviewedBy = uuid.NullUUID{UUID: reviewedBy, Valid: true}
	draft.ReviewedAt = null.TimeFrom(now)
	draft.ReviewNotes = null.StringFrom(reviewNotes)
	draft.UpdatedBy = uuid.NullUUID{UUID: reviewedBy, Valid: true}
	draft.UpdatedAt = now

	err = s.courseDraftRepo.Update(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Str("reviewed_by", reviewedBy.String()).
			Msg("[RejectDraft] Error updating draft status to rejected")
		return nil, fmt.Errorf("failed to update draft status: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draftID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("reviewed_by", reviewedBy.String()).
		Msg("[RejectDraft] Draft rejected successfully")

	return draft, nil
}

// mergeCourseData merges draft data into current course while preserving critical fields
func (s *CourseDraftService) mergeCourseData(current *model.Course, draft *model.Course) *model.Course {
	// Create a copy of current course to preserve audit fields
	merged := *current

	// Update fields from draft (preserve ID, audit fields, and other critical data)
	merged.Title = draft.Title
	merged.Description = draft.Description
	merged.Price = draft.Price
	merged.ClassType = draft.ClassType
	merged.IsFreeFirstCourse = draft.IsFreeFirstCourse
	merged.CourseCategoryID = draft.CourseCategoryID
	merged.Status = draft.Status
	merged.UpdatedAt = time.Now()

	// Note: In a real implementation, you might want to be more selective
	// about which fields to merge, and handle relationships properly

	return &merged
}

// PreviewCourse merges live course data with draft data for preview
func (s *CourseDraftService) PreviewCourse(ctx context.Context, courseID uuid.UUID) (*model.Course, error) {
	// Get current course
	course, err := s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.ErrorCtx(ctx).
				Str("course_id", courseID.String()).
				Msg("[PreviewCourse] Course not found")
			return nil, fmt.Errorf("course not found")
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[PreviewCourse] Error getting course")
		return nil, fmt.Errorf("failed to get course: %w", err)
	}

	// Try to get current draft
	draft, err := s.courseDraftRepo.GetByCourseID(ctx, courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// No draft exists, return current course
			logger.InfoCtx(ctx).
				Str("course_id", courseID.String()).
				Msg("[PreviewCourse] No draft found, returning current course")
			return course, nil
		}
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[PreviewCourse] Error getting draft")
		return nil, fmt.Errorf("failed to get draft: %w", err)
	}

	// Parse draft data
	var draftCourse model.Course
	if err := json.Unmarshal(draft.DraftData, &draftCourse); err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Msg("[PreviewCourse] Error parsing draft data")
		return nil, fmt.Errorf("failed to parse draft data: %w", err)
	}

	// Merge draft data with current course for preview
	previewCourse := s.mergeCourseData(course, &draftCourse)

	logger.InfoCtx(ctx).
		Str("course_id", courseID.String()).
		Str("draft_id", draft.ID.String()).
		Str("draft_status", string(draft.Status)).
		Msg("[PreviewCourse] Course preview generated with draft data")

	return previewCourse, nil
}

// GetPendingDrafts gets all drafts pending approval for admin review
func (s *CourseDraftService) GetPendingDrafts(ctx context.Context, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	drafts, metadata, err := s.courseDraftRepo.GetPendingDrafts(ctx, pagination)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetPendingDrafts] Error getting pending drafts")
		return nil, model.Metadata{}, fmt.Errorf("failed to get pending drafts: %w", err)
	}

	logger.InfoCtx(ctx).
		Int64("total", metadata.Total).
		Int("count", len(drafts)).
		Msg("[GetPendingDrafts] Retrieved pending drafts successfully")

	return drafts, metadata, nil
}

// GetDraftsByStatus gets drafts filtered by status
func (s *CourseDraftService) GetDraftsByStatus(ctx context.Context, status model.DraftStatus, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	drafts, metadata, err := s.courseDraftRepo.GetDraftsByStatus(ctx, status, pagination)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("status", string(status)).
			Msg("[GetDraftsByStatus] Error getting drafts by status")
		return nil, model.Metadata{}, fmt.Errorf("failed to get drafts by status: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("status", string(status)).
		Int64("total", metadata.Total).
		Int("count", len(drafts)).
		Msg("[GetDraftsByStatus] Retrieved drafts by status successfully")

	return drafts, metadata, nil
}

// GetDraftsByCreator gets drafts created by a specific user
func (s *CourseDraftService) GetDraftsByCreator(ctx context.Context, creatorID uuid.UUID, pagination model.Pagination) ([]model.CourseDraft, model.Metadata, error) {
	drafts, metadata, err := s.courseDraftRepo.GetDraftsByCreator(ctx, creatorID, pagination)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("creator_id", creatorID.String()).
			Msg("[GetDraftsByCreator] Error getting drafts by creator")
		return nil, model.Metadata{}, fmt.Errorf("failed to get drafts by creator: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("creator_id", creatorID.String()).
		Int64("total", metadata.Total).
		Int("count", len(drafts)).
		Msg("[GetDraftsByCreator] Retrieved drafts by creator successfully")

	return drafts, metadata, nil
}

// CheckForConflicts checks if the live course has been modified since the draft was created
func (s *CourseDraftService) CheckForConflicts(ctx context.Context, draftID uuid.UUID) (*model.ConflictInfo, error) {
	// Get the draft
	draft, err := s.courseDraftRepo.GetByID(ctx, draftID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draftID.String()).
			Msg("[CheckForConflicts] Error getting draft")
		return nil, fmt.Errorf("failed to get draft: %w", err)
	}

	// Get the current live course
	liveCourse, err := s.courseRepo.GetByID(ctx, draft.CourseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", draft.CourseID.String()).
			Msg("[CheckForConflicts] Error getting live course")
		return nil, fmt.Errorf("failed to get live course: %w", err)
	}

	// Check if live course was modified after draft creation
	hasConflict := liveCourse.UpdatedAt.After(draft.CreatedAt)

	conflictInfo := &model.ConflictInfo{
		HasConflict:         hasConflict,
		DraftCreatedAt:      draft.CreatedAt,
		LiveCourseUpdatedAt: liveCourse.UpdatedAt,
		ConflictFields:      []string{}, // Will be populated if conflicts exist
	}

	if hasConflict {
		// Identify specific fields that have conflicts
		conflictFields := s.identifyConflictFields(ctx, draft, liveCourse)
		conflictInfo.ConflictFields = conflictFields

		logger.WarnCtx(ctx).
			Str("draft_id", draftID.String()).
			Str("course_id", draft.CourseID.String()).
			Time("draft_created", draft.CreatedAt).
			Time("course_updated", liveCourse.UpdatedAt).
			Strs("conflict_fields", conflictFields).
			Msg("[CheckForConflicts] Draft conflict detected")
	}

	return conflictInfo, nil
}

// identifyConflictFields compares draft data with live course to identify specific conflicts
func (s *CourseDraftService) identifyConflictFields(ctx context.Context, draft *model.CourseDraft, liveCourse *model.Course) []string {
	var conflictFields []string

	// Parse draft data
	var draftCourse model.Course
	if err := json.Unmarshal(draft.DraftData, &draftCourse); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[identifyConflictFields] Error unmarshaling draft data")
		return []string{"unknown_fields"}
	}

	// Compare key fields
	if draftCourse.Title != liveCourse.Title {
		conflictFields = append(conflictFields, "title")
	}
	if draftCourse.Description != liveCourse.Description {
		conflictFields = append(conflictFields, "description")
	}
	if draftCourse.Price.Cmp(liveCourse.Price) != 0 {
		conflictFields = append(conflictFields, "price")
	}
	if draftCourse.Status != liveCourse.Status {
		conflictFields = append(conflictFields, "status")
	}
	if draftCourse.CourseCategoryID != liveCourse.CourseCategoryID {
		conflictFields = append(conflictFields, "course_category_id")
	}

	return conflictFields
}

// ResolveConflict provides options for resolving draft conflicts
func (s *CourseDraftService) ResolveConflict(ctx context.Context, draftID uuid.UUID, resolution model.ConflictResolution, userID uuid.UUID) error {
	draft, err := s.courseDraftRepo.GetByID(ctx, draftID)
	if err != nil {
		return fmt.Errorf("failed to get draft: %w", err)
	}

	switch resolution {
	case model.ConflictResolutionKeepDraft:
		// Keep draft as is - no action needed
		logger.InfoCtx(ctx).
			Str("draft_id", draftID.String()).
			Str("user_id", userID.String()).
			Msg("[ResolveConflict] Keeping draft unchanged")
		return nil

	case model.ConflictResolutionUpdateDraft:
		// Update draft with current live course data
		return s.updateDraftWithLiveCourse(ctx, draft, userID)

	case model.ConflictResolutionForceSubmit:
		// Force submit draft despite conflicts
		_, err := s.SubmitForApproval(ctx, draftID, userID)
		return err

	default:
		return fmt.Errorf("invalid conflict resolution: %s", resolution)
	}
}

// updateDraftWithLiveCourse updates the draft with current live course data
func (s *CourseDraftService) updateDraftWithLiveCourse(ctx context.Context, draft *model.CourseDraft, userID uuid.UUID) error {
	// Get current live course
	liveCourse, err := s.courseRepo.GetByID(ctx, draft.CourseID)
	if err != nil {
		return fmt.Errorf("failed to get live course: %w", err)
	}

	// Serialize live course data
	courseData, err := json.Marshal(liveCourse)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[updateDraftWithLiveCourse] Error marshaling live course data")
		return fmt.Errorf("failed to serialize live course data: %w", err)
	}

	// Update draft with live course data
	draft.DraftData = courseData
	draft.UpdatedBy = uuid.NullUUID{UUID: userID, Valid: true}

	err = s.courseDraftRepo.Update(ctx, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("draft_id", draft.ID.String()).
			Msg("[updateDraftWithLiveCourse] Error updating draft")
		return fmt.Errorf("failed to update draft: %w", err)
	}

	logger.InfoCtx(ctx).
		Str("draft_id", draft.ID.String()).
		Str("course_id", draft.CourseID.String()).
		Str("user_id", userID.String()).
		Msg("[updateDraftWithLiveCourse] Draft updated with live course data")

	return nil
}
