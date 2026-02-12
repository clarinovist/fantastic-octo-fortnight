package dto

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
)

// CreateDraftRequest represents the request to create a new draft
type CreateDraftRequest struct {
	CourseID uuid.UUID `json:"courseId" binding:"required"`
}

// UpdateDraftRequest represents the request to update a draft
type UpdateDraftRequest struct {
	DraftData json.RawMessage `json:"draftData" binding:"required"`
}

// SubmitDraftRequest represents the request to submit a draft for approval
type SubmitDraftRequest struct {
	// No additional fields needed - courseId comes from URL path
}

// ApproveDraftRequest represents the request to approve a draft (admin only)
type ApproveDraftRequest struct {
	ReviewNotes string `json:"reviewNotes,omitempty"`
}

// RejectDraftRequest represents the request to reject a draft (admin only)
type RejectDraftRequest struct {
	ReviewNotes string `json:"reviewNotes" binding:"required"`
}

// GetDraftsRequest represents the request to get drafts with filters
type GetDraftsRequest struct {
	Status    model.DraftStatus `form:"status"`
	CreatorID uuid.UUID         `form:"creatorId"`
	CourseID  uuid.UUID         `form:"courseId"`
	model.Pagination
}

// DraftResponse represents a course draft in API responses
type DraftResponse struct {
	ID          uuid.UUID         `json:"id"`
	CourseID    uuid.UUID         `json:"courseId"`
	DraftType   model.DraftType   `json:"draftType"`
	Status      model.DraftStatus `json:"status"`
	DraftData   json.RawMessage   `json:"draftData"`
	CreatedBy   uuid.UUID         `json:"createdBy"`
	UpdatedBy   *uuid.UUID        `json:"updatedBy,omitempty"`
	ReviewedBy  *uuid.UUID        `json:"reviewedBy,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
	SubmittedAt *time.Time        `json:"submittedAt,omitempty"`
	ReviewedAt  *time.Time        `json:"reviewedAt,omitempty"`
	ReviewNotes *string           `json:"reviewNotes,omitempty"`
	Course      *CourseBasicInfo  `json:"course,omitempty"`
	Creator     *UserBasicInfo    `json:"creator,omitempty"`
	Reviewer    *UserBasicInfo    `json:"reviewer,omitempty"`
}

// CourseBasicInfo represents basic course information for draft responses
type CourseBasicInfo struct {
	ID             uuid.UUID      `json:"id"`
	Title          string         `json:"title"`
	Description    string         `json:"description"`
	CourseCategory CourseCategory `json:"courseCategory"`
	TutorID        uuid.UUID      `json:"tutorId"`
	Status         string         `json:"status"`
}

// UserBasicInfo represents basic user information for draft responses
type UserBasicInfo struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
}

// DraftSummaryResponse represents a simplified draft for listing views
type DraftSummaryResponse struct {
	ID          uuid.UUID         `json:"id"`
	CourseID    uuid.UUID         `json:"courseId"`
	CourseTitle string            `json:"courseTitle"`
	Status      model.DraftStatus `json:"status"`
	CreatedBy   uuid.UUID         `json:"createdBy"`
	CreatorName string            `json:"creatorName"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
	SubmittedAt *time.Time        `json:"submittedAt,omitempty"`
}

// NewDraftResponse creates a DraftResponse from a CourseDraft model
func NewDraftResponse(draft model.CourseDraft) DraftResponse {
	response := DraftResponse{
		ID:        draft.ID,
		CourseID:  draft.CourseID,
		DraftType: draft.DraftType,
		Status:    draft.Status,
		DraftData: json.RawMessage(draft.DraftData),
		CreatedBy: draft.CreatedBy,
		CreatedAt: draft.CreatedAt,
		UpdatedAt: draft.UpdatedAt,
	}

	// Handle nullable fields
	if draft.UpdatedBy.Valid {
		response.UpdatedBy = &draft.UpdatedBy.UUID
	}

	if draft.ReviewedBy.Valid {
		response.ReviewedBy = &draft.ReviewedBy.UUID
	}

	if draft.SubmittedAt.Valid {
		submittedTime := draft.SubmittedAt.Time
		response.SubmittedAt = &submittedTime
	}

	if draft.ReviewedAt.Valid {
		reviewedTime := draft.ReviewedAt.Time
		response.ReviewedAt = &reviewedTime
	}

	if draft.ReviewNotes.Valid {
		response.ReviewNotes = &draft.ReviewNotes.String
	}

	// Add related data if loaded
	response.Course = &CourseBasicInfo{
		ID:          draft.Course.ID,
		Title:       draft.Course.Title,
		Description: draft.Course.Description,
		TutorID:     draft.Course.TutorID,
		Status:      string(draft.Course.Status),
	}

	// Add course category if loaded
	response.Course.CourseCategory = CourseCategory{
		ID:   draft.Course.CourseCategory.ID,
		Name: draft.Course.CourseCategory.Name,
	}

	response.Creator = &UserBasicInfo{
		ID:    draft.Creator.ID,
		Name:  draft.Creator.Name,
		Email: draft.Creator.Email,
	}

	if draft.Reviewer != nil {
		response.Reviewer = &UserBasicInfo{
			ID:    draft.Reviewer.ID,
			Name:  draft.Reviewer.Name,
			Email: draft.Reviewer.Email,
		}
	}

	return response
}

// NewDraftResponses creates a slice of DraftResponse from CourseDraft models
func NewDraftResponses(drafts []model.CourseDraft) []DraftResponse {
	responses := make([]DraftResponse, len(drafts))
	for i, draft := range drafts {
		responses[i] = NewDraftResponse(draft)
	}
	return responses
}

// NewDraftSummaryResponse creates a DraftSummaryResponse from a CourseDraft model
func NewDraftSummaryResponse(draft model.CourseDraft) DraftSummaryResponse {
	response := DraftSummaryResponse{
		ID:        draft.ID,
		CourseID:  draft.CourseID,
		Status:    draft.Status,
		CreatedBy: draft.CreatedBy,
		CreatedAt: draft.CreatedAt,
		UpdatedAt: draft.UpdatedAt,
	}

	// Handle nullable fields
	if draft.SubmittedAt.Valid {
		submittedTime := draft.SubmittedAt.Time
		response.SubmittedAt = &submittedTime
	}

	// Add course title if course is loaded
	response.CourseTitle = draft.Course.Title

	// Add creator name if creator is loaded
	response.CreatorName = draft.Creator.Name

	return response
}

// NewDraftSummaryResponses creates a slice of DraftSummaryResponse from CourseDraft models
func NewDraftSummaryResponses(drafts []model.CourseDraft) []DraftSummaryResponse {
	responses := make([]DraftSummaryResponse, len(drafts))
	for i, draft := range drafts {
		responses[i] = NewDraftSummaryResponse(draft)
	}
	return responses
}

// Filter converts GetDraftsRequest to appropriate repository filters
func (r *GetDraftsRequest) Filter() (model.DraftStatus, uuid.UUID, uuid.UUID, model.Pagination) {
	return r.Status, r.CreatorID, r.CourseID, r.Pagination
}
