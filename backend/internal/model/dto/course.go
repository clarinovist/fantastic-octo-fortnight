package dto

import (
	"cmp"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"sort"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/logger"
)

type GetCoursesRequest struct {
	ID                   uuid.UUID       `form:"id"`
	LocationID           uuid.UUID       `form:"locationId"`
	CourseCategoryID     uuid.UUID       `form:"courseCategoryId"`
	ClassType            model.ClassType `form:"classType"`
	Rating               []int           `form:"rating"`
	MaxPrice             decimal.Decimal `form:"maxPrice"`
	FreeFirstCourse      null.Bool       `form:"freeFirstCourse"`
	Latitude             decimal.Decimal `form:"latitude"`
	Longitude            decimal.Decimal `form:"longitude"`
	Radius               int             `form:"radius"`
	MaxResponseTime      int             `form:"maxResponseTime"`
	LevelEducationCourse []string        `form:"levelEducationCourse"`
	model.Pagination
	model.Sort
}

func (r *GetCoursesRequest) Filter() model.CourseFilter {
	f := model.CourseFilter{
		Pagination:           r.Pagination,
		Sort:                 r.Sort,
		CourseCategoryID:     r.CourseCategoryID,
		LocationID:           r.LocationID,
		ClassType:            r.ClassType,
		MaxPrice:             r.MaxPrice,
		FreeFirstCourse:      r.FreeFirstCourse,
		Latitude:             r.Latitude,
		Longitude:            r.Longitude,
		Radius:               r.Radius,
		MaxResponseTime:      r.MaxResponseTime,
		LevelEducationCourse: r.LevelEducationCourse,
		IsPublished:          null.BoolFrom(true),
	}

	if len(r.Rating) > 0 {
		sort.Ints(r.Rating)

		minRating := r.Rating[0]
		maxRating := r.Rating[len(r.Rating)-1] + 1

		f.MinRating = null.IntFrom(int64(minRating))
		f.MaxRating = null.IntFrom(int64(maxRating))
	}

	return f
}

type Tutor struct {
	ID               uuid.UUID         `json:"id"`
	Name             string            `json:"name"`
	PhotoProfile     null.String       `json:"photoProfile"`
	Description      string            `json:"description"`
	ClassType        model.ClassType   `json:"classType"`
	OnlineChannel    []OnlineChannel   `json:"onlineChannel"`
	SocialMediaLinks []SocialMediaLink `json:"socialMediaLinks"`
	Latitude         decimal.Decimal   `json:"latitude"`
	Longitude        decimal.Decimal   `json:"longitude"`
	Level            string            `json:"level"`
	LevelOfEducation string            `json:"levelOfEducation"`
	ResponseTime     null.Int          `json:"responseTime"`
	Rating           decimal.Decimal   `json:"rating"`
	TotalRating      int               `json:"totalRating"`
	Location         Location          `json:"location"`
	Ratings          []TutorRating     `json:"ratings"`
}

type Course struct {
	ID                uuid.UUID       `json:"id"`
	CourseCategory    CourseCategory  `json:"courseCategory"`
	Tutor             Tutor           `json:"tutor"`
	IsFreeFirstCourse bool            `json:"isFreeFirstCourse"`
	Description       string          `json:"description"`
	Price             decimal.Decimal `json:"price"`
	IsBooked          bool            `json:"isBooked"`
}

// CourseWithDraft extends Course with draft-related information
type CourseWithDraft struct {
	Course
	HasDraft       bool               `json:"hasDraft"`
	DraftStatus    *model.DraftStatus `json:"draftStatus,omitempty"`
	DraftUpdatedAt *time.Time         `json:"draftUpdatedAt,omitempty"`
	CanEdit        bool               `json:"canEdit"`
	DraftID        *uuid.UUID         `json:"draftId,omitempty"`
}

func NewCourses(courses []model.Course) []Course {
	resp := make([]Course, len(courses))
	for i, course := range courses {
		resp[i] = NewCourse(course)
	}

	return resp
}

