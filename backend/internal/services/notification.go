package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"html/template"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/email"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type NotificationService struct {
	config        *config.Config
	notification  *repositories.NotificationRepository
	tutor         *repositories.TutorRepository
	student       *repositories.StudentRepository
	user          *repositories.UserRepository
	courseService *CourseService
	email         email.EmailService
	redis         *infras.Redis
}

func NewNotificationService(
	config *config.Config,
	notification *repositories.NotificationRepository,
	tutor *repositories.TutorRepository,
	student *repositories.StudentRepository,
	user *repositories.UserRepository,
	courseService *CourseService,
	email email.EmailService,
	redis *infras.Redis,
) *NotificationService {
	return &NotificationService{
		config:        config,
		notification:  notification,
		tutor:         tutor,
		student:       student,
		user:          user,
		courseService: courseService,
		email:         email,
		redis:         redis,
	}
}

func (s *NotificationService) GetNotification(ctx context.Context, request dto.GetNotificationsRequest) ([]model.Notification, model.Metadata, error) {
	userID := middleware.GetUserID(ctx)
	notifications, metadata, err := s.notification.Get(ctx, model.NotificationFilter{
		Pagination: model.Pagination{
			Page:     request.Page,
			PageSize: request.PageSize,
		},
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
		UserID:      userID,
		IsDismissed: request.IsDismissed,
		IsRead:      request.IsRead,
		IsDeleted:   request.IsDeleted,
	})

	return notifications, metadata, err
}

func (s *NotificationService) DismissNotification(ctx context.Context, id uuid.UUID) error {
	userID := middleware.GetUserID(ctx)
	notification, err := s.notification.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DismissNotification] Error getting notification by ID")
		return err
	}

	if notification == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DismissNotification] Notification not found")
		return err
	}

	if notification.UserID != userID {
		logger.ErrorCtx(ctx).Err(err).Msg("[DismissNotification] Notification does not belong to user")
		return err
	}

	notification.IsDismissed = true
	notification.UpdatedAt = time.Now()
	notification.UpdatedBy = middleware.GetUserID(ctx)

	err = s.notification.Update(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DismissNotification] Error updating notification")
		return err
	}

	return nil
}

func (s *NotificationService) ReadNotification(ctx context.Context, id uuid.UUID) error {
	userID := middleware.GetUserID(ctx)
	notification, err := s.notification.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReadNotification] Error getting notification by ID")
		return err
	}

	if notification == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReadNotification] Notification not found")
		return err
	}

	if notification.UserID != userID {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReadNotification] Notification does not belong to user")
		return err
	}

	notification.IsRead = true
	notification.UpdatedAt = time.Now()
	notification.UpdatedBy = middleware.GetUserID(ctx)

	err = s.notification.Update(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReadNotification] Error updating notification")
		return err
	}

	return nil
}

func (s *NotificationService) DeleteNotification(ctx context.Context, id uuid.UUID) error {
	userID := middleware.GetUserID(ctx)
	notification, err := s.notification.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteNotification] Error getting notification by ID")
		return err
	}

	if notification == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteNotification] Notification not found")
		return err
	}

	if notification.UserID != userID {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteNotification] Notification does not belong to user")
		return err
	}

	notification.DeletedAt = null.TimeFrom(time.Now())
	notification.DeletedBy = uuid.NullUUID{
		Valid: true,
		UUID:  middleware.GetUserID(ctx),
	}

	err = s.notification.Update(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteNotification] Error updating notification")
		return err
	}

	return nil
}

func (s *NotificationService) RetentionNotification(ctx context.Context) error {
	duration := s.config.Notification.RetentionDuration
	notifications, _, err := s.notification.Get(ctx, model.NotificationFilter{
		IsDeleted:       null.BoolFrom(true),
		CreatedAtBefore: null.TimeFrom(time.Now().Add(-duration)),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RetentionNotification] Error getting notification by ID")
		return err
	}

	if len(notifications) == 0 {
		return nil
	}

	err = s.notification.BulkDelete(ctx, notifications)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RetentionNotification] Error updating notification")
		return err
	}

	return nil
}

