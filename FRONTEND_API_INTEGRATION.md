# Frontend API Integration Guide

## Overview

The frontend has been updated to use a centralized API service (`src/services/api.js`) that handles:
- Authentication headers automatically
- Consistent error handling
- Base URL configuration
- Type-safe API calls

## Changes Made

### 1. Created Centralized API Service (`src/services/api.js`)
- All API calls are now centralized
- Automatically adds authentication headers (`x-user-email`, `x-user-id`)
- Uses axios with interceptors for consistent error handling
- Modules: `reviewAPI`, `workflowAPI`, `uploadAPI`, `versionAPI`, `commentAPI`, `passwordAPI`, `adminAPI`, `teamsAPI`

### 2. Updated Components

#### FileUpload.vue
- ✅ Updated to use `uploadAPI.createFromUpload()` and `uploadAPI.createFromUrl()`
- ✅ Properly handles file uploads with presigned URLs

#### ReviewPage.vue (in progress)
- ✅ Updated comment functions (add, update, reply, reactions)
- ✅ Updated version loading functions
- ⏳ Need to update workflow functions (approve, reject, move, resubmit)
- ⏳ Need to update password and expiration functions
- ⏳ Need to update review loading function

### 3. Updated isMockMode Detection
- Now auto-detects API availability when `useRealAPI` is not explicitly set
- Falls back to mock mode if API is unavailable

## Remaining Work

### ReviewPage.vue Functions to Update:
1. `loadComments()` - Update axios call to use `commentAPI.getComments()`
2. `handleApprove()` - Update to use `workflowAPI.approve()`
3. `handleReject()` - Update to use `workflowAPI.reject()`
4. `handleMoveToClientReview()` - Update to use `workflowAPI.moveToClientReview()`
5. `handleMoveToArtDirectorReview()` - Update to use `workflowAPI.moveToArtDirectorReview()`
6. `handleResubmitForReview()` - Update to use `workflowAPI.resubmit()`
7. `confirmMarkCompleted()` - Update to use `reviewAPI.completeReview()`
8. `handleUpdateSharing()` - Update to use `reviewAPI.updateSharing()`
9. `handleUpdatePassword()` - Update to use `passwordAPI.updatePassword()`
10. `handleExtendExpiration()` - Update to use `passwordAPI.extendExpiration()`
11. `loadReview()` - Update to use `reviewAPI.getReview()`

### Other Components to Update:
- AdminDashboard.vue - Update admin API calls
- TeamsPage.vue - Update teams API calls
- VersionUploadModal.vue - Update version upload API calls
- KanbanBoard.vue - Update review loading API calls

## Testing Checklist

- [ ] Test file upload (both file and URL)
- [ ] Test review loading with password protection
- [ ] Test comment creation, updates, replies, reactions
- [ ] Test workflow approvals and rejections
- [ ] Test version uploads
- [ ] Test password and expiration updates
- [ ] Test sharing settings updates
- [ ] Test admin functions
- [ ] Test teams management

## API Base URL Configuration

Set in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

If not set, defaults to `http://localhost:3000`.

## Mock Mode vs Real API

The app automatically detects API availability:
1. Checks `forceMockMode` localStorage flag (if true, always use mock)
2. Checks `useRealAPI` localStorage flag
3. If `useRealAPI` is true or not set, pings `/health` endpoint
4. Falls back to mock mode if API is unavailable

## Authentication

Authentication headers are automatically added by the API service:
- `x-user-email`: User's email (from `getCurrentUser()`)
- `x-user-id`: User's ID (from `getCurrentUser()`)

For production, replace the authentication middleware in the backend with real JWT/OAuth.

