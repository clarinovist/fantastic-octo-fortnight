package services

import (
	"context"
	"fmt"
	"time"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type DashboardService struct {
	tutorRepo        *repositories.TutorRepository
	studentRepo      *repositories.StudentRepository
	subscriptionRepo *repositories.SubscriptionRepository
	bookingRepo      *repositories.BookingRepository
	courseRepo       *repositories.CourseRepository
	courseViewRepo   *repositories.CourseViewRepository
}

func NewDashboardService(
	tutorRepo *repositories.TutorRepository,
	studentRepo *repositories.StudentRepository,
	subscriptionRepo *repositories.SubscriptionRepository,
	bookingRepo *repositories.BookingRepository,
	courseRepo *repositories.CourseRepository,
	courseViewRepo *repositories.CourseViewRepository,
) *DashboardService {
	return &DashboardService{
		tutorRepo:        tutorRepo,
		studentRepo:      studentRepo,
		subscriptionRepo: subscriptionRepo,
		bookingRepo:      bookingRepo,
		courseRepo:       courseRepo,
		courseViewRepo:   courseViewRepo,
	}
}

func (s *DashboardService) GetStatisticUser(ctx context.Context, startDate, endDate time.Time) (*model.DashboardStatistics, error) {
	totalTutors, err := s.tutorRepo.CountTotal(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to count total tutors")
		return nil, fmt.Errorf("failed to count total tutors: %w", err)
	}

	totalStudents, err := s.studentRepo.CountTotal(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to count total students")
		return nil, fmt.Errorf("failed to count total students: %w", err)
	}

	totalPremiumStudents, err := s.studentRepo.CountPremium(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to count premium students")
		return nil, fmt.Errorf("failed to count premium students: %w", err)
	}

	tutorsCreatedPerDay, err := s.tutorRepo.GetTutorsCreatedPerDay(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to get tutors created per day")
		return nil, fmt.Errorf("failed to get tutors created per day: %w", err)
	}

	studentsCreatedPerDay, err := s.studentRepo.GetStudentsCreatedPerDay(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to get students created per day")
		return nil, fmt.Errorf("failed to get students created per day: %w", err)
	}

	subscriptionsPerDay, err := s.subscriptionRepo.GetSubscriptionsPerDay(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticUser] Failed to get subscriptions per day")
		return nil, fmt.Errorf("failed to get subscriptions per day: %w", err)
	}

	statistics := &model.DashboardStatistics{
		TotalTutors:           totalTutors,
		TotalStudents:         totalStudents,
		TotalPremiumStudents:  totalPremiumStudents,
		TutorsCreatedPerDay:   tutorsCreatedPerDay,
		StudentsCreatedPerDay: studentsCreatedPerDay,
		SubscriptionsPerDay:   subscriptionsPerDay,
	}

	logger.InfoCtx(ctx).
		Int64("total_tutors", totalTutors).
		Int64("total_students", totalStudents).
		Int64("total_premium_students", totalPremiumStudents).
		Int("tutors_created_per_day_count", len(tutorsCreatedPerDay)).
		Int("students_created_per_day_count", len(studentsCreatedPerDay)).
		Int("subscriptions_per_day_count", len(subscriptionsPerDay)).
		Str("start_date", startDate.Format("2006-01-02")).
		Str("end_date", endDate.Format("2006-01-02")).
		Msg("[GetStatisticUser] Successfully retrieved dashboard statistics")

	return statistics, nil
}

func (s *DashboardService) GetStatisticSubscription(ctx context.Context, startDate, endDate time.Time) (*model.SubscriptionStatistics, error) {
	totalAmount, err := s.subscriptionRepo.GetTotalAmount(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticSubscription] Failed to get total subscription amount")
		return nil, fmt.Errorf("failed to get total subscription amount: %w", err)
	}

	amountPerDay, err := s.subscriptionRepo.GetAmountPerDay(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStatisticSubscription] Failed to get subscription amount per day")
		return nil, fmt.Errorf("failed to get subscription amount per day: %w", err)
	}

	statistics := &model.SubscriptionStatistics{
		TotalAmount:  totalAmount,
		AmountPerDay: amountPerDay,
	}

	logger.InfoCtx(ctx).
		Float64("total_amount", totalAmount).
		Int("amount_per_day_count", len(amountPerDay)).
		Str("start_date", startDate.Format("2006-01-02")).
		Str("end_date", endDate.Format("2006-01-02")).
		Msg("[GetStatisticSubscription] Successfully retrieved subscription statistics")

	return statistics, nil
}

func (s *DashboardService) GetTopBookedTutors(ctx context.Context) ([]model.TutorBookingStatistic, error) {
	tutors, err := s.bookingRepo.GetTopBookedTutors(ctx, 10)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedTutors] Failed to get top booked tutors")
		return nil, fmt.Errorf("failed to get top booked tutors: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("tutor_count", len(tutors)).
		Msg("[GetTopBookedTutors] Successfully retrieved top booked tutors")

	return tutors, nil
}

func (s *DashboardService) GetTopBookedStudents(ctx context.Context) ([]model.StudentBookingStatistic, error) {
	students, err := s.bookingRepo.GetTopBookedStudents(ctx, 10)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedStudents] Failed to get top booked students")
		return nil, fmt.Errorf("failed to get top booked students: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("student_count", len(students)).
		Msg("[GetTopBookedStudents] Successfully retrieved top booked students")

	return students, nil
}

func (s *DashboardService) GetTopBookedCategories(ctx context.Context) ([]model.CategoryBookingStatistic, error) {
	categories, err := s.bookingRepo.GetTopBookedCategories(ctx, 10)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopBookedCategories] Failed to get top booked categories")
		return nil, fmt.Errorf("failed to get top booked categories: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("category_count", len(categories)).
		Msg("[GetTopBookedCategories] Successfully retrieved top booked categories")

	return categories, nil
}

func (s *DashboardService) GetCourseStatisticsByCategory(ctx context.Context) ([]model.CourseStatisticByCategory, error) {
	statistics, err := s.courseRepo.GetCourseStatisticsByCategory(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourseStatisticsByCategory] Failed to get course statistics by category")
		return nil, fmt.Errorf("failed to get course statistics by category: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("category_count", len(statistics)).
		Msg("[GetCourseStatisticsByCategory] Successfully retrieved course statistics by category")

	return statistics, nil
}

func (s *DashboardService) GetTopViewedTutors(ctx context.Context) ([]model.TutorViewStatistic, error) {
	tutors, err := s.courseViewRepo.GetTopViewedTutors(ctx, 10)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopViewedTutors] Failed to get top viewed tutors")
		return nil, fmt.Errorf("failed to get top viewed tutors: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("tutor_count", len(tutors)).
		Msg("[GetTopViewedTutors] Successfully retrieved top viewed tutors")

	return tutors, nil
}

func (s *DashboardService) GetTopViewedCategories(ctx context.Context) ([]model.CategoryViewStatistic, error) {
	categories, err := s.courseViewRepo.GetTopViewedCategories(ctx, 10)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTopViewedCategories] Failed to get top viewed categories")
		return nil, fmt.Errorf("failed to get top viewed categories: %w", err)
	}

	logger.InfoCtx(ctx).
		Int("category_count", len(categories)).
		Msg("[GetTopViewedCategories] Successfully retrieved top viewed categories")

	return categories, nil
}
