package main

import (
	"log"
	"net/http"
	"os"

	"github.com/choorai/b2c-todo-api/internal/handler"
	"github.com/choorai/b2c-todo-api/internal/middleware"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file (optional, for local development)
	godotenv.Load()

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.Use(cors.Handler(middleware.CORSConfig()))

	// Handlers
	healthHandler := handler.NewHealthHandler()
	todoHandler := handler.NewTodoHandler()

	// Routes
	r.Get("/health", healthHandler.Check)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/todos", todoHandler.List)
		r.Post("/todos", todoHandler.Create)
		r.Get("/todos/{id}", todoHandler.Get)
		r.Patch("/todos/{id}", todoHandler.Update)
		r.Delete("/todos/{id}", todoHandler.Delete)
	})

	// Start server
	log.Printf("🚀 B2C Todo API (Go) running on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
