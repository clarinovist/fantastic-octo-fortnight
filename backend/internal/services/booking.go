package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
<<<<<<< HEAD
=======
	"github.com/shopspring/decimal"
>>>>>>> 1a19ced (chore: update service folders from local)
)

type BookingService struct {
	config              *config.Config
	booking             *repositories.BookingRepository
<<<<<<< HEAD
=======
	student             *repositories.StudentRepository
	course              *repositories.CourseRepository
>>>>>>> 1a19ced (chore: update service folders from local)
	notification        *repositories.NotificationRepository
	review              *repositories.ReviewRepository
	notificationService *NotificationService
	redis               *infras.Redis
}

func NewBookingService(
	config *config.Config,
	booking *repositories.BookingRepository,
<<<<<<< HEAD
=======
	student *repositories.StudentRepository,
	course *repositories.CourseRepository,
>>>>>>> 1a19ced (chore: update service folders from local)
	notification *repositories.NotificationRepository,
	review *repositories.ReviewRepository,
	notificationService *NotificationService,
	redis *infras.Redis,
) *BookingService {
	return &BookingService{
		config:              config,
		booking:             booking,
<<<<<<< HEAD
=======
		student:             student,
		course:              course,
>>>>>>> 1a19ced (chore: update service folders from local)
		notification:        notification,
		review:              review,
		notificationService: notificationService,
		redis:               redis,
	}
}

func (s *BookingService) ExpiredBooking(ctx context.Context) error {
	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		ExpiredAtBefore: time.Now(),
		Status:          model.BookingStatusPending,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ExpiredBooking] Error getting bookings")
		return err
	}

	if len(bookings) == 0 {
		return nil
	}

	notifications := []model.Notification{}
	for i, booking := range bookings {
		bookings[i].Status = model.BookingStatusExpired
		bookings[i].UpdatedAt = time.Now()
		bookings[i].UpdatedBy = uuid.MustParse(model.SystemID)
		link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())

		notifications = append(notifications, model.Notification{
			ID:           uuid.New(),
			UserID:       booking.Student.UserID,
			Type:         model.NotificationTypeError,
			Title:        "Booking Rejected",
			Message:      fmt.Sprintf("Maaf, tutor tidak merespon permintaan les kamu untuk %s dalam 6 jam.", booking.Course.Title),
			Link:         link,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    uuid.MustParse(model.SystemID),
			UpdatedBy:    uuid.MustParse(model.SystemID),
		})

	}

	err = s.booking.BulkUpdate(ctx, bookings)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ExpiredBooking] Error bulk updating bookings")
		return err
	}

	if err := s.notification.BulkCreate(ctx, notifications); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[StudentBookingCourse] Error creating notification for tutor")
	}

	return nil
}

func (s *BookingService) ReminderExpiredBooking(ctx context.Context) error {
	keys, err := s.redis.Client.Keys(ctx, model.BuildCacheKey(model.ReminderExpiredBookingKey, "*")).Result()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error getting keys")
	}

	ids := []uuid.UUID{}
	for _, key := range keys {
		key = strings.TrimPrefix(key, model.BuildCacheKey(model.ReminderExpiredBookingKey, ""))

		id, err := uuid.Parse(key)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error parsing key")
			return err
		}

		ids = append(ids, id)
	}

	reminderDuration := s.config.Booking.ReminderBeforeExpiredDuration
	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		NotIDs: ids,
		ExpiredAtBetween: []time.Time{
			time.Now(),
			time.Now().Add(reminderDuration),
		},
		Status: model.BookingStatusPending,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error getting bookings")
		return err
	}

	if len(bookings) == 0 {
		return nil
	}

	notifications := []model.Notification{}
	for _, booking := range bookings {
		key := model.BuildCacheKey(model.ReminderExpiredBookingKey, booking.ID.String())
		err := s.redis.Client.Set(ctx, key, true, time.Until(booking.ExpiredAt)).Err()
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error setting redis")
		}

		link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())

		notifications = append(notifications, model.Notification{
			ID:           uuid.New(),
			UserID:       booking.Tutor.UserID,
			Type:         model.NotificationTypeWarning,
			Title:        fmt.Sprintf("Expire in %d hour", int(reminderDuration.Hours())),
			Message:      fmt.Sprintf("Ada permintaan les yang belum direspon untuk %s. Segera respon dalam %d jam agar booking tidak hangus.", booking.Course.Title, int(reminderDuration.Hours())),
			Link:         link,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    uuid.MustParse(model.SystemID),
			UpdatedBy:    uuid.MustParse(model.SystemID),
		})
	}

	err = s.notificationService.ReminderExpiredBooking(ctx, notifications, bookings)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderExpiredBooking] Error bulk updating bookings")
		return err
	}

	return nil
}

