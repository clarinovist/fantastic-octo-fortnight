package v1

import (
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetLocations get all locations
// @Summary Get all locations
// @Description get all locations
// @Tags location
// @Param q query string false "search query"
// @Param page query int false "page number"
// @Param pageSize query int false "page size"
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.Location}
// @Failure 400 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/locations [get]
func (a *Api) GetLocations(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.GetLocationsRequest
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

	request.Pagination.SetDefault()

	locations, metadata, err := a.location.GetLocations(ctx, request)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, dto.NewLocations(locations), base.SetMetadata(metadata))
}
