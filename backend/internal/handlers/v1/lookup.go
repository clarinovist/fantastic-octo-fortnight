package v1

import (
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetLookups get lookups by type
// @Summary Get lookups by type
// @Description get lookups by type
// @Tags lookups
// @Param type query string true "type"
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.Lookup}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/lookups [get]
func (a *Api) GetLookups(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetLookupsRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error decoding request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	if err = request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("Error validate request")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = err.Error()
		})
		return
	}

	lookups, err := a.lookup.GetLookups(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewLookups(lookups))
}
