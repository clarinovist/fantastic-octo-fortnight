package dto

import (
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
)

type GetSubCourseCategoriesRequest struct {
	Name string `form:"name"`
	model.Pagination
	model.Sort
}

type SubCourseCategory struct {
	ID               uuid.UUID `json:"id"`
	CourseCategoryID uuid.UUID `json:"course_category_id"`
	Name             string    `json:"name"`
}

func NewSubCourseCategories(subCategories []model.SubCourseCategory) []SubCourseCategory {
	resp := make([]SubCourseCategory, len(subCategories))
	for i, subCategory := range subCategories {
		resp[i] = SubCourseCategory{
			ID:               subCategory.ID,
			CourseCategoryID: subCategory.CourseCategoryID,
			Name:             subCategory.Name,
		}
	}

	return resp
}
