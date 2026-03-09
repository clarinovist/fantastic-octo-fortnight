package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/lesprivate/backend/infras"
	"github.com/lesprivate/backend/internal/model"
)

type PaymentRepository struct {
	db *infras.MySQL
}

func NewPaymentRepository(db *infras.MySQL) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Get(ctx context.Context, filter model.PaymentFilter) ([]model.Payment, error) {
	var payments []model.Payment
	db := r.db.Read.WithContext(ctx)

	if filter.StudentID != uuid.Nil {
		db = db.Where("student_id = ?", filter.StudentID)
	}

	if len(filter.StatusIn) > 0 {
		db = db.Where("status IN (?)", filter.StatusIn)
	}

	if !filter.Pagination.IsEmpty() {
		db = db.Limit(filter.Pagination.Limit()).
			Offset(filter.Pagination.Offset())
	}

	if sort := filter.Sort.String(); sort != "" {
		db = db.Order(sort)
	}

	err := db.Find(&payments).Error
	return payments, err
}

func (r *PaymentRepository) Create(ctx context.Context, payment *model.Payment) error {
	return r.db.Write.WithContext(ctx).Save(payment).Error
}

func (r *PaymentRepository) GetByID(ctx context.Context, id string) (*model.Payment, error) {
	var payment model.Payment
	err := r.db.Read.WithContext(ctx).Preload("Student.User").Where("id = ?", id).First(&payment).Error
	return &payment, err
}

func (r *PaymentRepository) GetByInvoiceNumber(ctx context.Context, id string) (*model.Payment, error) {
	var payment model.Payment
	err := r.db.Read.WithContext(ctx).Preload("Student.User").Where("invoice_number = ?", id).First(&payment).Error
	return &payment, err
}

func (r *PaymentRepository) Update(ctx context.Context, payment *model.Payment) error {
	return r.db.Write.WithContext(ctx).Save(payment).Error
}

func (r *PaymentRepository) UpdateWithStudent(ctx context.Context, payment *model.Payment, student *model.Student) error {
	return r.db.Write.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(payment).Error; err != nil {
			return err
		}
		if err := tx.Save(student).Error; err != nil {
			return err
		}
		return nil
	})
}
