# Client Review

A modern Vue.js application for managing and reviewing design files. This application allows designers to upload design files (PDF, AI, Sketch, Figma, etc.) and share them with clients for review and feedback.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Routes](#routes)
- [Components](#components)
- [Key Functionality](#key-functionality)
- [Development](#development)
- [Build & Deployment](#build--deployment)

## Features

### For Designers
- **Upload & Publish**: Upload design files with drag-and-drop support, optional password protection, and instant review link generation
- **Version Management**: Upload multiple versions of designs with labels, notes, and version types
- **Review Management**: 
  - Extend expiration dates (30-day extension)
  - Change or remove passwords
  - Mark reviews as completed (disables link but preserves comments)
  - View all uploaded files in demo review links
  - Upload new versions via modal with drag-and-drop support
- **Admin Dashboard**: 
  - View all review links in a table format
  - Batch operations (select multiple links for deletion)
  - Copy review URLs
  - Extend expiration dates (7-day extension)
  - Override expiration dates with custom dates
  - Reset passwords
  - Reactivate expired links (extends by 30 days)
  - Filter by expiration status (shows all links including expired)

### For Clients
- **Design Review**: View designs in an embedded preview with version switching
- **Full-Screen Preview**: Open designs in a new tab for distraction-free viewing
- **Comments System**: 
  - Add comments with different types (General, Bug, Suggestion, Approval, Request Changes)
  - Reply to comments
  - Mark comments as resolved/unresolved
  - View threaded conversations
- **Password Protection**: Secure access to password-protected reviews

### General
- **Mock Mode**: Full functionality without backend API for development and testing
- **Real API Integration**: Seamless switching between mock and real API modes
- **Responsive Design**: Modern UI built with Tailwind CSS and Vuetify 3
- **Password Visibility Toggle**: Show/hide passwords in input fields
- **Expiration Tracking**: Visual indicators for expired links (red) and links expiring soon (orange, within 7 days)
- **Side-by-Side Layout**: Upload and demo links cards displayed side-by-side (50/50 split)
- **Clean UI**: Streamlined header without demo mode indicators

## Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **Vite**: Fast build tool and development server
- **Vue Router**: Client-side routing
- **Vuetify 3**: Material Design component framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Mock Data**: In-memory data simulation for development

## Project Structure

```
client-review-ui/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── AlertModal.vue   # Alert dialog component
│   │   ├── CommentsSidebar.vue  # Unified comments interface
│   │   ├── ConfirmModal.vue     # Confirmation dialog
│   │   ├── DatePickerModal.vue   # Date picker dialog
│   │   ├── FileUpload.vue        # Drag-and-drop file upload
│   │   ├── PasswordPrompt.vue    # Password entry dialog
│   │   ├── PreviewFrame.vue      # Design preview iframe
│   │   ├── PromptModal.vue       # Input prompt dialog
│   │   ├── VersionSelector.vue   # Version dropdown selector
│   │   └── VersionUploadModal.vue # Version upload modal
│   ├── views/               # Page components
│   │   ├── AdminDashboard.vue    # Admin panel for managing links
│   │   ├── FullScreenPreview.vue # Full-screen preview page
│   │   ├── ReviewPage.vue        # Main review interface
│   │   └── UploadPage.vue         # File upload and demo links
│   ├── router/              # Vue Router configuration
│   │   └── index.js
│   ├── mockData.js          # Mock API and data simulation
│   ├── main.js              # Application entry point
│   ├── style.css            # Global styles and Tailwind imports
│   └── App.vue              # Root component
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd client-review-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL (if using real API):
```env
VITE_API_BASE_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the backend API | `http://localhost:3000` |

**Note**: If the API is not available or `VITE_API_BASE_URL` is not set, the app automatically uses mock mode.

## How It Works

### Mock Mode vs Real API

The application intelligently switches between mock and real API modes:

1. **Mock Mode** (Default):
   - Uses in-memory data stored in `src/mockData.js`
   - No backend required
   - Perfect for development and testing
   - All functionality works without an API

2. **Real API Mode**:
   - Connects to backend API at `VITE_API_BASE_URL`
   - Requires running backend server
   - Automatically detects API availability

### Mode Detection Logic

The app checks for API availability:
- If `forceMockMode` is set to `'true'` in localStorage → Mock mode
- If `forceMockMode` is set to `'false'` → Real API mode
- Otherwise, attempts to ping `/health` endpoint
- If API is unreachable → Falls back to mock mode

### Mock Data Storage

Mock data is stored in browser memory during the session. To persist data across refreshes, you can use localStorage (not currently implemented).

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `UploadPage` | Upload files and view demo review links |
| `/review/:id` | `ReviewPage` | Main review interface with preview and comments |
| `/review/:id/preview` | `FullScreenPreview` | Full-screen preview in new tab |
| `/admin` | `AdminDashboard` | Admin panel for managing all review links |

## Components

### Core Components

#### `FileUpload.vue`
- Drag-and-drop file upload interface
- Optional password protection
- File preview with size display
- Password visibility toggle
- Generates full review URL on success

#### `CommentsSidebar.vue`
- Unified comments interface
- Add new comments with type selection
- View threaded comments and replies
- Reply to comments
- Mark comments as resolved/unresolved
- Auto-updates on comment submission
- Read-only mode for completed reviews

#### `VersionSelector.vue`
- Dropdown to switch between design versions
- Displays version labels and metadata

#### `PreviewFrame.vue`
- Embedded iframe for design preview
- Responsive sizing
- Supports PDF, images, and other embeddable formats

#### `VersionUploadModal.vue`
- Modal for uploading new versions
- Drag-and-drop support
- Version label, notes, and type selection
- File preview before upload

### Modal Components

- **`AlertModal.vue`**: Displays alert messages (success, error, info)
- **`ConfirmModal.vue`**: Confirmation dialogs with custom messages
- **`PromptModal.vue`**: Text input prompts (with password visibility toggle)
- **`DatePickerModal.vue`**: Date selection for expiration override

## Key Functionality

### Upload & Publish Flow

1. User selects or drags a file onto the upload card (or clicks to choose file)
2. Optionally enters a password (with visibility toggle)
3. Clicks "Upload & Publish"
4. File is uploaded (mock or real API)
5. Review link is generated and displayed
6. Full URL is shown for easy sharing
7. Upload and demo links sections are displayed side-by-side for easy navigation

### Review Flow

1. Access review via link (`/review/:id`)
2. If password-protected, enter password
3. View design in preview pane
4. Switch between versions using dropdown
5. Add comments with type classification
6. Reply to comments
7. Mark comments as resolved
8. Optionally open in full-screen preview

### Designer Actions (on Demo Links)

Designers can perform these actions via icon buttons with tooltips:

- **Mark as Completed** (✓): Disables the review link, preserves comments
- **Change Password** (🔑): Update or remove password protection
- **Extend Expiration** (📅): Extends expiration by 30 days
- **Upload New Version** (⬆️): Add a new version to the review via modal with drag-and-drop support

**Note**: These actions are only visible to the designer who owns the review link.

### Admin Dashboard

- **View All Links**: Table showing all review links with metadata (including expired)
- **Batch Selection**: Select multiple links for batch operations
- **Actions** (per link):
  - Copy review URL
  - Extend expiration (7 days)
  - Override expiration (custom date)
  - Reset password
  - Reactivate expired link (extends by 30 days, only shown for expired reviews)
  - Delete link
- **Bulk Delete**: Delete selected links at once
- **Visual Indicators**: 
  - Password protection status (Protected/Public badges)
  - Extension status (Extended badge)
  - Expiration dates with color coding

### Comment System

- **Comment Types**:
  - General Feedback
  - Bug Report
  - Design Suggestion
  - Approval
  - Request Changes

- **Features**:
  - Threaded replies
  - Resolution tracking
  - Version-specific comments
  - Auto-refresh on new comments
  - Read-only mode for completed reviews

### Expiration Management

- **Expiration Display**:
  - Red: Expired (shows expiration date)
  - Orange: Expiring within 7 days
  - Gray: Active (more than 7 days remaining)

- **Extension Options**:
  - Quick extend: 30 days (demo links, admin reactivate)
  - Custom extend: 7 days (admin dashboard)
  - Override: Custom date (admin dashboard)
  - Reactivate: 30 days from current date (admin dashboard, expired links only)

## Development

### Development Server

```bash
npm run dev
```

Runs on `http://localhost:4000` (configurable in `vite.config.js`)

### Code Style

- Vue 3 Composition API with `<script setup>`
- Tailwind CSS for styling
- Vuetify components for UI elements
- Path alias `@/` for `src/` directory

### Adding New Features

1. Create components in `src/components/`
2. Add routes in `src/router/index.js`
3. Update mock data in `src/mockData.js` if needed
4. Ensure both mock and real API modes work

### Mock Data

Mock data is stored in `src/mockData.js`:
- `mockReviews`: Array of review objects
- `mockAdminLinks`: Array of admin link objects
- `mockAPI`: Object with API simulation functions

To modify mock data, edit `src/mockData.js` directly.

## Build & Deployment

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Considerations

1. Set `VITE_API_BASE_URL` to production API URL
2. Ensure backend API is running and accessible
3. Configure CORS on backend if needed
4. Use environment-specific builds for different environments

### Port Configuration

Default port: `4000` (configured in `vite.config.js`)

To change the port, modify `server.port` in `vite.config.js`:
```javascript
server: {
  port: 4000,  // Change this
  host: true
}
```

## Troubleshooting

### Mock Mode Not Working

- Check browser console for errors
- Ensure `mockData.js` is properly imported
- Verify localStorage doesn't have `forceMockMode: 'false'`

### API Connection Issues

- Verify `VITE_API_BASE_URL` in `.env`
- Check backend API is running
- Check CORS settings on backend
- App will automatically fall back to mock mode if API is unreachable

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` content paths
- Verify CSS import order in `main.js` (Vuetify first, then Tailwind)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