func NewCourse(course model.Course) Course {
	return Course{
		ID: course.ID,
		CourseCategory: CourseCategory{
			ID:   course.CourseCategory.ID,
			Name: course.CourseCategory.Name,
		},
		Tutor: Tutor{
			ID:               course.Tutor.ID,
			Name:             course.Tutor.User.Name,
			PhotoProfile:     course.Tutor.PhotoProfile,
			ClassType:        course.Tutor.ClassType,
			Latitude:         course.Tutor.Latitude.Decimal,
			Longitude:        course.Tutor.Longitude.Decimal,
			Rating:           course.Rating,
			TotalRating:      len(course.TutorReviews),
			Level:            course.Tutor.LevelByPoint(),
			LevelOfEducation: course.Tutor.LevelOfEducation.String,
			ResponseTime:     course.Tutor.ResponseTime,
			Location: Location{
				ID:        course.Tutor.Location.ID,
				Name:      course.Tutor.Location.Name,
				FullName:  course.Tutor.Location.FullName,
				ShortName: course.Tutor.Location.Name,
				Type:      course.Tutor.Location.Type,
			},
		},
		IsFreeFirstCourse: course.IsFreeFirstCourse.Bool,
		Description:       course.Description,
		Price:             course.Price,
		IsBooked:          course.IsBooked,
	}
}

type CoursePrice struct {
	DurationInHour int             `json:"durationInHour"`
	Price          decimal.Decimal `json:"price"`
}

type CourseDetail struct {
	ID                     uuid.UUID                         `json:"id"`
	CourseCategory         CourseCategory                    `json:"courseCategory"`
	Title                  string                            `json:"title"`
	LevelEducationCourse   []string                          `json:"levelEducationCourse"`
	RelatedCourses         []string                          `json:"relatedCourses"`
	TotalStudentEnrollment int                               `json:"totalStudentEnrollment"`
	Tutor                  Tutor                             `json:"tutor"`
	IsFreeFirstCourse      bool                              `json:"isFreeFirstCourse"`
	Description            string                            `json:"description"`
	CoursePrices           map[model.ClassType][]CoursePrice `json:"coursePrices"`
	CourseSchedulesOnline  map[int][]CourseSchedule          `json:"courseSchedulesOnline"`
	CourseSchedulesOffline map[int][]CourseSchedule          `json:"courseSchedulesOffline"`
	Price                  decimal.Decimal                   `json:"price"`
	IsBooked               bool                              `json:"isBooked"`
}

// CourseDetailWithDraft extends CourseDetail with draft-related information
type CourseDetailWithDraft struct {
	CourseDetail
	HasDraft       bool               `json:"hasDraft"`
	DraftStatus    *model.DraftStatus `json:"draftStatus,omitempty"`
	DraftUpdatedAt *time.Time         `json:"draftUpdatedAt,omitempty"`
	CanEdit        bool               `json:"canEdit"`
	DraftID        *uuid.UUID         `json:"draftId,omitempty"`
}

func NewCoursePrices(coursePrices []model.CoursePrice) map[model.ClassType][]CoursePrice {
	resp := make(map[model.ClassType][]CoursePrice)
	for _, price := range coursePrices {
		val, ok := resp[price.ClassType]
		if !ok {
			resp[price.ClassType] = make([]CoursePrice, 0)
			val = resp[price.ClassType]
		}

		val = append(val, CoursePrice{
			DurationInHour: price.DurationInHour,
			Price:          price.Price,
		})
		resp[price.ClassType] = val
	}

	return resp
}

func NewCourseDetail(course model.Course) CourseDetail {
	return CourseDetail{
		ID: course.ID,
		CourseCategory: CourseCategory{
			ID:   course.CourseCategory.ID,
			Name: course.CourseCategory.Name,
		},
		Title:                  course.Title,
		RelatedCourses:         NewRelatedCourses(course.RelatedCourses),
		TotalStudentEnrollment: course.TotalStudentEnrollment,
		LevelEducationCourse:   course.LevelEducationCourseSlice(),
		CourseSchedulesOnline:  NewCourseSchedules(course.CourseSchedules, model.OnlineClassType),
		CourseSchedulesOffline: NewCourseSchedules(course.CourseSchedules, model.OfflineClassType),
		Tutor: Tutor{
			ID:               course.Tutor.ID,
			Name:             course.Tutor.User.Name,
			Description:      course.TutorDescription.String,
			PhotoProfile:     course.Tutor.PhotoProfile,
			ClassType:        course.Tutor.ClassType,
			SocialMediaLinks: NewSocialMediaLink(course.Tutor),
			OnlineChannel:    NewOnlineChannel(course.OnlineChannel),
			Latitude:         course.Tutor.Latitude.Decimal,
			Longitude:        course.Tutor.Longitude.Decimal,
			Rating:           course.Rating,
			TotalRating:      len(course.TutorReviews),
			Level:            course.Tutor.LevelByPoint(),
			LevelOfEducation: course.Tutor.LevelOfEducation.String,
			ResponseTime:     course.Tutor.ResponseTime,
			Location: Location{
				ID:        course.Tutor.Location.ID,
				Name:      course.Tutor.Location.Name,
				FullName:  course.Tutor.Location.FullName,
				ShortName: course.Tutor.Location.ShortName(),
				Type:      course.Tutor.Location.Type,
			},
			Ratings: NewRatings(course.TutorReviews),
		},
		IsFreeFirstCourse: course.IsFreeFirstCourse.Bool,
		Description:       course.Description,
		CoursePrices:      NewCoursePrices(course.CoursePrices),
		Price:             course.Price,
		IsBooked:          course.IsBooked,
	}
}

