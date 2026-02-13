package admin

import (
	"net/http"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetTransactions
// @Summary Get all transactions
// @Description get list of all transactions (admin only)
// @Tags admin-transaction
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "page number"
// @Param pageSize query int false "page size"
// @Param tutorName query string false "filter by tutor name"
// @Param type query string false "filter by transaction type (credit/debit)"
// @Success 200 {object} base.Base{data=[]dto.AdminTransactionResponse,metadata=model.Metadata}
// @Router /v1/admin/transactions [get]
func (a *Api) GetTransactions(w http.ResponseWriter, r *http.Request) {
	var filter model.Pagination
	if err := decoder.Decode(&filter, r.URL.Query()); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid Query Param format"), base.SetError(err.Error()))
		return
	}

	tutorName := r.URL.Query().Get("tutorName")
	txType := r.URL.Query().Get("type")

	transactions, metadata, err := a.mentorBalanceAdmin.ListAllTransactions(r.Context(), filter, tutorName, txType)
	if err != nil {
		logger.ErrorCtx(r.Context()).Err(err).Msg("failed to list all transactions")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal Server Error"))
		return
	}

	response.Success(w, http.StatusOK, transactions, base.SetMetadata(metadata))
}

// GetTransactionStats
// @Summary Get transaction statistics
// @Description get summary of transactions (admin only)
// @Tags admin-transaction
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} base.Base{data=dto.AdminTransactionStats}
// @Router /v1/admin/transactions/stats [get]
func (a *Api) GetTransactionStats(w http.ResponseWriter, r *http.Request) {
	logger.InfoCtx(r.Context()).Msg("hit GetTransactionStats handler")
	stats, err := a.mentorBalanceAdmin.GetTransactionStats(r.Context())
	if err != nil {
		logger.ErrorCtx(r.Context()).Err(err).Msg("failed to get transaction stats")
		response.Failure(w, base.SetStatusCode(http.StatusInternalServerError), base.SetMessage("Internal Server Error"))
		return
	}

	logger.InfoCtx(r.Context()).Interface("stats", stats).Msg("successfully got transaction stats")
	response.Success(w, http.StatusOK, stats)
}
