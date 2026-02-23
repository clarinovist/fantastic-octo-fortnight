package v1

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// CreateTutorDocument creates a new tutor documents
// @Summary Create Tutor Document
// @Description Create a new tutor document
// @Tags tutor-document
// @Accept json
// @Produce json
// @Param request body dto.CreateTutorDocumentRequest true "Document creation request"
// @Success 201 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/documents [post]
func (a *Api) CreateTutorDocument(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.CreateTutorDocumentRequest
	)

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Request validation failed")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Validation failed"
		})
		return
	}

	err := a.tutorDocument.CreateTutorDocument(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Error creating tutor document")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusCreated, "success")
}

// ListTutorDocument list tutor documents
// @Summary List Tutor Document
// @Description List tutor document
// @Tags tutor-document
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10)
// @Success 200 {object} base.Base{data=[]dto.TutorDocumentResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/documents [get]
func (a *Api) ListTutorDocument(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.ListTutorDocumentRequest
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

	documents, err := a.tutorDocument.ListTutorDocument(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorDocument] Error list tutor document")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.TutorDocumentResponse, 0)
	for _, document := range documents {
		resp = append(resp, dto.TutorDocumentResponse{
			ID:        document.ID,
			URL:       document.URL,
			Name:      document.Name,
			Type:      document.Type,
			Status:    document.Status,
			CreatedAt: document.CreatedAt,
			UpdatedAt: document.UpdatedAt,
		})
	}

	response.Success(w, http.StatusOK, resp)
}

// DeleteTutorDocument creates a new tutor documents
// @Summary Delete Tutor Document
// @Description Delete a new tutor document
// @Tags tutor-document
// @Accept json
// @Produce json
// @Param id path string true "Document ID"
// @Success 201 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/tutors/documents/{id} [delete]
func (a *Api) DeleteTutorDocument(w http.ResponseWriter, r *http.Request) {
	var (
		ctx   = r.Context()
		idStr = chi.URLParam(r, "id")
	)

	id, err := uuid.Parse(idStr)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteTutorDocument] Error parsing id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid id"
		})
		return
	}

	err = a.tutorDocument.DeleteTutorDocument(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteTutorDocument] Error delete course")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
