package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"golang.org/x/crypto/bcrypt"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type TutorService struct {
	student *repositories.StudentRepository
	tutor   *repositories.TutorRepository
	review  *repositories.ReviewRepository
	role    *repositories.RoleRepository
	user    *repositories.UserRepository
	course  *repositories.CourseRepository
}

func NewTutorService(
	student *repositories.StudentRepository,
	tutor *repositories.TutorRepository,
	review *repositories.ReviewRepository,
	role *repositories.RoleRepository,
	user *repositories.UserRepository,
	course *repositories.CourseRepository,
) *TutorService {
	return &TutorService{
		student: student,
		tutor:   tutor,
		review:  review,
		role:    role,
		user:    user,
		course:  course,
	}
}

func (s *TutorService) GetLocalTutor(ctx context.Context, id uuid.UUID) (model.Tutor, error) {
	tutor, err := s.tutor.GetByID(ctx, id)
	if err != nil {
		return model.Tutor{}, err
	}
	if tutor == nil {
		return model.Tutor{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}
	return *tutor, nil
}

func (s *TutorService) GetAdminTutors(ctx context.Context, req dto.GetAdminTutorsRequest) (dto.GetAdminTutorsResponse, error) {
	var (
		createdAtFrom time.Time
		createdAtTo   time.Time
		err           error
	)
	if req.CreatedAtFrom != "" {
		createdAtFrom, err = time.Parse(time.DateOnly, req.CreatedAtFrom)
		if err != nil {
			return dto.GetAdminTutorsResponse{}, err
		}
	}

	if req.CreatedAtTo != "" {
		createdAtTo, err = time.Parse(time.DateOnly, req.CreatedAtTo)
		if err != nil {
			return dto.GetAdminTutorsResponse{}, err
		}
	}

	tutors, metadata, err := s.tutor.Get(ctx, model.TutorFilter{
		Name:          req.Name,
		Email:         req.Email,
		Query:         req.Query,
		CreatedAtFrom: createdAtFrom,
		CreatedAtTo:   createdAtTo,
		DeletedIsNull: null.BoolFrom(true),
		Pagination:    req.Pagination,
		Sort:          req.Sort,
	})
	if err != nil {
		return dto.GetAdminTutorsResponse{}, err
	}

	resp := dto.GetAdminTutorsResponse{
		Data:     make([]dto.AdminTutor, len(tutors)),
		Metadata: metadata,
	}
	for i, tutor := range tutors {
		resp.Data[i] = dto.AdminTutor{
			ID:          tutor.ID,
			UserID:      tutor.UserID,
			Name:        tutor.User.Name,
			PhoneNumber: tutor.User.PhoneNumber,
			Email:       tutor.User.Email,
			Status:      tutor.StatusLabel(),
			CreatedAt:   tutor.CreatedAt,
			UpdatedAt:   tutor.UpdatedAt,
		}
	}

	return resp, nil
}

func (s *TutorService) GetAdminDetailTutor(ctx context.Context, id uuid.UUID) (dto.AdminDetailTutor, error) {
	tutor, err := s.tutor.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("tutor_id", id.String()).Msg("[GetAdminDetailTutor] Failed to get tutor by id")
		return dto.AdminDetailTutor{}, err
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Str("tutor_id", id.String()).Msg("[GetAdminDetailTutor] Tutor not found")
		return dto.AdminDetailTutor{}, nil
	}

	tutorReviews, _, err := s.review.GetTutorReviews(ctx, model.ReviewFilter{
		TutorID:         tutor.ID,
		DeletedAtIsNull: null.BoolFrom(true),
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 4,
		},
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailTutor] Failed to get tutor reviews")
		return dto.AdminDetailTutor{}, err
	}

	ratingTutor, err := s.review.GetTotalRatingTutor(ctx, tutor.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailTutor] Failed to get tutor rating tutor")
		return dto.AdminDetailTutor{}, err
	}

	studentReviews, _, err := s.review.GetStudentReviews(ctx, model.ReviewFilter{
		TutorID:         tutor.ID,
		DeletedAtIsNull: null.BoolFrom(true),
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 4,
		},
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailTutor] Failed to get student reviews")
		return dto.AdminDetailTutor{}, err
	}

	resp := dto.AdminDetailTutor{
		ID:                   tutor.ID,
		Name:                 tutor.User.Name,
		Email:                tutor.User.Email,
		Gender:               tutor.Gender,
		DateOfBirth:          tutor.DateOfBirth,
		PhoneNumber:          tutor.User.PhoneNumber,
		Latitude:             tutor.Latitude,
		Longitude:            tutor.Longitude,
		PhotoProfile:         tutor.PhotoProfile,
		Rating:               ratingTutor,
		LevelPoint:           tutor.LevelPoint,
		Level:                tutor.LevelByPoint(),
		Status:               tutor.StatusLabel(),
		StudentToTutorReview: make([]dto.AdminReview, len(tutorReviews)),
		TutorToStudentReview: make([]dto.AdminReview, len(studentReviews)),
		SocialMediaLinks:     make(map[string]string),
	}

	for _, link := range tutor.SocialMediaLink {
		resp.SocialMediaLinks[link.Name] = link.Link
	}

	for i, review := range studentReviews {
		resp.TutorToStudentReview[i] = dto.AdminReview{
			ID:                review.ID,
			Name:              review.Tutor.User.Name,
			CourseTitle:       review.Course.Title,
			CourseDescription: review.Course.Description,
			Review:            review.Review,
			Rating:            review.Rate,
		}
	}

	for i, review := range tutorReviews {
		resp.StudentToTutorReview[i] = dto.AdminReview{
			ID:                 review.ID,
			Name:               review.Tutor.User.Name,
			CourseTitle:        review.Course.Title,
			CourseDescription:  review.Course.Description,
			Review:             review.Review,
			Rating:             review.Rate,
			RecommendByStudent: review.RecommendByStudent,
		}
	}

	return resp, nil
}

