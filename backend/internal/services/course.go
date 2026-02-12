package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
	"googlemaps.github.io/maps"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type CourseService struct {
	config            *config.Config
	course            *repositories.CourseRepository
	user              *repositories.UserRepository
	courseCategory    *repositories.CourseCategoryRepository
	subCourseCategory *repositories.SubCourseCategoryRepository
	tutor             *repositories.TutorRepository
	location          *repositories.LocationRepository
	booking           *repositories.BookingRepository
	student           *repositories.StudentRepository
	courseDraft       *CourseDraftService
	maps              *maps.Client
	redis             *infras.Redis
}

func NewCourseService(
	c *config.Config,
	course *repositories.CourseRepository,
	courseCategory *repositories.CourseCategoryRepository,
	subCourseCategory *repositories.SubCourseCategoryRepository,
	tutor *repositories.TutorRepository,
	location *repositories.LocationRepository,
	user *repositories.UserRepository,
	booking *repositories.BookingRepository,
	student *repositories.StudentRepository,
	courseDraft *CourseDraftService,
	maps *maps.Client,
	redis *infras.Redis,
) *CourseService {
	return &CourseService{
		config:            c,
		course:            course,
		courseCategory:    courseCategory,
		subCourseCategory: subCourseCategory,
		tutor:             tutor,
		location:          location,
		user:              user,
		booking:           booking,
		student:           student,
		courseDraft:       courseDraft,
		maps:              maps,
		redis:             redis,
	}
}

func (s *CourseService) GetCourses(ctx context.Context, request dto.GetCoursesRequest) ([]model.Course, model.Metadata, error) {
	if request.LocationID != uuid.Nil {
		location, err := s.getLatLongByLocationID(ctx, request.LocationID)
		if err != nil {
			return nil, model.Metadata{}, err
		}

		if !location.Latitude.IsZero() && !location.Longitude.IsZero() {
			request.LocationID = uuid.Nil
			request.Latitude = location.Latitude
			request.Longitude = location.Longitude
			if request.Radius == 0 {
				request.Radius = s.config.Location.DefaultRadius
			}
		}
	}

	filter := request.Filter()
	courses, metadata, err := s.course.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error getting courses")
		return nil, model.Metadata{}, err
	}

	courseIDs := []uuid.UUID{}
	for i, course := range courses {
		courseIDs = append(courseIDs, course.ID)

		total := int64(0)
		for _, review := range course.TutorReviews {
			total += review.Rate.Int64
		}

		if total > 0 {
			courses[i].Rating = decimal.NewFromFloat(float64(total) / float64(len(course.TutorReviews)))
		}

		if !course.Tutor.Latitude.Valid || !course.Tutor.Longitude.Valid {
			continue
		}

		location, err := s.GetLocationByLatLong(ctx, course.Tutor.Latitude.Decimal, course.Tutor.Longitude.Decimal)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error getting location")
			continue
		}

		courses[i].Tutor.Location = location
	}

	userID := middleware.GetUserID(ctx)
	if userID != uuid.Nil {
		student, err := s.student.GetByUserID(ctx, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error getting user")
			return nil, model.Metadata{}, err
		}

		if student == nil {
			goto ReturnResponse
		}

		bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
			StudentID: student.ID,
			CourseIDs: courseIDs,
			StatusIn:  []model.BookingStatus{model.BookingStatusPending},
		})
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error getting bookings")
			return nil, model.Metadata{}, err
		}

		mapBookingStudent := map[uuid.UUID]struct{}{}
		for _, booking := range bookings {
			mapBookingStudent[booking.CourseID] = struct{}{}
		}

		for i, course := range courses {
			if _, ok := mapBookingStudent[course.ID]; ok {
				courses[i].IsBooked = true
			}
		}
	}

ReturnResponse:
	// Deduplicate courses by tutor ID - keep only the first course per tutor
	seenTutors := make(map[uuid.UUID]bool)
	uniqueCourses := []model.Course{}
	
	for _, course := range courses {
		if !seenTutors[course.TutorID] {
			seenTutors[course.TutorID] = true
			uniqueCourses = append(uniqueCourses, course)
		}
	}
	
	// Update metadata to reflect the actual count after deduplication
	metadata.Total = int64(len(uniqueCourses))
	
	return uniqueCourses, metadata, nil
}

