package services

import (
	"context"
	"crypto/rand"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared"
)

type MentorStudentService struct {
	mentorStudent *repositories.MentorStudentRepository
	tutor         *repositories.TutorRepository
	inviteCode    *repositories.MentorInviteCodeRepository
	student       *repositories.StudentRepository
	user          *repositories.UserRepository
}

func NewMentorStudentService(
	mentorStudent *repositories.MentorStudentRepository,
	tutor *repositories.TutorRepository,
	inviteCode *repositories.MentorInviteCodeRepository,
	student *repositories.StudentRepository,
	user *repositories.UserRepository,
) *MentorStudentService {
	return &MentorStudentService{
		mentorStudent: mentorStudent,
		tutor:         tutor,
		inviteCode:    inviteCode,
		student:       student,
		user:          user,
	}
}

func (s *MentorStudentService) JoinByCode(ctx context.Context, code string, userID uuid.UUID) error {
	// Resolve Student from UserID
	student, err := s.student.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if student == nil {
		return shared.MakeError("not_found", "student not found")
	}

	// 1. Validate invite code
	invite, err := s.inviteCode.GetByCode(ctx, code)
	if err != nil {
		return err // TODO: return specific error "Invalid invite code"
	}

	// 2. Check if already joined
	existing, err := s.mentorStudent.GetByTutorAndStudent(ctx, invite.TutorID, student.ID)
	if err == nil && existing != nil {
		return nil // Already joined, treat as success
	}

	// 3. Create relationship
	ms := &model.MentorStudent{
		ID:        uuid.New(),
		TutorID:   invite.TutorID,
		StudentID: student.ID,
		Status:    "active",
		JoinedAt:  time.Now(),
	}

	return s.mentorStudent.Create(ctx, ms)
}

func (s *MentorStudentService) ListStudents(ctx context.Context, userID uuid.UUID, filter model.Pagination) ([]model.MentorStudent, model.Metadata, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, model.Metadata{}, err
	}
	if tutor == nil {
		return nil, model.Metadata{}, shared.MakeError("not_found", "tutor not found")
	}

	return s.mentorStudent.ListByTutor(ctx, tutor.ID, filter)
}

func (s *MentorStudentService) RemoveStudent(ctx context.Context, tutorID, studentID uuid.UUID) error {
	// Verify ownership/relationship first
	ms, err := s.mentorStudent.GetByTutorAndStudent(ctx, tutorID, studentID)
	if err != nil {
		return err
	}

	return s.mentorStudent.Delete(ctx, ms.ID)
}

func (s *MentorStudentService) GetInviteCode(ctx context.Context, userID uuid.UUID) (string, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return "", err
	}
	if tutor == nil {
		return "", shared.MakeError("not_found", "tutor not found")
	}

	// Try get existing
	code, err := s.inviteCode.GetByTutor(ctx, tutor.ID)
	if err == nil {
		return code.Code, nil
	}

	// Generate new if not exists
	newCodeStr, err := s.generateCode()
	if err != nil {
		return "", err
	}

	newCode := &model.MentorInviteCode{
		ID:      uuid.New(),
		TutorID: tutor.ID,
		Code:    newCodeStr,
	}

	if err := s.inviteCode.Create(ctx, newCode); err != nil {
		return "", err
	}

	return newCodeStr, nil
}

func (s *MentorStudentService) generateCode() (string, error) {
	// Simple random string generation 6 chars
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		b[i] = charset[num.Int64()]
	}
	return string(b), nil
}

// GetStudentDetail returns student profile + session history for this tutor
func (s *MentorStudentService) GetStudentDetail(ctx context.Context, userID uuid.UUID, studentID uuid.UUID) (*model.MentorStudent, error) {
	tutor, err := s.tutor.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if tutor == nil {
		return nil, shared.MakeError("not_found", "tutor not found")
	}

	ms, err := s.mentorStudent.GetByTutorAndStudentWithPreload(ctx, tutor.ID, studentID)
	if err != nil {
		return nil, shared.MakeError("not_found", "student not found")
	}

	return ms, nil
}
