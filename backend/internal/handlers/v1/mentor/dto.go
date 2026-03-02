package mentor

import (
	"github.com/lesprivate/backend/internal/model"
)

type JoinByCodeRequest struct {
	Code string `json:"code" validate:"required,len=6"`
}

type MentorStudentResponse struct {
	ID            string `json:"id"`
	StudentID     string `json:"student_id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	JoinedAt      string `json:"joined_at"`
	Status        string `json:"status"`
	TotalSessions int64  `json:"total_sessions"`
}

func ToMentorStudentResponse(ms model.MentorStudent) MentorStudentResponse {
	return MentorStudentResponse{
		ID:            ms.ID.String(),
		StudentID:     ms.StudentID.String(),
		Name:          ms.Student.User.Name,
		Email:         ms.Student.User.Email,
		JoinedAt:      ms.JoinedAt.Format("2006-01-02 15:04:05"),
		Status:        ms.Status,
		TotalSessions: ms.TotalSessions,
	}
}

type InviteCodeResponse struct {
	Code string `json:"code"`
}

type WithdrawalRequest struct {
	Amount        float64 `json:"amount" validate:"required,gt=0"`
	BankName      string  `json:"bank_name" validate:"required"`
	AccountNumber string  `json:"account_number" validate:"required"`
	AccountName   string  `json:"account_name" validate:"required"`
}

type BalanceResponse struct {
	Balance string `json:"balance"` // Decimal as string
}

type ChartDataPoint struct {
	Month  string `json:"month"`
	Amount int64  `json:"amount"`
}

type FinanceStatsResponse struct {
	TotalBalance       string           `json:"total_balance"`
	BalanceChangePct   float64          `json:"balance_change_pct"` // vs last month
	TotalIncome30d     string           `json:"total_income_30d"`
	IncomeChangePct    float64          `json:"income_change_pct"`
	TotalCommission30d string           `json:"total_commission_30d"`
	CommissionTarget   string           `json:"commission_target"`
	ChartData          []ChartDataPoint `json:"chart_data"`
}

type BookingStatsResponse struct {
	Pending   int `json:"pending"`
	Accepted  int `json:"accepted"`
	Rejected  int `json:"rejected"`
	Completed int `json:"completed"`
	Total     int `json:"total"`
}

type TransactionResponse struct {
	ID            string `json:"id"`
	Type          string `json:"type"`
	Amount        string `json:"amount"`
	Description   string `json:"description"`
	ReferenceType string `json:"reference_type"`
	CreatedAt     string `json:"created_at"`
}

func ToTransactionResponse(t model.BalanceTransaction) TransactionResponse {
	txType := string(t.Type)
	// Map database types to frontend expected types
	if t.Type == "credit" {
		txType = "income"
	} else if t.Type == "debit" {
		txType = "withdrawal"
	}

	return TransactionResponse{
		ID:            t.ID.String(),
		Type:          txType,
		Amount:        t.Amount.String(),
		Description:   t.Description,
		ReferenceType: t.ReferenceType,
		CreatedAt:     t.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

type WithdrawalResponse struct {
	ID            string `json:"id"`
	Amount        string `json:"amount"`
	Status        string `json:"status"`
	BankName      string `json:"bank_name"`
	AccountNumber string `json:"account_number"`
	AccountName   string `json:"account_name"`
	CreatedAt     string `json:"created_at"`
}

func ToWithdrawalResponse(w model.WithdrawalRequest) WithdrawalResponse {
	return WithdrawalResponse{
		ID:            w.ID.String(),
		Amount:        w.Amount.String(),
		Status:        string(w.Status),
		BankName:      w.BankName,
		AccountNumber: w.AccountNumber,
		AccountName:   w.AccountName,
		CreatedAt:     w.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

type SessionResponse struct {
	ID          string `json:"id"`
	StudentID   string `json:"student_id"`
	StudentName string `json:"student_name"`
	CourseName  string `json:"course_name"`
	BookingDate string `json:"booking_date"`
	BookingTime string `json:"booking_time"`
	Status      string `json:"status"`
	ClassType   string `json:"class_type"`
	Code        string `json:"code"`
	Notes       string `json:"notes"`
}

func ToSessionResponse(b model.Booking) SessionResponse {
	return SessionResponse{
		ID:          b.ID.String(),
		StudentID:   b.StudentID.String(),
		StudentName: b.Student.User.Name,
		CourseName:  b.Course.Title,
		BookingDate: b.BookingDate.Format("2006-01-02"),
		BookingTime: b.BookingTime,
		Status:      string(b.Status),
		ClassType:   string(b.ClassType),
		Code:        b.Code,
		Notes:       b.NotesStudent.String, // Or NotesTutor?
	}
}

type StudentDetailResponse struct {
	ID        string `json:"id"`
	StudentID string `json:"student_id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Status    string `json:"status"`
	JoinedAt  string `json:"joined_at"`
	// Session stats
	TotalSessions     int               `json:"total_sessions"`
	CompletedSessions int               `json:"completed_sessions"`
	UpcomingSessions  int               `json:"upcoming_sessions"`
	Sessions          []SessionResponse `json:"sessions"`
}

func ToStudentDetailResponse(ms model.MentorStudent, bookings []model.Booking) StudentDetailResponse {
	var sessions []SessionResponse
	var completed, upcoming int

	for _, b := range bookings {
		sessions = append(sessions, ToSessionResponse(b))
		switch b.Status {
		case model.BookingStatusAccepted:
			completed++
		case model.BookingStatusPending:
			upcoming++
		}
	}

	return StudentDetailResponse{
		ID:                ms.ID.String(),
		StudentID:         ms.StudentID.String(),
		Name:              ms.Student.User.Name,
		Email:             ms.Student.User.Email,
		Status:            ms.Status,
		JoinedAt:          ms.JoinedAt.Format("2006-01-02 15:04:05"),
		TotalSessions:     len(bookings),
		CompletedSessions: completed,
		UpcomingSessions:  upcoming,
		Sessions:          sessions,
	}
}

type CreateSessionTaskRequest struct {
	Title         string  `json:"title" validate:"required"`
	Description   *string `json:"description"`
	AttachmentURL *string `json:"attachment_url"`
}

type GradeTaskRequest struct {
	SubmissionURL *string  `json:"submission_url"`
	Score         *float64 `json:"score"`
}
