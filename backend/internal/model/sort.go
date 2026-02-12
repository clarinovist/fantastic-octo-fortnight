package model

import "fmt"

type Sort struct {
	Sort          string `form:"sort"`
	SortDirection string `form:"sortDirection"`
}

func (s *Sort) SetDefault() {
	if s.Sort == "" {
		s.Sort = "created_at"
	}

	if s.SortDirection == "" {
		s.SortDirection = "desc"
	}
}

func (s *Sort) SetDefaultWithValue(sort, sortDirection string) {
	if s.Sort == "" {
		s.Sort = sort
	}

	if s.SortDirection == "" {
		s.SortDirection = sortDirection
	}
}

func (s *Sort) String() string {
	if s.Sort == "" && s.SortDirection == "" {
		return ""
	}

	return fmt.Sprintf("%s %s", s.Sort, s.SortDirection)
}