func (s *BookingService) ReminderCourseBooking(ctx context.Context) error {
	keys, err := s.redis.Client.Keys(ctx, model.BuildCacheKey(model.ReminderCourseBookingKey, "*")).Result()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error getting keys")
	}

	ids := []uuid.UUID{}
	for _, key := range keys {
		key = strings.TrimPrefix(key, model.BuildCacheKey(model.ReminderCourseBookingKey, ""))

		id, err := uuid.Parse(key)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error parsing key")
			return err
		}

		ids = append(ids, id)
	}

	reminderDuration := s.config.Booking.ReminderBeforeBookingDateDuration
	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		NotIDs: ids,
		BookingDateTimeBetween: []time.Time{
			time.Now(),
			time.Now().Add(reminderDuration),
		},
		Status: model.BookingStatusAccepted,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error getting bookings")
		return err
	}

	if len(bookings) == 0 {
		return nil
	}

	notifications := []model.Notification{}
	for _, booking := range bookings {
		key := model.BuildCacheKey(model.ReminderCourseBookingKey, booking.ID.String())
		err := s.redis.Client.Set(ctx, key, true, time.Until(booking.ExpiredAt)).Err()
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error setting redis")
		}

		link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())

		notifications = append(notifications, model.Notification{
			ID:           uuid.New(),
			UserID:       booking.Tutor.UserID,
			Type:         model.NotificationTypeWarning,
			Title:        fmt.Sprintf("Reminder Course H-%d", int(reminderDuration.Hours())/24),
			Message:      fmt.Sprintf("Hai %s, sesi les kamu untuk %s akan dimulai besok. Pastikan kamu sudah menyiapkan segala keperluannya, ya!", booking.Student.User.Name, booking.Course.Title),
			Link:         link,
			IsRead:       false,
			IsDismissed:  false,
			IsDeleteable: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			CreatedBy:    uuid.MustParse(model.SystemID),
			UpdatedBy:    uuid.MustParse(model.SystemID),
		})
	}

	err = s.notificationService.ReminderCourseBookingForStudent(ctx, notifications, bookings)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderCourseBooking] Error bulk updating bookings")
		return err
	}

	return nil
}

func (s *BookingService) CreateReviewBooking(ctx context.Context) error {
	duration := s.config.Booking.CreateReviewDuration
	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		BookingDateTimeAdd: duration,
		Status:             model.BookingStatusAccepted,
		IsReviewed:         null.BoolFrom(false),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error getting bookings")
		return err
	}

	if len(bookings) == 0 {
		return nil
	}

	tutorReviews := []model.TutorReview{}
	studentReviews := []model.StudentReview{}
	for i, booking := range bookings {
		bookings[i].IsReviewed = true
		tutorReviews = append(tutorReviews, model.TutorReview{
			ID:        uuid.New(),
			BookingID: booking.ID,
			CourseID:  booking.CourseID,
			TutorID:   booking.TutorID,
			StudentID: booking.StudentID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			CreatedBy: uuid.NullUUID{
				UUID:  uuid.MustParse(model.SystemID),
				Valid: true,
			},
			UpdatedBy: uuid.NullUUID{
				UUID:  uuid.MustParse(model.SystemID),
				Valid: true,
			},
		})
		studentReviews = append(studentReviews, model.StudentReview{
			ID:        uuid.New(),
			BookingID: booking.ID,
			CourseID:  booking.CourseID,
			TutorID:   booking.TutorID,
			StudentID: booking.StudentID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			CreatedBy: uuid.NullUUID{
				UUID:  uuid.MustParse(model.SystemID),
				Valid: true,
			},
			UpdatedBy: uuid.NullUUID{
				UUID:  uuid.MustParse(model.SystemID),
				Valid: true,
			},
		})
	}

	err = s.booking.BulkUpdate(ctx, bookings)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error bulk updating bookings")
		return err
	}

	err = s.review.CreateReview(ctx, studentReviews, tutorReviews)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error bulk creating reviews")
		return err
	}

	go func() {
		err = s.notificationService.CreateReviewBooking(context.Background(), bookings)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateReviewBooking] Error bulk creating notifications")
		}
	}()

	return nil
}

