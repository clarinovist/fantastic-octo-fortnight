package services

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"time"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type MonthlyReportService struct {
	bookingRepo *repositories.BookingRepository
	studentRepo *repositories.StudentRepository
}

func NewMonthlyReportService(
	bookingRepo *repositories.BookingRepository,
	studentRepo *repositories.StudentRepository,
) *MonthlyReportService {
	return &MonthlyReportService{
		bookingRepo: bookingRepo,
		studentRepo: studentRepo,
	}
}

// MonthlyReportData represents the data passed to the HTML template
type MonthlyReportData struct {
	StudentName string
	MonthYear   string
	Date        string
	Sessions    []ReportSessionData
}

type ReportSessionData struct {
	Date          string
	Subject       string
	TutorName     string
	Tasks         int
	AverageScore  string
	ProgressNotes string
}

func (s *MonthlyReportService) GenerateMonthlyReport(ctx context.Context, studentID uuid.UUID, month int, year int) ([]byte, string, error) {
	student, err := s.studentRepo.GetByID(ctx, studentID)
	if err != nil || student == nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GenerateMonthlyReport] Student not found")
		return nil, "", fmt.Errorf("student not found")
	}

	// Filter bookings for this student in the given month and year
	// We'll construct a date range
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	filter := model.BookingFilter{
		StudentID:          studentID,
		Status:             model.BookingStatusAccepted,
		BookingDateBetween: []string{startDate.Format("2006-01-02"), endDate.Format("2006-01-02")},
		Pagination:         model.Pagination{Page: 1, PageSize: 100},
	}

	bookings, _, err := s.bookingRepo.Get(ctx, filter)
	if err != nil {
		return nil, "", err
	}

	// For each booking, we need full details including tasks and reports
	var sessionsData []ReportSessionData
	for _, b := range bookings {
		fullBooking, err := s.bookingRepo.GetByID(ctx, b.ID)
		if err != nil || fullBooking == nil {
			continue
		}

		taskCount := len(fullBooking.SessionTasks)

		totalTaskScore := 0.0
		scoredCount := 0
		for _, task := range fullBooking.SessionTasks {
			if len(task.TaskSubmissions) > 0 && !task.TaskSubmissions[0].Score.Decimal.IsZero() {
				scoreFloat, _ := task.TaskSubmissions[0].Score.Decimal.Float64()
				totalTaskScore += scoreFloat
				scoredCount++
			}
		}

		avgScoreStr := "-"
		if scoredCount > 0 {
			avgScoreStr = fmt.Sprintf("%.1f", totalTaskScore/float64(scoredCount))
		}

		progressNotes := "-"
		if fullBooking.ReportBooking.ID != uuid.Nil && fullBooking.ReportBooking.Body != "" {
			progressNotes = fullBooking.ReportBooking.Body
		}

		sessionsData = append(sessionsData, ReportSessionData{
			Date:          fullBooking.BookingDate.Format("02/01/2006"),
			Subject:       fullBooking.Course.Title,
			TutorName:     fullBooking.Tutor.User.Name,
			Tasks:         taskCount,
			AverageScore:  avgScoreStr,
			ProgressNotes: progressNotes,
		})
	}

	data := MonthlyReportData{
		StudentName: student.User.Name,
		MonthYear:   startDate.Format("January 2006"),
		Date:        time.Now().Format("02/01/2006"),
		Sessions:    sessionsData,
	}

	// Parse template
	tmpl, err := template.ParseFiles("./templates/pdf/monthly_report/index.html")
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GenerateMonthlyReport] failed to parse template")
		return nil, "", err
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, data)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GenerateMonthlyReport] failed to execute template")
		return nil, "", err
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GenerateMonthlyReport] failed to create pdf generator")
		return nil, "", err
	}

	page := wkhtmltopdf.NewPageReader(bytes.NewReader(buf.Bytes()))
	pdfg.AddPage(page)
	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationLandscape)

	err = pdfg.Create()
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GenerateMonthlyReport] failed to create pdf")
		return nil, "", err
	}

	filename := fmt.Sprintf("Report_%s_%s.pdf", student.User.Name, data.MonthYear)
	return pdfg.Bytes(), filename, nil
}
