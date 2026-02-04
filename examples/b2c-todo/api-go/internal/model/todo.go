package model

import "time"

// Todo represents a B2C todo item
type Todo struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	IsCompleted bool      `json:"is_completed"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateTodoRequest represents the request body for creating a todo
type CreateTodoRequest struct {
	Title       string  `json:"title"`
	Description *string `json:"description"`
}

// UpdateTodoRequest represents the request body for updating a todo
type UpdateTodoRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	IsCompleted *bool   `json:"is_completed"`
}

// Validate validates the create request
func (r *CreateTodoRequest) Validate() error {
	if r.Title == "" {
		return ErrTitleRequired
	}
	if len(r.Title) > 200 {
		return ErrTitleTooLong
	}
	return nil
}

// Custom errors
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return e.Message
}

var (
	ErrTitleRequired = ValidationError{Field: "title", Message: "title is required"}
	ErrTitleTooLong  = ValidationError{Field: "title", Message: "title must be 200 characters or less"}
)
