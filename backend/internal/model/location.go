package model

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Location struct {
	ID        uuid.UUID `gorm:"primaryKey"`
	CountryID uuid.UUID
	ParentID  uuid.UUID
	Name      string
	Type      string
	FullName  string
	CreatedAt time.Time
}

func (l Location) MarshalBinary() ([]byte, error) {
	return json.Marshal(l)
}

func (l *Location) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, l)
}

func (l *Location) ShortName() string {
	location := strings.Split(l.FullName, ", ")
	if len(location) >= 2 {
		return fmt.Sprintf("%s, %s", location[0], location[1])
	}

	return l.FullName
}

func (l *Location) Key() string {
	return "location:" + l.ID.String()
}

type LocationFilter struct {
	Pagination
	Sort
	ID    uuid.UUID
	Query string
}

type LatLongLocationCache struct {
	Latitude  decimal.Decimal
	Longitude decimal.Decimal
}

func (l LatLongLocationCache) MarshalBinary() ([]byte, error) {
	return json.Marshal(l)
}

func (l *LatLongLocationCache) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, l)
}
