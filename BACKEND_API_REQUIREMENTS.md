# Backend API Requirements

This document outlines the backend API endpoints and requirements needed to support the Client Review UI application.

## Required API Endpoints

### 1. Review Management

#### GET `/review/:id`
- **Description**: Get review details by ID
- **Query Parameters**: 
  - `password` (optional): Password for password-protected reviews
- **Response**:
  ```json
  {
    "id": "string",
    "filename": "string",
    "password": "string | null",
    "designer": "string",
    "designerEmail": "string",
    "teamId": "string | null",
    "workflowState": "draft | client_review | client_approved | art_director_review | art_director_approved | ad_changes_requested | creative_director_review | cd_changes_requested | approved",
    "workflowHistory": [
      {
        "stage": "string",
        "action": "uploaded | created_from_url | version_uploaded | approved | rejected | moved_to_review | resubmitted | completed | password_set | password_removed | extended | sharing_changed",
        "user": "string",
        "timestamp": "ISO8601 string",
        "versionLabel": "string | null",
        "days": "number | null",
        "reason": "string | null"
      }
    ],
    "versions": [
      {
        "id": "string",
        "label": "string",
        "url": "string",
        "filename": "string | null",
        "notes": "string | null",
        "type": "string | null",
        "uploadedAt": "ISO8601 string",
        "uploadedBy": "string"
      }
    ],
    "expiresAt": "ISO8601 string",
    "extended": "boolean",
    "completed": "boolean",
    "sharingMode": "anyone | restricted",
    "approvedEmails": ["string"],
    "comments": []
  }
  ```
- **Status Codes**: 200 (success), 401 (unauthorized - wrong password), 404 (not found)

#### GET `/review/:id/version/:versionId`
- **Description**: Get version URL by version ID
- **Response**:
  ```json
  {
    "url": "string"
  }
  ```

#### POST `/review/:id/complete`
- **Description**: Mark review as complete and deactivate the link
- **Request Body**: None (user info from auth token)
- **Response**: Updated review object
- **Side Effects**: 
  - Sets `completed` to `true`
  - Sets `expiresAt` to current time (deactivates link)
  - Adds `completed` entry to `workflowHistory`

#### POST `/review/:id/sharing`
- **Description**: Update sharing settings for a review
- **Request Body**:
  ```json
  {
    "sharingMode": "anyone | restricted",
    "approvedEmails": ["string"]
  }
  ```
- **Response**: Updated review object
- **Side Effects**: Adds `sharing_changed` entry to `workflowHistory`

### 2. Workflow Management

#### POST `/review/:id/workflow/approve`
- **Description**: Approve a workflow stage
- **Request Body**:
  ```json
  {
    "stage": "client_review | art_director_review | creative_director_review"
  }
  ```
- **Response**: Updated review object
- **Workflow Logic**:
  - `client_review` → `client_approved` (do NOT auto-advance to art director)
  - `art_director_review` → `art_director_approved` → `creative_director_review` (auto-advance)
  - `creative_director_review` → `approved`
- **Side Effects**: 
  - Updates `workflowState`
  - Adds `approved` entry to `workflowHistory`
  - If art director approves, automatically transitions to `creative_director_review`

#### POST `/review/:id/workflow/reject`
- **Description**: Reject a workflow stage (request changes)
- **Request Body**:
  ```json
  {
    "stage": "client_review | art_director_review | creative_director_review",
    "reason": "string (optional)"
  }
  ```
- **Response**: Updated review object
- **Workflow Logic**:
  - `client_review` → stays in `client_review`
  - `art_director_review` → `ad_changes_requested`
  - `creative_director_review` → `cd_changes_requested`
- **Side Effects**: 
  - Updates `workflowState`
  - Adds `rejected` entry to `workflowHistory`

