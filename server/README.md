# Backend API Server

This is the backend API server for the Client Review UI application.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api` (or use the base URL directly).

### Health Check
- `GET /health` - Check server status

### Review Management
- `GET /review/:id` - Get review details
- `GET /review/:id/version/:versionId` - Get version URL
- `POST /review/:id/complete` - Mark review as complete
- `POST /review/:id/sharing` - Update sharing settings

### Workflow Management
- `POST /review/:id/workflow/approve` - Approve workflow stage
- `POST /review/:id/workflow/reject` - Reject workflow stage
- `POST /review/:id/workflow/move-to-client-review` - Move to client review
- `POST /review/:id/workflow/move-to-art-director-review` - Move to art director review
- `POST /review/:id/workflow/resubmit` - Resubmit after changes

### Upload & Creation
- `POST /upload` - Create review from file upload
- `PUT /upload/:reviewId` - Upload file to presigned URL
- `POST /review/create-from-url` - Create review from external URL

### Version Management
- `POST /review/:id/versions` - Upload new version

### Comments
- `GET /review/:id/comments` - Get all comments
- `POST /review/:id/comments` - Add comment
- `PATCH /review/:id/comments/:commentId` - Update comment
- `POST /review/:id/comments/:commentId/replies` - Add reply
- `POST /review/:id/comments/:commentId/reactions` - Toggle reaction
- `POST /review/:id/comments/:commentId/replies/:replyId/reactions` - Toggle reply reaction

### Password & Expiration
- `POST /review/:id/password` - Update password
- `POST /review/:id/extend` - Extend expiration

### Admin
- `GET /admin/reviews` - Get all reviews
- `POST /admin/reviews/:id/extend` - Extend review (admin)
- `POST /admin/reviews/:id/reactivate` - Reactivate expired review
- `DELETE /admin/reviews/:id` - Delete review

### Teams
- `GET /teams` - Get all teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team details
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/members` - Add member
- `PATCH /teams/:id/members/:email` - Update member role
- `DELETE /teams/:id/members/:email` - Remove member

## Authentication

Currently uses mock authentication via headers:
- `x-user-id`: User ID (optional)
- `x-user-email`: User email (optional)

For production, replace the authentication middleware in `server/middleware/auth.js` with real JWT/OAuth authentication.

## Data Storage

Currently uses in-memory storage. To use a real database:
1. Replace `server/config/database.js` with your database adapter
2. Update all store functions to use your database

## File Uploads

Files are stored in the `uploads/` directory. For production:
1. Use AWS S3 or similar cloud storage
2. Generate presigned URLs for uploads
3. Update the upload routes accordingly

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get review (requires authentication headers)
curl -H "x-user-email: sarah.johnson@example.com" \
     http://localhost:3000/review/{reviewId}
```

