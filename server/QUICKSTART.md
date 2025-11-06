# Quick Start Guide

This guide will help you get the backend API server running quickly.

## Prerequisites

- Node.js v16 or higher
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. (Optional) Update `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Starting the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Testing the API

Once the server is running, test the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing with Authentication

Most endpoints require authentication. Use these headers:

```bash
curl -H "x-user-email: sarah.johnson@example.com" \
     http://localhost:3000/review/{reviewId}
```

## Default Users

The server comes with these default users (for testing):

- **Sarah Johnson** (Designer): `sarah.johnson@example.com`
- **John Doe** (Client): `john.doe@example.com`
- **Art Director**: `art.director@example.com`
- **Creative Director**: `creative.director@example.com`

## Connecting Frontend

1. Make sure your frontend `.env` file has:
```env
VITE_API_BASE_URL=http://localhost:3000
```

2. The frontend will automatically detect the API and switch from mock mode to real API mode.

## File Uploads

Uploaded files are stored in the `server/uploads/` directory. This directory is created automatically when the server starts.

## Next Steps

- See `API.md` for complete API documentation
- See `BACKEND_API_REQUIREMENTS.md` for detailed requirements
- Replace mock authentication with real JWT/OAuth in production
- Replace in-memory storage with a real database (PostgreSQL, MongoDB, etc.)
- Configure AWS S3 for file storage in production

