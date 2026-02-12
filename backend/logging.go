package main

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/lesprivate/backend/config"
)

func setupLogging(c *config.Config) {
	level, err := zerolog.ParseLevel(c.App.Log.Level)
	if err != nil {
		log.Panic().Err(err).Msg("failed parse level")
	}

	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	zerolog.SetGlobalLevel(level)
}
