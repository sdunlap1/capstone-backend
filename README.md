# Task Manager API

## Auth Routes
### POST /auth/signup
- **Body**:
    - `username`: string (required)
    - `email`: string (required)
    - `password`: string (required, min 6 characters)

### POST /auth/login
- **Body**:
    - `username`: string (required)
    - `email`: string (required)
    - `password`: string (required)

## Task Routes (Protected)
### GET /tasks
- **Query Parameters**:
    - `page`: number (optional)
    - `limit`: number (optional)
    - `category_id`: number (optional)
    - `sort_by`: string (optional, default is `createdAt`)
    - `order`: string (optional, default is `DESC`)

## Category Routes (Protected)
### POST /categories
- **Body**:
    - `name`: string (required, max 255 characters)

### DELETE /categories/:id
- **Authorization**: Bearer token required
