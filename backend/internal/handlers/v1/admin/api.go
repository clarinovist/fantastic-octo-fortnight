package admin

import (
	"github.com/go-chi/chi/v5"

	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/transport/http/middleware"
)

var decoder = shared.Decoder

type Api struct {
	course             *services.CourseService
	student            *services.StudentService
	tutor              *services.TutorService
	tutorDocument      *services.TutorDocumentService
	studentReview      *services.StudentReviewService
	tutorReview        *services.TutorReviewService
	notification       *services.NotificationService
	booking            *services.BookingService
	subscriptionPrice  *services.SubscriptionPriceService
	dashboard          *services.DashboardService
	mentorBalanceAdmin *services.MentorBalanceAdminService
	jwt                *jwt.JWT
	userRepo           *repositories.UserRepository
	roleRepo           *repositories.RoleRepository
}

func NewApi(
	course *services.CourseService,
	student *services.StudentService,
	tutor *services.TutorService,
	tutorDocument *services.TutorDocumentService,
	studentReview *services.StudentReviewService,
	tutorReview *services.TutorReviewService,
	notification *services.NotificationService,
	booking *services.BookingService,
	subscriptionPrice *services.SubscriptionPriceService,
	dashboard *services.DashboardService,
	mentorBalanceAdmin *services.MentorBalanceAdminService,
	jwt *jwt.JWT,
	userRepo *repositories.UserRepository,
	roleRepo *repositories.RoleRepository,
) *Api {
	return &Api{
		course:             course,
		student:            student,
		tutor:              tutor,
		tutorDocument:      tutorDocument,
		studentReview:      studentReview,
		tutorReview:        tutorReview,
		notification:       notification,
		booking:            booking,
		subscriptionPrice:  subscriptionPrice,
		dashboard:          dashboard,
		mentorBalanceAdmin: mentorBalanceAdmin,
		jwt:                jwt,
		userRepo:           userRepo,
		roleRepo:           roleRepo,
	}
}

func (a *Api) Router(r chi.Router) {
	r.Use(middleware.JWTAuth(a.jwt))
	r.Use(middleware.RequireAdminRole(a.userRepo, a.roleRepo))

	r.Route("/courses", func(r chi.Router) {
		r.Get("/", a.GetCourses)
		r.Post("/", a.CreateCourse)
		r.Get("/{id}", a.GetCourseDetail)
		r.Put("/{id}", a.UpdateCourse)
		r.Delete("/{id}", a.DeleteCourse)
		r.Post("/{id}/approve", a.ApproveCourse)
		r.Post("/{id}/reject", a.RejectCourse)
	})

	r.Route("/notifications", func(r chi.Router) {
		r.Post("/", a.CreateNotification)
	})

	r.Route("/students", func(r chi.Router) {
		r.Get("/", a.GetStudents)
		r.Get("/{id}", a.GetDetailStudent)
		r.Post("/", a.CreateStudent)
		r.Put("/{id}", a.UpdateStudent)
		r.Delete("/", a.DeleteStudent)
		r.Post("/{id}/change-role", a.ChangeRoleStudent)
		r.Put("/{id}/status", a.UpdateStudentStatus)
		r.Put("/{id}/premium", a.UpdateStudentPremium)
	})

	r.Route("/tutors", func(r chi.Router) {
		r.Get("/", a.GetTutors)
		r.Get("/{id}", a.GetDetailTutor)
		r.Post("/", a.CreateTutor)
		r.Put("/{id}", a.UpdateTutor)
		r.Delete("/", a.DeleteTutor)
		r.Post("/{id}/change-role", a.ChangeRoleTutor)
		r.Put("/{id}/status", a.UpdateTutorStatus)

		r.Route("/{tutorId}/documents", func(r chi.Router) {
			r.Post("/", a.CreateTutorDocument)
			r.Get("/", a.GetTutorDocuments)
			r.Put("/{id}/{status}", a.UpdateTutorDocumentStatus)
		})

		r.Get("/{tutorId}/courses", a.GetTutorCourses)
	})

	r.Route("/student-reviews", func(r chi.Router) {
		r.Put("/{id}", a.UpdateStudentReview)
		r.Delete("/{id}", a.DeleteStudentReview)
	})

	r.Route("/tutor-reviews", func(r chi.Router) {
		r.Put("/{id}", a.UpdateTutorReview)
		r.Delete("/{id}", a.DeleteTutorReview)
	})

	r.Route("/bookings", func(r chi.Router) {
		r.Get("/", a.GetBookings)
		r.Post("/", a.CreateBooking)
		r.Get("/{id}", a.GetBookingDetail)
		r.Put("/{id}", a.UpdateBooking)
		r.Post("/{id}/reminder-student", a.SendReminderToStudent)
		r.Post("/{id}/reminder-tutor", a.SendReminderToTutor)
	})

	r.Route("/subscription-prices", func(r chi.Router) {
		r.Get("/", a.GetSubscriptionPrices)
		r.Put("/{id}", a.UpdateSubscriptionPrice)
	})

	r.Route("/dashboard", func(r chi.Router) {
		r.Get("/statistic-user", a.GetDashboardStatisticUser)
		r.Get("/statistic-subscription", a.GetDashboardStatisticSubscription)
		r.Get("/statistic-tutor", a.GetDashboardStatisticTutor)
		r.Get("/statistic-student", a.GetDashboardStatisticStudent)
		r.Get("/statistic-category", a.GetDashboardStatisticCategory)
		r.Get("/statistic-course", a.GetDashboardStatisticCourse)
		r.Get("/statistic-tutor-view", a.GetDashboardStatisticTutorView)
		r.Get("/statistic-category-view", a.GetDashboardStatisticCategoryView)
	})

	r.Route("/withdrawals", func(r chi.Router) {
		r.Get("/", a.ListWithdrawals)
		r.Post("/{id}/approve", a.ApproveWithdrawal)
		r.Post("/{id}/reject", a.RejectWithdrawal)
	})

	r.Route("/transactions", func(r chi.Router) {
		r.Get("/", a.GetTransactions)
		r.Get("/stats", a.GetTransactionStats)
	})
}
