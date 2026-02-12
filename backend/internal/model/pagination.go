package model

type Pagination struct {
	Page     int `form:"page"`
	PageSize int `form:"pageSize"`
}

func (p *Pagination) Limit() int {
	if p.PageSize == 0 {
		p.PageSize = 10
	}

	return p.PageSize
}

func (p *Pagination) Offset() int {
	if p.Page == 0 {
		p.Page = 1
	}

	return (p.Page - 1) * p.PageSize
}

func (p *Pagination) SetDefault() {
	if p.Page == 0 {
		p.Page = 1
	}

	if p.PageSize == 0 {
		p.PageSize = 10
	}
}

func (p *Pagination) IsEmpty() bool {
	return p.Page == 0 && p.PageSize == 0
}
