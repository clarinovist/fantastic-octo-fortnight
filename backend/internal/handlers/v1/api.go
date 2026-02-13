package v1

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/handlers/v1/admin"
	"github.com/lesprivate/backend/internal/handlers/v1/mentor"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/transport/http/middleware"

	"github.com/lesprivate/backend/transport/http/response"
)

var decoder = shared.Decoder

type Api struct {
	config              *config.Config
	course              *services.CourseService
	courseCategory      *services.CourseCategoryService
	subCourseCategory   *services.SubCourseCategoryService
	location            *services.LocationService
	lookup              *services.LookupService
	user                *services.UserService
	profile             services.ProfileService
	file                *services.FileService
	tutorDocument       *services.TutorDocumentService
	studentBooking      *services.StudentBookingService
	studentReview       *services.StudentReviewService
	tutorBooking        *services.TutorBookingService
	tutorReview         *services.TutorReviewService
	courseView          *services.CourseViewService
	booking             *services.BookingService
	notification        *services.NotificationService
	studentSubscription *services.StudentSubscriptionService
	webhook             *services.WebhookService
	jwt                 *jwt.JWT
	admin               *admin.Api
	mentor              *mentor.MentorHandler
	courseRepo          *repositories.CourseRepository
	userRepo            *repositories.UserRepository
	roleRepo            *repositories.RoleRepository
}

func NewApi(
	config *config.Config,
	course *services.CourseService,
	courseCategory *services.CourseCategoryService,
	subCourseCategory *services.SubCourseCategoryService,
	location *services.LocationService,
	lookup *services.LookupService,
	user *services.UserService,
	profile services.ProfileService,
	file *services.FileService,
	tutorDocument *services.TutorDocumentService,
	studentBooking *services.StudentBookingService,
	studentReview *services.StudentReviewService,
	tutorBooking *services.TutorBookingService,
	tutorReview *services.TutorReviewService,
	courseView *services.CourseViewService,
	booking *services.BookingService,
	notification *services.NotificationService,
	studentSubscription *services.StudentSubscriptionService,
	webhook *services.WebhookService,
	courseRepo *repositories.CourseRepository,
	userRepo *repositories.UserRepository,
	roleRepo *repositories.RoleRepository,
	adminAPI *admin.Api,
	mentorHandler *mentor.MentorHandler,
	jwt *jwt.JWT,
) *Api {
	return &Api{
		config:              config,
		course:              course,
		courseCategory:      courseCategory,
		subCourseCategory:   subCourseCategory,
		location:            location,
		lookup:              lookup,
		user:                user,
		profile:             profile,
		file:                file,
		tutorDocument:       tutorDocument,
		studentBooking:      studentBooking,
		studentReview:       studentReview,
		tutorBooking:        tutorBooking,
		tutorReview:         tutorReview,
		courseView:          courseView,
		booking:             booking,
		notification:        notification,
		studentSubscription: studentSubscription,
		webhook:             webhook,
		jwt:                 jwt,
		admin:               adminAPI,
		mentor:              mentorHandler,
		courseRepo:          courseRepo,
		userRepo:            userRepo,
		roleRepo:            roleRepo,
	}
}

