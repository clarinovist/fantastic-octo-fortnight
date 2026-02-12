package dto

import (
	"strings"

	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared"
)

type GetLookupsRequest struct {
	Type string `form:"type"`
}

func (r *GetLookupsRequest) Validate() error {
	if strings.TrimSpace(r.Type) == "" {
		return shared.ErrorRequired("type")
	}

	return nil
}

type Lookup struct {
	Type        string `json:"type"`
	Code        string `json:"code"`
	Description string `json:"description"`
}

func NewLookups(lookups []model.Lookup) []Lookup {
	resp := make([]Lookup, len(lookups))
	for i, lookup := range lookups {
		resp[i] = Lookup{
			Type:        lookup.Type,
			Code:        lookup.Code,
			Description: lookup.Description,
		}
	}

	return resp
}