type OnlineChannel struct {
	Channel  string `json:"channel"`
	ImageURL string `json:"imageURL"`
}

func NewOnlineChannel(channels model.OnlineChannel) []OnlineChannel {
	resp := make([]OnlineChannel, 0)
	for _, channel := range channels {
		resp = append(resp, OnlineChannel{
			Channel:  channel,
			ImageURL: model.GetImageURLByOnlineChannel(channel),
		})
	}

	return resp
}

type CourseSchedule struct {
	StartTime string          `json:"startTime"`
	Timezone  string          `json:"timezone"`
	ClassType model.ClassType `json:"classType"`
}

func NewCourseSchedules(schedules []model.CourseSchedule, classType model.ClassType) map[int][]CourseSchedule {
	resp := make(map[int][]CourseSchedule)
	for _, schedule := range schedules {
		if schedule.ClassType != classType {
			continue
		}

		val, ok := resp[schedule.Day]
		if !ok {
			val = make([]CourseSchedule, 0)
		}

		val = append(val, CourseSchedule{
			StartTime: schedule.StartTime,
			Timezone:  schedule.Timezone,
			ClassType: schedule.ClassType,
		})

		resp[schedule.Day] = val
	}

	return resp
}

type TutorRating struct {
	StudentName  string `json:"studentName"`
	StudentEmail string `json:"studentEmail"`
	StudentPhoto string `json:"studentPhoto"`
	Rating       int    `json:"rating"`
	Review       string `json:"review"`
}

func NewRatings(ratings []model.TutorReview) []TutorRating {
	resp := make([]TutorRating, len(ratings))
	for i, rating := range ratings {
		resp[i] = TutorRating{
			StudentName:  rating.Student.User.Name,
			StudentEmail: rating.Student.User.Email,
			StudentPhoto: rating.Student.PhotoProfile.String,
			Rating:       int(rating.Rate.ValueOrZero()),
			Review:       rating.Review.String,
		}
	}

	return resp
}

func NewRelatedCourses(courses []model.Course) []string {
	resp := []string{}
	mapCategory := make(map[string]struct{})
	for _, course := range courses {
		if _, ok := mapCategory[course.CourseCategory.Name]; ok {
			continue
		}

		resp = append(resp, course.CourseCategory.Name)
		mapCategory[course.CourseCategory.Name] = struct{}{}
	}

	return resp
}

type SocialMediaLink struct {
	SocialMedia string `json:"socialMedia"`
	Link        string `json:"link"`
	Image       string `json:"image"`
}

func NewSocialMediaLink(tutor model.Tutor) []SocialMediaLink {
	resp := make([]SocialMediaLink, 0)
	if tutor.LinkedinLink.Valid {
		resp = append(resp, SocialMediaLink{
			SocialMedia: "linkedin",
			Image:       config.Conf.Image.Linkedin,
		})
	}

	if tutor.TiktokLink.Valid {
		resp = append(resp, SocialMediaLink{
			SocialMedia: "tiktok",
			Image:       config.Conf.Image.Tiktok,
		})
	}

	if tutor.InstagramLink.Valid {
		resp = append(resp, SocialMediaLink{
			SocialMedia: "instagram",
			Image:       config.Conf.Image.Instagram,
		})
	}

	return resp
}

// CoursePriceRequest represents a single course price entry in the request
type CoursePriceRequest struct {
	DurationInHour int             `json:"durationInHour" validate:"required,min=1"`
	Price          decimal.Decimal `json:"price" validate:"required,min=0"`
}

// CoursePricesRequest represents the course prices structure in the request
type CoursePricesRequest struct {
	Offline []CoursePriceRequest `json:"offline"`
	Online  []CoursePriceRequest `json:"online"`
}

// CourseScheduleRequest represents a single course schedule entry
type CourseScheduleRequest struct {
	StartTime string `json:"startTime" validate:"required"`
	Timezone  string `json:"timezone" validate:"required"`
}

