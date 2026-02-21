package mentor

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/jwt"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
	"github.com/shopspring/decimal"
)

type MentorHandler struct {
	config        *config.Config
	mentorStudent *services.MentorStudentService
	mentorBalance *services.MentorBalanceService
	tutorBooking  *services.TutorBookingService
	jwt           *jwt.JWT
}

func NewMentorHandler(
	config *config.Config,
	mentorStudent *services.MentorStudentService,
	mentorBalance *services.MentorBalanceService,
	tutorBooking *services.TutorBookingService,
	jwt *jwt.JWT,
) *MentorHandler {
	return &MentorHandler{
		config:        config,
		mentorStudent: mentorStudent,
		mentorBalance: mentorBalance,
		tutorBooking:  tutorBooking,
		jwt:           jwt,
	}
}

func (h *MentorHandler) Router(r chi.Router) {
	r.Post("/join", h.JoinByCode)
	r.Get("/students", h.ListStudents)
	r.Get("/students/{studentId}", h.GetStudentDetail)
	r.Get("/invite-code", h.GetInviteCode)

	r.Get("/balance", h.GetBalance)
	r.Get("/transactions", h.ListTransactions)
	r.Post("/withdrawals", h.RequestWithdrawal)
	r.Get("/withdrawals", h.ListWithdrawals)
	r.Get("/finance/stats", h.GetFinanceStats)

	r.Route("/sessions", func(r chi.Router) {
		r.Get("/", h.ListSessions)
		r.Post("/", h.CreateSession)
		r.Get("/stats", h.GetBookingStats)
		r.Get("/{sessionId}", h.GetSessionDetail)
		r.Post("/{sessionId}/accept", h.ApproveBooking)
		r.Post("/{sessionId}/reject", h.DeclineBooking)
	})
}

func (h *MentorHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	// Verify tutor existence logic is inside service List method usually, or handled here?
	// TutorBookingService.List gets tutor by middleware UserID. So it's fine.

	filter := model.Pagination{}
	if err := shared.Decoder.Decode(&filter, r.URL.Query()); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}
	filter.SetDefault()

	// Need to check Sort? Service sets default.
	req := dto.ListTutorBookingRequest{
		Pagination: filter,
	}

	sessions, meta, err := h.tutorBooking.List(r.Context(), req)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	var res []SessionResponse
	for _, s := range sessions {
		res = append(res, ToSessionResponse(s))
	}

	response.Success(w, http.StatusOK, res, base.SetMetadata(meta))
}

func (h *MentorHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTutorBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	// Validate req? shared.Validator.Struct(req)?
	// TutorBookingService.Create does some validation but explicit validation here is good.
	// But let's rely on service or add manual validation if needed. DTO has tags? Yes. Not implemented validation here yet.
	// Ideally use shared.Validator.Struct(req) if available. Assuming existing pattern.

	booking, err := h.tutorBooking.Create(r.Context(), req)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, ToSessionResponse(booking))
}

func (h *MentorHandler) JoinByCode(w http.ResponseWriter, r *http.Request) {
	var req JoinByCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	studentID := claims.UserID

	if err := h.mentorStudent.JoinByCode(r.Context(), req.Code, studentID); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, nil)
}

func (h *MentorHandler) ListStudents(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	filter := model.Pagination{}
	if err := shared.Decoder.Decode(&filter, r.URL.Query()); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}
	filter.SetDefault()

	students, meta, err := h.mentorStudent.ListStudents(r.Context(), tutorID, filter)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	var res []MentorStudentResponse
	for _, s := range students {
		res = append(res, ToMentorStudentResponse(s))
	}

	response.Success(w, http.StatusOK, res, base.SetMetadata(meta))
}

func (h *MentorHandler) GetInviteCode(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	code, err := h.mentorStudent.GetInviteCode(r.Context(), tutorID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, InviteCodeResponse{Code: code})
}

func (h *MentorHandler) GetBalance(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	balance, err := h.mentorBalance.GetBalance(r.Context(), tutorID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, BalanceResponse{Balance: balance.Balance.String()})
}

func (h *MentorHandler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	filter := model.Pagination{}
	if err := shared.Decoder.Decode(&filter, r.URL.Query()); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}
	filter.SetDefault()

	txs, meta, err := h.mentorBalance.ListTransactions(r.Context(), tutorID, filter)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	var res []TransactionResponse
	for _, t := range txs {
		res = append(res, ToTransactionResponse(t))
	}

	response.Success(w, http.StatusOK, res, base.SetMetadata(meta))
}

func (h *MentorHandler) RequestWithdrawal(w http.ResponseWriter, r *http.Request) {
	var req WithdrawalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"), base.SetError(err.Error()))
		return
	}

	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	withdrawal := model.WithdrawalRequest{
		TutorID:       tutorID,
		Amount:        decimal.NewFromFloat(req.Amount),
		BankName:      req.BankName,
		AccountNumber: req.AccountNumber,
		AccountName:   req.AccountName,
	}

	if err := h.mentorBalance.RequestWithdrawal(r.Context(), tutorID, withdrawal); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, nil)
}

