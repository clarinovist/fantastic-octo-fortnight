package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// CourseStatus represents the status of a course
type CourseStatus string

const (
	CourseStatusWaitingForApproval CourseStatus = "Waiting for Approval"
	CourseStatusDraft              CourseStatus = "Draft"
	CourseStatusAccepted           CourseStatus = "Accepted"
	CourseStatusRejected           CourseStatus = "Rejected"
)

type LevelEducationCourse struct {
	CourseID         uuid.UUID `gorm:"primaryKey"`
	LevelOfEducation string    `gorm:"primaryKey"`
}

type CourseSubCourseCategory struct {
	ID                  uuid.UUID         `gorm:"type:char(36);primaryKey"`
	CourseID            uuid.UUID         `gorm:"type:char(36);not null"`
	SubCourseCategoryID uuid.UUID         `gorm:"type:char(36);not null"`
	Course              Course            `gorm:"foreignKey:CourseID"`
	SubCourseCategory   SubCourseCategory `gorm:"foreignKey:SubCourseCategoryID"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	DeletedAt           null.Time
	CreatedBy           uuid.NullUUID
	UpdatedBy           uuid.NullUUID
	DeletedBy           uuid.NullUUID
}

func (c *CourseSubCourseCategory) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

type CoursePrice struct {
	ID             uuid.UUID `gorm:"primaryKey"`
	CourseID       uuid.UUID
	ClassType      ClassType
	DurationInHour int
	Price          decimal.Decimal
	CreatedAt      time.Time
	CreatedBy      uuid.NullUUID
}

type CourseSchedule struct {
	gorm.Model

	ID        uuid.UUID
	CourseID  uuid.UUID
	Day       int
	StartTime string
	Timezone  string
	ClassType ClassType
	Status    string `gorm:"-"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt null.Time
	CreatedBy uuid.NullUUID
	UpdatedBy uuid.NullUUID
	DeletedBy uuid.NullUUID
}

type Course struct {
	gorm.Model

	ID                uuid.UUID
	CourseCategoryID  uuid.UUID
	TutorID           uuid.UUID
	Tutor             Tutor
	Title             string
	Description       string
	TutorDescription  null.String
	Price             decimal.Decimal
	IsFreeFirstCourse null.Bool
	ClassType         ClassType
	OnlineChannel     OnlineChannel
	Status            CourseStatus `gorm:"type:varchar(255);not null;default:''"`
	StatusNotes       null.String  `gorm:"type:text"`
	IsPublished       null.Bool    `gorm:"not null;default:false"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         null.Time
	CreatedBy         uuid.NullUUID
	UpdatedBy         uuid.NullUUID
	DeletedBy         uuid.NullUUID

	// Relationships
	CourseCategory        CourseCategory
	SubCourseCategories   []CourseSubCourseCategory `gorm:"foreignKey:CourseID"`
	LevelEducationCourses []LevelEducationCourse    `gorm:"foreignKey:CourseID"`
	CoursePrices          []CoursePrice             `gorm:"foreignKey:CourseID"`
	CourseSchedules       []CourseSchedule          `gorm:"foreignKey:CourseID"`
	Draft                 *CourseDraft              `gorm:"foreignKey:CourseID"`
	TutorReviews          []TutorReview             `gorm:"foreignKey:CourseID"`

	TotalStudentEnrollment int             `gorm:"-"`
	RelatedCourses         []Course        `gorm:"-"`
	IsBooked               bool            `gorm:"-"`
	Rating                 decimal.Decimal `gorm:"-"`
}

func (c *Course) LevelEducationCourseSlice() []string {
	resp := []string{}
	for _, course := range c.LevelEducationCourses {
		resp = append(resp, course.LevelOfEducation)
	}

	return resp
}

func (c *Course) FillFromDraft(draft Course) {
	c.CourseCategoryID = draft.CourseCategoryID
	c.TutorID = draft.TutorID
	c.Title = draft.Title
	c.Description = draft.Description
	c.TutorDescription = draft.TutorDescription
	c.Price = draft.Price
	c.IsFreeFirstCourse = draft.IsFreeFirstCourse
	c.ClassType = draft.ClassType
	c.OnlineChannel = draft.OnlineChannel
	c.CourseCategory = draft.CourseCategory
	c.SubCourseCategories = draft.SubCourseCategories
	c.LevelEducationCourses = draft.LevelEducationCourses
	c.CoursePrices = draft.CoursePrices
	c.CourseSchedules = draft.CourseSchedules
}

type CourseFilter struct {
	ID                   uuid.UUID
	NotID                uuid.UUID
	TutorID              uuid.UUID
	CourseCategoryID     uuid.UUID
	LocationID           uuid.UUID
	ClassType            ClassType
	MinRating            null.Int
	MaxRating            null.Int
	MaxPrice             decimal.Decimal
	FreeFirstCourse      null.Bool
	Latitude             decimal.Decimal
	Longitude            decimal.Decimal
	Radius               int
	MaxResponseTime      int
	LevelEducationCourse []string
	IsPublished          null.Bool
	DeletedAtIsNull      null.Bool
	Status               CourseStatus
	Pagination
	Sort
}

func (f CourseFilter) TutorCourse(db *gorm.DB) {
	if f.TutorID != uuid.Nil {
		db = db.Where("tutor_id = ?", f.TutorID)
	}

	if f.DeletedAtIsNull.Valid {
		if f.DeletedAtIsNull.Bool {
			db = db.Where("deleted_at IS NULL")
		} else {
			db = db.Where("deleted_at IS NOT NULL")
		}
	}
}
