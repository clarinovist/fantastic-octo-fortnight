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

type StudentService struct {
	student *repositories.StudentRepository
	tutor   *repositories.TutorRepository
	review  *repositories.ReviewRepository
	role    *repositories.RoleRepository
	user    *repositories.UserRepository
}

func NewStudentService(
	student *repositories.StudentRepository,
	tutor *repositories.TutorRepository,
	review *repositories.ReviewRepository,
	role *repositories.RoleRepository,
	user *repositories.UserRepository,
) *StudentService {
	return &StudentService{
		student: student,
		tutor:   tutor,
		review:  review,
		role:    role,
		user:    user,
	}
}

func (s *StudentService) GetAdminStudents(ctx context.Context, req dto.GetAdminStudentsRequest) (dto.GetAdminStudentsResponse, error) {
	var (
		createdAtFrom time.Time
		createdAtTo   time.Time
		err           error
	)
	if req.CreatedAtFrom != "" {
		createdAtFrom, err = time.Parse(time.DateOnly, req.CreatedAtFrom)
		if err != nil {
			return dto.GetAdminStudentsResponse{}, err
		}
	}

	if req.CreatedAtTo != "" {
		createdAtTo, err = time.Parse(time.DateOnly, req.CreatedAtTo)
		if err != nil {
			return dto.GetAdminStudentsResponse{}, err
		}
	}

	students, metadata, err := s.student.Get(ctx, model.StudentFilter{
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
		return dto.GetAdminStudentsResponse{}, err
	}

	resp := dto.GetAdminStudentsResponse{
		Data:     make([]dto.AdminStudent, len(students)),
		Metadata: metadata,
	}
	for i, student := range students {
		premium := "Non Active"
		if student.PremiumUntil.Valid && student.PremiumUntil.Time.After(time.Now()) {
			premium = "Active"
		}
		resp.Data[i] = dto.AdminStudent{
			ID:                  student.ID,
			UserID:              student.UserID,
			Name:                student.User.Name,
			PhoneNumber:         student.User.PhoneNumber,
			Email:               student.User.Email,
			PremiumSubscription: premium,
			CreatedAt:           student.CreatedAt,
			UpdatedAt:           student.UpdatedAt,
		}
	}

	return resp, nil
}

func (s *StudentService) GetAdminDetailStudent(ctx context.Context, id uuid.UUID) (dto.AdminDetailStudent, error) {
	student, err := s.student.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("student_id", id.String()).Msg("[GetAdminDetailStudent] Failed to get student by id")
		return dto.AdminDetailStudent{}, err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Str("student_id", id.String()).Msg("[GetAdminDetailStudent] Student not found")
		return dto.AdminDetailStudent{}, nil
	}

	studentReviews, _, err := s.review.GetStudentReviews(ctx, model.ReviewFilter{
		StudentID:       student.ID,
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
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailStudent] Failed to get student reviews")
		return dto.AdminDetailStudent{}, err
	}

	ratingStudent, err := s.review.GetTotalRatingStudent(ctx, student.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailStudent] Failed to get student rating student")
		return dto.AdminDetailStudent{}, err
	}

	tutorReviews, _, err := s.review.GetTutorReviews(ctx, model.ReviewFilter{
		StudentID:       student.ID,
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
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminDetailStudent] Failed to get tutor reviews")
		return dto.AdminDetailStudent{}, err
	}

	resp := dto.AdminDetailStudent{
		ID:                   student.ID,
		Name:                 student.User.Name,
		Email:                student.User.Email,
		Gender:               student.Gender,
		DateOfBirth:          student.DateOfBirth,
		PhoneNumber:          student.User.PhoneNumber,
		Latitude:             student.Latitude,
		Longitude:            student.Longitude,
		PhotoProfile:         student.PhotoProfile,
		Rating:               ratingStudent,
		PremiumUntil:         student.PremiumUntil,
		TutorToStudentReview: make([]dto.AdminReview, len(studentReviews)),
		StudentToTutorReview: make([]dto.AdminReview, len(tutorReviews)),
		SocialMediaLinks:     make(map[string]string),
	}

	for _, link := range student.SocialMediaLink {
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
			Name:               review.Student.User.Name,
			CourseTitle:        review.Course.Title,
			CourseDescription:  review.Course.Description,
			Review:             review.Review,
			Rating:             review.Rate,
			RecommendByStudent: review.RecommendByStudent,
		}
	}

	return resp, nil
}

func (s *StudentService) CreateAdminStudent(ctx context.Context, req dto.CreateAdminStudentRequest) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to hash password")
		return err
	}

	role, err := s.role.GetByName(ctx, model.RoleNameStudent)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to get role")
		return err
	}

	if role == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to get role")
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
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to parse date of birth")
			return err
		}

		dateOfBirth = null.TimeFrom(t)
	}

	student := model.Student{
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

	err = s.user.CreateWithRoleAndRecord(ctx, &user, role.ID, &student)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to create student")
		return err
	}

	return nil
}

