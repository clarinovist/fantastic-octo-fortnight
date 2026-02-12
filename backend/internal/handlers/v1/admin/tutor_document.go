package admin

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/response"
)

// CreateTutorDocument
// @Summary Create tutor document
// @Description create a new tutor document by admin
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tutorId path string true "Tutor ID"
// @Param request body dto.CreateAdminTutorDocumentRequest true "Create tutor document request"
// @Success 201 {object} base.Base{data=dto.AdminTutorDocument}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{tutorId}/documents [post]
func (a *Api) CreateTutorDocument(w http.ResponseWriter, r *http.Request) {
	var (
		ctx        = r.Context()
		tutorIdStr = chi.URLParam(r, "tutorId")
		req        dto.CreateAdminTutorDocumentRequest
	)

	tutorID, err := uuid.Parse(tutorIdStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid tutor ID format"), base.SetError(err.Error()))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Error decoding body")
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid JSON format"))
		return
	}

	if err := req.Validate(); err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Validation failed"), base.SetError(err.Error()))
		return
	}

	document, err := a.tutorDocument.CreateAdminTutorDocument(ctx, tutorID, req)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform model to DTO
	resp := dto.AdminTutorDocument{
		ID:      document.ID,
		TutorID: document.TutorID,
		URL:     document.URL,
		Status:  document.Status,
	}

	response.Success(w, http.StatusCreated, resp)
}

// GetTutorDocuments
// @Summary Get tutor documents
// @Description get tutor documents
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tutorId path string true "Tutor ID"
// @Success 200 {object} base.Base{data=[]dto.AdminTutorDocument}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 409 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{tutorId}/documents [get]
func (a *Api) GetTutorDocuments(w http.ResponseWriter, r *http.Request) {
	var (
		ctx        = r.Context()
		tutorIdStr = chi.URLParam(r, "tutorId")
	)

	id, err := uuid.Parse(tutorIdStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid ID format"), base.SetError(err.Error()))
		return
	}

	documents, err := a.tutorDocument.GetAdminTutorDocuments(ctx, id)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform model to DTO
	resp := make([]dto.AdminTutorDocument, 0, len(documents))
	for _, doc := range documents {
		resp = append(resp, dto.AdminTutorDocument{
			ID:      doc.ID,
			TutorID: doc.TutorID,
			URL:     doc.URL,
			Status:  doc.Status,
		})
	}

	response.Success(w, http.StatusOK, resp)
}

// UpdateTutorDocumentStatus
// @Summary Update tutor document status
// @Description update tutor document status to active or inactive
// @Tags admin-tutor
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tutorId path string true "Tutor ID"
// @Param id path string true "Document ID"
// @Param status path string true "Status (active or inactive)"
// @Success 200 {object} base.Base{data=dto.AdminTutorDocument}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 403 {object} base.Base
// @Failure 404 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/admin/tutors/{tutorId}/documents/{id}/{status} [put]
func (a *Api) UpdateTutorDocumentStatus(w http.ResponseWriter, r *http.Request) {
	var (
		ctx           = r.Context()
		tutorIdStr    = chi.URLParam(r, "tutorId")
		documentIdStr = chi.URLParam(r, "id")
		statusStr     = chi.URLParam(r, "status")
	)

	tutorID, err := uuid.Parse(tutorIdStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid tutor ID format"), base.SetError(err.Error()))
		return
	}

	documentID, err := uuid.Parse(documentIdStr)
	if err != nil {
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid document ID format"), base.SetError(err.Error()))
		return
	}

	// Validate status
	var status model.TutorDocumentStatus
	switch statusStr {
	case "active":
		status = model.TutorDocumentStatusActive
	case "inactive":
		status = model.TutorDocumentStatusInactive
	default:
		response.Failure(w, base.SetStatusCode(http.StatusBadRequest), base.SetMessage("Invalid status. Must be 'active' or 'inactive'"))
		return
	}

	document, err := a.tutorDocument.UpdateTutorDocumentStatus(ctx, tutorID, documentID, status)
	if err != nil {
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	// Transform model to DTO
	resp := dto.AdminTutorDocument{
		ID:      document.ID,
		TutorID: document.TutorID,
		URL:     document.URL,
		Status:  document.Status,
	}

	response.Success(w, http.StatusOK, resp)
}
