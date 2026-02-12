package shared

import (
	"strconv"

	"github.com/go-playground/form"
	"github.com/google/uuid"
	"github.com/guregu/null/v6"
	"github.com/shopspring/decimal"
)

var Decoder = form.NewDecoder()

func FormDecoderRegisterCustomType() {
	Decoder.RegisterCustomTypeFunc(func(vals []string) (interface{}, error) {
		return uuid.Parse(vals[0])
	}, uuid.UUID{})

	Decoder.RegisterCustomTypeFunc(func(vals []string) (interface{}, error) {
		return decimal.NewFromString(vals[0])
	}, decimal.Decimal{})

	Decoder.RegisterCustomTypeFunc(func(vals []string) (interface{}, error) {
		val, err := strconv.ParseBool(vals[0])
		if err != nil {
			return null.NewBool(false, false), nil
		}

		return null.BoolFrom(val), nil
	}, null.Bool{})
}
