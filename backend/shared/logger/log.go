package logger

import (
	"context"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func InfoCtx(ctx context.Context) *zerolog.Event {
	requestId := middleware.GetReqID(ctx)
	return log.Info().Str("requestId", requestId)
}

func WarnCtx(ctx context.Context) *zerolog.Event {
	requestId := middleware.GetReqID(ctx)
	return log.Warn().Str("requestId", requestId)
}

func ErrorCtx(ctx context.Context) *zerolog.Event {
	requestId := middleware.GetReqID(ctx)
	return log.Error().Str("requestId", requestId)
}