#### POST `/review/:id/workflow/move-to-client-review`
- **Description**: Move review from draft to client review
- **Request Body**: None
- **Response**: Updated review object
- **Side Effects**: 
  - Updates `workflowState` to `client_review`
  - Adds `moved_to_review` entry to `workflowHistory`

#### POST `/review/:id/workflow/move-to-art-director-review`
- **Description**: Move review from client approved to art director review
- **Request Body**: None
- **Response**: Updated review object
- **Side Effects**: 
  - Updates `workflowState` to `art_director_review`
  - Adds `moved_to_review` entry to `workflowHistory`

#### POST `/review/:id/workflow/resubmit`
- **Description**: Resubmit review after changes requested
- **Request Body**:
  ```json
  {
    "targetStage": "art_director_review | creative_director_review"
  }
  ```
- **Response**: Updated review object
- **Workflow Logic**:
  - `ad_changes_requested` → `art_director_review`
  - `cd_changes_requested` → `creative_director_review`
- **Side Effects**: 
  - Updates `workflowState`
  - Adds `resubmitted` entry to `workflowHistory`

### 3. Upload & Creation

#### POST `/upload`
- **Description**: Create a new review from file upload
- **Request Body**:
  ```json
  {
    "filename": "string",
    "password": "string | null",
    "bypassClientReview": "boolean",
    "sharingMode": "anyone | restricted",
    "approvedEmails": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "uploadUrl": "string (S3/presigned URL)",
    "reviewId": "string"
  }
  ```
- **Side Effects**: 
  - Creates new review with initial workflow state:
    - If `bypassClientReview` is `true`: `art_director_review`
    - Otherwise: `draft`
  - Adds `uploaded` or `created_from_url` entry to `workflowHistory`

#### PUT `{uploadUrl}`
- **Description**: Upload file to presigned URL (from `/upload` response)
- **Method**: PUT
- **Body**: File binary data
- **Headers**: `Content-Type: {file.type}`

#### POST `/review/create-from-url`
- **Description**: Create a new review from external URL
- **Request Body**:
  ```json
  {
    "url": "string",
    "password": "string | null",
    "bypassClientReview": "boolean",
    "sharingMode": "anyone | restricted",
    "approvedEmails": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "reviewId": "string"
  }
  ```
- **Side Effects**: Same as `/upload` but uses `created_from_url` action

### 4. Version Management

#### POST `/review/:id/versions`
- **Description**: Upload a new version for a review
- **Request Body**: FormData with file + metadata
- **Form Fields**:
  - `file`: File binary
  - `label`: "string"
  - `notes`: "string (optional)"
  - `type`: "string (optional)"
- **Response**: New version object
- **Side Effects**: 
  - Adds new version to review
  - Adds `version_uploaded` entry to `workflowHistory`

### 5. Comments

#### GET `/review/:id/comments`
- **Description**: Get all comments for a review
- **Query Parameters**: 
  - `versionId` (optional): Filter by version
- **Response**: Array of comment objects

#### POST `/review/:id/comments`
- **Description**: Add a new comment
- **Request Body**:
  ```json
  {
    "text": "string",
    "author": "string",
    "authorRole": "designer | client | art_director | creative_director",
    "version": "string | null",
    "type": "string (optional)",
    "resolved": "boolean",
    "reactions": [],
    "replies": []
  }
  ```
- **Response**: Created comment object

#### PATCH `/review/:id/comments/:commentId`
- **Description**: Update a comment (e.g., mark as resolved)
- **Request Body**: Partial comment object with updates
- **Response**: Updated comment object

#### POST `/review/:id/comments/:commentId/replies`
- **Description**: Add a reply to a comment
- **Request Body**:
  ```json
  {
    "text": "string",
    "author": "string",
    "authorRole": "designer | client | art_director | creative_director",
    "timestamp": "ISO8601 string",
    "reactions": []
  }
  ```
- **Response**: Created reply object

