# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Production stage
FROM alpine:3.20

WORKDIR /app

# Create non-root user
RUN adduser -D -g '' appuser

# Copy binary from builder
COPY --from=builder /app/server .

# Use non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080

# Run the binary
CMD ["./server"]
