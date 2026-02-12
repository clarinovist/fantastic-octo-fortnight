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

// ListStudentReview list student review
// @Summary List student review
// @Description List student review
// @Tags student-review
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Items per page" default(10)
// @Param sort query string false "Sort by field"
// @Param sortDirection query string false "Sort direction"
// @Success 200 {object} base.Base{data=[]dto.Review}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/reviews [get]
func (a *Api) ListStudentReview(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.ListReviewRequest
	)

	err := decoder.Decode(&request, r.URL.Query())
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentReview] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.Pagination.SetDefault()
	request.Sort.SetDefault()

	reviews, metadata, err := a.studentReview.List(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[ListStudentReview] Error list student review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	resp := make([]dto.Review, len(reviews))
	for i, b := range reviews {
		resp[i] = dto.Review{
			ID:                 b.ID,
			Name:               b.Tutor.User.Name,
			Email:              b.Tutor.User.Email,
			PhotoProfile:       b.Tutor.PhotoProfile,
			CourseTitle:        b.Course.Title,
			Review:             b.Review,
			Rate:               b.Rate,
			IsReviewed:         b.Review.Valid,
			RecommendByStudent: b.RecommendByStudent,
			CreatedAt:          b.CreatedAt,
			UpdatedAt:          b.UpdatedAt,
		}
	}

	response.Success(w, http.StatusOK, resp, base.SetMetadata(metadata))
}

// UpdateStudentReview update student review
// @Summary Update student review
// @Description Update List student review
// @Tags student-review
// @Accept json
// @Produce json
// @Param id path string true "ID of review"
// @Param request body dto.UpdateReviewRequest true "update student review request"
// @Success 200 {object} base.Base{data=string}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 500 {object} base.Base
// @Security BearerAuth
// @Router /v1/students/reviews/{id} [put]
func (a *Api) UpdateStudentReview(w http.ResponseWriter, r *http.Request) {
	var (
		ctx     = r.Context()
		request dto.UpdateReviewRequest
	)

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error decoding request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	if err := request.Validate(); err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error validate request body")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error parse id")
		response.Failure(w, func(b *base.Base) {
			b.StatusCode = http.StatusBadRequest
			b.Error = err.Error()
			b.Message = "Invalid request body"
		})
		return
	}

	request.ID = id
	err = a.studentReview.Update(ctx, request)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[UpdateStudentReview] Error update student review")
		response.Failure(w, base.CustomError(services.Error(err)))
		return
	}

	response.Success(w, http.StatusOK, "success")
}