#### POST `/review/:id/comments/:commentId/reactions`
- **Description**: Toggle emoji reaction on a comment
- **Request Body**:
  ```json
  {
    "emoji": "string"
  }
  ```
- **Response**: Updated comment object (with reactions array)

#### POST `/review/:id/comments/:commentId/replies/:replyId/reactions`
- **Description**: Toggle emoji reaction on a reply
- **Request Body**:
  ```json
  {
    "emoji": "string"
  }
  ```
- **Response**: Updated reply object (with reactions array)

### 6. Password Management

#### POST `/review/:id/password`
- **Description**: Update or remove password for a review
- **Request Body**:
  ```json
  {
    "password": "string | null"
  }
  ```
- **Response**: Updated review object
- **Side Effects**: 
  - If password provided: adds `password_set` entry
  - If password is null: adds `password_removed` entry
  - Updates `workflowHistory`

### 7. Expiration Management

#### POST `/review/:id/extend`
- **Description**: Extend review expiration
- **Request Body**:
  ```json
  {
    "days": "number"
  }
  ```
- **Response**: Updated review object
- **Side Effects**: 
  - Updates `expiresAt`
  - Adds `extended` entry to `workflowHistory` with `days` field

### 8. Admin Endpoints

#### GET `/admin/reviews`
- **Description**: Get all reviews for admin dashboard
- **Query Parameters**:
  - `showExpired` (optional): Include expired reviews
- **Response**: Array of review summary objects

#### POST `/admin/reviews/:id/extend`
- **Description**: Extend review expiration (admin action)
- **Query Parameters**:
  - `days` (optional): Number of days to extend (default: 7)
- **Response**: Updated review object

#### POST `/admin/reviews/:id/reactivate`
- **Description**: Reactivate an expired review link
- **Request Body**: None
- **Response**: Updated review object
- **Side Effects**: Sets `expiresAt` to 7 days from now

#### DELETE `/admin/reviews/:id`
- **Description**: Delete a review (admin action)
- **Response**: 204 No Content

### 9. Teams Management

#### GET `/teams`
- **Description**: Get all teams
- **Response**: Array of team objects

#### POST `/teams`
- **Description**: Create a new team
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- **Response**: Created team object

#### GET `/teams/:id`
- **Description**: Get team details
- **Response**: Team object with members

#### PATCH `/teams/:id`
- **Description**: Update team details
- **Request Body**: Partial team object
- **Response**: Updated team object

#### DELETE `/teams/:id`
- **Description**: Delete a team
- **Response**: 204 No Content

#### POST `/teams/:id/members`
- **Description**: Add a member to a team
- **Request Body**:
  ```json
  {
    "email": "string",
    "name": "string (optional)",
    "role": "Designer | Art Director"
  }
  ```
- **Response**: Updated team object

#### PATCH `/teams/:id/members/:email`
- **Description**: Update member role
- **Request Body**:
  ```json
  {
    "role": "Designer | Art Director"
  }
  ```
- **Response**: Updated team object

#### DELETE `/teams/:id/members/:email`
- **Description**: Remove a member from a team
- **Response**: Updated team object

## Important Backend Requirements

### 1. Workflow State Persistence
- **Critical**: All workflow state changes must be persisted to the database
- When an art director approves, the state must transition: `art_director_review` → `art_director_approved` → `creative_director_review`
- The state must persist across page reloads and role switches
- All state transitions must be recorded in `workflowHistory`

### 2. Workflow History Tracking
- Every workflow action must create a history entry with:
  - `stage`: Current workflow stage
  - `action`: Type of action (approved, rejected, moved_to_review, etc.)
  - `user`: Name/ID of user who performed the action
  - `timestamp`: ISO8601 timestamp
  - Additional fields based on action type (`versionLabel`, `days`, `reason`)

