package dto

import (
	"github.com/google/uuid"

	"github.com/lesprivate/backend/internal/model"
)

type GetLocationsRequest struct {
	Query string `form:"q"`
	model.Pagination
}

type Location struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	FullName  string    `json:"fullName"`
	ShortName string    `json:"shortName"`
	Type      string    `json:"type"`
}

func NewLocations(locations []model.Location) []Location {
	resp := make([]Location, len(locations))
	for i, location := range locations {
		resp[i] = Location{
			ID:        location.ID,
			Name:      location.Name,
			FullName:  location.FullName,
			ShortName: location.ShortName(),
			Type:      location.Type,
		}
	}

	return resp
}
