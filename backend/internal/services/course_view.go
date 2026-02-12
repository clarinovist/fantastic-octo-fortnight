package services

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type CourseViewService struct {
	courseViewRepo *repositories.CourseViewRepository
}

func NewCourseViewService(courseViewRepo *repositories.CourseViewRepository) *CourseViewService {
	return &CourseViewService{
		courseViewRepo: courseViewRepo,
	}
}

func (s *CourseViewService) RecordView(ctx context.Context, tutorID, courseID, courseCategoryID uuid.UUID, userID uuid.UUID, ipAddress, userAgent string) error {
	courseView := &model.CourseView{
		TutorID:          tutorID,
		CourseID:         courseID,
		CourseCategoryID: courseCategoryID,
		UserID:           userID,
		IPAddress:        ipAddress,
		UserAgent:        userAgent,
		CreatedAt:        time.Now(),
	}

	err := s.courseViewRepo.Create(ctx, courseView)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutorID.String()).
			Str("course_id", courseID.String()).
			Str("course_category_id", courseCategoryID.String()).
			Msg("[RecordView] Error recording course view")
		return err
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", tutorID.String()).
		Str("course_id", courseID.String()).
		Str("course_category_id", courseCategoryID.String()).
		Msg("[RecordView] Course view recorded successfully")

	return nil
}

func (s *CourseViewService) GetViews(ctx context.Context, filter model.CourseViewFilter) ([]model.CourseView, model.Metadata, error) {
	views, metadata, err := s.courseViewRepo.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetViews] Error getting course views")
		return nil, model.Metadata{}, err
	}

	return views, metadata, nil
}

func (s *CourseViewService) CountViewsByTutorID(ctx context.Context, tutorID uuid.UUID) (int64, error) {
	count, err := s.courseViewRepo.CountByTutorID(ctx, tutorID.String())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutorID.String()).
			Msg("[CountViewsByTutorID] Error counting course views")
		return 0, err
	}

	return count, nil
}