### 3. Role-Based Access Control
- **Designer**: Can only see their own reviews (filter by `designerEmail`)
- **Art Director**: Can see all reviews in their team (filter by `teamId`)
- **Creative Director**: Can see all reviews across all teams
- Reviews must include `designerEmail` and `teamId` for proper filtering

### 4. Link Deactivation on Completion
- When a review is marked as complete (`POST /review/:id/complete`):
  - Set `completed` to `true`
  - Set `expiresAt` to current time (immediately expires the link)
  - Add `completed` entry to `workflowHistory`

### 5. Sharing Settings
- Support `sharingMode`: `"anyone"` or `"restricted"`
- If `restricted`, use `approvedEmails` array to control access
- Track sharing changes in `workflowHistory`

### 6. Review Path Selection
- Support `bypassClientReview` flag during creation
- If `true`, initial workflow state should be `art_director_review` instead of `draft`
- Add appropriate history entry (`bypassed_client_review` action)

### 7. Default Expiration
- New reviews should default to 30 days expiration
- Expiration extensions should default to 30 days (not 7 days)

### 8. Authentication & Authorization
- All endpoints should require authentication (except public review access with password)
- User information should come from auth token (not request body)
- Track user who performs each action for `workflowHistory`

### 9. Comment Filtering
- Comments should be filterable by `versionId`
- Comments should include `authorRole` field
- Replies should also include `authorRole` field

### 10. Version-Specific Comments
- Comments can be tagged with a `version` field
- Filter comments by version when displaying in UI

## Data Models

### Review Model
```typescript
interface Review {
  id: string;
  filename: string;
  password: string | null;
  designer: string;
  designerEmail: string;
  teamId: string | null;
  workflowState: WorkflowState;
  workflowHistory: WorkflowHistoryEntry[];
  versions: Version[];
  expiresAt: string; // ISO8601
  extended: boolean;
  completed: boolean;
  sharingMode: 'anyone' | 'restricted';
  approvedEmails: string[];
  comments: Comment[];
}

type WorkflowState = 
  | 'draft'
  | 'client_review'
  | 'client_approved'
  | 'art_director_review'
  | 'art_director_approved'
  | 'ad_changes_requested'
  | 'creative_director_review'
  | 'cd_changes_requested'
  | 'approved';

interface WorkflowHistoryEntry {
  stage: WorkflowState;
  action: 'uploaded' | 'created_from_url' | 'version_uploaded' | 'approved' | 'rejected' | 'moved_to_review' | 'resubmitted' | 'completed' | 'password_set' | 'password_removed' | 'extended' | 'sharing_changed' | 'bypassed_client_review';
  user: string;
  timestamp: string; // ISO8601
  versionLabel?: string;
  days?: number;
  reason?: string;
}

interface Version {
  id: string;
  label: string;
  url: string;
  filename?: string;
  notes?: string;
  type?: string;
  uploadedAt: string; // ISO8601
  uploadedBy: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  authorRole: 'designer' | 'client' | 'art_director' | 'creative_director';
  timestamp: string; // ISO8601
  version?: string;
  type?: string;
  resolved: boolean;
  reactions: Reaction[];
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  author: string;
  authorRole: 'designer' | 'client' | 'art_director' | 'creative_director';
  timestamp: string; // ISO8601
  reactions?: Reaction[];
}

interface Reaction {
  user: string;
  emoji: string;
  timestamp: string; // ISO8601
}
```

## Testing Checklist

- [ ] Workflow state persists correctly after art director approval
- [ ] Creative director sees review in `creative_director_review` state after art director approval
- [ ] Mark as complete deactivates the review link
- [ ] Sharing settings update correctly
- [ ] Review path selection (bypass client review) works correctly
- [ ] Password protection works for review access
- [ ] Version uploads create history entries
- [ ] Comments are filtered by version correctly
- [ ] Role-based filtering works (designer sees only their reviews, art director sees team reviews)
- [ ] Expiration extensions default to 30 days
- [ ] Workflow history tracks all actions correctly