// TutorCourseRequest represents the request payload for creating a new course
type TutorCourseRequest struct {
	ID                     uuid.UUID                          `json:"-"`
	UserID                 uuid.UUID                          `json:"-"`
	Title                  string                             `json:"title" validate:"required"`
	Description            string                             `json:"description" validate:"required"`
	TutorDescription       string                             `json:"tutorDescription"`
	LevelEducationCourses  []string                           `json:"levelEducationCourses" validate:"required,min=1"`
	CourseCategoryID       uuid.UUID                          `json:"courseCategoryID" validate:"required"`
	SubCategoryID          []string                           `json:"subCategoryIDs" validate:"required,min=1"`
	IsFreeFirstCourse      null.Bool                          `json:"isFreeFirstCourse"`
	OnlineChannel          []string                           `json:"onlineChannel"`
	ClassType              model.ClassType                    `json:"classType" validate:"required"`
	CoursePrices           CoursePricesRequest                `json:"coursePrices"`
	CourseSchedulesOffline map[string][]CourseScheduleRequest `json:"courseSchedulesOffline"`
	CourseSchedulesOnline  map[string][]CourseScheduleRequest `json:"courseSchedulesOnline"`
}

// Validate validates the TutorCourseRequest
func (r *TutorCourseRequest) Validate() error {
	// Validate ClassType
	switch r.ClassType {
	case model.AllClassType, model.OnlineClassType, model.OfflineClassType:
		// Valid class type
	default:
		return fmt.Errorf("invalid classType: must be one of 'all', 'online', 'offline'")
	}

	// Validate SubCategoryID UUIDs
	for _, subCatID := range r.SubCategoryID {
		if _, err := uuid.Parse(subCatID); err != nil {
			return fmt.Errorf("invalid subCategoryID format: %s", subCatID)
		}
	}

	// Validate course prices
	if err := r.validateCoursePrices(); err != nil {
		return err
	}

	// Validate course schedules
	if err := r.validateCourseSchedulesOffline(); err != nil {
		return err
	}
	if err := r.validateCourseSchedulesOnline(); err != nil {
		return err
	}

	return nil
}

// validateCoursePrices validates the course prices structure
func (r *TutorCourseRequest) validateCoursePrices() error {
	// Validate offline prices
	offlineDurations := make(map[int]bool)
	for i, price := range r.CoursePrices.Offline {
		if price.DurationInHour <= 0 {
			return fmt.Errorf("offline price[%d]: durationInHour must be greater than 0", i)
		}
		if price.Price.LessThan(decimal.Zero) {
			return fmt.Errorf("offline price[%d]: price must be greater than or equal to 0", i)
		}

		// Check for duplicate duration
		if offlineDurations[price.DurationInHour] {
			return fmt.Errorf("offline price[%d]: duplicate durationInHour %d found", i, price.DurationInHour)
		}
		offlineDurations[price.DurationInHour] = true
	}

	// Validate online prices
	onlineDurations := make(map[int]bool)
	for i, price := range r.CoursePrices.Online {
		if price.DurationInHour <= 0 {
			return fmt.Errorf("online price[%d]: durationInHour must be greater than 0", i)
		}
		if price.Price.LessThan(decimal.Zero) {
			return fmt.Errorf("online price[%d]: price must be greater than or equal to 0", i)
		}

		// Check for duplicate duration
		if onlineDurations[price.DurationInHour] {
			return fmt.Errorf("online price[%d]: duplicate durationInHour %d found", i, price.DurationInHour)
		}
		onlineDurations[price.DurationInHour] = true
	}

	return nil
}

// validateCourseSchedulesOffline validates the course schedules offline structure
func (r *TutorCourseRequest) validateCourseSchedulesOffline() error {
	for dayStr, schedules := range r.CourseSchedulesOffline {
		// Validate day is a valid integer (1-7 for Monday-Sunday)
		day, err := strconv.Atoi(dayStr)
		if err != nil {
			return fmt.Errorf("invalid day format: %s, must be a number", dayStr)
		}
		if day < 1 || day > 7 {
			return fmt.Errorf("invalid day: %d, must be between 1 and 7", day)
		}

		// Track start times for duplicate validation
		startTimes := make(map[string]bool)

		// Validate each schedule for the day
		for i, schedule := range schedules {
			// Validate startTime format (HH:MM:SS)
			if _, err := time.Parse("15:04:05", schedule.StartTime); err != nil {
				return fmt.Errorf("day %s schedule[%d]: invalid startTime format '%s', must be HH:MM:SS", dayStr, i, schedule.StartTime)
			}

			// Validate timezone is not empty
			if schedule.Timezone == "" {
				return fmt.Errorf("day %s schedule[%d]: timezone cannot be empty", dayStr, i)
			}

			// Validate timezone format (basic validation for common timezones)
			validTimezones := map[string]bool{
				"WIB":  true, // Western Indonesian Time
				"WITA": true, // Central Indonesian Time
				"WIT":  true, // Eastern Indonesian Time
			}
			if !validTimezones[schedule.Timezone] {
				return fmt.Errorf("day %s schedule[%d]: invalid timezone '%s', must be one of: WIB, WITA, WIT", dayStr, i, schedule.Timezone)
			}

			// Check for duplicate startTime within the same day
			if startTimes[schedule.StartTime] {
				return fmt.Errorf("day %s schedule[%d]: duplicate startTime '%s' found", dayStr, i, schedule.StartTime)
			}
			startTimes[schedule.StartTime] = true
		}
	}

	return nil
}

