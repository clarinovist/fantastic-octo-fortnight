package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/shopspring/decimal"
)

type SessionTaskService struct {
	sessionTaskRepo *repositories.SessionTaskRepository
	bookingRepo     *repositories.BookingRepository
	tutorRepo       *repositories.TutorRepository
}

func NewSessionTaskService(
	sessionTaskRepo *repositories.SessionTaskRepository,
	bookingRepo *repositories.BookingRepository,
	tutorRepo *repositories.TutorRepository,
) *SessionTaskService {
	return &SessionTaskService{
		sessionTaskRepo: sessionTaskRepo,
		bookingRepo:     bookingRepo,
		tutorRepo:       tutorRepo,
	}
}

// AddTaskToBooking adds a new task (module/assignment) to a specific booking session
func (s *SessionTaskService) AddTaskToBooking(ctx context.Context, bookingID uuid.UUID, title string, description null.String, attachmentURL null.String) (*model.SessionTask, error) {
	// 1. Verify Tutor
	tutor, err := s.tutorRepo.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil || tutor == nil {
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	// 2. Verify Booking ownership
	booking, err := s.bookingRepo.GetByID(ctx, bookingID)
	if err != nil || booking == nil {
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}
	if booking.TutorID != tutor.ID {
		return nil, shared.MakeError(ErrForbidden, "booking ownership mismatch")
	}

	// 3. Create Task
	task := &model.SessionTask{
		BookingID:     bookingID,
		Title:         title,
		Description:   description,
		AttachmentURL: attachmentURL,
	}

	err = s.sessionTaskRepo.Create(ctx, task)
	if err != nil {
		return nil, shared.MakeError(ErrInternalServer)
	}

	return task, nil
}

// GradeTask adds or updates the submission for a task
func (s *SessionTaskService) GradeTask(ctx context.Context, taskID uuid.UUID, submissionURL null.String, score decimal.NullDecimal) (*model.TaskSubmission, error) {
	// 1. Verify Tutor & Task Existence
	tutor, err := s.tutorRepo.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil || tutor == nil {
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	task, err := s.sessionTaskRepo.GetByID(ctx, taskID)
	if err != nil || task == nil {
		return nil, shared.MakeError(ErrEntityNotFound, "task")
	}

	booking, err := s.bookingRepo.GetByID(ctx, task.BookingID)
	if err != nil || booking == nil {
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.TutorID != tutor.ID {
		return nil, shared.MakeError(ErrForbidden, "task ownership mismatch")
	}

	// 2. Check if submission already exists
	submission, err := s.sessionTaskRepo.GetSubmissionByTaskID(ctx, taskID)
	if err != nil {
		return nil, shared.MakeError(ErrInternalServer)
	}

	if submission != nil {
		// Update existing
		submission.SubmissionURL = submissionURL
		submission.Score = score
		err = s.sessionTaskRepo.UpdateSubmission(ctx, submission)
		if err != nil {
			return nil, shared.MakeError(ErrInternalServer)
		}
		return submission, nil
	}

	// Create new
	newSubmission := &model.TaskSubmission{
		SessionTaskID: taskID,
		SubmissionURL: submissionURL,
		Score:         score,
	}

	err = s.sessionTaskRepo.CreateSubmission(ctx, newSubmission)
	if err != nil {
		return nil, shared.MakeError(ErrInternalServer)
	}

	return newSubmission, nil
}