func (s *NotificationService) StudentBookingCourse(
	ctx context.Context,
	booking model.Booking,
	location model.Location,
) error {
	tutor, err := s.tutor.GetByID(ctx, booking.TutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error getting tutor by ID")
		return err
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Tutor not found")
		return err
	}

	student, err := s.student.GetByID(ctx, booking.StudentID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error getting tutor by ID")
		return err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Student not found")
		return err
	}

	err = s.email.SendBookingCourseStudentEmail(context.Background(), student.User, tutor.User, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error sending booking request email for student")
	}

	err = s.email.SendBookingCourseTutorEmail(context.Background(), student.User, tutor.User, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error sending booking request email for tutor")
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())

	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       student.UserID,
		Type:         model.NotificationTypeInfo,
		Title:        "Booking request",
		Message:      fmt.Sprintf("Kamu telah berhasil membuat permintaan les untuk %s. Tunggu konfirmasi dari tutor ya.", booking.Course.Title),
		Link:         link,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    student.UserID,
		UpdatedBy:    student.UserID,
	}

	if err := s.notification.Create(ctx, notification); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error creating notification for student")
	}

	notification = &model.Notification{
		ID:           uuid.New(),
		UserID:       tutor.UserID,
		Type:         model.NotificationTypeWarning,
		Title:        "Booking request",
		Message:      fmt.Sprintf("Ada permintaan les baru untuk %s. Segera respon dalam 6 jam agar booking tidak hangus.", booking.Course.Title),
		Link:         link,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    student.UserID,
		UpdatedBy:    student.UserID,
	}

	if err := s.notification.Create(ctx, notification); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error creating notification for tutor")
	}

	return nil
}

func (s *NotificationService) TutorChangeStatusBooking(ctx context.Context, booking model.Booking, location model.Location) error {
	err := s.email.SendUpdateStatusBookingTutorEmail(ctx, booking.Student.User, booking.Tutor.User, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendEmailWhenUpdatStatusBooking] Error sending email tutor")
	}

	err = s.email.SendUpdateStatusBookingStudentEmail(ctx, booking.Student.User, booking.Tutor.User, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendEmailWhenUpdatStatusBooking] Error sending email student")
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())
	var (
		title   string
		message string
	)

	switch booking.Status {
	case model.BookingStatusAccepted:
		title = "Booking Accepted"
		message = fmt.Sprintf("Selamat! Permintaan les kamu untuk %s telah diterima oleh tutor. Siapkan diri kamu untuk belajar!", booking.Course.Title)
	case model.BookingStatusDeclined:
		title = "Booking Declined"
		message = fmt.Sprintf("Maaf, tutor tidak menolak permintaan les kamu. Silahkan bisa cari tutor lain atau booking diwaktu yang lain. ")
	}

	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       booking.Student.UserID,
		Type:         model.NotificationTypeInfo,
		Title:        title,
		Message:      message,
		Link:         link,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    booking.Tutor.UserID,
		UpdatedBy:    booking.Tutor.UserID,
	}

	if err := s.notification.Create(ctx, notification); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendEmailWhenUpdatStatusBooking] Error creating notification for student")
	}

	return nil
}

func (s *NotificationService) RegisterUser(ctx context.Context, user model.User, role model.Role) error {
	// Generate verification token and link
	token, verificationLink, err := s.generateVerificationToken(ctx, user.ID, user.Email)
	if err != nil {
		logger.ErrorCtx(ctx).
			Err(err).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Msg("failed to generate verification token")
		return err
	}

	// Send verification email
	if err = s.email.SendVerificationEmail(ctx, user.Email, verificationLink); err != nil {
		logger.ErrorCtx(ctx).
			Err(err).
			Str("userID", user.ID.String()).
			Str("email", user.Email).
			Str("token", token).
			Msg("failed to send verification email")
	}

	if role.Name == model.RoleNameTutor {
		s.TutorNotificationUpdateProfile(ctx, user)
	}

	return nil
}

func (s *NotificationService) TutorNotificationUpdateProfile(ctx context.Context, user model.User) {
	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       user.ID,
		Type:         model.NotificationTypeWarning,
		Title:        model.NotificationTitleTutorProfile,
		Message:      "Profil kamu belum lengkap! Lengkapi data diri dan dokumen pendukung agar bisa membuat course.",
		Link:         s.config.Frontend.BaseURL + s.config.Frontend.Account,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    user.ID,
		UpdatedBy:    user.ID,
	}

	err := s.notification.Create(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RegisterUser] Error creating notification for tutor")
	}
}

func (s *NotificationService) RemoveTutorProfile(ctx context.Context, user model.User) error {
	notifications, _, err := s.notification.Get(ctx, model.NotificationFilter{
		UserID:    user.ID,
		Title:     model.NotificationTitleTutorProfile,
		IsDeleted: null.BoolFrom(false),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RemoveTutorProfile] Error getting notification by ID")
		return err
	}

	if len(notifications) == 0 {
		return nil
	}

	notification := notifications[0]
	notification.IsDeleteable = true
	notification.DeletedAt = null.TimeFrom(time.Now())
	notification.DeletedBy = uuid.NullUUID{
		UUID:  user.ID,
		Valid: true,
	}

	err = s.notification.Update(ctx, &notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[RemoveTutorProfile] Error updating notification")
		return err
	}

	return nil
}

