package main

import (
	"github.com/rs/zerolog/log"
	"googlemaps.github.io/maps"
	"gorm.io/gorm/schema"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/internal/model"
	"github.com/lesprivate/backend/shared"
)

//go:generate go run github.com/swaggo/swag/cmd/swag init
//go:generate go run github.com/google/wire/cmd/wire

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	c := config.Load()

	setupLogging(c)

	shared.FormDecoderRegisterCustomType()
	schema.RegisterSerializer("social_media_link", model.SocialMediaLink{})

	m, err := maps.NewClient(maps.WithAPIKey(c.GoogleMaps.ApiKey))
	if err != nil {
		log.Panic().Err(err).Msg("failed create google maps client")
	}

	h := InitializeHTTP(c, m)
	h.Serve()
}
