# Adobe Reviewer Frontend (Vue + Vuetify)

This is the frontend for the Adobe Reviewer System, rebuilt with Vuetify (Material 3) UI components.

## Features

- Upload Adobe files to S3 with optional password protection
- Preview files with version toggle and iframe embedding
- Password-protected viewer with secure entry
- Admin dashboard for managing design links and batch operations
- Fully styled using Vuetify Material 3

## Project Setup

```bash
npm install
```

### Compile and Hot-Reload for Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:3001
```
