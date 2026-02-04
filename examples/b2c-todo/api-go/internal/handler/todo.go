package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/choorai/b2c-todo-api/internal/model"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// TodoListResponse represents the paginated list response
type TodoListResponse struct {
	Items    []*model.Todo `json:"items"`
	Total    int           `json:"total"`
	Page     int           `json:"page"`
	PageSize int           `json:"page_size"`
}

// TodoHandler handles todo-related requests
type TodoHandler struct {
	mu    sync.RWMutex
	todos map[string]*model.Todo
}

// NewTodoHandler creates a new todo handler with in-memory storage
func NewTodoHandler() *TodoHandler {
	h := &TodoHandler{
		todos: make(map[string]*model.Todo),
	}
	// Add seed data
	h.seedData()
	return h
}

func (h *TodoHandler) seedData() {
	now := time.Now()
	desc1 := "Learn Go basics and build a simple API"
	desc2 := "Review and understand chi router patterns"
	seeds := []model.Todo{
		{
			ID:          uuid.New().String(),
			Title:       "Learn Go programming",
			Description: &desc1,
			IsCompleted: false,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          uuid.New().String(),
			Title:       "Study Chi router",
			Description: &desc2,
			IsCompleted: true,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          uuid.New().String(),
			Title:       "Build REST API",
			Description: nil,
			IsCompleted: false,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
	for i := range seeds {
		h.todos[seeds[i].ID] = &seeds[i]
	}
}

// List handles GET /api/v1/todos
func (h *TodoHandler) List(w http.ResponseWriter, r *http.Request) {
	// Parse pagination parameters
	page := 1
	pageSize := 10

	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 100 {
			pageSize = parsed
		}
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	// Collect all todos
	todos := make([]*model.Todo, 0, len(h.todos))
	for _, t := range h.todos {
		todos = append(todos, t)
	}

	total := len(todos)

	// Apply pagination
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}
	paginatedTodos := todos[start:end]

	response := TodoListResponse{
		Items:    paginatedTodos,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Get handles GET /api/v1/todos/{id}
func (h *TodoHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.RLock()
	todo, exists := h.todos[id]
	h.mu.RUnlock()

	if !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"detail": "Todo not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

// Create handles POST /api/v1/todos
func (h *TodoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.CreateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"detail": "invalid request body"})
		return
	}

	if err := req.Validate(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]string{"detail": err.Error()})
		return
	}

	now := time.Now()
	todo := &model.Todo{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: req.Description,
		IsCompleted: false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	h.mu.Lock()
	h.todos[todo.ID] = todo
	h.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

// Update handles PATCH /api/v1/todos/{id}
func (h *TodoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.Lock()
	defer h.mu.Unlock()

	todo, exists := h.todos[id]
	if !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"detail": "Todo not found"})
		return
	}

	var req model.UpdateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"detail": "invalid request body"})
		return
	}

	if req.Title != nil {
		if *req.Title == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			json.NewEncoder(w).Encode(map[string]string{"detail": "title cannot be empty"})
			return
		}
		todo.Title = *req.Title
	}
	if req.Description != nil {
		todo.Description = req.Description
	}
	if req.IsCompleted != nil {
		todo.IsCompleted = *req.IsCompleted
	}
	todo.UpdatedAt = time.Now()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

// Delete handles DELETE /api/v1/todos/{id}
func (h *TodoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.todos[id]; !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"detail": "Todo not found"})
		return
	}

	delete(h.todos, id)
	w.WriteHeader(http.StatusNoContent)
}
