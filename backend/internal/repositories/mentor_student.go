package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"gorm.io/gorm"
)

type MentorStudentRepository struct {
	db *gorm.DB
}

func NewMentorStudentRepository(db *gorm.DB) *MentorStudentRepository {
	return &MentorStudentRepository{
		db: db,
	}
}

func (r *MentorStudentRepository) Create(ctx context.Context, mentorStudent *model.MentorStudent) error {
	return r.db.WithContext(ctx).Create(mentorStudent).Error
}

func (r *MentorStudentRepository) GetByTutorAndStudent(ctx context.Context, tutorID, studentID uuid.UUID) (*model.MentorStudent, error) {
	var mentorStudent model.MentorStudent
	if err := r.db.WithContext(ctx).
		Where("tutor_id = ? AND student_id = ?", tutorID, studentID).
		First(&mentorStudent).Error; err != nil {
		return nil, err
	}
	return &mentorStudent, nil
}

func (r *MentorStudentRepository) ListByTutor(ctx context.Context, tutorID uuid.UUID, filter model.Pagination) ([]model.MentorStudent, model.Metadata, error) {
	var (
		mentorStudents []model.MentorStudent
		total          int64
		metadata       = model.Metadata{
			Page:     filter.Page,
			PageSize: filter.PageSize,
		}
	)

	query := r.db.WithContext(ctx).Model(&model.MentorStudent{}).
		Select("mentor_students.*, (SELECT COUNT(*) FROM bookings WHERE bookings.student_id = mentor_students.student_id AND bookings.tutor_id = mentor_students.tutor_id AND bookings.status = 'accepted') as total_sessions").
		Where("tutor_id = ?", tutorID).
		Preload("Student").Preload("Student.User")

	if err := query.Count(&total).Error; err != nil {
		return nil, metadata, err
	}

	if err := query.Limit(filter.Limit()).Offset(filter.Offset()).Find(&mentorStudents).Error; err != nil {
		return nil, metadata, err
	}

	metadata.Total = total
	return mentorStudents, metadata, nil
}

func (r *MentorStudentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.MentorStudent{}, id).Error
}

func (r *MentorStudentRepository) GetByTutorAndStudentWithPreload(ctx context.Context, tutorID, studentID uuid.UUID) (*model.MentorStudent, error) {
	var mentorStudent model.MentorStudent
	if err := r.db.WithContext(ctx).
		Where("tutor_id = ? AND student_id = ?", tutorID, studentID).
		Preload("Student").Preload("Student.User").
		First(&mentorStudent).Error; err != nil {
		return nil, err
	}
	return &mentorStudent, nil
}

func (r *MentorStudentRepository) CountByTutor(ctx context.Context, tutorID uuid.UUID) (int64, error) {
	var total int64
	if err := r.db.WithContext(ctx).Model(&model.MentorStudent{}).
		Where("tutor_id = ? AND status = ?", tutorID, "active").
		Count(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}
