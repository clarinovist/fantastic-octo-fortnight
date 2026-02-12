package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
)

type ProfileService struct {
	user          *repositories.UserRepository
	student       *repositories.StudentRepository
	tutor         *repositories.TutorRepository
	tutorDocument *repositories.TutorDocumentRepository
	booking       *repositories.BookingRepository
	review        *repositories.ReviewRepository
	courseService *CourseService
	notification  *NotificationService
}

func NewProfileService(
	user *repositories.UserRepository,
	student *repositories.StudentRepository,
	tutor *repositories.TutorRepository,
	tutorDocument *repositories.TutorDocumentRepository,
	booking *repositories.BookingRepository,
	review *repositories.ReviewRepository,
	courseService *CourseService,
	notification *NotificationService,
) ProfileService {
	return ProfileService{
		user:          user,
		student:       student,
		tutor:         tutor,
		tutorDocument: tutorDocument,
		booking:       booking,
		review:        review,
		courseService: courseService,
		notification:  notification,
	}
}

func (s *ProfileService) UpdateProfile(ctx context.Context, userID uuid.UUID, req dto.UpdateProfileRequest) error {
	// Get user with roles
	user, err := s.user.GetByID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get user")
		return shared.MakeError(ErrInternalServer)
	}

	if user == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	user.Name = req.Name
	user.PhoneNumber = req.PhoneNumber

	var userRole string
	for _, role := range user.Roles {
		if role.Name == model.RoleNameStudent || role.Name == model.RoleNameTutor {
			userRole = role.Name
			break
		}
	}

	if userRole == "" {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User has no student or tutor role")
		return fmt.Errorf("user has no student or tutor role")
	}

	var profile any
	switch userRole {
	case model.RoleNameStudent:
		profile, err = s.updateStudentProfile(ctx, req, user)
	case model.RoleNameTutor:
		profile, err = s.updateTutorProfile(ctx, req, user)
	default:
		return fmt.Errorf("unsupported user role: %s", userRole)
	}

	err = s.user.UpdateProfile(ctx, user, profile)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Str("role", userRole).
			Msg("[ProfileService.UpdateProfile] Failed to update profile")
		return err
	}

	if userRole == model.RoleNameTutor {
		if err := s.updateNotificationTutorUpdateProfile(ctx, *user); err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("user_id", userID.String()).
				Str("role", userRole).
				Msg("[ProfileService.UpdateProfile] Failed to update notification")
		}
	}

	return nil
}

func (s *ProfileService) UpdateProfileLocation(ctx context.Context, userID uuid.UUID, req dto.UpdateProfileLocationRequest) error {
	// Get user with roles
	user, err := s.user.GetByID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get user")
		return shared.MakeError(ErrInternalServer)
	}

	if user == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User not found")
		return shared.MakeError(ErrEntityNotFound, "user")
	}

	var userRole string
	for _, role := range user.Roles {
		if role.Name == model.RoleNameStudent || role.Name == model.RoleNameTutor {
			userRole = role.Name
			break
		}
	}

	if userRole == "" {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User has no student or tutor role")
		return fmt.Errorf("user has no student or tutor role")
	}

	var profile any
	switch userRole {
	case model.RoleNameStudent:
		profile, err = s.updateStudentProfileLocation(ctx, req, user)
	case model.RoleNameTutor:
		profile, err = s.updateTutorProfileLocation(ctx, req, user)
	default:
		return fmt.Errorf("unsupported user role: %s", userRole)
	}

	err = s.user.UpdateProfile(ctx, user, profile)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Str("role", userRole).
			Msg("[ProfileService.UpdateProfile] Failed to update profile")
		return err
	}

	if userRole == model.RoleNameTutor {
		if err := s.updateNotificationTutorUpdateProfile(ctx, *user); err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("user_id", userID.String()).
				Str("role", userRole).
				Msg("[ProfileService.UpdateProfile] Failed to update notification")
		}
	}

	return nil
}

