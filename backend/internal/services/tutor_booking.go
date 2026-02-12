package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type TutorBookingService struct {
	booking       *repositories.BookingRepository
	course        *repositories.CourseRepository
	tutor         *repositories.TutorRepository
	notification  *NotificationService
	courseService *CourseService
	config        *config.Config
}

func NewTutorBookingService(
	student *repositories.StudentRepository,
	booking *repositories.BookingRepository,
	course *repositories.CourseRepository,
	tutor *repositories.TutorRepository,
	notification *NotificationService,
	courseService *CourseService,
	config *config.Config,
) *TutorBookingService {
	return &TutorBookingService{
		booking:       booking,
		course:        course,
		tutor:         tutor,
		config:        config,
		notification:  notification,
		courseService: courseService,
	}
}

func (s *TutorBookingService) List(ctx context.Context, request dto.ListTutorBookingRequest) ([]model.Booking, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorBooking] Error getting tutor by user ID")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorBooking] Tutor not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	request.Sort.SetDefaultWithValue("CONCAT(booking_date, ' ', booking_time)", "desc")
	bookings, metadata, err := s.booking.Get(ctx, model.BookingFilter{
		Pagination: request.Pagination,
		Sort:       request.Sort,
		TutorID:    tutor.ID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorBooking] Error getting tutor bookings")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	return bookings, metadata, nil
}

func (s *TutorBookingService) GetByID(ctx context.Context, id uuid.UUID) (*model.Booking, error) {
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Error getting tutor by user ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] User not found")
		return nil, shared.MakeError(ErrEntityNotFound, "user")
	}

	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Error getting tutor bookings")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Booking not found")
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.TutorID != tutor.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetByID] Booking not found")
		return nil, shared.MakeError(ErrEntityNotFound, "booking")
	}

	return booking, nil
}

func (s *TutorBookingService) ApproveBooking(ctx context.Context, request dto.ApproveTutorBookingRequest) error {
	id := request.ID
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Error getting tutor by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Error getting tutor bookings")
		return shared.MakeError(ErrInternalServer)
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.TutorID != tutor.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.Status != model.BookingStatusPending {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Booking not found")
		return shared.MakeError(ErrBadRequest, "booking status is not pending")
	}

	booking.Status = model.BookingStatusAccepted
	booking.NotesStudent = request.Notes
	booking.UpdatedAt = time.Now()
	booking.UpdatedBy = middleware.GetUserID(ctx)

	err = s.booking.Update(ctx, booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ApproveBooking] Error updating tutor booking")
		return shared.MakeError(ErrInternalServer)
	}

	go func() {
		_ = s.sendEmailWhenUpdatStatusBooking(context.Background(), *booking)
	}()

	return nil
}

func (s *TutorBookingService) DeclineBooking(ctx context.Context, request dto.DeclineTutorBookingRequest) error {
	id := request.ID
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Error getting tutor by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	booking, err := s.booking.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Error getting tutor bookings")
		return shared.MakeError(ErrInternalServer)
	}

	if booking == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.TutorID != tutor.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Booking not found")
		return shared.MakeError(ErrEntityNotFound, "booking")
	}

	if booking.Status != model.BookingStatusPending {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Booking not found")
		return shared.MakeError(ErrBadRequest, "booking status is not pending")
	}

	booking.Status = model.BookingStatusDeclined
	booking.NotesStudent = request.Notes
	booking.UpdatedAt = time.Now()
	booking.UpdatedBy = middleware.GetUserID(ctx)

	err = s.booking.Update(ctx, booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeclineBooking] Error decline tutor booking")
		return shared.MakeError(ErrInternalServer)
	}

	go func() {
		_ = s.sendEmailWhenUpdatStatusBooking(context.Background(), *booking)
	}()

	return nil
}

func (s *TutorBookingService) sendEmailWhenUpdatStatusBooking(ctx context.Context, booking model.Booking) error {
	location := model.Location{FullName: string(model.OnlineClassType)}
	if booking.ClassType == model.OfflineClassType {
		var err error
		location, err = s.courseService.GetLocationByLatLong(ctx, booking.Latitude, booking.Longitude)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[sendEmailWhenUpdatStatusBooking] Error getting location by ID")
			location = model.Location{FullName: string(model.OfflineClassType)}
		}
	}

	err := s.notification.TutorChangeStatusBooking(ctx, booking, location)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[sendEmailWhenUpdatStatusBooking] Error sending email")
	}

	return nil
}