func (s *BookingService) GetAdminBookings(ctx context.Context, req dto.GetAdminBookingsRequest) (dto.GetAdminBookingsResponse, error) {
	filter := model.BookingFilter{
		Pagination:     req.Pagination,
		Sort:           req.Sort,
		DeletedAtIsNil: null.BoolFrom(true),
	}

	if req.Status != "" {
		filter.Status = model.BookingStatus(req.Status)
	}

	if req.StudentName != "" {
		filter.StudentName = strings.ToLower(req.StudentName)
	}

	if req.TutorName != "" {
		filter.TutorName = strings.ToLower(req.TutorName)
	}

	bookings, metadata, err := s.booking.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminBookings] Error getting bookings")
		return dto.GetAdminBookingsResponse{}, err
	}

	data := make([]dto.AdminBooking, 0, len(bookings))
	for _, booking := range bookings {
		data = append(data, dto.NewAdminBooking(&booking))
	}

	return dto.GetAdminBookingsResponse{
		Data:     data,
		Metadata: metadata,
	}, nil
}

func (s *BookingService) GetAdminBookingDetail(ctx context.Context, id uuid.UUID) (*model.Booking, error) {
	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[GetAdminBookingDetail] Error getting booking by id")
		return nil, err
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Str("booking_id", id.String()).Msg("[GetAdminBookingDetail] Booking not found")
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	return booking, nil
}

func (s *BookingService) ReminderStudent(ctx context.Context, id uuid.UUID) error {
	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[ReminderStudent] Error getting booking by id")
		return err
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Str("booking_id", id.String()).Msg("[ReminderStudent] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())

	notification := model.Notification{
		ID:           uuid.New(),
		UserID:       booking.Tutor.UserID,
		Type:         model.NotificationTypeWarning,
		Title:        "Reminder Course",
		Message:      fmt.Sprintf("Hai %s, sesi les kamu untuk %s akan dimulai besok. Pastikan kamu sudah menyiapkan segala keperluannya, ya!", booking.Student.User.Name, booking.Course.Title),
		Link:         link,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID),
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	err = s.notificationService.ReminderCourseBookingForStudent(ctx, []model.Notification{notification}, []model.Booking{*booking})
	if err != nil {
		logger.ErrorCtx(ctx)
		return err
	}

	return nil
}

func (s *BookingService) ReminderTutor(ctx context.Context, id uuid.UUID) error {
	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[ReminderTutor] Error getting booking by id")
		return err
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Str("booking_id", id.String()).Msg("[ReminderTutor] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	link := fmt.Sprintf(s.config.Frontend.BaseURL+s.config.Frontend.BookingDetail, booking.ID.String())
	reminderDuration := booking.ReminderBeforeExpiredInHour()

	notification := model.Notification{
		ID:           uuid.New(),
		UserID:       booking.Tutor.UserID,
		Type:         model.NotificationTypeWarning,
		Title:        fmt.Sprintf("Expire in %d hour", reminderDuration),
		Message:      fmt.Sprintf("Ada permintaan les yang belum direspon untuk %s. Segera respon dalam %d jam agar booking tidak hangus.", booking.Course.Title, reminderDuration),
		Link:         link,
		IsRead:       false,
		IsDismissed:  false,
		IsDeleteable: true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID),
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	err = s.notificationService.ReminderExpiredBooking(ctx, []model.Notification{notification}, []model.Booking{*booking})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReminderTutor] Error bulk updating bookings")
		return err
	}

	return nil
}
<<<<<<< HEAD
=======

