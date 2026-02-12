package services

import (
	"context"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/internal/model/dto"
	"github.com/lesprivate/backend/internal/repositories"
	"github.com/lesprivate/backend/shared/logger"
)

type LookupService struct {
	config *config.Config
	lookup *repositories.LookupRepository
}

func NewLookupService(
	c *config.Config,
	lookup *repositories.LookupRepository,
) *LookupService {
	return &LookupService{
		config: c,
		lookup: lookup,
	}
}

func (s LookupService) GetLookups(ctx context.Context, request dto.GetLookupsRequest) ([]model.Lookup, error) {
	filter := model.LookupFilter{
		Sort: model.Sort{
			Sort:          "created_at",
			SortDirection: "ASC",
		},
		Type: request.Type,
	}
	lookups, _, err := s.lookup.Get(ctx, filter)
	if err != nil {
		logger.ErrorCtx(ctx).Err(err).Msg("[GetLookups] Error getting lookups")
		return nil, err
	}

	return lookups, nil
}
