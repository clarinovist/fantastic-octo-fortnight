package admin

import (
	"net/http"
	"time"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetDashboardStatisticUser
// @Summary Get dashboard statistics
// @Description get dashboard statistics including total users, users created per day, and subscriptions per day
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Param startDate query string false "Start date (YYYY-MM-DD)"
// @Param endDate query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} dto.DashboardStatisticsResponse
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-user [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("startDate", startDateStr).Msg("[GetDashboardStatisticUser] Invalid start date format")
			response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid start date format. Use YYYY-MM-DD"))
			return
		}
	} else {
		startDate = time.Now().AddDate(0, 0, -7)
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("endDate", endDateStr).Msg("[GetDashboardStatisticUser] Invalid end date format")
			response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid end date format. Use YYYY-MM-DD"))
			return
		}
	} else {
		endDate = time.Now()
	}

	if startDate.After(endDate) {
		logger.ErrorCtx(ctx).Str("startDate", startDateStr).Str("endDate", endDateStr).Msg("[GetDashboardStatisticUser] Start date is after end date")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Start date must be before or equal to end date"))
		return
	}

	statistics, err := a.dashboard.GetStatisticUser(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticUser] Failed to get dashboard statistics")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get dashboard statistics"))
		return
	}

	tutorsCreatedPerDay := make([]dto.UserCreatedPerDayResponse, len(statistics.TutorsCreatedPerDay))
	for i, tutorCreated := range statistics.TutorsCreatedPerDay {
		tutorsCreatedPerDay[i] = dto.UserCreatedPerDayResponse{
			Date:  tutorCreated.Date,
			Count: tutorCreated.Count,
		}
	}

	studentsCreatedPerDay := make([]dto.UserCreatedPerDayResponse, len(statistics.StudentsCreatedPerDay))
	for i, studentCreated := range statistics.StudentsCreatedPerDay {
		studentsCreatedPerDay[i] = dto.UserCreatedPerDayResponse{
			Date:  studentCreated.Date,
			Count: studentCreated.Count,
		}
	}

	subscriptionsPerDay := make([]dto.SubscriptionPerDayResponse, len(statistics.SubscriptionsPerDay))
	for i, subscription := range statistics.SubscriptionsPerDay {
		subscriptionsPerDay[i] = dto.SubscriptionPerDayResponse{
			Date:  subscription.Date,
			Count: subscription.Count,
		}
	}

	responseData := dto.DashboardStatisticsResponse{
		TotalTutors:           statistics.TotalTutors,
		TotalStudents:         statistics.TotalStudents,
		TotalPremiumStudents:  statistics.TotalPremiumStudents,
		TutorsCreatedPerDay:   tutorsCreatedPerDay,
		StudentsCreatedPerDay: studentsCreatedPerDay,
		SubscriptionsPerDay:   subscriptionsPerDay,
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticSubscription
// @Summary Get subscription statistics
// @Description get subscription statistics including total amount and amount per day
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Param startDate query string false "Start date (YYYY-MM-DD)"
// @Param endDate query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} dto.SubscriptionStatisticsResponse
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-subscription [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticSubscription(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("startDate", startDateStr).Msg("[GetDashboardStatisticSubscription] Invalid start date format")
			response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid start date format. Use YYYY-MM-DD"))
			return
		}
	} else {
		startDate = time.Now().AddDate(0, 0, -7)
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("endDate", endDateStr).Msg("[GetDashboardStatisticSubscription] Invalid end date format")
			response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid end date format. Use YYYY-MM-DD"))
			return
		}
	} else {
		endDate = time.Now()
	}

	if startDate.After(endDate) {
		logger.ErrorCtx(ctx).Str("startDate", startDateStr).Str("endDate", endDateStr).Msg("[GetDashboardStatisticSubscription] Start date is after end date")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Start date must be before or equal to end date"))
		return
	}

	statistics, err := a.dashboard.GetStatisticSubscription(ctx, startDate, endDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticSubscription] Failed to get subscription statistics")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get subscription statistics"))
		return
	}

	amountPerDay := make([]dto.SubscriptionAmountPerDay, len(statistics.AmountPerDay))
	for i, amount := range statistics.AmountPerDay {
		amountPerDay[i] = dto.SubscriptionAmountPerDay{
			Date:   amount.Date,
			Amount: amount.Amount,
		}
	}

	responseData := dto.SubscriptionStatisticsResponse{
		TotalAmount:  statistics.TotalAmount,
		AmountPerDay: amountPerDay,
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticTutor
// @Summary Get top 10 most booked tutors
// @Description get top 10 tutors with the most bookings
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.TutorBookingStatisticResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-tutor [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticTutor(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	tutors, err := a.dashboard.GetTopBookedTutors(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticTutor] Failed to get top booked tutors")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get top booked tutors"))
		return
	}

	responseData := make([]dto.TutorBookingStatisticResponse, len(tutors))
	for i, tutor := range tutors {
		responseData[i] = dto.TutorBookingStatisticResponse{
			TutorID:      tutor.TutorID,
			TutorName:    tutor.TutorName,
			PhotoProfile: tutor.PhotoProfile,
			BookingCount: tutor.BookingCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticStudent
// @Summary Get top 10 most booked students
// @Description get top 10 students with the most bookings
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.StudentBookingStatisticResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-student [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticStudent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	students, err := a.dashboard.GetTopBookedStudents(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticStudent] Failed to get top booked students")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get top booked students"))
		return
	}

	responseData := make([]dto.StudentBookingStatisticResponse, len(students))
	for i, student := range students {
		responseData[i] = dto.StudentBookingStatisticResponse{
			StudentID:    student.StudentID,
			StudentName:  student.StudentName,
			PhotoProfile: student.PhotoProfile,
			BookingCount: student.BookingCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticCategory
// @Summary Get top 10 most booked categories
// @Description get top 10 categories with the most bookings
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.CategoryBookingStatisticResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-category [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticCategory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	categories, err := a.dashboard.GetTopBookedCategories(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticCategory] Failed to get top booked categories")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get top booked categories"))
		return
	}

	responseData := make([]dto.CategoryBookingStatisticResponse, len(categories))
	for i, category := range categories {
		responseData[i] = dto.CategoryBookingStatisticResponse{
			CategoryID:   category.CategoryID,
			CategoryName: category.CategoryName,
			BookingCount: category.BookingCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticCourse
// @Summary Get course statistics grouped by category
// @Description get total courses grouped by course category
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.CourseStatisticByCategoryResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-course [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	statistics, err := a.dashboard.GetCourseStatisticsByCategory(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticCourse] Failed to get course statistics by category")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get course statistics by category"))
		return
	}

	responseData := make([]dto.CourseStatisticByCategoryResponse, len(statistics))
	for i, statistic := range statistics {
		responseData[i] = dto.CourseStatisticByCategoryResponse{
			CategoryID:   statistic.CategoryID,
			CategoryName: statistic.CategoryName,
			CourseCount:  statistic.CourseCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticTutorView
// @Summary Get top 10 most viewed tutors
// @Description get top 10 tutors with the most course views
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.TutorViewStatisticResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-tutor-view [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticTutorView(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	tutors, err := a.dashboard.GetTopViewedTutors(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticTutorView] Failed to get top viewed tutors")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get top viewed tutors"))
		return
	}

	responseData := make([]dto.TutorViewStatisticResponse, len(tutors))
	for i, tutor := range tutors {
		responseData[i] = dto.TutorViewStatisticResponse{
			TutorID:      tutor.TutorID,
			TutorName:    tutor.TutorName,
			PhotoProfile: tutor.PhotoProfile,
			ViewCount:    tutor.ViewCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}

// GetDashboardStatisticCategoryView
// @Summary Get top 10 most viewed categories
// @Description get top 10 categories with the most course views
// @Tags admin-dashboard
// @Accept json
// @Produce json
// @Success 200 {array} dto.CategoryViewStatisticResponse
// @Failure 500 {object} base.Base
// @Router /v1/admin/dashboard/statistic-category-view [get]
// @Security BearerAuth
func (a *Api) GetDashboardStatisticCategoryView(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	categories, err := a.dashboard.GetTopViewedCategories(ctx)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetDashboardStatisticCategoryView] Failed to get top viewed categories")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Failed to get top viewed categories"))
		return
	}

	responseData := make([]dto.CategoryViewStatisticResponse, len(categories))
	for i, category := range categories {
		responseData[i] = dto.CategoryViewStatisticResponse{
			CategoryID:   category.CategoryID,
			CategoryName: category.CategoryName,
			ViewCount:    category.ViewCount,
		}
	}

	response.Success(w, http.StatusOK, responseData)
}