func (s *TutorService) CreateAdminTutor(ctx context.Context, req dto.CreateAdminTutorRequest) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to hash password")
		return err
	}

	role, err := s.role.GetByName(ctx, model.RoleNameTutor)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to get role")
		return err
	}

	if role == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to get role")
		return err
	}

	user := model.User{
		ID:          uuid.New(),
		Name:        req.Name,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		LoginSource: model.LoginSourceEmail,
		VerifiedAt:  null.TimeFrom(time.Now()),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		CreatedBy: uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		},
		UpdatedBy: uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		},
	}

	socialMediaLinks := make([]model.SocialMediaLink, 0)
	for name, link := range req.SocialMediaLinks {
		socialMediaLinks = append(socialMediaLinks, model.SocialMediaLink{
			Name: name,
			Link: link,
		})
	}

	dateOfBirth := null.Time{}
	if req.DateOfBirth.Valid {
		t, err := time.Parse(time.DateOnly, req.DateOfBirth.String)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to parse date of birth")
			return err
		}

		dateOfBirth = null.TimeFrom(t)
	}

	tutor := model.Tutor{
		ID:              uuid.New(),
		UserID:          user.ID,
		PhotoProfile:    req.PhotoProfile,
		Gender:          req.Gender,
		DateOfBirth:     dateOfBirth,
		PhoneNumber:     null.StringFrom(req.PhoneNumber),
		SocialMediaLink: socialMediaLinks,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		CreatedBy: uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		},
		UpdatedBy: uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		},
	}

	err = s.user.CreateWithRoleAndRecord(ctx, &user, role.ID, &tutor)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to create tutor")
		return err
	}

	return nil
}

func (s *TutorService) UpdateAdminTutor(ctx context.Context, req dto.UpdateAdminTutorRequest) error {
	tutor, err := s.tutor.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminTutor] Failed to get tutor")
		return err
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminTutor] Failed to get tutor")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	user := tutor.User

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminTutor] Failed to hash password")
			return err
		}

		user.Password = string(hashedPassword)
	}

	user.Name = req.Name
	user.Email = req.Email
	user.PhoneNumber = req.PhoneNumber
	user.UpdatedAt = time.Now()
	user.UpdatedBy = uuid.NullUUID{
		UUID:  middleware.GetUserID(ctx),
		Valid: true,
	}

	socialMediaLinks := make([]model.SocialMediaLink, 0)
	for name, link := range req.SocialMediaLinks {
		socialMediaLinks = append(socialMediaLinks, model.SocialMediaLink{
			Name: name,
			Link: link,
		})
	}

	dateOfBirth := null.Time{}
	if req.DateOfBirth.Valid {
		t, err := time.Parse(time.DateOnly, req.DateOfBirth.String)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutor] Failed to parse date of birth")
			return err
		}

		dateOfBirth = null.TimeFrom(t)
	}

	tutor.PhotoProfile = req.PhotoProfile
	tutor.Gender = req.Gender
	tutor.DateOfBirth = dateOfBirth
	tutor.PhoneNumber = null.StringFrom(req.PhoneNumber)
	tutor.SocialMediaLink = socialMediaLinks
	tutor.Latitude = req.Latitude
	tutor.Longitude = req.Longitude
	tutor.LevelPoint = req.LevelPoint
	tutor.UpdatedAt = time.Now()
	tutor.UpdatedBy = uuid.NullUUID{
		UUID:  middleware.GetUserID(ctx),
		Valid: true,
	}

	err = s.tutor.Update(ctx, tutor)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminTutor] Failed to update tutor")
		return err
	}

	err = s.user.Update(ctx, &user)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminTutor] Failed to update user")
		return err
	}

	return nil
}