func (s *CourseService) GetLocationByLatLong(ctx context.Context, latitude, longitude decimal.Decimal) (model.Location, error) {
	key := model.BuildCacheKey(model.LocationLatLongKey, latitude.Round(6).String(), longitude.Round(6).String())
	var location model.Location

	err := s.redis.Client.Get(ctx, key).Scan(&location)
	if err == nil {
		return location, nil
	}

	req := &maps.GeocodingRequest{
		LatLng: &maps.LatLng{
			Lat: float64(latitude.InexactFloat64()),
			Lng: float64(longitude.InexactFloat64()),
		},
	}
	resp, err := s.maps.ReverseGeocode(ctx, req)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[getLocationByLatLong] Error reverse geocoding")
		return model.Location{}, err
	}

	if len(resp) == 0 {
		return model.Location{}, nil
	}

	for _, component := range resp[0].AddressComponents {
		if component.Types[0] == "locality" {
			location.FullName = component.LongName
			break
		}

		if component.Types[0] == "administrative_area_level_2" {
			location.FullName = component.LongName
			break
		}

		if component.Types[0] == "country" {
			location.FullName = component.LongName
			break
		}
	}

	go func() {
		err = s.redis.Client.Set(ctx, key, location, time.Hour*24*14).Err()
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[getLocationByLatLong] Error setting location to redis")
		}
	}()

	return location, nil
}

func (s *CourseService) getLatLongByLocationID(ctx context.Context, locationID uuid.UUID) (model.LatLongLocationCache, error) {
	var latLong model.LatLongLocationCache

	key := model.BuildCacheKey(model.LocationKey, locationID.String())
	err := s.redis.Client.Get(ctx, key).Scan(&latLong)
	if err == nil {
		return latLong, nil
	}

	locations, _, err := s.location.Get(ctx, model.LocationFilter{
		ID: locationID,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error getting location")
		return latLong, err
	}

	if len(locations) == 0 {
		return latLong, shared.MakeError(ErrEntityNotFound, "location")
	}

	resp, err := s.maps.Geocode(ctx, &maps.GeocodingRequest{
		Address: locations[0].FullName,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error geocoding")
		return latLong, err
	}

	if len(resp) == 0 {
		return latLong, nil
	}

	latLong = model.LatLongLocationCache{
		Latitude:  decimal.NewFromFloat(resp[0].Geometry.Location.Lat),
		Longitude: decimal.NewFromFloat(resp[0].Geometry.Location.Lng),
	}

	go func() {
		err = s.redis.Client.Set(ctx, key, latLong, time.Hour*24*14).Err()
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetCourses] Error setting lat long to redis")
		}
	}()

	return latLong, nil
}

func (s *CourseService) GetCourse(ctx context.Context, id uuid.UUID) (model.Course, error) {
	filter := model.CourseFilter{
		ID:          id,
		IsPublished: null.BoolFrom(true),
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 1,
		},
	}
	courses, _, err := s.course.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error getting course")
		return model.Course{}, err
	}

	if len(courses) == 0 {
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	total := int64(0)
	for _, review := range courses[0].TutorReviews {
		total += review.Rate.Int64
	}

	if total > 0 {
		courses[0].Rating = decimal.NewFromFloat(float64(total) / float64(len(courses[0].TutorReviews)))
	}

	relatedCourse, _, err := s.course.Get(ctx, model.CourseFilter{
		TutorID:     courses[0].TutorID,
		IsPublished: null.BoolFrom(true),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error getting related course")
		return model.Course{}, err
	}

	totalStudentEnrollment, err := s.course.CountStudentByCourseID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error counting student enrollment")
		return model.Course{}, err
	}

	location, err := s.GetLocationByLatLong(ctx, courses[0].Tutor.Latitude.Decimal, courses[0].Tutor.Longitude.Decimal)
	if err != nil {
		location = model.Location{}
	}

	courses[0].Tutor.Location = location
	courses[0].TotalStudentEnrollment = totalStudentEnrollment
	courses[0].RelatedCourses = relatedCourse

	userID := middleware.GetUserID(ctx)
	if userID != uuid.Nil {
		student, err := s.student.GetByUserID(ctx, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetDetailCourse] Error getting user")
			return model.Course{}, err
		}

		if student == nil {
			goto ReturnResponse
		}

		bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
			StudentID: student.ID,
			CourseID:  courses[0].ID,
			StatusIn:  []model.BookingStatus{model.BookingStatusPending},
		})
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[GetDetailCourse] Error getting bookings")
			return model.Course{}, err
		}

		if len(bookings) == 0 {
			goto ReturnResponse
		}

		courses[0].IsBooked = true
	}

