package middleware

import (
	"github.com/go-chi/cors"
)

// CORSConfig returns CORS middleware configuration
func CORSConfig() cors.Options {
	return cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "https://*.pages.dev"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}
}