func (s *TutorService) DeleteAdminTutor(ctx context.Context, req dto.DeleteAdminTutorRequest) error {
	tutors, _, err := s.tutor.Get(ctx, model.TutorFilter{
		IDs:           req.IDs,
		DeletedIsNull: null.BoolFrom(true),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteAdminTutor] Failed to get tutors")
		return err
	}

	if len(tutors) != len(req.IDs) {
		logger.WarnCtx(ctx).Msg("[DeleteAdminTutor] Failed to get tutors, length not equal")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	for _, tutor := range tutors {
		tutor.DeletedBy = uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		}
		tutor.DeletedAt = null.TimeFrom(time.Now())
		tutor.User.DeletedBy = uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		}
		tutor.User.DeletedAt = null.TimeFrom(time.Now())

		err = s.tutor.Delete(ctx, tutor)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[DeleteAdminTutor] Failed to delete student")
			return err
		}
	}

	return nil
}

func (s *TutorService) ChangeRoleAdminTutor(ctx context.Context, id uuid.UUID) error {
	tutor, err := s.tutor.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminTutor] Failed to get tutor")
		return err
	}

	if tutor == nil {
		logger.WarnCtx(ctx).Msg("[ChangeRoleAdminTutor] tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	tutor.DeletedBy = uuid.NullUUID{
		UUID:  middleware.GetUserID(ctx),
		Valid: true,
	}
	tutor.DeletedAt = null.TimeFrom(time.Now())

	students, _, err := s.student.Get(ctx, model.StudentFilter{
		UserID: tutor.UserID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminTutor] Failed to get tutor")
		return err
	}

	var student model.Student
	if len(students) == 0 {
		student = model.Student{
			ID:              uuid.New(),
			UserID:          tutor.UserID,
			Gender:          tutor.Gender,
			DateOfBirth:     tutor.DateOfBirth,
			PhoneNumber:     tutor.PhoneNumber,
			SocialMediaLink: tutor.SocialMediaLink,
			PhotoProfile:    tutor.PhotoProfile,
			Latitude:        tutor.Latitude,
			Longitude:       tutor.Longitude,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
			CreatedBy:       uuid.NullUUID{UUID: middleware.GetUserID(ctx), Valid: true},
			UpdatedBy:       uuid.NullUUID{UUID: middleware.GetUserID(ctx), Valid: true},
		}
	} else {
		student = students[0]
		student.DeletedBy = uuid.NullUUID{}
		student.DeletedAt = null.Time{}
	}

	role, err := s.role.GetByName(ctx, model.RoleNameStudent)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminTutor] Failed to get tutor")
		return err
	}

	if role == nil {
		logger.WarnCtx(ctx).Msg("[ChangeRoleAdminTutor] student not found")
		return shared.MakeError(ErrEntityNotFound, "role student")
	}

	userRole := &model.UserRole{
		UserID: tutor.UserID,
		RoleID: role.ID,
	}

	err = s.user.ChangeRole(ctx, &student, tutor, userRole)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminTutor] Failed to change role tutor to student")
		return err
	}

	return nil
}

func (s *TutorService) GetTutorCourses(ctx context.Context, tutorID uuid.UUID) ([]dto.AdminTutorCourse, error) {
	// Verify tutor exists
	tutor, err := s.tutor.GetByID(ctx, tutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourses] Error getting tutor")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[GetTutorCourses] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	// Get courses by tutor ID
	courses, _, err := s.course.Get(ctx, model.CourseFilter{
		TutorID: tutorID,
		Pagination: model.Pagination{
			PageSize: 6,
		},
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetTutorCourses] Error getting courses")
		return nil, shared.MakeError(ErrInternalServer)
	}

	// Transform to DTO
	resp := make([]dto.AdminTutorCourse, len(courses))
	for i, course := range courses {
		resp[i] = dto.AdminTutorCourse{
			ID:     course.ID,
			Title:  course.Title,
			Status: string(course.Status),
		}
	}

	return resp, nil
}
