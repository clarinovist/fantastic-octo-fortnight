package http

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/lesprivate/backend/config"
	"github.com/lesprivate/backend/docs"
	v1 "github.com/lesprivate/backend/internal/handlers/v1"
	middlewareint "github.com/lesprivate/backend/transport/http/middleware"
)

type HTTP struct {
	port   string
	router *chi.Mux
	config *config.Config
	v1     *v1.Api
}

func New(c *config.Config, v1 *v1.Api) *HTTP {
	h := &HTTP{
		port:   c.App.Port,
		router: chi.NewRouter(),
		config: c,
		v1:     v1,
	}

	h.globalMiddleware()
	h.registerRouter()

	return h
}

func (h *HTTP) globalMiddleware() {
	h.router.Use(middlewareint.RequestID)
	h.router.Use(middleware.Logger)
	h.router.Use(middleware.Recoverer)
	h.setupCORS()
	h.setupSwaggerDocs()
}

func (h *HTTP) registerRouter() {
	h.router.Route("/v1", func(r chi.Router) {
		h.v1.Router(r)
	})
}

func (h *HTTP) setupCORS() {
	corsConfig := h.config.App.CORS
	if corsConfig.Enable {
		corsHeaderInfo := "CORS Header"
		log.Info().Msg("CORS Headers and Handlers are enabled.")
		log.Info().Str(corsHeaderInfo, fmt.Sprintf("Access-Control-Allow-Credentials: %t", corsConfig.AllowCredentials)).Msg("")
		log.Info().Str(corsHeaderInfo, fmt.Sprintf("Access-Control-Allow-Headers: %s", strings.Join(corsConfig.AllowedHeaders, ", "))).Msg("")
		log.Info().Str(corsHeaderInfo, fmt.Sprintf("Access-Control-Allow-Methods: %s", strings.Join(corsConfig.AllowedMethods, ", "))).Msg("")
		log.Info().Str(corsHeaderInfo, fmt.Sprintf("Access-Control-Allow-Origin: %s", strings.Join(corsConfig.AllowedOrigins, ", "))).Msg("")
		log.Info().Str(corsHeaderInfo, fmt.Sprintf("Access-Control-Max-Age: %d", corsConfig.MaxAgeSeconds)).Msg("")
		h.router.Use(cors.Handler(cors.Options{
			AllowedOrigins:   corsConfig.AllowedOrigins,
			AllowedMethods:   corsConfig.AllowedMethods,
			AllowedHeaders:   corsConfig.AllowedHeaders,
			AllowCredentials: corsConfig.AllowCredentials,
			MaxAge:           corsConfig.MaxAgeSeconds,
		}))
	} else {
		log.Info().Msg("CORS Headers are disabled.")
	}
}

func (h *HTTP) setupSwaggerDocs() {
	if h.config.App.Env == "development" {
		docs.SwaggerInfo.Title = h.config.App.Name
		swaggerURL := fmt.Sprintf("%s/swagger/doc.json", h.config.App.URL)
		h.router.Get("/swagger/*", httpSwagger.Handler(httpSwagger.URL(swaggerURL)))
		log.Info().Str("url", swaggerURL).Msg("Swagger documentation enabled.")
	}
}

func (h *HTTP) Serve() {
	log.Info().Str("port", h.port).Msg("service started")
	http.ListenAndServe(":"+h.port, h.router)
}
