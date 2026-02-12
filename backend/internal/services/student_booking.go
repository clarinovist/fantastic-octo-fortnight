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

type StudentBookingService struct {
	student       *repositories.StudentRepository
	booking       *repositories.BookingRepository
	course        *repositories.CourseRepository
	tutor         *repositories.TutorRepository
	reportBooking *repositories.ReportBookingRepository
	notification  *NotificationService
	courseService *CourseService
	config        *config.Config
}

func NewStudentBookingService(
	student *repositories.StudentRepository,
	booking *repositories.BookingRepository,
	course *repositories.CourseRepository,
	tutor *repositories.TutorRepository,
	reportBooking *repositories.ReportBookingRepository,
	notification *NotificationService,
	courseService *CourseService,
	config *config.Config,
) *StudentBookingService {
	return &StudentBookingService{
		student:       student,
		booking:       booking,
		course:        course,
		tutor:         tutor,
		reportBooking: reportBooking,
		config:        config,
		notification:  notification,
		courseService: courseService,
	}
}

func (s *StudentBookingService) List(ctx context.Context, request dto.ListStudentBookingRequest) ([]model.Booking, model.Metadata, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] Error getting student by user ID")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] User not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "user")
	}

	request.Sort.SetDefaultWithValue("CONCAT(booking_date, ' ', booking_time)", "desc")
	bookings, metadata, err := s.booking.Get(ctx, model.BookingFilter{
		Pagination: request.Pagination,
		Sort:       request.Sort,
		StudentID:  student.ID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentBooking] Error getting student bookings")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	return bookings, metadata, nil
}

func (s *StudentBookingService) GetByID(ctx context.Context, id uuid.UUID) (*model.Booking, error) {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Error getting student by user ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] User not found")
		return nil, shared.MakeError(ErrEntityNotFound, "user")
	}

	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Error getting student bookings")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Booking not found")
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	return booking, nil
}

