# B2C Todo API (Go)

Go backend for B2C Todo application using Chi router.

## Requirements

- Go 1.22+

## Quick Start

```bash
# Install dependencies
go mod tidy

# Run development server
go run .

# Build for production
go build -o server .
./server
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/v1/todos | List all todos |
| POST | /api/v1/todos | Create a todo |
| GET | /api/v1/todos/:id | Get a todo |
| PATCH | /api/v1/todos/:id | Update a todo |
| DELETE | /api/v1/todos/:id | Delete a todo |

## Docker

```bash
# Build image
docker build -t b2c-todo-api-go .

# Run container
docker run -p 8080:8080 b2c-todo-api-go
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Server port |
