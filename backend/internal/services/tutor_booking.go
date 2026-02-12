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
<<<<<<< HEAD
=======
	"github.com/shopspring/decimal"
>>>>>>> 1a19ced (chore: update service folders from local)
)

type TutorBookingService struct {
	booking       *repositories.BookingRepository
	course        *repositories.CourseRepository
	tutor         *repositories.TutorRepository
<<<<<<< HEAD
=======
	student       *repositories.StudentRepository
>>>>>>> 1a19ced (chore: update service folders from local)
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
<<<<<<< HEAD
=======
		student:       student,
>>>>>>> 1a19ced (chore: update service folders from local)
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

<<<<<<< HEAD
=======
// ListByStudentID returns all bookings for a specific student under this tutor
func (s *TutorBookingService) ListByStudentID(ctx context.Context, userID uuid.UUID, studentID uuid.UUID) ([]model.Booking, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListByStudentID] Error getting tutor by user ID")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListByStudentID] Tutor not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	sort := model.Sort{}
	sort.SetDefaultWithValue("CONCAT(booking_date, ' ', booking_time)", "desc")
	bookings, metadata, err := s.booking.Get(ctx, model.BookingFilter{
		TutorID:   tutor.ID,
		StudentID: studentID,
		Sort:      sort,
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 100, // Get all sessions for this student
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListByStudentID] Error getting bookings")
		return nil, model.Metadata{}, shared.MakeError(ErrInternalServer)
	}

	return bookings, metadata, nil
}

>>>>>>> 1a19ced (chore: update service folders from local)
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
<<<<<<< HEAD
=======
func (s *TutorBookingService) Create(ctx context.Context, request dto.CreateTutorBookingRequest) (model.Booking, error) {
	tutor, err := s.tutor.GetByUserID(ctx, middleware.GetUserID(ctx))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Error getting tutor by user ID")
		return model.Booking{}, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Tutor not found")
		return model.Booking{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	course, err := s.course.GetByID(ctx, request.CourseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Error getting course")
		return model.Booking{}, shared.MakeError(ErrInternalServer)
	}

	if course == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Course not found")
		return model.Booking{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.TutorID != tutor.ID {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Course does not belong to tutor")
		return model.Booking{}, shared.MakeError(ErrForbidden, "course ownership mismatch")
	}

	student, err := s.student.GetByID(ctx, request.StudentID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Error getting student")
		return model.Booking{}, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Student not found")
		return model.Booking{}, shared.MakeError(ErrEntityNotFound, "student")
	}

	bookingDate, err := time.Parse(time.DateOnly, request.BookingDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Invalid booking date format")
		return model.Booking{}, shared.MakeError(ErrBadRequest, "invalid booking date format")
	}

	booking := model.Booking{
		ID:          uuid.New(),
		CourseID:    course.ID,
		TutorID:     tutor.ID,
		StudentID:   student.ID,
		ClassType:   model.ClassType(request.ClassType),
		BookingDate: bookingDate,
		BookingTime: request.BookingTime,
		Timezone:    "Asia/Jakarta", // Default timezone for now
		Status:      model.BookingStatusAccepted,
		NotesTutor:  request.Notes, // Mentor creates notes for themselves/student? NotesStudent is usually what student sees. Let's use NotesTutor for internal notes or NotesStudent for message to student? Use NotesStudent as per params.
		Latitude:    decimal.NewFromFloat(request.Latitude),
		Longitude:   decimal.NewFromFloat(request.Longitude),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		CreatedBy:   middleware.GetUserID(ctx),
		UpdatedBy:   middleware.GetUserID(ctx),
	}
	booking.NotesStudent = request.Notes

	if booking.ClassType != model.OnlineClassType && booking.ClassType != model.OfflineClassType {
		return model.Booking{}, shared.MakeError(ErrBadRequest, "invalid class type")
	}

	booking.GenerateCode()

	err = s.booking.Create(ctx, &booking)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateBooking] Error creating booking")
		return model.Booking{}, shared.MakeError(ErrInternalServer)
	}

	// Send notification?
	go func() {
		_ = s.sendEmailWhenUpdatStatusBooking(context.Background(), booking)
	}()

	return booking, nil
}
func (s *TutorBookingService) GetStats(ctx context.Context, userID uuid.UUID) (*dto.TutorBookingStats, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStats] Error getting tutor by user ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStats] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	filter := model.BookingFilter{
		TutorID: tutor.ID,
	}

	// Status counts
	pendingCount, _ := s.booking.Count(ctx, model.BookingFilter{TutorID: tutor.ID, Status: model.BookingStatusPending})
	acceptedCount, _ := s.booking.Count(ctx, model.BookingFilter{TutorID: tutor.ID, Status: model.BookingStatusAccepted})
	declinedCount, _ := s.booking.Count(ctx, model.BookingFilter{TutorID: tutor.ID, Status: model.BookingStatusDeclined})
	expiredCount, _ := s.booking.Count(ctx, model.BookingFilter{TutorID: tutor.ID, Status: model.BookingStatusExpired})

	// Completed sessions (Accepted + passed time)
	// For now let's just use Accepted as proxy or filtered counts.
	// But let's check repo capabilities.

	total, _ := s.booking.Count(ctx, filter)

	return &dto.TutorBookingStats{
		Pending:   int(pendingCount),
		Accepted:  int(acceptedCount),
		Rejected:  int(declinedCount + expiredCount),
		Completed: 0, // Need logic for completed
		Total:     int(total),
	}, nil
}
>>>>>>> 1a19ced (chore: update service folders from local)
