package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type StudentReviewService struct {
	config              *config.Config
	review              *repositories.ReviewRepository
	student             *repositories.StudentRepository
	tutor               *repositories.TutorRepository
	notificationService *NotificationService
}

func NewStudentReviewService(
	config *config.Config,
	review *repositories.ReviewRepository,
	student *repositories.StudentRepository,
	tutor *repositories.TutorRepository,
	notificationService *NotificationService,
) *StudentReviewService {
	return &StudentReviewService{
		config:              config,
		review:              review,
		student:             student,
		tutor:               tutor,
		notificationService: notificationService,
	}
}

func (s *StudentReviewService) List(ctx context.Context, request dto.ListReviewRequest) ([]model.TutorReview, model.Metadata, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentReview] Error getting student by user ID")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentReview] User not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "user")
	}

	reviews, metadata, err := s.review.GetTutorReviews(ctx, model.ReviewFilter{
		Pagination: request.Pagination,
		Sort:       request.Sort,
		StudentID:  student.ID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentReview] Error getting student reviews")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	return reviews, metadata, nil
}

func (s *StudentReviewService) Update(ctx context.Context, request dto.UpdateReviewRequest) error {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error getting student by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	review, err := s.review.GetTutorReviewByID(ctx, request.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error getting student review")
		return shared.MakeError(ErrInternalServer)
	}

	if review == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	if review.StudentID != student.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	duration := s.config.Review.MaxEditedDuration
	if review.CreatedAt.Add(duration).Before(time.Now()) {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Review expired")
		return shared.MakeError(ErrBadRequest, "cannot edit review")
	}

	isSubmitted := review.IsSubmitted
	review.Review = null.StringFrom(request.Review)
	review.Rate = null.IntFrom(int64(request.Rate))
	review.RecommendByStudent = request.RecommendByStudent
	review.IsSubmitted = true

	err = s.review.UpdateTutorReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error updating student review")
		return shared.MakeError(ErrInternalServer)
	}

	if !isSubmitted {
		// Update tutor level point
		go func() {
			bgCtx := context.Background()

			tutor, err := s.tutor.GetByID(bgCtx, review.TutorID)
			if err != nil {
				logger.ErrorCtx(bgCtx).Err(err).Msg("[UpdateStudentReview] Error getting tutor")
				return
			}

			if tutor != nil {
				tutor.LevelPoint++
				err = s.tutor.Update(bgCtx, tutor)
				if err != nil {
					logger.ErrorCtx(bgCtx).Err(err).Msg("[UpdateStudentReview] Error updating tutor level point")
				}
			}

			err = s.notificationService.SubmitReviewTutor(bgCtx, *review)
			if err != nil {
			}
		}()
	}

	return nil
}

func (s *StudentReviewService) UpdateByAdmin(ctx context.Context, request dto.UpdateStudentReviewAdminRequest) error {
	review, err := s.review.GetStudentReviewByID(ctx, request.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateByAdmin] Error getting student review")
		return shared.MakeError(ErrInternalServer)
	}

	if review == nil {
		logger.ErrorCtx(ctx).Msg("[UpdateByAdmin] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	review.Review = null.StringFrom(request.Review)
	review.Rate = null.IntFrom(int64(request.Rate))

	err = s.review.UpdateStudentReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateByAdmin] Error updating student review")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *StudentReviewService) DeleteByAdmin(ctx context.Context, id uuid.UUID) error {
	review, err := s.review.GetStudentReviewByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteByAdmin] Error getting student review")
		return shared.MakeError(ErrInternalServer)
	}

	if review == nil {
		logger.ErrorCtx(ctx).Msg("[DeleteByAdmin] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	userID := middleware.GetUserID(ctx)
	now := null.TimeFrom(time.Now())
	review.DeletedAt = now
	review.DeletedBy = uuid.NullUUID{UUID: userID, Valid: true}

	err = s.review.UpdateStudentReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteByAdmin] Error deleting student review")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}
