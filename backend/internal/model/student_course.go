package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StudentCourse struct {
	gorm.Model

	StudentID uuid.UUID
	CourseID  uuid.UUID
}
