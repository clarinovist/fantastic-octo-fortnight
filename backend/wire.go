//go:build wireinject
// +build wireinject

package main

import (
	"github.com/google/wire"
	"googlemaps.github.io/maps"

	xendit "github.com/xendit/xendit-go/v7"

	"github.com/lesprivate/backend/config"
	xenditext "github.com/lesprivate/backend/external/xendit"
	"github.com/lesprivate/backend/infras"
	v1 "github.com/lesprivate/backend/internal/handlers/v1"
	adminV1 "github.com/lesprivate/backend/internal/handlers/v1/admin"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/email"
	"github.com/lesprivate/backend/shared/google"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/transport/http"
)

var persistence = wire.NewSet(
	infras.NewMySQL,
	infras.NewRedis,
	infras.NewLinode,
)

var handlers = wire.NewSet(
	v1.NewApi,
	adminV1.NewApi,
)

var external = wire.NewSet(
	xenditext.NewClient,
)

var svc = wire.NewSet(
	services.NewCourseService,
	services.NewCourseDraftService,
	services.NewLocationService,
	services.NewCourseCategoryService,
	services.NewSubCourseCategoryService,
	services.NewLookupService,
	services.NewUserService,
	services.NewProfileService,
	services.NewFileService,
	services.NewTutorDocumentService,
	services.NewStudentBookingService,
	services.NewTutorBookingService,
	services.NewBookingService,
	services.NewNotificationService,
	services.NewStudentReviewService,
	services.NewTutorReviewService,
	services.NewCourseViewService,
	services.NewStudentSubscriptionService,
	services.NewSubscriptionPriceService,
	services.NewWebhookService,
	services.NewStudentService,
	services.NewTutorService,
	services.NewDashboardService,
	email.NewEmailService,
	google.NewGoogleOAuthService,
	provideJWT,
	provideXendit,
)

var repo = wire.NewSet(
	repositories.NewCourseRepository,
	repositories.NewCourseDraftRepository,
	repositories.NewLocationRepository,
	repositories.NewCourseCategoryRepository,
	repositories.NewSubCourseCategoryRepository,
	repositories.NewTutorRepository,
	repositories.NewStudentRepository,
	repositories.NewLookupRepository,
	repositories.NewUserRepository,
	repositories.NewRoleRepository,
	repositories.NewTutorDocumentRepository,
	repositories.NewBookingRepository,
	repositories.NewReportBookingRepository,
	repositories.NewNotificationRepository,
	repositories.NewReviewRepository,
	repositories.NewSubscriptionRepository,
	repositories.NewSubscriptionPriceRepository,
	repositories.NewPaymentRepository,
	repositories.NewCourseViewRepository,
)

// provideJWT creates a JWT service from config
func provideJWT(cfg *config.Config) *jwt.JWT {
	return jwt.NewJWT(cfg.JWT.Key, cfg.JWT.ExpiresIn, cfg.JWT.RefreshExpiresIn)
}

func provideXendit(cfg *config.Config) *xendit.APIClient {
	return xendit.NewClient(cfg.Xendit.SecretKey)
}

func InitializeHTTP(*config.Config, *maps.Client) *http.HTTP {
	wire.Build(
		persistence,
		external,
		repo,
		svc,
		handlers,
		http.New,
	)
	return &http.HTTP{}
}
