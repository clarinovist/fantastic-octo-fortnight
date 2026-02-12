package dto

import (
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
)

type ApproveCourseRequest struct {
	ID          uuid.UUID   `json:"-"`
	ReviewNotes null.String `json:"reviewNotes"`
}

type RejectCourseRequest struct {
	ID          uuid.UUID `json:"-"`
	ReviewNotes string    `json:"reviewNotes"`
}

type AdminCreateCourseRequest struct {
	AdminID                uuid.UUID                          `json:"-"`
	TutorID                uuid.UUID                          `json:"tutorId" validate:"required"`
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

func (r *AdminCreateCourseRequest) Validate() error {
	switch r.ClassType {
	case model.AllClassType, model.OnlineClassType, model.OfflineClassType:
	default:
		return fmt.Errorf("invalid classType: must be one of 'all', 'online', 'offline'")
	}

	for _, subCatID := range r.SubCategoryID {
		if _, err := uuid.Parse(subCatID); err != nil {
			return fmt.Errorf("invalid subCategoryID format: %s", subCatID)
		}
	}

	if err := r.validateCoursePrices(); err != nil {
		return err
	}

	if err := r.validateCourseSchedulesOffline(); err != nil {
		return err
	}
	if err := r.validateCourseSchedulesOnline(); err != nil {
		return err
	}

	return nil
}

func (r *AdminCreateCourseRequest) validateCoursePrices() error {
	offlineDurations := make(map[int]bool)
	for i, price := range r.CoursePrices.Offline {
		if price.DurationInHour <= 0 {
			return fmt.Errorf("offline price[%d]: durationInHour must be greater than 0", i)
		}
		if price.Price.LessThan(decimal.Zero) {
			return fmt.Errorf("offline price[%d]: price must be greater than or equal to 0", i)
		}

		if offlineDurations[price.DurationInHour] {
			return fmt.Errorf("offline price[%d]: duplicate durationInHour %d found", i, price.DurationInHour)
		}
		offlineDurations[price.DurationInHour] = true
	}

	onlineDurations := make(map[int]bool)
	for i, price := range r.CoursePrices.Online {
		if price.DurationInHour <= 0 {
			return fmt.Errorf("online price[%d]: durationInHour must be greater than 0", i)
		}
		if price.Price.LessThan(decimal.Zero) {
			return fmt.Errorf("online price[%d]: price must be greater than or equal to 0", i)
		}

		if onlineDurations[price.DurationInHour] {
			return fmt.Errorf("online price[%d]: duplicate durationInHour %d found", i, price.DurationInHour)
		}
		onlineDurations[price.DurationInHour] = true
	}

	return nil
}

func (r *AdminCreateCourseRequest) validateCourseSchedulesOffline() error {
	for dayStr, schedules := range r.CourseSchedulesOffline {
		day, err := strconv.Atoi(dayStr)
		if err != nil {
			return fmt.Errorf("invalid day format: %s, must be a number", dayStr)
		}
		if day < 1 || day > 7 {
			return fmt.Errorf("invalid day: %d, must be between 1 and 7", day)
		}

		startTimes := make(map[string]bool)

		for i, schedule := range schedules {
			if _, err := time.Parse("15:04:05", schedule.StartTime); err != nil {
				return fmt.Errorf("day %s schedule[%d]: invalid startTime format '%s', must be HH:MM:SS", dayStr, i, schedule.StartTime)
			}

			if schedule.Timezone == "" {
				return fmt.Errorf("day %s schedule[%d]: timezone cannot be empty", dayStr, i)
			}

			validTimezones := map[string]bool{
				"WIB":  true,
				"WITA": true,
				"WIT":  true,
			}
			if !validTimezones[schedule.Timezone] {
				return fmt.Errorf("day %s schedule[%d]: invalid timezone '%s', must be one of: WIB, WITA, WIT", dayStr, i, schedule.Timezone)
			}

			if startTimes[schedule.StartTime] {
				return fmt.Errorf("day %s schedule[%d]: duplicate startTime '%s' found", dayStr, i, schedule.StartTime)
			}
			startTimes[schedule.StartTime] = true
		}
	}

	return nil
}

func (r *AdminCreateCourseRequest) validateCourseSchedulesOnline() error {
	for dayStr, schedules := range r.CourseSchedulesOnline {
		day, err := strconv.Atoi(dayStr)
		if err != nil {
			return fmt.Errorf("invalid day format: %s, must be a number", dayStr)
		}
		if day < 1 || day > 7 {
			return fmt.Errorf("invalid day: %d, must be between 1 and 7", day)
		}

		startTimes := make(map[string]bool)

		for i, schedule := range schedules {
			if _, err := time.Parse("15:04:05", schedule.StartTime); err != nil {
				return fmt.Errorf("day %s schedule[%d]: invalid startTime format '%s', must be HH:MM:SS", dayStr, i, schedule.StartTime)
			}

			if schedule.Timezone == "" {
				return fmt.Errorf("day %s schedule[%d]: timezone cannot be empty", dayStr, i)
			}

			validTimezones := map[string]bool{
				"WIB":  true,
				"WITA": true,
				"WIT":  true,
			}
			if !validTimezones[schedule.Timezone] {
				return fmt.Errorf("day %s schedule[%d]: invalid timezone '%s', must be one of: WIB, WITA, WIT", dayStr, i, schedule.Timezone)
			}

			if startTimes[schedule.StartTime] {
				return fmt.Errorf("day %s schedule[%d]: duplicate startTime '%s' found", dayStr, i, schedule.StartTime)
			}
			startTimes[schedule.StartTime] = true
		}
	}

	return nil
}

func (r *AdminCreateCourseRequest) ToTutorCourseRequest() TutorCourseRequest {
	return TutorCourseRequest{
		UserID:                 r.AdminID,
		Title:                  r.Title,
		Description:            r.Description,
		TutorDescription:       r.TutorDescription,
		LevelEducationCourses:  r.LevelEducationCourses,
		CourseCategoryID:       r.CourseCategoryID,
		SubCategoryID:          r.SubCategoryID,
		IsFreeFirstCourse:      r.IsFreeFirstCourse,
		OnlineChannel:          r.OnlineChannel,
		ClassType:              r.ClassType,
		CoursePrices:           r.CoursePrices,
		CourseSchedulesOffline: r.CourseSchedulesOffline,
		CourseSchedulesOnline:  r.CourseSchedulesOnline,
	}
}

type AdminUpdateCourseRequest struct {
	ID                     uuid.UUID                          `json:"-"`
	AdminID                uuid.UUID                          `json:"-"`
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

// Validate validates the AdminUpdateCourseRequest
func (r *AdminUpdateCourseRequest) Validate() error {
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
func (r *AdminUpdateCourseRequest) validateCoursePrices() error {
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
func (r *AdminUpdateCourseRequest) validateCourseSchedulesOffline() error {
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
func (r *AdminUpdateCourseRequest) validateCourseSchedulesOnline() error {
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

// ToTutorCourseRequest converts AdminUpdateCourseRequest to TutorCourseRequest
func (r *AdminUpdateCourseRequest) ToTutorCourseRequest() TutorCourseRequest {
	return TutorCourseRequest{
		ID:                     r.ID,
		UserID:                 r.AdminID,
		Title:                  r.Title,
		Description:            r.Description,
		TutorDescription:       r.TutorDescription,
		LevelEducationCourses:  r.LevelEducationCourses,
		CourseCategoryID:       r.CourseCategoryID,
		SubCategoryID:          r.SubCategoryID,
		IsFreeFirstCourse:      r.IsFreeFirstCourse,
		OnlineChannel:          r.OnlineChannel,
		ClassType:              r.ClassType,
		CoursePrices:           r.CoursePrices,
		CourseSchedulesOffline: r.CourseSchedulesOffline,
		CourseSchedulesOnline:  r.CourseSchedulesOnline,
	}
}

func NewAdminCourseDetail(course model.Course) AdminCourseDetail {
	resp := AdminCourseDetail{
		ID: course.ID,
		CourseCategory: CourseCategory{
			ID:   course.CourseCategory.ID,
			Name: course.CourseCategory.Name,
		},
		SubCourseCategories:    make([]SubCourseCategory, 0),
		Title:                  course.Title,
		RelatedCourses:         NewRelatedCourses(course.RelatedCourses),
		TotalStudentEnrollment: course.TotalStudentEnrollment,
		LevelEducationCourse:   course.LevelEducationCourseSlice(),
		CourseSchedulesOnline:  NewCourseSchedules(course.CourseSchedules, model.OnlineClassType),
		CourseSchedulesOffline: NewCourseSchedules(course.CourseSchedules, model.OfflineClassType),
		Tutor: Tutor{
			ID:               course.Tutor.ID,
			Name:             course.Tutor.User.Name,
			Description:      course.Tutor.Description,
			PhotoProfile:     course.Tutor.PhotoProfile,
			ClassType:        course.Tutor.ClassType,
			SocialMediaLinks: NewSocialMediaLink(course.Tutor),
			OnlineChannel:    NewOnlineChannel(course.Tutor.OnlineChannel),
			Latitude:         course.Tutor.Latitude.Decimal,
			Longitude:        course.Tutor.Longitude.Decimal,
			Rating:           course.Rating,
			TotalRating:      len(course.TutorReviews),
			Level:            course.Tutor.Level.String,
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
		OnlineChannel:     course.OnlineChannel,
		Description:       course.Description,
		CoursePrices:      NewCoursePrices(course.CoursePrices),
		Price:             course.Price,
		IsBooked:          course.IsBooked,
		Status:            course.Status,
	}

	for _, subCourseCategory := range course.SubCourseCategories {
		resp.SubCourseCategories = append(resp.SubCourseCategories, SubCourseCategory{
			ID:               subCourseCategory.SubCourseCategory.ID,
			CourseCategoryID: subCourseCategory.SubCourseCategory.CourseCategoryID,
			Name:             subCourseCategory.SubCourseCategory.Name,
		})
	}

	return resp
}

type AdminCourseDetail struct {
	ID                     uuid.UUID                         `json:"id"`
	CourseCategory         CourseCategory                    `json:"courseCategory"`
	SubCourseCategories    []SubCourseCategory               `json:"subCourseCategories"`
	Title                  string                            `json:"title"`
	LevelEducationCourse   []string                          `json:"levelEducationCourse"`
	RelatedCourses         []string                          `json:"relatedCourses"`
	TotalStudentEnrollment int                               `json:"totalStudentEnrollment"`
	Tutor                  Tutor                             `json:"tutor"`
	IsFreeFirstCourse      bool                              `json:"isFreeFirstCourse"`
	OnlineChannel          []string                          `json:"onlineChannel"`
	Description            string                            `json:"description"`
	CoursePrices           map[model.ClassType][]CoursePrice `json:"coursePrices"`
	CourseSchedulesOnline  map[int][]CourseSchedule          `json:"courseSchedulesOnline"`
	CourseSchedulesOffline map[int][]CourseSchedule          `json:"courseSchedulesOffline"`
	Price                  decimal.Decimal                   `json:"price"`
	IsBooked               bool                              `json:"isBooked"`
	Status                 model.CourseStatus                `json:"status"`
}