// validateCourseSchedulesOnline validates the course schedules online structure
func (r *TutorCourseRequest) validateCourseSchedulesOnline() error {
	for dayStr, schedules := range r.CourseSchedulesOnline {
		// Validate day is a valid integer (1-7 for Monday-Sunday)
		day, err := strconv.Atoi(dayStr)
		if err != nil {
			return fmt.Errorf("invalid day format: %s, must be a number", dayStr)
		}
		if day < 1 || day > 7 {
			return fmt.Errorf("invalid day: %d, must be between 1 and 7", day)
		}

		// Track start times for duplicate validation
		startTimes := make(map[string]bool)

		// Validate each schedule for the day
		for i, schedule := range schedules {
			// Validate startTime format (HH:MM:SS)
			if _, err := time.Parse("15:04:05", schedule.StartTime); err != nil {
				return fmt.Errorf("day %s schedule[%d]: invalid startTime format '%s', must be HH:MM:SS", dayStr, i, schedule.StartTime)
			}

			// Validate timezone is not empty
			if schedule.Timezone == "" {
				return fmt.Errorf("day %s schedule[%d]: timezone cannot be empty", dayStr, i)
			}

			// Validate timezone format (basic validation for common timezones)
			validTimezones := map[string]bool{
				"WIB":  true, // Western Indonesian Time
				"WITA": true, // Central Indonesian Time
				"WIT":  true, // Eastern Indonesian Time
			}
			if !validTimezones[schedule.Timezone] {
				return fmt.Errorf("day %s schedule[%d]: invalid timezone '%s', must be one of: WIB, WITA, WIT", dayStr, i, schedule.Timezone)
			}

			// Check for duplicate startTime within the same day
			if startTimes[schedule.StartTime] {
				return fmt.Errorf("day %s schedule[%d]: duplicate startTime '%s' found", dayStr, i, schedule.StartTime)
			}
			startTimes[schedule.StartTime] = true
		}
	}

	return nil
}

func (r *TutorCourseRequest) CreateCourse(subCategories []model.SubCourseCategory, tutorID uuid.UUID) model.Course {
	course := model.Course{
		ID:                uuid.New(),
		CourseCategoryID:  r.CourseCategoryID,
		TutorID:           tutorID,
		Title:             r.Title,
		Description:       r.Description,
		TutorDescription:  null.StringFrom(r.TutorDescription),
		IsFreeFirstCourse: r.IsFreeFirstCourse,
		ClassType:         r.ClassType,
		OnlineChannel:     model.OnlineChannel(r.OnlineChannel),
		Status:            model.CourseStatusDraft,
		IsPublished:       null.BoolFrom(false),
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		CreatedBy:         uuid.NullUUID{UUID: r.UserID, Valid: true},
		UpdatedBy:         uuid.NullUUID{UUID: r.UserID, Valid: true},
	}

	r.ID = course.ID
	course.CoursePrices, course.Price = r.prepareCoursesPrices()
	course.CourseSchedules = r.prepareCourseSchedules()
	course.SubCourseCategories = r.prepareCourseSubCourseCategories(subCategories)
	course.LevelEducationCourses = r.prepareLevelEducationCourses()

	return course
}