func (s *NotificationService) generateVerificationToken(ctx context.Context, userID uuid.UUID, email string) (string, string, error) {
	// Generate a random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	// Create Redis key for verification token
	key := model.BuildCacheKey(model.EmailVerificationKey, token)

	// Store user data in Redis with 24-hour expiration
	userData := fmt.Sprintf("%s:%s", userID.String(), email)
	if err := s.redis.Client.Set(ctx, key, userData, 24*time.Hour).Err(); err != nil {
		return "", "", fmt.Errorf("failed to store verification token in Redis: %w", err)
	}

	verificationLink := fmt.Sprintf("%s%s?token=%s", s.config.Frontend.BaseURL, s.config.Frontend.VerifyEmailPath, token)

	return token, verificationLink, nil
}

func (s *NotificationService) ReminderExpiredBooking(ctx context.Context, notifications []model.Notification, bookings []model.Booking) error {
	for _, booking := range bookings {
		go func() {
			var err error
			location := model.Location{FullName: string(model.OnlineClassType)}
			if booking.ClassType == model.OfflineClassType {
				location, err = s.courseService.GetLocationByLatLong(ctx, booking.Latitude, booking.Longitude)
				if err != nil {
					logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error getting location by ID")
					location = model.Location{FullName: string(model.OfflineClassType)}
				}
			}

			s.email.SendReminderExpiredBookingTutorEmail(context.Background(), booking, location)
		}()
	}

	err := s.notification.BulkCreate(ctx, notifications)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error creating notifications")
	}

	return nil
}

func (s *NotificationService) ReminderCourseBookingForStudent(ctx context.Context, notifications []model.Notification, bookings []model.Booking) error {
	for _, booking := range bookings {
		go func(b model.Booking) {
			err := s.SendReminderBookingToStudent(ctx, b)
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[SendReminderToStudent] Error sending reminder email")
				return
			}
		}(booking)
	}

	err := s.notification.BulkCreate(ctx, notifications)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error creating notifications")
	}

	return nil
}

func (s *NotificationService) CreateReviewBooking(ctx context.Context, bookings []model.Booking) error {
	notifications := []model.Notification{}
	for _, booking := range bookings {
		go func() {
			location := model.Location{FullName: string(model.OnlineClassType)}
			if booking.ClassType == model.OfflineClassType {
				var e error
				location, e = s.courseService.GetLocationByLatLong(ctx, booking.Latitude, booking.Longitude)
				if e != nil {
					logger.ErrorCtx(ctx).Err(e).Msg("[CreateReviewBooking] Error getting location by ID")
					location = model.Location{FullName: string(model.OfflineClassType)}
				}
			}

			err := s.email.SendReviewBookingTutor(ctx, booking, location)
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error sending email")
			}

			err = s.email.SendReviewBookingStudent(ctx, booking, location)
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error sending email")
			}
		}()

		// student
		notifications = append(notifications, model.Notification{
			ID:           uuid.New(),
			UserID:       booking.Student.UserID,
			Type:         model.NotificationTypeInfo,
			Title:        "Review Booking",
			Message:      fmt.Sprintf("Les kamu dengan %s sudah selesai! Yuk, beri ulasan agar tutor bisa terus berkembang!", booking.Tutor.User.Name),
			Link:         s.config.Frontend.BaseURL + s.config.Frontend.Account,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    uuid.MustParse(model.SystemID),
			UpdatedBy:    uuid.MustParse(model.SystemID),
		})

		// tutor
		notifications = append(notifications, model.Notification{
			ID:           uuid.New(),
			UserID:       booking.Tutor.UserID,
			Type:         model.NotificationTypeInfo,
			Title:        "Review Booking",
			Message:      fmt.Sprintf("Sesi les selesai! Yuk, beri ulasan untuk [nama siswa] agar pengalaman mengajar makin baik!", booking.Student.User.Name),
			Link:         s.config.Frontend.BaseURL + s.config.Frontend.Account,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    uuid.MustParse(model.SystemID),
			UpdatedBy:    uuid.MustParse(model.SystemID),
		})
	}

	return nil
}

