package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/choorai/b2b-admin-api/internal/model"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// ProjectHandler handles project-related requests
type ProjectHandler struct {
	mu       sync.RWMutex
	projects map[string]*model.Project
}

// NewProjectHandler creates a new project handler with in-memory storage
func NewProjectHandler() *ProjectHandler {
	h := &ProjectHandler{
		projects: make(map[string]*model.Project),
	}
	// Add seed data
	h.seedData()
	return h
}

func (h *ProjectHandler) seedData() {
	now := time.Now()
	seeds := []model.Project{
		{
			ID:          uuid.New().String(),
			Name:        "E-commerce Platform",
			Description: "Online shopping platform with payment integration",
			Status:      "active",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          uuid.New().String(),
			Name:        "CRM System",
			Description: "Customer relationship management system",
			Status:      "active",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Analytics Dashboard",
			Description: "Real-time analytics and reporting dashboard",
			Status:      "planning",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
	for i := range seeds {
		h.projects[seeds[i].ID] = &seeds[i]
	}
}

// List handles GET /api/v1/projects
func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	projects := make([]*model.Project, 0, len(h.projects))
	for _, p := range h.projects {
		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// Get handles GET /api/v1/projects/{id}
func (h *ProjectHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.RLock()
	project, exists := h.projects[id]
	h.mu.RUnlock()

	if !exists {
		http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

// Create handles POST /api/v1/projects
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	now := time.Now()
	project := &model.Project{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Description: req.Description,
		Status:      "active",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	h.mu.Lock()
	h.projects[project.ID] = project
	h.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project)
}

// Update handles PUT /api/v1/projects/{id}
func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.Lock()
	defer h.mu.Unlock()

	project, exists := h.projects[id]
	if !exists {
		http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
		return
	}

	var req model.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Name != "" {
		project.Name = req.Name
	}
	if req.Description != "" {
		project.Description = req.Description
	}
	if req.Status != "" {
		project.Status = req.Status
	}
	project.UpdatedAt = time.Now()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

// Delete handles DELETE /api/v1/projects/{id}
func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.projects[id]; !exists {
		http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
		return
	}

	delete(h.projects, id)
	w.WriteHeader(http.StatusNoContent)
}
