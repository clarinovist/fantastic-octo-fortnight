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

type TutorReviewService struct {
	config *config.Config
	review *repositories.ReviewRepository
	tutor  *repositories.TutorRepository
}

func NewTutorReviewService(config *config.Config, review *repositories.ReviewRepository, tutor *repositories.TutorRepository) *TutorReviewService {
	return &TutorReviewService{
		config: config,
		review: review,
		tutor:  tutor,
	}
}

func (s *TutorReviewService) List(ctx context.Context, request dto.ListReviewRequest) ([]model.StudentReview, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorReview] Error getting tutor by user ID")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorReview] User not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "user")
	}

	reviews, metadata, err := s.review.GetStudentReviews(ctx, model.ReviewFilter{
		Pagination: request.Pagination,
		Sort:       request.Sort,
		TutorID:    tutor.ID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorReview] Error getting tutor reviews")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	return reviews, metadata, nil
}

func (s *TutorReviewService) Update(ctx context.Context, request dto.UpdateReviewRequest) error {
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Error getting tutor by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	review, err := s.review.GetStudentReviewByID(ctx, request.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Error getting tutor review")
		return shared.MakeError(ErrInternalServer)
	}

	if review == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	if review.TutorID != tutor.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	duration := s.config.Review.MaxEditedDuration
	if review.CreatedAt.Add(duration).Before(time.Now()) {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Review expired")
		return shared.MakeError(ErrBadRequest, "cannot edit review")
	}

	review.Review = null.StringFrom(request.Review)
	review.Rate = null.IntFrom(int64(request.Rate))

	err = s.review.UpdateStudentReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorReview] Error updating tutor review")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *TutorReviewService) UpdateByAdmin(ctx context.Context, request dto.UpdateTutorReviewAdminRequest) error {
	review, err := s.review.GetTutorReviewByID(ctx, request.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateByAdmin] Error getting tutor review")
		return shared.MakeError(ErrInternalServer)
	}

	if review == nil {
		logger.ErrorCtx(ctx).Msg("[UpdateByAdmin] Review not found")
		return shared.MakeError(ErrEntityNotFound, "review")
	}

	review.Review = null.StringFrom(request.Review)
	review.Rate = null.IntFrom(int64(request.Rate))
	review.RecommendByStudent = request.RecommendByStudent
	review.IsSubmitted = true

	err = s.review.UpdateTutorReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateByAdmin] Error updating tutor review")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *TutorReviewService) DeleteByAdmin(ctx context.Context, id uuid.UUID) error {
	review, err := s.review.GetTutorReviewByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteByAdmin] Error getting tutor review")
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

	err = s.review.UpdateTutorReview(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteByAdmin] Error deleting tutor review")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}