func (r *TutorCourseRequest) UpdateCourse(course *model.Course, subCategories []model.SubCourseCategory) {
	course.CourseCategoryID = r.CourseCategoryID
	course.Title = r.Title
	course.Description = r.Description
	course.TutorDescription = null.StringFrom(r.TutorDescription)
	course.IsFreeFirstCourse = r.IsFreeFirstCourse
	course.ClassType = r.ClassType
	course.OnlineChannel = r.OnlineChannel
	course.Status = model.CourseStatusDraft
	course.UpdatedAt = time.Now()
	course.UpdatedBy = uuid.NullUUID{UUID: r.UserID, Valid: true}
	course.CoursePrices, course.Price = r.prepareCoursesPrices()
	course.CourseSchedules = r.prepareCourseSchedules()
	course.SubCourseCategories = r.prepareCourseSubCourseCategories(subCategories)
	course.LevelEducationCourses = r.prepareLevelEducationCourses()
}

func (r *TutorCourseRequest) prepareCoursesPrices() ([]model.CoursePrice, decimal.Decimal) {
	var (
		coursePrices []model.CoursePrice
		prices       []decimal.Decimal
	)

	for _, offlinePrice := range r.CoursePrices.Offline {
		prices = append(prices, offlinePrice.Price)
		coursePrices = append(coursePrices, model.CoursePrice{
			ID:             uuid.New(),
			CourseID:       r.ID,
			ClassType:      model.OfflineClassType,
			DurationInHour: offlinePrice.DurationInHour,
			Price:          offlinePrice.Price,
			CreatedAt:      time.Now(),
			CreatedBy:      uuid.NullUUID{UUID: r.UserID, Valid: true},
		})
	}

	for _, onlinePrice := range r.CoursePrices.Online {
		prices = append(prices, onlinePrice.Price)
		coursePrices = append(coursePrices, model.CoursePrice{
			ID:             uuid.New(),
			CourseID:       r.ID,
			ClassType:      model.OnlineClassType,
			DurationInHour: onlinePrice.DurationInHour,
			Price:          onlinePrice.Price,
			CreatedAt:      time.Now(),
			CreatedBy:      uuid.NullUUID{UUID: r.UserID, Valid: true},
		})
	}

	price := slices.MinFunc(prices, func(a, b decimal.Decimal) int {
		return cmp.Compare(a.IntPart(), b.IntPart())
	})

	return coursePrices, price
}

func (r *TutorCourseRequest) prepareCourseSchedules() []model.CourseSchedule {
	var courseSchedules []model.CourseSchedule

	for dayStr, schedules := range r.CourseSchedulesOffline {
		day, _ := strconv.Atoi(dayStr)

		for _, schedule := range schedules {
			courseSchedules = append(courseSchedules, model.CourseSchedule{
				ID:        uuid.New(),
				CourseID:  r.ID,
				Day:       day,
				StartTime: schedule.StartTime,
				Timezone:  schedule.Timezone,
				ClassType: model.OfflineClassType,
				CreatedAt: time.Now(),
				CreatedBy: uuid.NullUUID{UUID: r.UserID, Valid: true},
			})
		}
	}

	for dayStr, schedules := range r.CourseSchedulesOnline {
		day, _ := strconv.Atoi(dayStr)

		for _, schedule := range schedules {
			courseSchedules = append(courseSchedules, model.CourseSchedule{
				ID:        uuid.New(),
				CourseID:  r.ID,
				Day:       day,
				StartTime: schedule.StartTime,
				Timezone:  schedule.Timezone,
				ClassType: model.OnlineClassType,
				CreatedAt: time.Now(),
				CreatedBy: uuid.NullUUID{UUID: r.UserID, Valid: true},
			})
		}
	}

	return courseSchedules
}

func (r *TutorCourseRequest) prepareCourseSubCourseCategories(categories []model.SubCourseCategory) []model.CourseSubCourseCategory {
	subCategories := make([]model.CourseSubCourseCategory, 0)
	for _, category := range categories {
		subCategories = append(subCategories, model.CourseSubCourseCategory{
			ID:                  uuid.New(),
			CourseID:            r.ID,
			SubCourseCategoryID: category.ID,
			CreatedAt:           time.Now(),
			CreatedBy:           uuid.NullUUID{UUID: r.UserID, Valid: true},
		})
	}

	return subCategories
}

func (r *TutorCourseRequest) prepareLevelEducationCourses() []model.LevelEducationCourse {
	levelEducationCourses := make([]model.LevelEducationCourse, 0)

	for _, levelEducation := range r.LevelEducationCourses {
		levelEducationCourses = append(levelEducationCourses, model.LevelEducationCourse{
			CourseID:         r.ID,
			LevelOfEducation: levelEducation,
		})
	}

	return levelEducationCourses
}