ReturnResponse:
	return courses[0], nil
}

func (s *CourseService) GetBookingCourse(ctx context.Context, request dto.GetBookingCourseRequest) ([]model.CourseSchedule, []model.Booking, error) {
	course, err := s.course.GetByID(ctx, request.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetBookingCourse] Error getting course")
		return nil, nil, err
	}

	if course == nil {
		logger.WarnCtx(ctx).Str("course_id", request.ID.String()).Msg("[GetBookingCourse] Course not found")
		return nil, nil, shared.MakeError(ErrEntityNotFound, "course")
	}

	if !course.IsPublished.Bool {
		logger.WarnCtx(ctx).Str("course_id", request.ID.String()).Msg("[GetBookingCourse] Course is not published")
		return nil, nil, shared.MakeError(ErrEntityNotFound, "course")
	}

	bookings, _, err := s.booking.Get(ctx, model.BookingFilter{
		CourseID: course.ID,
		BookingDateBetween: []string{
			request.StartDate,
			request.EndDate,
		},
		StatusNot: model.BookingStatusDeclined,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetBookingCourse] Error getting bookings")
		return nil, nil, err
	}

	return course.CourseSchedules, bookings, nil
}

func (s *CourseService) GetRelatedCourse(ctx context.Context, request dto.GetCoursesRequest) ([]model.Course, model.Metadata, error) {
	filter := model.CourseFilter{
		ID:          request.ID,
		IsPublished: null.BoolFrom(true),
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 1,
		},
	}
	courses, _, err := s.course.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetRelatedCourse] Error getting course")
		return []model.Course{}, model.Metadata{}, err
	}

	if len(courses) == 0 {
		return []model.Course{}, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	course := courses[0]

	filter = model.CourseFilter{
		NotID:            request.ID,
		CourseCategoryID: course.CourseCategoryID,
		LocationID:       course.Tutor.LocationID.UUID,
		IsPublished:      null.BoolFrom(true),
	}
	courses, metadata, err := s.course.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetRelatedCourse] Error getting courses")
		return nil, model.Metadata{}, err
	}

	return courses, metadata, nil
}

