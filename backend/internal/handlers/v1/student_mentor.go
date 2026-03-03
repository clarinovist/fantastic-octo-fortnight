package v1

import (
	"net/http"

	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/services"
	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/shared/logger"
	"github.com/lesprivate/backend/transport/http/middleware"
	"github.com/lesprivate/backend/transport/http/response"
)

// GetStudentTutors get learning mentors for student
// @Summary List mentors
// @Description List active mentors/tutors for the authenticated student
// @Tags student
// @Accept json
// @Produce json
// @Success 200 {object} base.Base{data=[]dto.StudentTutorResponse}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/tutors [get]
func (a *Api) GetStudentTutors(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := middleware.GetUserID(ctx)

	// Fetch student by user ID (wait, profile.GetProfile returns ProfileResponse where ID is the user ID)
	profile, err := a.profile.GetProfile(ctx, userID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentTutors] Error getting student profile")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	mentors, err := a.mentorStudent.ListStudentTutors(ctx, profile.ID)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetStudentTutors] Error get mentor students")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.StudentTutorResponse, len(mentors))
	for i, m := range mentors {
		resp[i] = dto.StudentTutorResponse{
			TutorID:      m.TutorID,
			Name:         m.Tutor.User.Name,
			PhotoProfile: m.Tutor.PhotoProfile,
			JoinedAt:     m.JoinedAt,
		}
	}

	response.Success(w, http.StatusOK, resp)
}
