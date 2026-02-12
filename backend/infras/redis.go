package infras

import (
	"context"
	"fmt"

	"github.com/lesprivate/backend/config"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

type Redis struct {
	Client *redis.Client
}

func NewRedis(c *config.Config) *Redis {
	r := c.Redis
	client := redis.NewClient(&redis.Options{
		Addr:       fmt.Sprintf("%s:%s", r.Host, r.Port),
		Password:   r.Password,
		DB:         r.DB,
		MaxRetries: r.MaxRetries,
	})

	if _, err := client.Ping(context.TODO()).Result(); err != nil {
		log.Panic().Err(err).Msg("failed connect redis")
	}

	return &Redis{
		Client: client,
	}
}