func (h *MentorHandler) ListWithdrawals(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	status := r.URL.Query().Get("status")

	filter := model.Pagination{}
	if err := shared.Decoder.Decode(&filter, r.URL.Query()); err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}
	filter.SetDefault()

	withdrawals, meta, err := h.mentorBalance.ListWithdrawals(r.Context(), tutorID, status, filter)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	var res []WithdrawalResponse
	for _, w := range withdrawals {
		res = append(res, ToWithdrawalResponse(w))
	}

	response.Success(w, http.StatusOK, res, base.SetMetadata(meta))
}

func (h *MentorHandler) GetStudentDetail(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}

	studentIDStr := chi.URLParam(r, "studentId")
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		response.Failure(w, base.SetError("invalid student ID"))
		return
	}

	// Get student relationship
	ms, err := h.mentorStudent.GetStudentDetail(r.Context(), claims.UserID, studentID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	// Get session history for this student with this tutor
	bookings, _, err := h.tutorBooking.ListByStudentID(r.Context(), claims.UserID, studentID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	res := ToStudentDetailResponse(*ms, bookings)
	response.Success(w, http.StatusOK, res)
}

func (h *MentorHandler) GetSessionDetail(w http.ResponseWriter, r *http.Request) {
	sessionIDStr := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response.Failure(w, base.SetError("invalid session ID"))
		return
	}

	booking, err := h.tutorBooking.GetByID(r.Context(), sessionID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	res := ToSessionResponse(*booking)
	response.Success(w, http.StatusOK, res)
}

func (h *MentorHandler) ApproveBooking(w http.ResponseWriter, r *http.Request) {
	sessionIDStr := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response.Failure(w, base.SetError("invalid session ID"))
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	err = h.tutorBooking.ApproveBooking(r.Context(), dto.ApproveTutorBookingRequest{
		ID:    sessionID,
		Notes: null.StringFrom(req.Notes),
	})
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, nil)
}

func (h *MentorHandler) DeclineBooking(w http.ResponseWriter, r *http.Request) {
	sessionIDStr := chi.URLParam(r, "sessionId")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response.Failure(w, base.SetError("invalid session ID"))
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Failure(w, base.SetError("invalid request body"))
		return
	}

	err = h.tutorBooking.DeclineBooking(r.Context(), dto.DeclineTutorBookingRequest{
		ID:    sessionID,
		Notes: null.StringFrom(req.Reason),
	})
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, nil)
}

func (h *MentorHandler) GetBookingStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}

	// Fetch statistics of bookings for this tutor
	// Note: We'll use FinanceStats logic or specific counters.
	// The MentorBalanceService has GetFinanceStats which is broad.
	// For BookingStats, we should ideally have a counter in BookingService or tutorBooking.
	// Let's implement a simple counter logic here or check if it exists in service.
	// Looking at models, we can filter bookings by status.

	stats, err := h.tutorBooking.GetStats(r.Context(), claims.UserID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	response.Success(w, http.StatusOK, BookingStatsResponse{
		Pending:   stats.Pending,
		Accepted:  stats.Accepted,
		Rejected:  stats.Rejected,
		Completed: stats.Completed,
		Total:     stats.Total,
	})
}

func (h *MentorHandler) GetFinanceStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Failure(w, base.SetError("invalid token claims"))
		return
	}
	tutorID := claims.UserID

	stats, err := h.mentorBalance.GetFinanceStats(r.Context(), tutorID)
	if err != nil {
		response.Failure(w, base.SetError(err.Error()))
		return
	}

	// Map map[string]interface{} to DTO
	// Since service returns map, we should map it to our clean DTO here or in service.
	// Service returned map[string]interface{} to be generic but DTO is typed.
	// Let's manually map or update service to return struct.
	// Service already returns map with correct keys matching DTO json tags approximately.
	// But let's be safe and map it.

	s := *stats
	res := FinanceStatsResponse{
		TotalBalance:       s["total_balance"].(string),
		BalanceChangePct:   s["balance_change_pct"].(float64),
		TotalIncome30d:     s["total_income_30d"].(string),
		IncomeChangePct:    s["income_change_pct"].(float64),
		TotalCommission30d: s["total_commission_30d"].(string),
		CommissionTarget:   s["commission_target"].(string),
	}

	// Chart Data
	if cd, ok := s["chart_data"].([]map[string]interface{}); ok {
		for _, item := range cd {
			res.ChartData = append(res.ChartData, ChartDataPoint{
				Month:  item["month"].(string),
				Amount: item["amount"].(int64),
			})
		}
	}

	response.Success(w, http.StatusOK, res)
}