func (s *BookingService) CreateBookingForAdmin(ctx context.Context, req dto.AdminCreateBookingRequest) (*model.Booking, error) {
	// Validate student exists
	student, err := s.student.GetByID(ctx, req.StudentID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("student_id", req.StudentID.String()).Msg("[CreateBookingForAdmin] Error getting student")
		return nil, shared.MakeError(ErrInternalServer)
	}
	if student == nil {
		logger.InfoCtx(ctx).Str("student_id", req.StudentID.String()).Msg("[CreateBookingForAdmin] Student not found")
		return nil, shared.MakeError(ErrEntityNotFound, "student")
	}

	// Validate course exists
	course, err := s.course.GetByID(ctx, req.CourseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", req.CourseID.String()).Msg("[CreateBookingForAdmin] Error getting course")
		return nil, shared.MakeError(ErrInternalServer)
	}
	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", req.CourseID.String()).Msg("[CreateBookingForAdmin] Course not found")
		return nil, shared.MakeError(ErrEntityNotFound, "course")
	}

	// Parse date
	bookingDate, _ := time.Parse("2006-01-02", req.BookingDate)

	// Create booking
	booking := &model.Booking{
		ID:           uuid.New(),
		StudentID:    req.StudentID,
		TutorID:      req.TutorID,
		CourseID:     req.CourseID,
		BookingDate:  bookingDate,
		BookingTime:  req.BookingTime,
		Timezone:     req.Timezone,
		ClassType:    model.ClassType(req.ClassType),
		Status:       model.BookingStatus(req.Status),
		NotesTutor:   null.StringFrom(req.NotesTutor),
		NotesStudent: null.StringFrom(req.NotesStudent),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		CreatedBy:    uuid.MustParse(model.SystemID), // Admin creates on behalf
		UpdatedBy:    uuid.MustParse(model.SystemID),
	}

	booking.GenerateCode()

	// Parse coordinates if provided
	if req.Latitude != "" && req.Longitude != "" {
		lat, _ := decimal.NewFromString(req.Latitude)
		lng, _ := decimal.NewFromString(req.Longitude)
		booking.Latitude = lat
		booking.Longitude = lng
	}

	// Set expiration for pending bookings
	if booking.Status == model.BookingStatusPending {
		booking.ExpiredAt = time.Now().Add(s.config.Booking.ExpiredDuration)
	}

	// Create in repository
	err = s.booking.Create(ctx, booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", booking.ID.String()).Msg("[CreateBookingForAdmin] Error creating booking")
		return nil, shared.MakeError(ErrInternalServer)
	}

	// Fetch created booking with relations
	createdBooking, err := s.booking.GetByID(ctx, booking.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", booking.ID.String()).Msg("[CreateBookingForAdmin] Error fetching created booking")
		return nil, shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("booking_id", booking.ID.String()).
		Str("student_id", req.StudentID.String()).
		Str("tutor_id", req.TutorID.String()).
		Msg("[CreateBookingForAdmin] Booking created successfully by admin")

	return createdBooking, nil
}

func (s *BookingService) UpdateBookingForAdmin(ctx context.Context, id uuid.UUID, req dto.AdminUpdateBookingRequest) (*model.Booking, error) {
	// Get existing booking
	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[UpdateBookingForAdmin] Error getting booking")
		return nil, shared.MakeError(ErrInternalServer)
	}
	if booking == nil {
		logger.InfoCtx(ctx).Str("booking_id", id.String()).Msg("[UpdateBookingForAdmin] Booking not found")
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	// Update fields if provided
	if req.Status != nil {
		booking.Status = model.BookingStatus(*req.Status)
		// Clear expiration for non-pending bookings
		if booking.Status != model.BookingStatusPending {
			booking.ExpiredAt = time.Time{}
		}
	}
	if req.BookingDate != nil {
		bookingDate, _ := time.Parse("2006-01-02", *req.BookingDate)
		booking.BookingDate = bookingDate
	}
	if req.BookingTime != nil {
		booking.BookingTime = *req.BookingTime
	}
	if req.NotesTutor != nil {
		booking.NotesTutor = null.StringFrom(*req.NotesTutor)
	}
	if req.NotesStudent != nil {
		booking.NotesStudent = null.StringFrom(*req.NotesStudent)
	}

	booking.UpdatedAt = time.Now()
	booking.UpdatedBy = uuid.MustParse(model.SystemID)

	// Update in repository
	err = s.booking.Update(ctx, booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[UpdateBookingForAdmin] Error updating booking")
		return nil, shared.MakeError(ErrInternalServer)
	}

	// Re-fetch with relations
	updatedBooking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("booking_id", id.String()).Msg("[UpdateBookingForAdmin] Error re-fetching booking")
		return nil, shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).Str("booking_id", id.String()).Msg("[UpdateBookingForAdmin] Booking updated successfully by admin")
	return updatedBooking, nil
}
>>>>>>> 1a19ced (chore: update service folders from local)
