package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type TutorDocumentRepository struct {
	db *infras.MySQL
}

func NewTutorDocumentRepository(db *infras.MySQL) *TutorDocumentRepository {
	return &TutorDocumentRepository{db: db}
}

func (r *TutorDocumentRepository) Create(ctx context.Context, document *model.TutorDocument) error {
	return r.db.Write.WithContext(ctx).Create(document).Error
}

func (r *TutorDocumentRepository) Get(ctx context.Context, filter model.TutorDocumentFilter) ([]model.TutorDocument, error) {
	var documents []model.TutorDocument
	db := r.db.Read.WithContext(ctx)

	if filter.ID != uuid.Nil {
		db = db.Where("id = ?", filter.ID)
	}

	if filter.TutorID != uuid.Nil {
		db = db.Where("tutor_id = ?", filter.TutorID)
	}

	if filter.Status != "" {
		db = db.Where("status = ?", filter.Status)
	}

	if len(filter.ExcludeStatuses) > 0 {
		db = db.Where("status NOT IN ?", filter.ExcludeStatuses)
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if filter.Sort.String() != "" {
		db = db.Order(filter.Sort.String())
	}

	err := db.Find(&documents).Error
	return documents, err
}

func (r *TutorDocumentRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.TutorDocument, error) {
	var document model.TutorDocument
	err := r.db.Read.WithContext(ctx).Where("id = ?", id).First(&document).Error

	return &document, err
}

func (r *TutorDocumentRepository) Update(ctx context.Context, document *model.TutorDocument) error {
	return r.db.Write.WithContext(ctx).Save(document).Error
}