func (s *NotificationService) SubmitReviewTutor(ctx context.Context, review model.TutorReview) error {
	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       review.Tutor.UserID,
		Type:         model.NotificationTypeInfo,
		Title:        "Review from Student",
		Message:      fmt.Sprintf("Kamu mendapat ulasan baru dari %s! Yuk, cek sekarang", review.Student.User.Name),
		Link:         s.config.Frontend.BaseURL + s.config.Frontend.Account,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID),
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	err := s.notification.Create(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[SubmitReviewTutor] Error creating notification")
	}

	err = s.email.SendSubmitReviewTutor(ctx, review)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[SubmitReviewTutor] Error sending email")
	}

	return nil
}

func (s *NotificationService) PaymentCreated(ctx context.Context, student model.Student, payment model.Payment) error {
	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       student.UserID,
		Type:         model.NotificationTypeInfo,
		Title:        "Menunggu Pembayaran User Premium",
		Message:      "Menunggu Pembayaran User Premium",
		Link:         payment.URL,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID),
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	err := s.notification.Create(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[PaymentCreated] Error creating notification")
	}

	err = s.email.SendPaymentCreatedEmail(ctx, student, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[SubmitReviewTutor] Error sending email")
	}

	return nil
}

func (s *NotificationService) PaymentCompleted(ctx context.Context, student model.Student, payment model.Payment) error {
	notification := &model.Notification{
		ID:           uuid.New(),
		UserID:       student.UserID,
		Type:         model.NotificationTypeInfo,
		Title:        "Pembayaran Berhasil!",
		Message:      "Pembayaran Berhasil!",
		Link:         s.config.Frontend.BaseURL + s.config.Frontend.ListCourse,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID),
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	err := s.notification.Create(ctx, notification)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[PaymentCompleted] Error creating notification")
	}

	err = s.email.SendPaymentCompletedEmail(ctx, student, payment)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[PaymentCompleted] Error sending email")
	}

	return nil
}

func (s *NotificationService) AdminCreateNotification(ctx context.Context, req dto.CreateAdminNotificationRequest) error {
	users, _, err := s.user.Get(ctx, model.UserFilter{
		IDs: req.UserIDs,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[AdminCreateNotification] Error getting users")
		return err
	}

	if len(users) != len(req.UserIDs) {
		logger.WarnCtx(ctx).Msg("[AdminCreateNotification] users not found")
		return shared.MakeError(ErrEntityNotFound, "users")
	}

	switch req.Type {
	case model.EmailBroadcastNotificationType:
		go func() {
			s.sendEmail(context.Background(), req, users)
		}()
		return nil
	case model.NotificationBroadcastNotificationType:
		return s.sendNotification(ctx, req, users)
	}

	return nil
}

func (s *NotificationService) sendEmail(ctx context.Context, req dto.CreateAdminNotificationRequest, users []model.User) error {
	tmpl, err := template.ParseFiles("./templates/email/general.html")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendEmail] Error parsing template")
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	for _, user := range users {
		var buf bytes.Buffer
		err = tmpl.Execute(&buf, map[string]interface{}{
			"subject": req.Title,
			"name":    user.Name,
			"body":    req.Message,
		})
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("user_id", user.ID.String()).Msg("[sendEmail] Error executing template")
			continue
		}

		err = s.email.SendEmail(ctx, user.Email, req.Title, buf.String())
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Str("user_email", user.Email).Msg("[sendEmail] Error sending email")
			continue
		}

		logger.InfoCtx(ctx).Str("user_email", user.Email).Msg("[sendEmail] Email sent successfully")
	}

	return nil
}

func (s *NotificationService) sendNotification(ctx context.Context, req dto.CreateAdminNotificationRequest, users []model.User) error {
	notifications := make([]model.Notification, len(users))
	actorID := middleware.GetUserID(ctx)
	for i, user := range users {
		notifications[i] = model.Notification{
			ID:           uuid.New(),
			UserID:       user.ID,
			Type:         model.NotificationTypeInfo,
			Title:        req.Title,
			Message:      req.Message,
			Link:         req.Link.String,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    actorID,
			UpdatedBy:    actorID,
		}
	}

	err := s.notification.BulkCreate(ctx, notifications)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendNotification] Error BulkCreate")
		return err
	}

	return nil
}

func (s *NotificationService) SendReminderBookingToStudent(ctx context.Context, booking model.Booking) error {
	var err error
	location := model.Location{FullName: string(model.OnlineClassType)}
	if booking.ClassType == model.OfflineClassType {
		location, err = s.courseService.GetLocationByLatLong(ctx, booking.Latitude, booking.Longitude)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[SendReminderToStudent] Error getting location by lat/long")
			location = model.Location{FullName: string(model.OfflineClassType)}
		}
	}

	err = s.email.SendReminderCourseBookingStudentEmail(ctx, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[SendReminderToStudent] Error sending reminder email")
		return err
	}

	return nil
}
