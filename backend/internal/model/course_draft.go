package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// DraftType represents the type of draft
type DraftType string

const (
	DraftTypeEdit   DraftType = "edit"   // Editing existing course
	DraftTypeCreate DraftType = "create" // Creating new course
)

// DraftStatus represents the status of a draft
type DraftStatus string

const (
	DraftStatusDraft           DraftStatus = "draft"            // Draft is being worked on
	DraftStatusPendingApproval DraftStatus = "pending_approval" // Draft submitted for approval
	DraftStatusApproved        DraftStatus = "approved"         // Draft approved and merged
	DraftStatusRejected        DraftStatus = "rejected"         // Draft rejected by admin
)

// CourseDraft represents a temporary version of course data during editing
type CourseDraft struct {
	ID          uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	CourseID    uuid.UUID      `gorm:"type:char(36);not null" json:"courseId"`
	DraftData   datatypes.JSON `gorm:"type:json;not null" json:"draftData"`
	DraftType   DraftType      `gorm:"type:enum('edit','create');not null;default:'edit'" json:"draftType"`
	Status      DraftStatus    `gorm:"type:enum('draft','pending_approval','approved','rejected');not null;default:'draft'" json:"status"`
	CreatedBy   uuid.UUID      `gorm:"type:char(36);not null" json:"createdBy"`
	SubmittedAt null.Time      `gorm:"type:timestamp" json:"submittedAt,omitempty"`
	ReviewedAt  null.Time      `gorm:"type:timestamp" json:"reviewedAt,omitempty"`
	ReviewedBy  uuid.NullUUID  `gorm:"type:char(36)" json:"reviewedBy,omitempty"`
	ReviewNotes null.String    `gorm:"type:text" json:"reviewNotes,omitempty"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt   null.Time      `gorm:"type:timestamp" json:"deletedAt,omitempty"`
	UpdatedBy   uuid.NullUUID  `gorm:"type:char(36)" json:"updatedBy,omitempty"`
	DeletedBy   uuid.NullUUID  `gorm:"type:char(36)" json:"deletedBy,omitempty"`

	// Relationships
	Course   Course `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	Creator  User   `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Reviewer *User  `gorm:"foreignKey:ReviewedBy" json:"reviewer,omitempty"`
}

// BeforeCreate hook to generate UUID if not provided
func (cd *CourseDraft) BeforeCreate(tx *gorm.DB) error {
	if cd.ID == uuid.Nil {
		cd.ID = uuid.New()
	}
	return nil
}

// TableName returns the table name for CourseDraft
func (CourseDraft) TableName() string {
	return "course_drafts"
}

// IsActive returns true if the draft is in an active state (draft or pending approval)
func (cd *CourseDraft) IsActive() bool {
	return cd.Status == DraftStatusDraft || cd.Status == DraftStatusPendingApproval
}

// CanBeEdited returns true if the draft can be edited
func (cd *CourseDraft) CanBeEdited() bool {
	return cd.Status != DraftStatusApproved
}

// CanBeSubmitted returns true if the draft can be submitted for approval
func (cd *CourseDraft) CanBeSubmitted() bool {
	return cd.Status == DraftStatusDraft
}

// IsCompleted returns true if the draft has been processed (approved or rejected)
func (cd *CourseDraft) IsCompleted() bool {
	return cd.Status == DraftStatusApproved || cd.Status == DraftStatusRejected
}

// ConflictResolution represents different ways to resolve draft conflicts
type ConflictResolution string

const (
	ConflictResolutionKeepDraft   ConflictResolution = "keep_draft"   // Keep draft unchanged
	ConflictResolutionUpdateDraft ConflictResolution = "update_draft" // Update draft with live course data
	ConflictResolutionForceSubmit ConflictResolution = "force_submit" // Submit draft despite conflicts
)

// ConflictInfo contains information about draft conflicts
type ConflictInfo struct {
	HasConflict         bool      `json:"has_conflict"`
	DraftCreatedAt      time.Time `json:"draft_created_at"`
	LiveCourseUpdatedAt time.Time `json:"live_course_updated_at"`
	ConflictFields      []string  `json:"conflict_fields"`
}

// CleanupResult contains results from draft cleanup operations
type CleanupResult struct {
	TotalProcessed int      `json:"total_processed"`
	TotalDeleted   int      `json:"total_deleted"`
	TotalSkipped   int      `json:"total_skipped"`
	Errors         []string `json:"errors"`
}

// CleanupStats contains statistics about drafts eligible for cleanup
type CleanupStats struct {
	TotalOldDrafts     int       `json:"total_old_drafts"`
	EligibleForCleanup int       `json:"eligible_for_cleanup"`
	PendingApproval    int       `json:"pending_approval"`
	ApprovedDrafts     int       `json:"approved_drafts"`
	CutoffDate         time.Time `json:"cutoff_date"`
}

// CourseDraftFilter for filtering drafts in repository queries
type CourseDraftFilter struct {
	CreatedBefore   time.Time     `json:"created_before"`
	ExcludeStatuses []DraftStatus `json:"exclude_statuses"`
	IncludeDeleted  bool          `json:"include_deleted"`
	CreatedBy       uuid.UUID     `json:"created_by"`
	Status          DraftStatus   `json:"status"`
	Pagination
}
