package dto

import (
	"fmt"
	"time"

	"strings"

	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/internal/model"
	"github.com/shopspring/decimal"
)

type Booking struct {
	ID                uuid.UUID           `json:"id"`
	BookingDate       string              `json:"bookingDate"`
	BookingTime       string              `json:"bookingTime"`
	Timezone          string              `json:"timezone"`
	CourseTitle       string              `json:"courseTitle"`
	CourseDescription string              `json:"courseDescription"`
	Status            model.BookingStatus `json:"status"`
	ExpiredAt         time.Time           `json:"expiredAt"`
}

type BookingTutor struct {
	Name            string            `json:"name"`
	Gender          null.String       `json:"gender"`
	Email           string            `json:"email"`
	DateOfBirth     null.String       `json:"dateOfBirth"`
	PhoneNumber     string            `json:"phoneNumber"`
	SocialMediaLink map[string]string `json:"socialMediaLink"`
	PhotoProfile    null.String       `json:"photoProfile"`
}

func NewBookingTutor(tutor *model.Tutor, status model.BookingStatus) BookingTutor {
	b := BookingTutor{
		Name:            tutor.User.Name,
		Gender:          tutor.Gender,
		Email:           tutor.User.Email,
		PhoneNumber:     tutor.PhoneNumber.String,
		SocialMediaLink: make(map[string]string),
		PhotoProfile:    tutor.PhotoProfile,
	}

	if tutor.DateOfBirth.Valid {
		b.DateOfBirth = null.StringFrom(tutor.DateOfBirth.Time.Format(time.DateOnly))
	}
	if status != model.BookingStatusAccepted {
		parts := strings.Split(tutor.User.Email, "@")
		if len(parts) == 2 {
			local := parts[0]
			maskedLocal := strings.Repeat("*", len(local))
			b.Email = maskedLocal + "@" + parts[1]
		}

		if tutor.PhoneNumber.Valid {
			b.PhoneNumber = tutor.PhoneNumber.String[:2] + strings.Repeat("*", len(tutor.PhoneNumber.String)-2)
		}

		b.DateOfBirth = null.StringFrom("**/**/****")
	}

	for _, v := range tutor.SocialMediaLink {
		maskedLink := v.Link
		if status != model.BookingStatusAccepted {
			lastSlash := strings.LastIndex(v.Link, "/")
			if lastSlash != -1 && lastSlash < len(v.Link)-1 {
				maskedLink = v.Link[:lastSlash+1] + "***********"
			}
		}
		b.SocialMediaLink[v.Name] = maskedLink
	}

	return b
}

type BookingStudent struct {
	Name            string            `json:"name"`
	Gender          null.String       `json:"gender"`
	Email           string            `json:"email"`
	DateOfBirth     null.String       `json:"dateOfBirth"`
	PhoneNumber     string            `json:"phoneNumber"`
	SocialMediaLink map[string]string `json:"socialMediaLink"`
	PhotoProfile    null.String       `json:"photoProfile"`
}

func NewBookingStudent(student *model.Student, status model.BookingStatus) BookingStudent {
	b := BookingStudent{
		Name:            student.User.Name,
		Gender:          student.Gender,
		Email:           student.User.Email,
		PhoneNumber:     student.PhoneNumber.String,
		SocialMediaLink: make(map[string]string),
		PhotoProfile:    student.PhotoProfile,
	}

	if student.DateOfBirth.Valid {
		b.DateOfBirth = null.StringFrom(student.DateOfBirth.Time.Format(time.DateOnly))
	}

	if status != model.BookingStatusAccepted {
		parts := strings.Split(student.User.Email, "@")
		if len(parts) == 2 {
			local := parts[0]
			maskedLocal := strings.Repeat("*", len(local))
			b.Email = maskedLocal + "@" + parts[1]
		}
		if student.PhoneNumber.Valid {
			b.PhoneNumber = student.PhoneNumber.String[:2] + strings.Repeat("*", len(student.PhoneNumber.String)-2)
		}

		b.DateOfBirth = null.StringFrom("**/**/****")
	}

	for _, v := range student.SocialMediaLink {
		maskedLink := v.Link
		if status != model.BookingStatusAccepted {
			lastSlash := strings.LastIndex(v.Link, "/")
			if lastSlash != -1 && lastSlash > len(v.Link)-1 {
				maskedLink = v.Link[:lastSlash+1] + "***********"
			}
		}
		b.SocialMediaLink[v.Name] = maskedLink
	}

	return b
}

type BookingCourse struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type TaskSubmissionDTO struct {
	ID            uuid.UUID       `json:"id"`
	SubmissionURL null.String     `json:"submissionUrl"`
	Score         decimal.Decimal `json:"score"`
	CreatedAt     time.Time       `json:"createdAt"`
}

type SessionTaskDTO struct {
	ID            uuid.UUID          `json:"id"`
	Title         string             `json:"title"`
	Description   null.String        `json:"description"`
	AttachmentURL null.String        `json:"attachmentUrl"`
	Submission    *TaskSubmissionDTO `json:"submission,omitempty"`
	CreatedAt     time.Time          `json:"createdAt"`
}

