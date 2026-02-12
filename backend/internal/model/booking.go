package model

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
)

type BookingStatus string

const (
	BookingStatusPending  BookingStatus = "pending"
	BookingStatusAccepted BookingStatus = "accepted"
	BookingStatusDeclined BookingStatus = "declined"
	BookingStatusExpired  BookingStatus = "expired"
)

type Booking struct {
	ID                uuid.UUID       `gorm:"type:char(36);primary_key" json:"id"`
	Code              string          `gorm:"type:varchar(50);not null" json:"code"`
	CourseID          uuid.UUID       `gorm:"type:char(36);not null" json:"course_id"`
	TutorID           uuid.UUID       `gorm:"type:char(36);not null" json:"tutor_id"`
	StudentID         uuid.UUID       `gorm:"type:char(36);not null" json:"student_id"`
	ClassType         ClassType       `gorm:"type:varchar(255);not null" json:"class_type"`
	BookingDate       time.Time       `gorm:"type:date;not null" json:"booking_date"`
	BookingTime       string          `gorm:"type:time;not null" json:"booking_time"`
	Timezone          string          `gorm:"type:varchar(50);not null" json:"timezone"`
	Latitude          decimal.Decimal `json:"latitude"`
	Longitude         decimal.Decimal `json:"longitude"`
	NotesTutor        null.String     `json:"notes_tutor"`   // notes for tutor
	NotesStudent      null.String     `json:"notes_student"` // notes for student
	IsFreeFirstCourse bool            `json:"is_free_first_course"`
	Status            BookingStatus   `gorm:"type:varchar(255);not null" json:"status"`
	IsReviewed        bool            `json:"is_reviewed"`
	ExpiredAt         time.Time       `json:"expired_at"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         null.Time       `gorm:"index" json:"deleted_at"`
	CreatedBy         uuid.UUID       `gorm:"type:char(36)" json:"created_by"`
	UpdatedBy         uuid.UUID       `gorm:"type:char(36)" json:"updated_by"`
	DeletedBy         uuid.NullUUID   `gorm:"type:char(36)" json:"deleted_by"`

	Tutor         Tutor         `gorm:"foreignKey:TutorID" json:"tutor"`
	Student       Student       `gorm:"foreignKey:StudentID" json:"student"`
	Course        Course        `gorm:"foreignKey:CourseID" json:"course"`
	ReportBooking ReportBooking `gorm:"foreignKey:BookingID" json:"report_booking"`
}

func (b *Booking) GetStatus() BookingStatus {
	if b.Status == BookingStatusPending && time.Now().After(b.ExpiredAt) {
		return BookingStatusExpired
	}
	return b.Status
}

func (b *Booking) GenerateCode() {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 5

	randomCode := make([]byte, length)
	for i := range randomCode {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		randomCode[i] = charset[num.Int64()]
	}

	b.Code = fmt.Sprintf("BK%s%s",
		time.Now().Format("20060102"),
		string(randomCode),
	)
}

func (b *Booking) ReminderBeforeExpiredInHour() int {
	return int(time.Since(b.ExpiredAt).Hours()) * -1
}

type BookingFilter struct {
	NotIDs                 []uuid.UUID
	CourseCategoryID       uuid.UUID
	StudentID              uuid.UUID
	TutorID                uuid.UUID
	CourseID               uuid.UUID
	CourseIDs              []uuid.UUID
	StudentName            string
	TutorName              string
	BookingDate            time.Time
	BookingDateBetween     []string
	BookingTime            time.Time
	ExpiredAtBefore        time.Time
	ExpiredAtBetween       []time.Time
	BookingDateTimeBetween []time.Time
	BookingDateTimeAdd     time.Duration
	Status                 BookingStatus
	StatusNot              BookingStatus
	StatusIn               []BookingStatus
	DateCreatedAt          time.Time
	IsFreeFirstCourse      null.Bool
	IsReviewed             null.Bool
	DeletedAtIsNil         null.Bool
	Pagination
	Sort
}
