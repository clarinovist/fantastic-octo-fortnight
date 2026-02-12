package dto

import (
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
)

type GetCourseCategoriesRequest struct {
	Query string `form:"q"`
	model.Pagination
}

type CourseCategory struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func NewCourseCategories(categories []model.CourseCategory) []CourseCategory {
	resp := make([]CourseCategory, len(categories))
	for i, category := range categories {
		resp[i] = CourseCategory{
			ID:   category.ID,
			Name: category.Name,
		}
	}

	return resp
}