type BookingDetail struct {
	ID           uuid.UUID           `json:"id"`
	Tutor        BookingTutor        `json:"tutor"`
	Student      BookingStudent      `json:"student"`
	Course       BookingCourse       `json:"course"`
	BookingDate  string              `json:"bookingDate"`
	BookingTime  string              `json:"bookingTime"`
	Timezone     string              `json:"timezone"`
	NotesTutor   string              `json:"notesTutor"`
	NotesStudent string              `json:"notesStudent"`
	ClassType    string              `json:"classType"`
	Latitude     decimal.Decimal     `json:"latitude"`
	Longitude    decimal.Decimal     `json:"longitude"`
	Status       model.BookingStatus `json:"status"`
	ExpiredAt    time.Time           `json:"expiredAt"`
	CreatedAt    time.Time           `json:"createdAt"`
	// Mentor grading feature
	SessionTasks  []SessionTaskDTO `json:"sessionTasks"`
	ReportBooking *ReportBooking   `json:"reportBooking,omitempty"`
}

func NewBookingDetail(booking *model.Booking) BookingDetail {
	var sessionTasks []SessionTaskDTO
	for _, st := range booking.SessionTasks {
		var subDTO *TaskSubmissionDTO
		if len(st.TaskSubmissions) > 0 {
			sub := st.TaskSubmissions[0] // Since it's a 1-to-1 relationship logically (one submission per task)
			subDTO = &TaskSubmissionDTO{
				ID:            sub.ID,
				SubmissionURL: sub.SubmissionURL,
				Score:         sub.Score.Decimal,
				CreatedAt:     sub.CreatedAt,
			}
		}

		sessionTasks = append(sessionTasks, SessionTaskDTO{
			ID:            st.ID,
			Title:         st.Title,
			Description:   st.Description,
			AttachmentURL: st.AttachmentURL,
			Submission:    subDTO,
			CreatedAt:     st.CreatedAt,
		})
	}

	return BookingDetail{
		ID:            booking.ID,
		Tutor:         NewBookingTutor(&booking.Tutor, booking.Status),
		Student:       NewBookingStudent(&booking.Student, booking.Status),
		Course:        BookingCourse{Title: booking.Course.Title, Description: booking.Course.Description},
		BookingDate:   booking.BookingDate.Format("2006-01-02"),
		BookingTime:   booking.BookingTime,
		Timezone:      booking.Timezone,
		NotesTutor:    booking.NotesTutor.String,
		NotesStudent:  booking.NotesStudent.String,
		ClassType:     string(booking.ClassType),
		Latitude:      booking.Latitude,
		Longitude:     booking.Longitude,
		Status:        booking.GetStatus(),
		ExpiredAt:     booking.ExpiredAt,
		CreatedAt:     booking.CreatedAt,
		SessionTasks:  sessionTasks,
		ReportBooking: NewReportBooking(booking.ReportBooking),
	}
}

type AdminBooking struct {
	ID          uuid.UUID           `json:"id"`
	BookingDate string              `json:"bookingDate"`
	StudentName string              `json:"studentName"`
	TutorName   string              `json:"tutorName"`
	Status      model.BookingStatus `json:"status"`
	CourseTitle string              `json:"courseTitle"`
}

func NewAdminBooking(booking *model.Booking) AdminBooking {
	return AdminBooking{
		ID:          booking.ID,
		BookingDate: booking.BookingDate.Format("2006-01-02"),
		StudentName: booking.Student.User.Name,
		TutorName:   booking.Tutor.User.Name,
		Status:      booking.GetStatus(),
		CourseTitle: booking.Course.Title,
	}
}

type GetAdminBookingsRequest struct {
	Status      string `form:"status"`
	TutorName   string `form:"tutorName"`
	StudentName string `form:"studentName"`
	model.Pagination
	model.Sort
}

type GetAdminBookingsResponse struct {
	Data     []AdminBooking `json:"data"`
	Metadata model.Metadata `json:"metadata"`
}

type ReportBooking struct {
	ID        uuid.UUID                 `json:"id"`
	BookingID uuid.UUID                 `json:"bookingId"`
	StudentID uuid.UUID                 `json:"studentId"`
	Topic     string                    `json:"topic"`
	Body      string                    `json:"body"`
	Status    model.ReportBookingStatus `json:"status"`
	CreatedAt time.Time                 `json:"createdAt"`
	UpdatedAt time.Time                 `json:"updatedAt"`
}

func NewReportBooking(report model.ReportBooking) *ReportBooking {
	if report.ID == uuid.Nil {
		return nil
	}
	return &ReportBooking{
		ID:        report.ID,
		BookingID: report.BookingID,
		StudentID: report.StudentID,
		Topic:     report.Topic,
		Body:      report.Body,
		Status:    report.Status,
		CreatedAt: report.CreatedAt,
		UpdatedAt: report.UpdatedAt,
	}
}