func (s *CourseService) CreateCourse(ctx context.Context, req dto.TutorCourseRequest) (model.Course, error) {
	userID := req.UserID
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", userID.String()).
			Msg("[CreateCourse] Tutor not found for user")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", userID.String()).Msg("[CreateCourse] Tutor not found for user")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	// Validate course category exists
	_, err = s.courseCategory.GetByID(ctx, req.CourseCategoryID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_category_id", req.CourseCategoryID.String()).
			Msg("[CreateCourse] Course category not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course category")
	}

	subCategoryIDs := make([]uuid.UUID, len(req.SubCategoryID))
	for i, subCatIDStr := range req.SubCategoryID {
		subCatID, err := uuid.Parse(subCatIDStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("sub_category_id", subCatIDStr).
				Msg("[CreateCourse] Invalid sub category ID format")
			return model.Course{}, shared.MakeError(ErrBadRequest, "invalid sub category ID format")
		}
		subCategoryIDs[i] = subCatID
	}

	subCategories := make([]model.SubCourseCategory, 0)
	if len(subCategoryIDs) > 0 {
		items, err := s.subCourseCategory.GetByIDs(ctx, subCategoryIDs)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Msg("[CreateCourse] Error validating sub course categories")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to validate sub course categories")
		}

		if len(items) != len(subCategoryIDs) {
			logger.ErrorCtx(ctx).
				Int("requested_count", len(subCategoryIDs)).
				Int("found_count", len(subCategories)).
				Msg("[CreateCourse] Some sub course categories not found")
			return model.Course{}, shared.MakeError(ErrEntityNotFound, "one or more sub course categories")
		}

		subCategories = items
	}

	course := req.CreateCourse(subCategories, tutor.ID)
	courseData, err := json.Marshal(course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourse] Error serializing course data")
		return model.Course{}, fmt.Errorf("failed to serialize course data: %w", err)
	}

	// Create new draft
	course.Draft = &model.CourseDraft{
		CourseID:  course.ID,
		DraftData: courseData,
		DraftType: model.DraftTypeCreate,
		Status:    model.DraftStatusDraft,
		CreatedBy: userID,
		UpdatedBy: uuid.NullUUID{UUID: userID, Valid: true},
	}

	err = s.course.CreateCourse(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourse] Error creating course with relationships")
		return model.Course{}, err
	}

	createdCourse, err := s.course.GetByID(ctx, course.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourse] Error fetching created course")
		return model.Course{}, err
	}

	if createdCourse == nil {
		logger.WarnCtx(ctx).Str("course_id", course.ID.String()).Msg("[CreateCourse] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	logger.InfoCtx(ctx).
		Str("course_id", course.ID.String()).
		Str("title", course.Title).
		Str("user_id", userID.String()).
		Str("tutor_id", tutor.ID.String()).
		Msg("[CreateCourse] Course created successfully")

	return *createdCourse, nil
}

func (s *CourseService) ListCoursesForTutor(ctx context.Context, req dto.ListTutorCoursesRequest) ([]model.Course, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, req.UserID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("user_id", req.UserID.String()).
			Msg("[ListCoursesForTutor] error getting tutor")
		return nil, model.Metadata{}, err
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", req.UserID.String()).Msg("[ListCoursesForTutor] tutor not found")
		return nil, model.Metadata{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	courses, metadata, err := s.course.GetTutorCourse(ctx, model.CourseFilter{
		TutorID:         tutor.ID,
		DeletedAtIsNull: null.BoolFrom(true),
		Pagination:      req.Pagination,
		Sort:            req.Sort,
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", tutor.ID.String()).
			Msg("[ListCoursesForTutor] Error getting courses with draft info for tutor")
		return nil, model.Metadata{}, err
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", tutor.ID.String()).
		Int("count", len(courses)).
		Int64("total", metadata.Total).
		Msg("[ListCoursesForTutor] Retrieved courses with draft info for tutor successfully")

	return courses, metadata, nil
}

func (s *CourseService) UpdateCourse(ctx context.Context, req dto.TutorCourseRequest) (model.Course, error) {
	courseID := req.ID
	userID := req.UserID

	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[UpdateCourse] Error getting course")
		return model.Course{}, err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[UpdateCourse] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	_, err = s.courseCategory.GetByID(ctx, req.CourseCategoryID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_category_id", req.CourseCategoryID.String()).
			Msg("[UpdateCourse] Course category not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course category")
	}

	subCategoryIDs := make([]uuid.UUID, len(req.SubCategoryID))
	for i, subCatIDStr := range req.SubCategoryID {
		subCatID, err := uuid.Parse(subCatIDStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("sub_category_id", subCatIDStr).
				Msg("[CreateCourse] Invalid sub category ID format")
			return model.Course{}, shared.MakeError(ErrBadRequest, "invalid sub category ID format")
		}
		subCategoryIDs[i] = subCatID
	}

	subCategories := make([]model.SubCourseCategory, 0)
	if len(subCategoryIDs) > 0 {
		subCategories, err = s.subCourseCategory.GetByIDs(ctx, subCategoryIDs)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Msg("[CreateCourse] Error validating sub course categories")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to validate sub course categories")
		}

		if len(subCategories) != len(subCategoryIDs) {
			logger.ErrorCtx(ctx).
				Int("requested_count", len(subCategoryIDs)).
				Int("found_count", len(subCategories)).
				Msg("[CreateCourse] Some sub course categories not found")
			return model.Course{}, shared.MakeError(ErrEntityNotFound, "one or more sub course categories not found")
		}
	}

	req.UpdateCourse(course, subCategories)
	draftData, err := json.Marshal(course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateCourse] Error marshaling draft data")
		return model.Course{}, fmt.Errorf("failed to process update data: %w", err)
	}

	var draft *model.CourseDraft
	var isNewDraft bool

	if course.Draft != nil {
		logger.InfoCtx(ctx).
			Str("course_id", courseID.String()).
			Str("course_status", string(course.Status)).
			Msg("[UpdateCourse] Course is in Draft status, updating existing draft")

		draft, err = s.courseDraft.UpdateDraft(ctx, courseID, draftData, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("course_id", courseID.String()).
				Msg("[UpdateCourse] Error updating existing draft")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to update existing draft")
		}

		isNewDraft = false
	} else {
		logger.InfoCtx(ctx).
			Str("course_id", courseID.String()).
			Str("course_status", string(course.Status)).
			Msg("[UpdateCourse] Course is not in Draft status, creating new draft")

		draft, err = s.courseDraft.CreateDraft(ctx, courseID, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("course_id", courseID.String()).
				Msg("[UpdateCourse] Error creating new draft")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to create new draft")
		}

		draft, err = s.courseDraft.UpdateDraft(ctx, courseID, draftData, userID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("course_id", courseID.String()).
				Str("draft_id", draft.ID.String()).
				Msg("[UpdateCourse] Error updating newly created draft")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to update newly created draft")
		}
		isNewDraft = true
	}

	err = s.course.UpdateStatus(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Msg("[UpdateCourse] Error updating course status")
		return model.Course{}, shared.MakeError(ErrInternalServer, "failed to update course status")
	}

	logger.InfoCtx(ctx).
		Str("course_id", courseID.String()).
		Str("draft_id", draft.ID.String()).
		Str("user_id", userID.String()).
		Bool("is_new_draft", isNewDraft).
		Msg("[UpdateCourse] Course update completed successfully")

	return *course, nil
}

func (s *CourseService) GetCoursesForTutor(ctx context.Context, req dto.GetTutorCourseRequest) (model.Course, error) {
	tutor, err := s.tutor.GetByUserID(ctx, req.UserID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("user_id", req.UserID.String()).Msg("[GetCoursesForTutor] Error getting tutor")
		return model.Course{}, err
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", req.UserID.String()).Msg("[GetCoursesForTutor] Tutor not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	course, err := s.course.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", req.ID.String()).Msg("[GetCoursesForTutor] Error getting course")
		return model.Course{}, err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", req.ID.String()).Msg("[GetCoursesForTutor] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.TutorID != tutor.ID {
		logger.InfoCtx(ctx).Str("course_id", req.ID.String()).Str("tutor_id", tutor.ID.String()).Msg("[GetCoursesForTutor] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	return *course, nil
}

func (s *CourseService) SubmitCourseForReview(ctx context.Context, courseID uuid.UUID, userID uuid.UUID) error {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("user_id", userID.String()).Msg("[SubmitCourseForReview] Error getting tutor")
		return err
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", userID.String()).Msg("[SubmitCourseForReview] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[SubmitCourseForReview] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[SubmitCourseForReview] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.TutorID != tutor.ID {
		logger.WarnCtx(ctx).
			Str("course_id", courseID.String()).
			Str("tutor_id", tutor.ID.String()).
			Str("course_tutor_id", course.TutorID.String()).
			Msg("[SubmitCourseForReview] Course ownership verification failed")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.Status != model.CourseStatusDraft {
		logger.WarnCtx(ctx).
			Str("course_id", courseID.String()).
			Str("current_status", string(course.Status)).
			Msg("[SubmitCourseForReview] Course cannot be submitted in current status")
		return shared.MakeError(ErrInternalServer)
	}

	course.Status = model.CourseStatusWaitingForApproval
	course.UpdatedAt = time.Now()
	course.UpdatedBy = uuid.NullUUID{
		UUID:  userID,
		Valid: true,
	}
	err = s.course.UpdateStatus(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[SubmitCourseForReview] Error updating course status")
		return shared.MakeError(ErrInternalServer)
	}

	_, err = s.courseDraft.SubmitForApproval(ctx, courseID, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[SubmitCourseForReview] Error submitting draft for approval")
		return shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("course_id", courseID.String()).
		Str("user_id", userID.String()).
		Str("tutor_id", tutor.ID.String()).
		Msg("[SubmitCourseForReview] Course submitted for review successfully")

	return nil
}

func (s *CourseService) ApproveCourse(ctx context.Context, req dto.ApproveCourseRequest) error {
	userId := middleware.GetUserID(ctx)
	course, err := s.course.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", req.ID.String()).Msg("[ApproveCourse] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", req.ID.String()).Msg("[ApproveCourse] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.Status != model.CourseStatusWaitingForApproval {
		logger.WarnCtx(ctx).
			Str("course_id", req.ID.String()).
			Str("current_status", string(course.Status)).
			Msg("[ApproveCourse] Course cannot be approved in current status")
		return shared.MakeError(ErrBadRequest, "can accept only 'waiting for approval' course")
	}

	if course.Draft == nil {
		logger.WarnCtx(ctx).Str("course_id", req.ID.String()).Msg("[ApproveCourse] Course has no draft")
		return shared.MakeError(ErrBadRequest, "course has no draft")
	}

	var draft *model.CourseDraft
	draft = course.Draft
	draft.Status = model.DraftStatusApproved
	draft.UpdatedAt = time.Now()
	draft.UpdatedBy = uuid.NullUUID{
		UUID:  userId,
		Valid: true,
	}

	var newCourse model.Course
	err = json.Unmarshal([]byte(course.Draft.DraftData), &newCourse)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", req.ID.String()).Msg("[ApproveCourse] Error unmarshalling course content")
		return shared.MakeError(ErrInternalServer)
	}

	course.FillFromDraft(newCourse)
	course.Status = model.CourseStatusAccepted
	course.StatusNotes = req.ReviewNotes
	course.UpdatedAt = time.Now()
	course.UpdatedBy = uuid.NullUUID{
		UUID:  userId,
		Valid: true,
	}

	err = s.course.ApproveCourse(ctx, course, draft)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", req.ID.String()).
			Str("user_id", userId.String()).
			Msg("[ApproveCourse] Error updating course status")
		return shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("course_id", req.ID.String()).
		Str("user_id", userId.String()).
		Msg("[ApproveCourse] Course approved successfully")
	return nil
}

func (s *CourseService) RejectCourse(ctx context.Context, req dto.RejectCourseRequest) error {
	userId := middleware.GetUserID(ctx)
	course, err := s.course.GetByID(ctx, req.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", req.ID.String()).Msg("[RejectCourse] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", req.ID.String()).Msg("[RejectCourse] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.Status != model.CourseStatusWaitingForApproval {
		logger.WarnCtx(ctx).
			Str("course_id", req.ID.String()).
			Str("current_status", string(course.Status)).
			Msg("[RejectCourse] Course cannot be approved in current status")
		return shared.MakeError(ErrBadRequest, "can reject only 'waiting for approval' course")
	}

	course.Status = model.CourseStatusRejected
	course.StatusNotes = null.StringFrom(req.ReviewNotes)
	course.UpdatedAt = time.Now()
	course.UpdatedBy = uuid.NullUUID{
		UUID:  userId,
		Valid: true,
	}

	if course.Draft != nil {
		course.Draft.Status = model.DraftStatusRejected
		course.Draft.UpdatedAt = time.Now()
		course.Draft.UpdatedBy = uuid.NullUUID{
			UUID:  userId,
			Valid: true,
		}
	}

	err = s.course.UpdateStatus(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", req.ID.String()).
			Str("user_id", userId.String()).
			Msg("[RejectCourse] Error updating course status")
		return shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("course_id", req.ID.String()).
		Str("user_id", userId.String()).
		Msg("[RejectCourse] Course rejected successfully")

	return nil
}

func (s *CourseService) DeleteCourse(ctx context.Context, courseID uuid.UUID) error {
	userID := middleware.GetUserID(ctx)
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("user_id", userID.String()).Msg("[DeleteCourse] Error getting tutor")
		return err
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", userID.String()).Msg("[DeleteCourse] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[DeleteCourse] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[DeleteCourse] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.TutorID != tutor.ID {
		logger.WarnCtx(ctx).
			Str("course_id", courseID.String()).
			Str("tutor_id", tutor.ID.String()).
			Str("course_tutor_id", course.TutorID.String()).
			Msg("[DeleteCourse] Course ownership verification failed")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	course.DeletedAt = null.TimeFrom(time.Now())
	course.DeletedBy = uuid.NullUUID{
		UUID:  userID,
		Valid: true,
	}

	err = s.course.Update(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[DeleteCourse] Error updating course")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *CourseService) PublishCourse(ctx context.Context, req dto.PublishTutorCourseRequest) error {
	userID := middleware.GetUserID(ctx)
	courseID := req.ID
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("user_id", userID.String()).Msg("[PublishCourse] Error getting tutor")
		return err
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("user_id", userID.String()).Msg("[PublishCourse] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[PublishCourse] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[PublishCourse] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.TutorID != tutor.ID {
		logger.WarnCtx(ctx).
			Str("course_id", courseID.String()).
			Str("tutor_id", tutor.ID.String()).
			Str("course_tutor_id", course.TutorID.String()).
			Msg("[PublishCourse] Course ownership verification failed")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	if course.Status != model.CourseStatusAccepted && req.IsPublished {
		logger.WarnCtx(ctx).
			Str("course_id", courseID.String()).
			Str("current_status", string(course.Status)).
			Msg("[PublishCourse] Course cannot be publish in current status")
		return shared.MakeError(ErrInternalServer)
	}

	course.IsPublished = null.BoolFrom(req.IsPublished)
	course.UpdatedAt = time.Now()
	course.UpdatedBy = uuid.NullUUID{
		UUID:  userID,
		Valid: true,
	}

	err = s.course.Update(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("user_id", userID.String()).
			Msg("[PublishCourse] Error updating course")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

// GetCoursesForAdmin gets all courses for admin with tutor information
func (s *CourseService) GetCoursesForAdmin(ctx context.Context, req dto.AdminGetCoursesRequest) ([]model.Course, model.Metadata, error) {
	filter := model.CourseFilter{
		ClassType:       req.ClassType,
		FreeFirstCourse: req.IsFreeFirstCourse,
		Status:          req.Status,
		Pagination:      req.Pagination,
		Sort:            req.Sort,
	}

	courses, metadata, err := s.course.GetForAdmin(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCoursesForAdmin] Error getting courses")
		return nil, model.Metadata{}, err
	}

	logger.InfoCtx(ctx).
		Int("count", len(courses)).
		Int64("total", metadata.Total).
		Msg("[GetCoursesForAdmin] Retrieved courses for admin successfully")

	return courses, metadata, nil
}

// GetCourseDetailForAdmin gets course detail for admin
func (s *CourseService) GetCourseDetailForAdmin(ctx context.Context, id uuid.UUID) (model.Course, error) {
	filter := model.CourseFilter{
		ID: id,
		Pagination: model.Pagination{
			Page:     1,
			PageSize: 1,
		},
	}
	courses, _, err := s.course.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error getting course")
		return model.Course{}, err
	}

	if len(courses) == 0 {
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	total := int64(0)
	for _, review := range courses[0].TutorReviews {
		total += review.Rate.Int64
	}

	if total > 0 {
		courses[0].Rating = decimal.NewFromFloat(float64(total) / float64(len(courses[0].TutorReviews)))
	}

	relatedCourse, _, err := s.course.Get(ctx, model.CourseFilter{
		TutorID:     courses[0].TutorID,
		IsPublished: null.BoolFrom(true),
	})
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error getting related course")
		return model.Course{}, err
	}

	totalStudentEnrollment, err := s.course.CountStudentByCourseID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetCourse] Error counting student enrollment")
		return model.Course{}, err
	}

	location, err := s.GetLocationByLatLong(ctx, courses[0].Tutor.Latitude.Decimal, courses[0].Tutor.Longitude.Decimal)
	if err != nil {
		location = model.Location{}
	}

	courses[0].Tutor.Location = location
	courses[0].TotalStudentEnrollment = totalStudentEnrollment
	courses[0].RelatedCourses = relatedCourse

	return courses[0], nil
}

// CreateCourseForAdmin allows admin to create a course for any tutor
func (s *CourseService) CreateCourseForAdmin(ctx context.Context, req dto.AdminCreateCourseRequest) (model.Course, error) {
	tutor, err := s.tutor.GetByID(ctx, req.TutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("tutor_id", req.TutorID.String()).
			Msg("[CreateCourseForAdmin] Tutor not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	if tutor == nil {
		logger.InfoCtx(ctx).Str("tutor_id", req.TutorID.String()).Msg("[CreateCourseForAdmin] Tutor not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	_, err = s.courseCategory.GetByID(ctx, req.CourseCategoryID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_category_id", req.CourseCategoryID.String()).
			Msg("[CreateCourseForAdmin] Course category not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course category")
	}

	subCategoryIDs := make([]uuid.UUID, len(req.SubCategoryID))
	for i, subCatIDStr := range req.SubCategoryID {
		subCatID, err := uuid.Parse(subCatIDStr)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("sub_category_id", subCatIDStr).
				Msg("[CreateCourseForAdmin] Invalid sub category ID format")
			return model.Course{}, shared.MakeError(ErrBadRequest, "invalid sub category ID format")
		}
		subCategoryIDs[i] = subCatID
	}

	subCategories := make([]model.SubCourseCategory, 0)
	if len(subCategoryIDs) > 0 {
		items, err := s.subCourseCategory.GetByIDs(ctx, subCategoryIDs)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Msg("[CreateCourseForAdmin] Error validating sub course categories")
			return model.Course{}, shared.MakeError(ErrInternalServer, "failed to validate sub course categories")
		}

		if len(items) != len(subCategoryIDs) {
			logger.ErrorCtx(ctx).
				Int("requested_count", len(subCategoryIDs)).
				Int("found_count", len(subCategories)).
				Msg("[CreateCourseForAdmin] Some sub course categories not found")
			return model.Course{}, shared.MakeError(ErrEntityNotFound, "one or more sub course categories")
		}

		subCategories = items
	}

	tutorReq := req.ToTutorCourseRequest()
	course := tutorReq.CreateCourse(subCategories, tutor.ID)
	course.Status = model.CourseStatusWaitingForApproval
	courseData, err := json.Marshal(course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourseForAdmin] Error serializing course data")
		return model.Course{}, fmt.Errorf("failed to serialize course data: %w", err)
	}

	course.Draft = &model.CourseDraft{
		CourseID:  course.ID,
		DraftData: courseData,
		DraftType: model.DraftTypeCreate,
		Status:    model.DraftStatusDraft,
		CreatedBy: req.AdminID,
		UpdatedBy: uuid.NullUUID{UUID: req.AdminID, Valid: true},
	}

	err = s.course.CreateCourse(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourseForAdmin] Error creating course with relationships")
		return model.Course{}, err
	}

	createdCourse, err := s.course.GetByID(ctx, course.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", course.ID.String()).
			Msg("[CreateCourseForAdmin] Error fetching created course")
		return model.Course{}, err
	}

	if createdCourse == nil {
		logger.WarnCtx(ctx).Str("course_id", course.ID.String()).Msg("[CreateCourseForAdmin] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	logger.InfoCtx(ctx).
		Str("course_id", course.ID.String()).
		Str("title", course.Title).
		Str("admin_id", req.AdminID.String()).
		Str("tutor_id", tutor.ID.String()).
		Msg("[CreateCourseForAdmin] Course created successfully by admin")

	return *createdCourse, nil
}

// UpdateCourseForAdmin allows admin to update any course directly
func (s *CourseService) UpdateCourseForAdmin(ctx context.Context, req dto.AdminUpdateCourseRequest) (model.Course, error) {
	courseID := req.ID

	// Get existing course
	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[UpdateCourseForAdmin] Error getting course")
		return model.Course{}, err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[UpdateCourseForAdmin] Course not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course")
	}

	// Validate course category exists
	_, err = s.courseCategory.GetByID(ctx, req.CourseCategoryID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_category_id", req.CourseCategoryID.String()).
			Msg("[UpdateCourseForAdmin] Course category not found")
		return model.Course{}, shared.MakeError(ErrEntityNotFound, "course category")
	}

	// Validate sub-categories exist
	subCategories := []model.SubCourseCategory{}
	for _, subCatID := range req.SubCategoryID {
		subCatUUID, err := uuid.Parse(subCatID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("sub_category_id", subCatID).
				Msg("[UpdateCourseForAdmin] Invalid sub-category ID format")
			return model.Course{}, shared.MakeError(ErrBadRequest, "invalid sub-category ID format")
		}

		subCat, err := s.subCourseCategory.GetByID(ctx, subCatUUID)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).
				Str("sub_category_id", subCatID).
				Msg("[UpdateCourseForAdmin] Sub-category not found")
			return model.Course{}, shared.MakeError(ErrEntityNotFound, "sub-category")
		}
		subCategories = append(subCategories, *subCat)
	}

	// Convert to TutorCourseRequest and update the course
	tutorReq := req.ToTutorCourseRequest()
	tutorReq.UpdateCourse(course, subCategories)

	err = s.course.UpdateAll(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[UpdateCourseForAdmin] Error updating course")
		return model.Course{}, err
	}

	return *course, nil
}

func (s *CourseService) DeleteCourseForAdmin(ctx context.Context, courseID uuid.UUID) error {
	adminID := middleware.GetUserID(ctx)

	course, err := s.course.GetByID(ctx, courseID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Str("course_id", courseID.String()).Msg("[DeleteCourseForAdmin] Error getting course")
		return err
	}

	if course == nil {
		logger.InfoCtx(ctx).Str("course_id", courseID.String()).Msg("[DeleteCourseForAdmin] Course not found")
		return shared.MakeError(ErrEntityNotFound, "course")
	}

	course.DeletedAt = null.TimeFrom(time.Now())
	course.DeletedBy = uuid.NullUUID{
		UUID:  adminID,
		Valid: true,
	}

	err = s.course.Update(ctx, course)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).
			Str("course_id", courseID.String()).
			Str("admin_id", adminID.String()).
			Msg("[DeleteCourseForAdmin] Error soft deleting course")
		return shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("course_id", courseID.String()).
		Str("admin_id", adminID.String()).
		Msg("[DeleteCourseForAdmin] Course deleted successfully by admin")

	return nil
}