func (s *StudentBookingService) Create(ctx context.Context, request dto.CreateStudentBookingRequest) (any, error) {
	userID := middleware.GetUserID(ctx)
	student, err := s.student.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error getting student by user ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] User not found")
		return nil, shared.MakeError(ErrEntityNotFound, "user")
	}

	course, err := s.course.GetByID(ctx, request.CourseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error getting course by ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if course == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Course not found")
		return nil, shared.MakeError(ErrEntityNotFound, "course")
	}

	if !course.IsPublished.Bool {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Course is not published")
		return nil, shared.MakeError(ErrEntityNotFound, "course")
	}

	bookingDate, err := time.Parse(time.DateOnly, request.BookingDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error parsing booking date")
		return nil, shared.MakeError(ErrInternalServer)
	}

	bookingTime, err := time.Parse(time.TimeOnly, request.BookingTime)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error parsing booking time")
		return nil, shared.MakeError(ErrInternalServer)
	}

	dayOfWeek := bookingDate.Weekday()
	var schedule *model.CourseSchedule
	for _, c := range course.CourseSchedules {
		if request.ClassType != c.ClassType {
			continue
		}

		if int(dayOfWeek) != c.Day {
			continue
		}

		if request.BookingTime != c.StartTime {
			continue
		}

		schedule = &c
	}

	if schedule == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Schedule not found")
		return nil, shared.MakeError(ErrEntityNotFound, "schedule")
	}

	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		StudentID:      student.ID,
		BookingDate:    bookingDate,
		BookingTime:    bookingTime,
		StatusIn:       []model.BookingStatus{model.BookingStatusPending, model.BookingStatusAccepted},
		DeletedAtIsNil: null.BoolFrom(true),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error counting student bookings")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if len(bookings) > 0 {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Booking already exists")
		b := dto.Booking{
			ID:                bookings[0].ID,
			BookingDate:       bookings[0].BookingDate.Format(time.DateOnly),
			BookingTime:       bookings[0].BookingTime,
			Timezone:          bookings[0].Timezone,
			CourseTitle:       bookings[0].Course.Title,
			CourseDescription: bookings[0].Course.Description,
			Status:            bookings[0].Status,
			ExpiredAt:         bookings[0].ExpiredAt,
		}
		return map[string]any{
			"booking": b,
		}, shared.MakeError(ErrStudentAlreadyHasAnotherSchedule)
	}

	var isFreeFirstCourse bool
	if course.IsFreeFirstCourse.Bool {
		count, err := s.booking.Count(ctx, model.BookingFilter{
			StudentID:         student.ID,
			CourseID:          course.ID,
			IsFreeFirstCourse: null.BoolFrom(true),
			DeletedAtIsNil:    null.BoolFrom(true),
		})
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error counting student bookings")
			return nil, shared.MakeError(ErrInternalServer)
		}

		if count == 0 {
			isFreeFirstCourse = true
		}
		bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
			StudentID:         student.ID,
			CourseCategoryID:  course.CourseCategoryID,
			DateCreatedAt:     time.Now(),
			IsFreeFirstCourse: null.BoolFrom(true),
			DeletedAtIsNil:    null.BoolFrom(true),
		})
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error counting student bookings")
			return nil, shared.MakeError(ErrInternalServer)
		}

		if bookings != nil && len(bookings) >= s.config.Booking.MaxBookingFreeFirstCourse {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Max booking free first course reached")
			b := dto.Booking{
				ID:                bookings[0].ID,
				BookingDate:       bookings[0].BookingDate.Format(time.DateOnly),
				BookingTime:       bookings[0].BookingTime,
				Timezone:          bookings[0].Timezone,
				CourseTitle:       bookings[0].Course.Title,
				CourseDescription: bookings[0].Course.Description,
				Status:            bookings[0].Status,
				ExpiredAt:         bookings[0].ExpiredAt,
			}
			return map[string]any{
				"booking":                   b,
				"maxBookingFreeFirstCourse": s.config.Booking.MaxBookingFreeFirstCourse,
			}, shared.MakeError(ErrMaxBookingFreeFirstCourse)
		}
	}

	booking := &model.Booking{
		ID:                uuid.New(),
		CourseID:          request.CourseID,
		TutorID:           course.TutorID,
		StudentID:         student.ID,
		ClassType:         request.ClassType,
		BookingDate:       bookingDate,
		BookingTime:       bookingTime.Format(time.TimeOnly),
		Timezone:          schedule.Timezone,
		Latitude:          request.Latitude,
		Longitude:         request.Longitude,
		NotesTutor:        request.Notes,
		IsFreeFirstCourse: isFreeFirstCourse,
		Status:            model.BookingStatusPending,
<<<<<<< HEAD
		ExpiredAt:         time.Now().Add(s.config.Booking.ExpiredDurtion),
=======
		ExpiredAt:         time.Now().Add(s.config.Booking.ExpiredDuration),
>>>>>>> 1a19ced (chore: update service folders from local)
		CreatedAt:         time.Now(),
		CreatedBy:         userID,
		UpdatedAt:         time.Now(),
		UpdatedBy:         userID,
	}

	booking.GenerateCode()

	err = s.booking.Create(ctx, booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error creating student booking")
		return nil, shared.MakeError(ErrInternalServer)
	}

	go func() {
		ctx := context.Background()
		location := model.Location{FullName: string(model.OnlineClassType)}
		if booking.ClassType == model.OfflineClassType {
			location, err = s.courseService.GetLocationByLatLong(ctx, booking.Latitude, booking.Longitude)
			if err != nil {
				logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error getting location by ID")
				location = model.Location{FullName: string(model.OfflineClassType)}
			}
		}

		err := s.notification.StudentBookingCourse(ctx, *booking, location)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateStudentBooking] Error sending student booking course notification")
		}
	}()

	return nil, nil
}

func (s *StudentBookingService) ReportBooking(ctx context.Context, req dto.ReportStudentBookingRequest) error {
	student, err := s.student.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Error getting student by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	booking, err := s.booking.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Error getting booking by ID")
		return shared.MakeError(ErrInternalServer)
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.StudentID != student.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	report := &model.ReportBooking{
		ID:        uuid.New(),
		StudentID: student.ID,
		BookingID: booking.ID,
		Topic:     req.Topic,
		Body:      req.Body,
		Status:    model.ReportBookingStatusPending,
		CreatedAt: time.Now(),
		CreatedBy: middleware.GetUserID(ctx),
		UpdatedAt: time.Now(),
		UpdatedBy: middleware.GetUserID(ctx),
	}

	err = s.reportBooking.Create(ctx, report)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ReportStudentBooking] Error reporting student booking")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}
