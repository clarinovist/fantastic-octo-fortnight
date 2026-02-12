package services

import (
	"context"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type LocationService struct {
	config   *config.Config
	location *repositories.LocationRepository
}

func NewLocationService(
	c *config.Config,
	location *repositories.LocationRepository,
) *LocationService {
	return &LocationService{
		config:   c,
		location: location,
	}
}

func (s LocationService) GetLocations(ctx context.Context, request dto.GetLocationsRequest) ([]model.Location, model.Metadata, error) {
	filter := model.LocationFilter{
		Pagination: request.Pagination,
		Query:      request.Query,
		Sort: model.Sort{
			Sort: "FIELD(type, 'province', 'city', 'district')",
		},
	}
	locations, metadata, err := s.location.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetLocations] Error getting locations")
		return nil, model.Metadata{}, err
	}

	return locations, metadata, nil
}
