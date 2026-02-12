package services

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
)

type TutorDocumentService struct {
	tutorDocument *repositories.TutorDocumentRepository
	tutor         *repositories.TutorRepository
	courseService *CourseService
}

func NewTutorDocumentService(
	tutorDocument *repositories.TutorDocumentRepository,
	tutor *repositories.TutorRepository,
	courseService *CourseService,
) *TutorDocumentService {
	return &TutorDocumentService{
		tutorDocument: tutorDocument,
		tutor:         tutor,
		courseService: courseService,
	}
}

func (s *TutorDocumentService) CreateTutorDocument(ctx context.Context, request dto.CreateTutorDocumentRequest) error {
	userID := middleware.GetUserID(ctx)
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Error getting tutor by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[CreateTutorDocument] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	document := &model.TutorDocument{
		ID:        uuid.New(),
		TutorID:   tutor.ID,
		URL:       request.URL,
		Status:    model.TutorDocumentStatusPendingCreated,
		CreatedAt: time.Now(),
		CreatedBy: userID,
		UpdatedAt: time.Now(),
		UpdatedBy: userID,
	}

	err = s.tutorDocument.Create(ctx, document)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateTutorDocument] Error creating tutor document")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *TutorDocumentService) ListTutorDocument(ctx context.Context, request dto.ListTutorDocumentRequest) ([]model.TutorDocument, error) {
	userID := middleware.GetUserID(ctx)
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorDocument] Error getting tutor by user ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[ListTutorDocument] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	filter := model.TutorDocumentFilter{
		TutorID: tutor.ID,
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	}
	documents, err := s.tutorDocument.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListTutorDocument] Error creating tutor document")
		return nil, shared.MakeError(ErrInternalServer)
	}

	return documents, nil
}

func (s *TutorDocumentService) DeleteTutorDocument(ctx context.Context, id uuid.UUID) error {
	userID := middleware.GetUserID(ctx)
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteTutorDocument] Error getting tutor by user ID")
		return shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[DeleteTutorDocument] Tutor not found")
		return shared.MakeError(ErrEntityNotFound, "tutor")
	}

	document, err := s.tutorDocument.GetByID(ctx, id)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteTutorDocument] Error getting tutor document by ID")
		return shared.MakeError(ErrInternalServer)
	}

	if document == nil {
		logger.ErrorCtx(ctx).Msg("[DeleteTutorDocument] Tutor document not found")
		return shared.MakeError(ErrEntityNotFound, "tutor document")
	}

	if document.Status == model.TutorDocumentStatusPendingDeleted {
		logger.ErrorCtx(ctx).Msg("[DeleteTutorDocument] Tutor document already deleted")
		return shared.MakeError(ErrBadRequest, "document already deleted")
	}

	document.Status = model.TutorDocumentStatusPendingDeleted
	document.UpdatedAt = time.Now()
	document.UpdatedBy = userID

	err = s.tutorDocument.Update(ctx, document)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[DeleteTutorDocument] Error creating tutor document")
		return shared.MakeError(ErrInternalServer)
	}

	return nil
}

func (s *TutorDocumentService) GetAdminTutorDocuments(ctx context.Context, id uuid.UUID) ([]model.TutorDocument, error) {
	filter := model.TutorDocumentFilter{
		TutorID: id,
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "desc",
		},
	}

	documents, err := s.tutorDocument.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetAdminTutorDocuments] Error getting tutor documents")
		return nil, shared.MakeError(ErrInternalServer)
	}

	return documents, nil
}

func (s *TutorDocumentService) CreateAdminTutorDocument(ctx context.Context, tutorID uuid.UUID, request dto.CreateAdminTutorDocumentRequest) (*model.TutorDocument, error) {
	userID := middleware.GetUserID(ctx)

	// Verify tutor exists
	tutor, err := s.tutor.GetByID(ctx, tutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutorDocument] Error getting tutor by ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[CreateAdminTutorDocument] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	document := &model.TutorDocument{
		ID:        uuid.New(),
		TutorID:   tutorID,
		URL:       request.URL,
		Status:    model.TutorDocumentStatusActive,
		CreatedAt: time.Now(),
		CreatedBy: userID,
		UpdatedAt: time.Now(),
		UpdatedBy: userID,
	}

	err = s.tutorDocument.Create(ctx, document)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[CreateAdminTutorDocument] Error creating tutor document")
		return nil, shared.MakeError(ErrInternalServer)
	}

	logger.InfoCtx(ctx).
		Str("tutor_id", tutorID.String()).
		Str("document_id", document.ID.String()).
		Msg("[CreateAdminTutorDocument] Tutor document created successfully by admin")

	return document, nil
}

func (s *TutorDocumentService) UpdateTutorDocumentStatus(ctx context.Context, tutorID, documentID uuid.UUID, status model.TutorDocumentStatus) (*model.TutorDocument, error) {
	userID := middleware.GetUserID(ctx)

	// Verify tutor exists
	tutor, err := s.tutor.GetByID(ctx, tutorID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorDocumentStatus] Error getting tutor by ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if tutor == nil {
		logger.ErrorCtx(ctx).Msg("[UpdateTutorDocumentStatus] Tutor not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor")
	}

	// Get the document
	document, err := s.tutorDocument.GetByID(ctx, documentID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorDocumentStatus] Error getting tutor document by ID")
		return nil, shared.MakeError(ErrInternalServer)
	}

	if document == nil {
		logger.ErrorCtx(ctx).Msg("[UpdateTutorDocumentStatus] Tutor document not found")
		return nil, shared.MakeError(ErrEntityNotFound, "tutor document")
	}

	// Verify document belongs to the tutor
	if document.TutorID != tutorID {
		logger.ErrorCtx(ctx).Msg("[UpdateTutorDocumentStatus] Document does not belong to tutor")
		return nil, shared.MakeError(ErrBadRequest, "document does not belong to tutor")
	}

	// Update document status
	document.Status = status
	document.UpdatedAt = time.Now()
	document.UpdatedBy = userID

	err = s.tutorDocument.Update(ctx, document)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorDocumentStatus] Error updating tutor document")
		return nil, shared.MakeError(ErrInternalServer)
	}

	// If document status is set to active, validate profile and update tutor status
	if status == model.TutorDocumentStatusActive && tutor.IsFinishUpdateProfile() {
		// Update tutor status to active
		tutor.Status.String = model.TutorStatusActive
		tutor.Status.Valid = true
		tutor.UpdatedAt = time.Now()
		tutor.UpdatedBy.UUID = userID
		tutor.UpdatedBy.Valid = true

		err = s.tutor.Update(ctx, tutor)
		if err != nil {
			logger.ErrorCtx(ctx).Err(err).Msg("[UpdateTutorDocumentStatus] Error updating tutor status")
			return nil, shared.MakeError(ErrInternalServer)
		}

		logger.InfoCtx(ctx).
			Str("tutor_id", tutorID.String()).
			Str("document_id", documentID.String()).
			Msg("[UpdateTutorDocumentStatus] Tutor status updated to active with validated profile")
	}

	return document, nil
}
