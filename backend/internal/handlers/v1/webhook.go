package v1

import (
	"encoding/json"
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// WebhookXendit webhook xendit
// @Summary webhook xendit
// @Description webhook xendit
// @Tags webhook
// @Accept json
// @Produce json
// @Param X-CALLBACK-TOKEN header string true "callback token"
// @Param request body dto.WebhookXenditRequest true "create subscription student request"
// @Success 201 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/webhook/xendit [post]
func (a *Api) WebhookXendit(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.WebhookXenditRequest
	)

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[WebhookXendit] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	logger.InfoCtx(ctx).
		Str("webhook-id", r.Header.Get("webhook-id")).
		Str("X-CALLBACK-TOKEN", r.Header.Get("X-CALLBACK-TOKEN")).
		Str("event", request.Event).
		Interface("request", request).
		Msg("[WebhookXendit] handle webhook xendit")

	request.WebhookKey = r.Header.Get("X-CALLBACK-TOKEN")
	err := a.webhook.HandleWebhookXendit(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[WebhookXendit] Error handle webhook xendit")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