func (s *ProfileService) updateNotificationTutorUpdateProfile(ctx context.Context, user model.User) error {
	tutor, err := s.tutor.GetByUserID(ctx, user.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateNotificationTutorUpdateProfile] Failed to get tutor")
		return err
	}

	if tutor.IsFinishUpdateProfile() {
		go func() {
			bgCtx := context.Background()

			// Check if tutor has active documents
			hasActiveDocuments, err := s.hasActiveTutorDocuments(bgCtx, tutor.ID)
			if err != nil {
				logger.ErrorCtx(bgCtx).Err(err).
					Str("tutor_id", tutor.ID.String()).
					Msg("[ProfileService.updateNotificationTutorUpdateProfile] Failed to check active documents")
				return
			}

			if hasActiveDocuments {
				// Update tutor status to active
				tutor.Status = null.StringFrom(model.TutorStatusActive)
				if err := s.tutor.Update(bgCtx, tutor); err != nil {
					logger.ErrorCtx(bgCtx).Err(err).
						Str("tutor_id", tutor.ID.String()).
						Msg("[ProfileService.updateNotificationTutorUpdateProfile] Failed to update tutor status")
					return
				}
			}
			// Remove notification after successful status update
			_ = s.notification.RemoveTutorProfile(bgCtx, user)
		}()
	}

	return nil
}

// hasActiveTutorDocuments checks if the tutor has any active documents
func (s *ProfileService) hasActiveTutorDocuments(ctx context.Context, tutorID uuid.UUID) (bool, error) {
	documents, err := s.tutorDocument.Get(ctx, model.TutorDocumentFilter{
		TutorID: tutorID,
		Status:  model.TutorDocumentStatusActive,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutorID.String()).
			Msg("[ProfileService.hasActiveTutorDocuments] Failed to get tutor documents")
		return false, err
	}

	return len(documents) > 0, nil
}

func (s *ProfileService) updateStudentProfileLocation(ctx context.Context, req dto.UpdateProfileLocationRequest, user *model.User) (*model.Student, error) {
	student, err := s.student.GetByUserID(ctx, user.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateStudentProfileLocation] Failed to get student")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateStudentProfileLocation] Student not found")
		return nil, shared.MakeError(ErrEntityNotFound, "student")
	}

	// Update student fields
	student.Latitude = decimal.NullDecimal{
		Decimal: req.Latitude,
		Valid:   true,
	}
	student.Longitude = decimal.NullDecimal{
		Decimal: req.Longitude,
		Valid:   true,
	}

	return student, nil
}

func (s *ProfileService) updateStudentProfile(ctx context.Context, req dto.UpdateProfileRequest, user *model.User) (*model.Student, error) {
	student, err := s.student.GetByUserID(ctx, user.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateStudentProfile] Failed to get student")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if student == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateStudentProfile] Student not found")
		return nil, shared.MakeError(ErrEntityNotFound, "student")
	}

	// Update student fields
	student.PhotoProfile = null.StringFrom(req.PhotoProfile)
	student.Gender = null.StringFrom(req.Gender)
	dateOfBirth, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		return nil, shared.MakeError(ErrBadRequest, "invalid date format")
	}
	student.DateOfBirth = null.TimeFrom(dateOfBirth)
	student.PhoneNumber = null.StringFrom(req.PhoneNumber)
	if req.SocialMediaLink != nil {
		links := make([]model.SocialMediaLink, 0)
		for socialMedia, link := range req.SocialMediaLink {
			links = append(links, model.SocialMediaLink{
				Name: socialMedia,
				Link: link,
			})
		}

		student.SocialMediaLink = links
	}

	return student, nil
}

func (s *ProfileService) updateTutorProfile(ctx context.Context, req dto.UpdateProfileRequest, user *model.User) (*model.Tutor, error) {
	tutor, err := s.tutor.GetByUserID(ctx, user.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateTutorProfile] Failed to get tutor")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateTutorProfile] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	// Update tutor fields
	tutor.PhotoProfile = null.StringFrom(req.PhotoProfile)
	tutor.Gender = null.StringFrom(req.Gender)
	dateOfBirth, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		return nil, shared.MakeError(ErrBadRequest, "invalid date format")
	}
	tutor.DateOfBirth = null.TimeFrom(dateOfBirth)
	tutor.PhoneNumber = null.StringFrom(req.PhoneNumber)
	tutor.Address = null.StringFrom(req.Address)
	if req.SocialMediaLink != nil {
		links := make([]model.SocialMediaLink, 0)
		for socialMedia, link := range req.SocialMediaLink {
			links = append(links, model.SocialMediaLink{
				Name: socialMedia,
				Link: link,
			})
		}

		tutor.SocialMediaLink = links
	}

	return tutor, nil
}

func (s *ProfileService) updateTutorProfileLocation(ctx context.Context, req dto.UpdateProfileLocationRequest, user *model.User) (*model.Tutor, error) {
	tutor, err := s.tutor.GetByUserID(ctx, user.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateTutorProfileLocation] Failed to get tutor")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", user.ID.String()).
			Msg("[ProfileService.updateTutorProfileLocation] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	tutor.Latitude = decimal.NullDecimal{
		Decimal: req.Latitude,
		Valid:   true,
	}
	tutor.Longitude = decimal.NullDecimal{
		Decimal: req.Longitude,
		Valid:   true,
	}

	return tutor, nil
}

