# API Documentation

This document provides detailed API documentation for the Client Review API.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently uses mock authentication via headers:
- `x-user-id`: User ID (optional)
- `x-user-email`: User email (optional)

**Example:**
```bash
curl -H "x-user-email: sarah.johnson@example.com" \
     http://localhost:3000/review/{reviewId}
```

## Endpoints

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Review Management

#### GET /review/:id
Get review details by ID.

**Query Parameters:**
- `password` (optional): Password for password-protected reviews

**Response:** See `BACKEND_API_REQUIREMENTS.md` for full schema.

**Status Codes:**
- `200`: Success
- `401`: Unauthorized (wrong password)
- `404`: Review not found

#### GET /review/:id/version/:versionId
Get version URL by version ID.

**Response:**
```json
{
  "url": "string"
}
```

#### POST /review/:id/complete
Mark review as complete and deactivate the link.

**Headers:** Requires authentication

**Response:** Updated review object

#### POST /review/:id/sharing
Update sharing settings for a review.

**Request Body:**
```json
{
  "sharingMode": "anyone | restricted",
  "approvedEmails": ["email1@example.com", "email2@example.com"]
}
```

**Response:** Updated review object

### Workflow Management

#### POST /review/:id/workflow/approve
Approve a workflow stage.

**Request Body:**
```json
{
  "stage": "client_review | art_director_review | creative_director_review"
}
```

**Workflow Logic:**
- `client_review` → `client_approved` (does NOT auto-advance)
- `art_director_review` → `art_director_approved` → `creative_director_review` (auto-advances)
- `creative_director_review` → `approved`

**Response:** Updated review object

#### POST /review/:id/workflow/reject
Reject a workflow stage (request changes).

**Request Body:**
```json
{
  "stage": "client_review | art_director_review | creative_director_review",
  "reason": "string (optional)"
}
```

**Response:** Updated review object

#### POST /review/:id/workflow/move-to-client-review
Move review from draft to client review.

**Response:** Updated review object

#### POST /review/:id/workflow/move-to-art-director-review
Move review from client approved to art director review.

**Response:** Updated review object

#### POST /review/:id/workflow/resubmit
Resubmit review after changes requested.

**Request Body:**
```json
{
  "targetStage": "art_director_review | creative_director_review"
}
```

**Response:** Updated review object

### Upload & Creation

#### POST /upload
Create a new review from file upload.

**Request Body:**
```json
{
  "filename": "string",
  "password": "string | null",
  "bypassClientReview": "boolean",
  "sharingMode": "anyone | restricted",
  "approvedEmails": ["string"]
}
```

**Response:**
```json
{
  "uploadUrl": "string (presigned URL)",
  "reviewId": "string"
}
```

#### PUT /upload/:reviewId
Upload file to presigned URL.

**Content-Type:** `multipart/form-data` or file binary

**Body:** File binary data

#### POST /review/create-from-url
Create a new review from external URL.

**Request Body:**
```json
{
  "url": "string",
  "password": "string | null",
  "bypassClientReview": "boolean",
  "sharingMode": "anyone | restricted",
  "approvedEmails": ["string"]
}
```

**Response:**
```json
{
  "reviewId": "string"
}
```

### Version Management

#### POST /review/:id/versions
Upload a new version for a review.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: File binary
- `label`: "string"
- `notes`: "string (optional)"
- `type`: "string (optional)"

**Response:** New version object

### Comments

#### GET /review/:id/comments
Get all comments for a review.

**Query Parameters:**
- `versionId` (optional): Filter by version

**Response:** Array of comment objects

#### POST /review/:id/comments
Add a new comment.

**Request Body:**
```json
{
  "text": "string",
  "version": "string | null",
  "type": "string (optional)",
  "resolved": "boolean"
}
```

**Response:** Created comment object

#### PATCH /review/:id/comments/:commentId
Update a comment.

**Request Body:** Partial comment object with updates

**Response:** Updated comment object

#### POST /review/:id/comments/:commentId/replies
Add a reply to a comment.

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** Created reply object

#### POST /review/:id/comments/:commentId/reactions
Toggle emoji reaction on a comment.

**Request Body:**
```json
{
  "emoji": "string"
}
```

**Response:** Updated comment object

#### POST /review/:id/comments/:commentId/replies/:replyId/reactions
Toggle emoji reaction on a reply.

**Request Body:**
```json
{
  "emoji": "string"
}
```

**Response:** Updated reply object

### Password & Expiration Management

#### POST /review/:id/password
Update or remove password for a review.

**Request Body:**
```json
{
  "password": "string | null"
}
```

**Response:** Updated review object

#### POST /review/:id/extend
Extend review expiration.

**Request Body:**
```json
{
  "days": "number"
}
```

**Response:** Updated review object

### Admin Endpoints

#### GET /admin/reviews
Get all reviews for admin dashboard.

**Query Parameters:**
- `showExpired` (optional): Include expired reviews

**Response:** Array of review summary objects

#### POST /admin/reviews/:id/extend
Extend review expiration (admin action).

**Query Parameters:**
- `days` (optional): Number of days to extend (default: 7)

**Response:** Updated review object

#### POST /admin/reviews/:id/reactivate
Reactivate an expired review link.

**Response:** Updated review object

#### DELETE /admin/reviews/:id
Delete a review (admin action).

**Response:** 204 No Content

### Teams Management

#### GET /teams
Get all teams.

**Response:** Array of team objects

#### POST /teams
Create a new team.

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response:** Created team object

#### GET /teams/:id
Get team details.

**Response:** Team object with members

#### PATCH /teams/:id
Update team details.

**Request Body:** Partial team object

**Response:** Updated team object

#### DELETE /teams/:id
Delete a team.

**Response:** 204 No Content

#### POST /teams/:id/members
Add a member to a team.

**Request Body:**
```json
{
  "email": "string",
  "name": "string (optional)",
  "role": "Designer | Art Director"
}
```

**Response:** Updated team object

#### PATCH /teams/:id/members/:email
Update member role.

**Request Body:**
```json
{
  "role": "Designer | Art Director"
}
```

**Response:** Updated team object

#### DELETE /teams/:id/members/:email
Remove a member from a team.

**Response:** Updated team object

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