type TutorCourseListResponse struct {
	ID          uuid.UUID          `json:"id"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	IsPublished bool               `json:"isPublished"`
	Status      model.CourseStatus `json:"status"`
}

func NewTutorCourseListResponse(course model.Course) TutorCourseListResponse {
	t := TutorCourseListResponse{
		ID:          course.ID,
		Title:       course.Title,
		Description: course.Description,
		IsPublished: course.IsPublished.Bool,
		Status:      course.Status,
	}

	if course.Draft != nil {
		var draft model.Course
		if err := json.Unmarshal(course.Draft.DraftData, &draft); err != nil {
			return t
		}

		t.Title = draft.Title
		t.Description = draft.Description
	}

	return t
}

type TutorCourseResponse struct {
	ID                     uuid.UUID                         `json:"id"`
	Title                  string                            `json:"title"`
	Description            string                            `json:"description"`
	TutorDescription       null.String                       `json:"tutorDescription"`
	LevelEducationCourses  []string                          `json:"levelEducationCourses"`
	CourseCategory         CourseCategory                    `json:"courseCategory"`
	SubCategoryIDs         []uuid.UUID                       `json:"subCategoryIDs"`
	IsFreeFirstCourse      bool                              `json:"isFreeFirstCourse"`
	OnlineChannel          []string                          `json:"onlineChannel"`
	ClassType              model.ClassType                   `json:"classType"`
	CoursePrices           map[model.ClassType][]CoursePrice `json:"coursePrices"`
	Price                  decimal.Decimal                   `json:"price"`
	Status                 model.CourseStatus                `json:"status"`
	StatusNotes            null.String                       `json:"statusNotes"`
	IsPublished            bool                              `json:"isPublished"`
	Draft                  any                               `json:"draft" swaggertype:"object"`
	CreatedAt              time.Time                         `json:"createdAt"`
	UpdatedAt              time.Time                         `json:"updatedAt"`
	CourseSchedulesOnline  map[int][]CourseSchedule          `json:"courseSchedulesOnline"`
	CourseSchedulesOffline map[int][]CourseSchedule          `json:"courseSchedulesOffline"`
}

func NewTutorCourseResponse(course model.Course) TutorCourseResponse {
	subCategoryIDs := make([]uuid.UUID, len(course.SubCourseCategories))
	for i, subCat := range course.SubCourseCategories {
		subCategoryIDs[i] = subCat.SubCourseCategoryID
	}

	// Convert OnlineChannel to string slice
	onlineChannels := make([]string, len(course.OnlineChannel))
	copy(onlineChannels, course.OnlineChannel)

	resp := TutorCourseResponse{
		ID:                    course.ID,
		Title:                 course.Title,
		Description:           course.Description,
		TutorDescription:      course.TutorDescription,
		LevelEducationCourses: course.LevelEducationCourseSlice(),
		CourseCategory: CourseCategory{
			ID:   course.CourseCategoryID,
			Name: course.CourseCategory.Name,
		},
		SubCategoryIDs:         subCategoryIDs,
		IsFreeFirstCourse:      course.IsFreeFirstCourse.Bool,
		OnlineChannel:          onlineChannels,
		ClassType:              course.ClassType,
		Status:                 course.Status,
		StatusNotes:            course.StatusNotes,
		IsPublished:            course.IsPublished.Bool,
		CoursePrices:           NewCoursePrices(course.CoursePrices),
		Price:                  course.Price,
		CourseSchedulesOnline:  NewCourseSchedules(course.CourseSchedules, model.OnlineClassType),
		CourseSchedulesOffline: NewCourseSchedules(course.CourseSchedules, model.OfflineClassType),
		CreatedAt:              course.CreatedAt,
		UpdatedAt:              course.UpdatedAt,
	}

	if course.Draft != nil {
		var c model.Course
		err := json.Unmarshal(course.Draft.DraftData, &c)
		if err != nil {
			return resp
		}
		c.Draft = nil
		resp.Draft = NewTutorCourseResponse(c)
	}

	return resp
}

// NewCourseDetailResponse converts a model.Course to CourseDetail response
func NewCourseDetailResponse(course model.Course) *CourseDetail {
	// Create basic course detail response
	// Note: This is a simplified version - you may need to populate more fields based on your requirements
	return &CourseDetail{
		ID:          course.ID,
		Title:       course.Title,
		Description: course.Description,
		Price:       decimal.Zero, // You may need to calculate this from CoursePrices
		// Add other fields as needed based on your Course model
	}
}

type ListTutorCoursesRequest struct {
	UserID uuid.UUID
	model.Pagination
	model.Sort
}

type GetTutorCourseRequest struct {
	UserID uuid.UUID
	ID     uuid.UUID
}

type PublishTutorCourseRequest struct {
	ID          uuid.UUID `json:"-"`
	IsPublished bool      `json:"isPublished"`
}

type GetBookingCourseRequest struct {
	ID        uuid.UUID `form:"-"`
	StartDate string    `form:"startDate"`
	EndDate   string    `form:"endDate"`
}

func (r *GetBookingCourseRequest) Validate() error {
	if r.StartDate == "" || r.EndDate == "" {
		return errors.New("start date and end date are required")
	}

	startDate, err := time.Parse(time.DateOnly, r.StartDate)
	if err != nil {
		return errors.New("invalid start date format")
	}

	endDate, err := time.Parse(time.DateOnly, r.EndDate)
	if err != nil {
		return errors.New("invalid end date format")
	}

	if startDate.After(endDate) {
		return errors.New("start date must be before end date")
	}

	return nil
}

type BookingCourseResponse struct {
	Status    bool            `json:"status"`
	ClassType model.ClassType `json:"classType"`
}

func NewBookingCourseResponse(ctx context.Context, schedules []model.CourseSchedule, bookings []model.Booking, request GetBookingCourseRequest) map[string]BookingCourseResponse {
	bookedSchedule := make(map[string]struct{})
	for _, booking := range bookings {
		key := fmt.Sprintf("%s %s", booking.BookingDate.Format(time.DateOnly), booking.BookingTime)
		bookedSchedule[key] = struct{}{}
	}

	resp := make(map[string]BookingCourseResponse)
	startDate, err := time.Parse(time.DateOnly, request.StartDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error parsing start date")
		return resp
	}

	endDate, err := time.Parse(time.DateOnly, request.EndDate)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error parsing end date")
		return resp
	}

	availableSchedules := make(map[int]map[string]model.ClassType)
	for _, schedule := range schedules {
		if _, ok := availableSchedules[schedule.Day]; !ok {
			availableSchedules[schedule.Day] = make(map[string]model.ClassType)
		}

		c := schedule.ClassType
		if _, ok := availableSchedules[schedule.Day][schedule.StartTime]; ok {
			c = model.AllClassType
		}
		availableSchedules[schedule.Day][schedule.StartTime] = c
	}

	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dayOfWeek := int(d.Weekday())
		if _, ok := availableSchedules[dayOfWeek]; !ok {
			continue
		}

		for startTime, classType := range availableSchedules[dayOfWeek] {
			key := fmt.Sprintf("%s %s", d.Format(time.DateOnly), startTime)
			if _, ok := bookedSchedule[key]; ok {
				continue
			}

			resp[key] = BookingCourseResponse{
				Status:    true,
				ClassType: classType,
			}
		}
	}

	return resp
}

// AdminGetCoursesRequest represents the request for admin to get courses list
type AdminGetCoursesRequest struct {
	ClassType         model.ClassType    `form:"classType"`
	IsFreeFirstCourse null.Bool          `form:"isFreeFirstCourse"`
	Status            model.CourseStatus `form:"status"`
	model.Pagination
	model.Sort
}

// AdminCourseListResponse represents a single course in the admin list
type AdminCourseListResponse struct {
	ID                uuid.UUID          `json:"id"`
	UpdatedAt         time.Time          `json:"updatedAt"`
	TutorName         string             `json:"tutorName"`
	CourseTitle       string             `json:"courseTitle"`
	ClassType         model.ClassType    `json:"classType"`
	IsFreeFirstCourse bool               `json:"isFreeFirstCourse"`
	Status            model.CourseStatus `json:"status"`
}

// NewAdminCourseListResponse creates a new AdminCourseListResponse from a model.Course
func NewAdminCourseListResponse(course model.Course) AdminCourseListResponse {
	tutorName := ""
	if course.Tutor.User.Name != "" {
		tutorName = course.Tutor.User.Name
	}

	return AdminCourseListResponse{
		ID:                course.ID,
		UpdatedAt:         course.UpdatedAt,
		TutorName:         tutorName,
		CourseTitle:       course.Title,
		ClassType:         course.ClassType,
		IsFreeFirstCourse: course.IsFreeFirstCourse.Bool,
		Status:            course.Status,
	}
}

// NewAdminCourseListResponses creates a slice of AdminCourseListResponse from a slice of model.Course
func NewAdminCourseListResponses(courses []model.Course) []AdminCourseListResponse {
	responses := make([]AdminCourseListResponse, len(courses))
	for i, course := range courses {
		responses[i] = NewAdminCourseListResponse(course)
	}
	return responses
}
