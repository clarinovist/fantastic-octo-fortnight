package model

import "github.com/shopspring/decimal"

type SubscriptionPrice struct {
	ID       string               `gorm:"column:id;primarykey"`
	Name     string               `gorm:"column:name"`
	Interval SubscriptionInterval `gorm:"column:interval"`
	Price    decimal.Decimal      `gorm:"column:price"`
}