func (a *Api) Router(r chi.Router) {
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		response.Success(w, http.StatusOK, "success")
	})

	r.Route("/webhook", func(r chi.Router) {
		r.Post("/xendit", a.WebhookXendit)
	})

	r.Route("/internal", func(r chi.Router) {
		r.Route("/booking", func(r chi.Router) {
			r.Post("/expired", a.ExpiredBooking)
			r.Post("/reminder-expired", a.ReminderExpiredBooking)
			r.Post("/reminder-course", a.ReminderCourseBooking)
			r.Post("/review", a.CreateReviewBooking)
		})
		r.Delete("/notifications/retention", a.RetentionNotification)
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", a.Register)
		r.Post("/login", a.Login)
		r.Post("/refresh", a.RefreshToken)
		r.Post("/verify-email", a.VerifyEmail)
		r.Post("/resend-verification", a.ResendVerification)
		r.Post("/google", a.GoogleLogin)
		r.Post("/check-user", a.CheckUser)
		r.Post("/forgot-password", a.ForgotPassword)
		r.Post("/reset-password", a.ResetPassword)
	})

	r.Route("/courses", func(r chi.Router) {
		r.Use(middleware.JWTClaim(a.jwt))
		r.Get("/", a.GetCourses)
		r.Get("/{id}", a.GetDetailCourse)
		r.Get("/{id}/related", a.GetRelatedCourse)
		r.Get("/{id}/booking", a.GetBookingCourse)
	})

	r.Route("/notifications", func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))
		r.Get("/", a.GetNotifications)
		r.Put("/{id}/dismiss", a.DismissNotification)
		r.Put("/{id}/read", a.ReadNotification)
		r.Delete("/{id}", a.DeleteNotification)
	})

	r.Route("/tutors", func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))

		r.Route("/courses", func(r chi.Router) {
			r.Get("/", a.ListTutorCourses)
			r.Post("/", a.CreateTutorCourse)
			r.Get("/{id}", a.GetTutorCourse)
			r.Put("/{id}", a.UpdateTutorCourse)
			r.Post("/{id}/submit", a.SubmitTutorCourse)
			r.Put("/{id}/publish", a.PublishTutorCourse)
			r.Delete("/{id}", a.DeleteTutorCourse)
		})

		r.Route("/documents", func(r chi.Router) {
			r.Get("/", a.ListTutorDocument)
			r.Post("/", a.CreateTutorDocument)
			r.Delete("/{id}", a.DeleteTutorDocument)
		})

		r.Route("/booking", func(r chi.Router) {
			r.Get("/", a.ListTutorBooking)
			r.Get("/{id}", a.GetTutorBooking)
			r.Put("/{id}/approve", a.ApproveTutorBooking)
			r.Put("/{id}/decline", a.DeclineTutorBooking)
		})

		r.Route("/reviews", func(r chi.Router) {
			r.Get("/", a.ListTutorReview)
			r.Put("/{id}", a.UpdateTutorReview)
		})
	})

	r.Get("/students/subscriptions/prices", a.GetPricesStudentSubscription)
	r.Route("/students", func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))
		// TODO: add middleware to validate role student

		r.Route("/booking", func(r chi.Router) {
			r.Post("/", a.CreateStudentBooking)
			r.Get("/", a.ListStudentBooking)
			r.Get("/{id}", a.GetStudentBooking)
			r.Post("/{id}/report", a.ReportStudentBooking)
		})

		r.Route("/reviews", func(r chi.Router) {
			r.Get("/", a.ListStudentReview)
			r.Put("/{id}", a.UpdateStudentReview)
		})

		r.Route("/subscriptions", func(r chi.Router) {
			r.Get("/", a.GetStudentSubscription)
			r.Post("/", a.CreateStudentSubscription)
			r.Post("/{id}/cancel", a.CancelStudentSubscription)
			r.Post("/{id}/invoice", a.CreateInvoiceStudentSubscription)
		})
	})

	r.Get("/locations", a.GetLocations)

	r.Route("/course-categories", func(r chi.Router) {
		r.Get("/", a.GetCourseCategories)
		r.Get("/trending", a.GetTrendingCourseCategories)
		r.Get("/{courseCategoryId}/sub", a.GetSubCourseCategories)
	})

	r.Get("/lookups", a.GetLookups)

	// Admin routes for draft management with admin role validation
	r.Route("/admin", a.admin.Router)

	// File upload routes with JWT authentication
	r.Route("/files", func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))
		r.Post("/upload", a.UploadFile)
	})

	// Protected routes that require JWT authentication
	r.Group(func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))
		r.Get("/me", a.GetProfile)
		r.Put("/profile", a.UpdateProfile)
		r.Put("/profile/location", a.UpdateProfileLocation)
		r.Put("/profile/location", a.UpdateProfileLocation)
		r.Put("/profile/password", a.ChangePassword)
	})

	// Mentor routes
	r.Route("/mentor", func(r chi.Router) {
		r.Use(middleware.JWTAuth(a.jwt))
		a.mentor.Router(r)
	})
}