type AdminBookingDetail struct {
	ID            uuid.UUID           `json:"id"`
	Code          string              `json:"code"`
	Student       BookingStudent      `json:"student"`
	Tutor         BookingTutor        `json:"tutor"`
	Course        BookingCourse       `json:"course"`
	BookingDate   string              `json:"bookingDate"`
	BookingTime   string              `json:"bookingTime"`
	Timezone      string              `json:"timezone"`
	ClassType     string              `json:"classType"`
	Latitude      decimal.Decimal     `json:"latitude"`
	Longitude     decimal.Decimal     `json:"longitude"`
	NotesTutor    string              `json:"notesTutor"`
	NotesStudent  string              `json:"notesStudent"`
	ReportBooking *ReportBooking      `json:"reportBooking,omitempty"`
	Status        model.BookingStatus `json:"status"`
	ExpiredAt     time.Time           `json:"expiredAt"`
	CreatedAt     time.Time           `json:"createdAt"`
	UpdatedAt     time.Time           `json:"updatedAt"`
}

func NewAdminBookingDetail(booking *model.Booking) AdminBookingDetail {
	return AdminBookingDetail{
		ID:            booking.ID,
		Code:          booking.Code,
		Student:       NewBookingStudent(&booking.Student, model.BookingStatusAccepted),
		Tutor:         NewBookingTutor(&booking.Tutor, model.BookingStatusAccepted),
		Course:        BookingCourse{Title: booking.Course.Title, Description: booking.Course.Description},
		BookingDate:   booking.BookingDate.Format("2006-01-02"),
		BookingTime:   booking.BookingTime,
		Timezone:      booking.Timezone,
		ClassType:     string(booking.ClassType),
		Latitude:      booking.Latitude,
		Longitude:     booking.Longitude,
		NotesTutor:    booking.NotesTutor.String,
		NotesStudent:  booking.NotesStudent.String,
		ReportBooking: NewReportBooking(booking.ReportBooking),
		Status:        booking.GetStatus(),
		ExpiredAt:     booking.ExpiredAt,
		CreatedAt:     booking.CreatedAt,
		UpdatedAt:     booking.UpdatedAt,
	}
}

type AdminCreateBookingRequest struct {
	StudentID    uuid.UUID `json:"studentId" validate:"required"`
	TutorID      uuid.UUID `json:"tutorId" validate:"required"`
	CourseID     uuid.UUID `json:"courseId" validate:"required"`
	BookingDate  string    `json:"bookingDate" validate:"required"` // Format: YYYY-MM-DD
	BookingTime  string    `json:"bookingTime" validate:"required"` // Format: HH:MM
	ClassType    string    `json:"classType" validate:"required"`
	Timezone     string    `json:"timezone" validate:"required"`
	Latitude     string    `json:"latitude"`
	Longitude    string    `json:"longitude"`
	NotesTutor   string    `json:"notesTutor"`
	NotesStudent string    `json:"notesStudent"`
	Status       string    `json:"status" validate:"required"`
}

func (r *AdminCreateBookingRequest) Validate() error {
	// Parse and validate booking date
	_, err := time.Parse("2006-01-02", r.BookingDate)
	if err != nil {
		return fmt.Errorf("invalid booking date format, expected YYYY-MM-DD: %w", err)
	}

	// Parse and validate booking time
	_, err = time.Parse("15:04", r.BookingTime)
	if err != nil {
		return fmt.Errorf("invalid booking time format, expected HH:MM: %w", err)
	}

	// Validate latitude/longitude if provided
	if r.Latitude != "" {
		if _, err := decimal.NewFromString(r.Latitude); err != nil {
			return fmt.Errorf("invalid latitude format: %w", err)
		}
	}
	if r.Longitude != "" {
		if _, err := decimal.NewFromString(r.Longitude); err != nil {
			return fmt.Errorf("invalid longitude format: %w", err)
		}
	}

	return nil
}

type AdminUpdateBookingRequest struct {
	ID           uuid.UUID `json:"-"` // Set from path parameter
	Status       *string   `json:"status,omitempty"`
	BookingDate  *string   `json:"bookingDate,omitempty"` // Format: YYYY-MM-DD
	BookingTime  *string   `json:"bookingTime,omitempty"` // Format: HH:MM
	NotesTutor   *string   `json:"notesTutor,omitempty"`
	NotesStudent *string   `json:"notesStudent,omitempty"`
}

func (r *AdminUpdateBookingRequest) Validate() error {
	if r.BookingDate != nil {
		_, err := time.Parse("2006-01-02", *r.BookingDate)
		if err != nil {
			return fmt.Errorf("invalid booking date format, expected YYYY-MM-DD: %w", err)
		}
	}

	if r.BookingTime != nil {
		_, err := time.Parse("15:04", *r.BookingTime)
		if err != nil {
			return fmt.Errorf("invalid booking time format, expected HH:MM: %w", err)
		}
	}

	return nil
}