func (s *ProfileService) GetProfile(ctx context.Context, userID uuid.UUID) (dto.ProfileResponse, error) {
	// Get user with roles
	user, err := s.user.GetByID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get user")
		return dto.ProfileResponse{}, shared.MakeError(ErrInternalServer)
	}

	if user == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User not found")
		return dto.ProfileResponse{}, shared.MakeError(ErrEntityNotFound, "user")
	}

	var userRole string
	for _, role := range user.Roles {
		if role.Name == model.RoleNameStudent || role.Name == model.RoleNameTutor {
			userRole = role.Name
			break
		}
	}

	if userRole == "" {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] User has no student or tutor role")
		return dto.ProfileResponse{}, fmt.Errorf("user has no student or tutor role")
	}

	profile := dto.ProfileResponse{
		ID:              user.ID,
		Name:            user.Name,
		Email:           user.Email,
		Role:            userRole,
		SocialMediaLink: make(map[string]string),
	}

	if user.PhoneNumber != "" {
		profile.PhoneNumber = null.StringFrom(user.PhoneNumber)
	}

	switch userRole {
	case model.RoleNameStudent:
		student, err := s.student.GetByUserID(ctx, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("user_id", userID.String()).
				Msg("[ProfileService.UpdateProfile] Failed to get student")
			return dto.ProfileResponse{}, shared.MakeError(ErrInternalServer)
		}

		if student == nil {
			logger.ErrorCtx(ctx).
				Str("user_id", userID.String()).
				Msg("[ProfileService.UpdateProfile] Student not found")
			return dto.ProfileResponse{}, shared.MakeError(ErrEntityNotFound, "student")
		}

		profile.Gender = student.Gender
		profile.PhotoProfile = student.PhotoProfile
		if student.DateOfBirth.Valid {
			profile.DateOfBirth = null.StringFrom(student.DateOfBirth.Time.Format("2006-01-02"))
		}

		profile.SocialMediaLink = make(map[string]string)
		profile.Latitude = student.Latitude
		profile.Longitude = student.Longitude
		for _, link := range student.SocialMediaLink {
			profile.SocialMediaLink[link.Name] = link.Link
		}
		profile.IsPremium = student.IsPremium()
	case model.RoleNameTutor:
		err := s.fillProfileForTutor(ctx, userID, &profile)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("user_id", userID.String()).
				Msg("[ProfileService.UpdateProfile] Failed to get tutor")
			return dto.ProfileResponse{}, err
		}
	}

	return profile, nil
}

func (s *ProfileService) fillProfileForTutor(ctx context.Context, userID uuid.UUID, profile *dto.ProfileResponse) error {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get tutor")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	profile.Gender = tutor.Gender
	profile.PhotoProfile = tutor.PhotoProfile
	if tutor.DateOfBirth.Valid {
		profile.DateOfBirth = null.StringFrom(tutor.DateOfBirth.Time.Format("2006-01-02"))
	}

	profile.SocialMediaLink = make(map[string]string)
	profile.Latitude = tutor.Latitude
	profile.Longitude = tutor.Longitude
	for _, link := range tutor.SocialMediaLink {
		profile.SocialMediaLink[link.Name] = link.Link
	}
	profile.LevelPoint = tutor.LevelPoint
	profile.Level = null.StringFrom(tutor.LevelByPoint())
	profile.Address = tutor.Address
	profile.JoinedAt = tutor.CreatedAt

	// Get total sessions
	totalSessions, err := s.booking.Count(ctx, model.BookingFilter{
		TutorID: userID,
		Status:  model.BookingStatusAccepted,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get total sessions")
		// Don't fail the whole request, just log error
	}
	profile.TotalSessions = totalSessions

	// Get average rating
	avgRating, err := s.review.GetTotalRatingTutor(ctx, tutor.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get average rating")
		// Don't fail
	}
	profile.AverageRating = avgRating

	location, err := s.courseService.GetLocationByLatLong(ctx, profile.Latitude.Decimal, profile.Longitude.Decimal)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[ProfileService.UpdateProfile] Failed to get location")
		return shared.MakeError(ErrInternalServer)
	}

	profile.Location = dto.Location{
		FullName: location.FullName,
	}

	profile.FinishUpdateProfile = tutor.StatusLabel() == model.TutorStatusActive

	return nil
}