func (s *StudentService) UpdateAdminStudent(ctx context.Context, req dto.UpdateAdminStudentRequest) error {
	student, err := s.student.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to get student")
		return err
	}

	if student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to get student")
		return shared.MakeError(ErrEntityNotFound, "student")
	}

	user := student.User

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to hash password")
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
			logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminStudent] Failed to parse date of birth")
			return err
		}

		dateOfBirth = null.TimeFrom(t)
	}

	premiumUntil := null.Time{}
	if req.PremiumUntil.Valid {
		t, err := time.Parse(time.DateOnly, req.PremiumUntil.String)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to parse premium until")
			return err
		}

		t = time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 0, time.Local)
		premiumUntil = null.TimeFrom(t)
	}

	student.PhotoProfile = req.PhotoProfile
	student.Gender = req.Gender
	student.DateOfBirth = dateOfBirth
	student.PhoneNumber = null.StringFrom(req.PhoneNumber)
	student.SocialMediaLink = socialMediaLinks
	student.Latitude = req.Latitude
	student.Longitude = req.Longitude
	student.PremiumUntil = premiumUntil
	student.UpdatedAt = time.Now()
	student.UpdatedBy = uuid.NullUUID{
		UUID:  middleware.GetUserID(ctx),
		Valid: true,
	}

	err = s.student.Update(ctx, student)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to update student")
		return err
	}

	err = s.user.Update(ctx, &user)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateAdminStudent] Failed to update user")
		return err
	}

	return nil
}

func (s *StudentService) DeleteAdminStudent(ctx context.Context, req dto.DeleteAdminStudentRequest) error {
	students, _, err := s.student.Get(ctx, model.StudentFilter{
		IDs:           req.IDs,
		DeletedIsNull: null.BoolFrom(true),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteAdminStudent] Failed to get students")
		return err
	}

	if len(students) != len(req.IDs) {
		logger.WarnCtx(ctx).Msg("[DeleteAdminStudent] Failed to get students, length not equal")
		return shared.MakeError(ErrEntityNotFound, "student")
	}

	for _, student := range students {
		student.DeletedBy = uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		}
		student.DeletedAt = null.TimeFrom(time.Now())
		student.User.DeletedBy = uuid.NullUUID{
			UUID:  middleware.GetUserID(ctx),
			Valid: true,
		}
		student.User.DeletedAt = null.TimeFrom(time.Now())

		err = s.student.Delete(ctx, student)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[DeleteAdminStudent] Failed to delete student")
			return err
		}
	}

	return nil
}

func (s *StudentService) ChangeRoleAdminStudent(ctx context.Context, id uuid.UUID) error {
	student, err := s.student.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminStudent] Failed to get student")
		return err
	}

	if student == nil {
		logger.WarnCtx(ctx).Msg("[ChangeRoleAdminStudent] student not found")
		return shared.MakeError(ErrEntityNotFound, "student")
	}

	student.DeletedBy = uuid.NullUUID{
		UUID:  middleware.GetUserID(ctx),
		Valid: true,
	}
	student.DeletedAt = null.TimeFrom(time.Now())

	tutors, _, err := s.tutor.Get(ctx, model.TutorFilter{
		UserID: student.UserID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminStudent] Failed to get tutor")
		return err
	}

	var tutor model.Tutor
	if len(tutors) == 0 {
		tutor = model.Tutor{
			ID:              uuid.New(),
			UserID:          student.UserID,
			Gender:          student.Gender,
			DateOfBirth:     student.DateOfBirth,
			PhoneNumber:     student.PhoneNumber,
			SocialMediaLink: student.SocialMediaLink,
			PhotoProfile:    student.PhotoProfile,
			Latitude:        student.Latitude,
			Longitude:       student.Longitude,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
			CreatedBy:       uuid.NullUUID{UUID: middleware.GetUserID(ctx), Valid: true},
			UpdatedBy:       uuid.NullUUID{UUID: middleware.GetUserID(ctx), Valid: true},
		}
	} else {
		tutor = tutors[0]
		tutor.DeletedBy = uuid.NullUUID{}
		tutor.DeletedAt = null.Time{}
	}

	role, err := s.role.GetByName(ctx, model.RoleNameTutor)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminStudent] Failed to get tutor")
		return err
	}

	if role == nil {
		logger.WarnCtx(ctx).Msg("[ChangeRoleAdminStudent] tutor not found")
		return shared.MakeError(ErrEntityNotFound, "role tutor")
	}

	userRole := &model.UserRole{
		UserID: student.UserID,
		RoleID: role.ID,
	}

	err = s.user.ChangeRole(ctx, student, &tutor, userRole)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ChangeRoleAdminStudent] Failed to change role student to tutor")
		return err
	}

	return nil
}
