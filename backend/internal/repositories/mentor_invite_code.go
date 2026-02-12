package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"gorm.io/gorm"
)

type MentorInviteCodeRepository struct {
	db *gorm.DB
}

func NewMentorInviteCodeRepository(db *gorm.DB) *MentorInviteCodeRepository {
	return &MentorInviteCodeRepository{
		db: db,
	}
}

func (r *MentorInviteCodeRepository) Create(ctx context.Context, code *model.MentorInviteCode) error {
	return r.db.WithContext(ctx).Create(code).Error
}

func (r *MentorInviteCodeRepository) GetByTutor(ctx context.Context, tutorID uuid.UUID) (*model.MentorInviteCode, error) {
	var code model.MentorInviteCode
	if err := r.db.WithContext(ctx).Where("tutor_id = ?", tutorID).First(&code).Error; err != nil {
		return nil, err
	}
	return &code, nil
}

func (r *MentorInviteCodeRepository) GetByCode(ctx context.Context, codeStr string) (*model.MentorInviteCode, error) {
	var code model.MentorInviteCode
	if err := r.db.WithContext(ctx).Where("code = ?", codeStr).First(&code).Error; err != nil {
		return nil, err
	}
	return &code, nil
}
