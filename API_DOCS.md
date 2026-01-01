# API Docs (Next.js Route Handlers)

## Mobile (React Native) ✅ Auth + authenticated API calls (recommended)

This backend supports **two auth transports**:

- **Web**: cookie session (`session` cookie)
- **Mobile (React Native)**: `Authorization: Bearer <token>`

Mobile uses a short, reliable flow:

### 1) Login to get a token

**POST** `/api/auth/token`

- **Body** (JSON):
  - `email`: string (required)
  - `password`: string (required)
- **Success** (200):
  - `{ token: string }`
- **Errors**:
  - 400: `{ error: "email and password are required" }`
  - 401: `{ error: string }` (invalid password / user not found)
  - 500: `{ error: "Failed to login", message: string }` or `{ error: "Failed to create session" }`

**What is this token?**

- It is the same encrypted session payload used by the web cookie (`session`).
- On mobile you **store it** (e.g., AsyncStorage / SecureStore) and send it as a Bearer token.

### 2) Store the token on the device

- Store the returned `token` as a string.
- Treat it like a session secret: if it leaks, anyone can act as that user.

### 3) Make authenticated API calls from React Native

Add this header to any request:

- `Authorization: Bearer <token>`

Recommended pattern:

- Create one API client (fetch wrapper or axios instance)
- On each request, read token from storage and attach the header

### 4) Verify auth works (smoke test)

Call:

- **GET** `/api/auth/me`

Expected:

- `{ user: Profile | null }`

If the token is valid, `user` will be populated.

---

## Web quick start (Next.js dev server)

### 1) Start the dev server

From the project root:

```bash
npm install
npm run dev
```

### 2) Base URL

By default Next.js runs on:

- `http://localhost:3000`

So an endpoint like `/api/chat` becomes:

- `http://localhost:3000/api/chat`

### 3) Example call (simple smoke test)

Example: check current session user

```bash
curl -s "http://localhost:3000/api/auth/me" | jq
```

> Notes about authentication
>
> - Most routes rely on `getCurrentUser()`.
> - If you’re calling APIs from React Native, prefer the Bearer-token flow documented above.
> - Some older auth endpoints under `/api/authentication/*` are legacy and **not active** (kept for reference). Logout is active.

---

# Complete API route documentation

## **1. ADMIN ROUTES** (`/api/admin/*`)

> These routes do **not** currently enforce admin auth at the route level. Authorization (if any) is handled inside the called service functions.

### Admin users routes

- Folder exists: `src/app/api/admin/users/`
- ⚠️ **No `route.ts` currently implemented** under `/api/admin/users`.
- Any “Admin users” docs should be considered **TBD** until routes are added.

### **GET `/api/admin/analytics`**

- **Method**: GET
- **Parameters**: None
- **Body**: N/A
- **Response**: Analytics data object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch analytics data", message: string }`

---

### **GET `/api/admin/courses`**

- **Method**: GET
- **Parameters**: None
- **Body**: N/A
- **Response**: Array of courses
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch courses data", message: string }`

### **POST `/api/admin/courses`**

- **Method**: POST
- **Parameters**: None
- **Body** (JSON):
  - `code`: string (required)
  - `name`: string (required)
  - `description`: string | null (optional)
  - `semester`: string | null (optional)
  - `instructor_id`: string (required)
  - `status`: string (optional, default: "active")
- **Response**: Created course object
- **Success Status**: 201
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to create course", message: string }`

### **PATCH `/api/admin/courses`**

- **Method**: PATCH
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
  - `code`: string (required)
  - `name`: string (required)
  - `description`: string | null (optional)
  - `semester`: string | null (optional)
  - `instructor_id`: string (required)
  - `status`: string (required)
- **Response**: Updated course object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to update course", message: string }`

### **DELETE `/api/admin/courses`**

- **Method**: DELETE
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
- **Response**: Deleted course object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to delete course", message: string }`

---

### **GET `/api/admin/students`**

- **Method**: GET
- **Parameters**: None
- **Body**: N/A
- **Response**: Array of students
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch students data", message: string }`

### **POST `/api/admin/students`**

- **Method**: POST
- **Parameters**: None
- **Body** (JSON):
  - `full_name`: string (required)
  - `email`: string (required)
  - `password`: string (required)
- **Response**: Created student object
- **Success Status**: 201
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to create student", message: string }`

### **PATCH `/api/admin/students`**

- **Method**: PATCH
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
  - `full_name`: string (required)
  - `email`: string (required)
  - `password`: string (optional)
- **Response**: Updated student object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to update student", message: string }`

### **DELETE `/api/admin/students`**

- **Method**: DELETE
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
- **Response**: Deleted student object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to delete student", message: string }`

---

### **GET `/api/admin/teachers`**

- **Method**: GET
- **Parameters**: None
- **Body**: N/A
- **Response**: Array of teachers
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch teachers data", message: string }`

### **POST `/api/admin/teachers`**

- **Method**: POST
- **Parameters**: None
- **Body** (JSON):
  - `full_name`: string (required)
  - `email`: string (required)
  - `password`: string (required)
- **Response**: Created teacher object
- **Success Status**: 201
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to create teacher", message: string }`

### **PATCH `/api/admin/teachers`**

- **Method**: PATCH
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
  - `full_name`: string (required)
  - `email`: string (required)
  - `password`: string (optional)
- **Response**: Updated teacher object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to update teacher", message: string }`

### **DELETE `/api/admin/teachers`**

- **Method**: DELETE
- **Parameters**: None
- **Body** (JSON):
  - `id`: string (required)
- **Response**: Deleted teacher object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to delete teacher", message: string }`

---

### **GET `/api/admin/teachers/search`**

- **Method**: GET
- **Parameters** (Query String):
  - `q`: string (required) - search query
- **Body**: N/A
- **Response**: Teacher object matching search
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Search query is required" }`
  - 404: `{ error: "Teacher not found", searched: string }`
  - 500: `{ error: "Failed to search for teacher", message: string }`

---

## **2. AUTH ROUTES** (`/api/auth/*`)

### **GET `/api/auth/me`**

- **Method**: GET
- **Parameters**: None
- **Body**: N/A
- **Response**: `{ user: User | null }`
- **Success Status**: 200
- **Error**: Returns `{ user: null }` on error (still status 200)

---

## **3. AUTHENTICATION ROUTES** (`/api/authentication/*`)

### **POST `/api/authentication/logout`**

- **Auth**: Uses your server-side `logout()` service (cookie/session logout)
- **Response**: `{ success: true }`

### Legacy / inactive endpoints

The following exist in the tree but are **commented out** (legacy Supabase auth):

- `POST /api/authentication/login/email`
- `POST /api/authentication/login/google`
- `GET  /api/authentication/login/google/callback`
- `POST /api/authentication/signup/email`
- `POST /api/authentication/signup/google`
- `GET  /api/authentication/signup/google/callback`

If you plan to re-enable them, the code needs to be restored (uncommented and adapted to your new cookie-based auth flow).

**Error Status**: 500

**Error Response**: `{ error: "Failed to log out." }`

---

## **4. CHAT ROUTES** (`/api/chat/*`)

### **POST `/api/chat`**

- **Method**: POST
- **Parameters**: None
- **Body** (JSON):
  - `chatId`: string | null (optional)
  - `message`: string (required)
  - `conversationHistory`: Message[] (optional)
  - `useDecksChat`: boolean (optional)
  - `deckIds`: string[] (optional; used only when `useDecksChat === true`)

**Auth behavior**:

- If the request has an authenticated user (via cookie), the API will:
  - auto-create a chat when `chatId` is not provided
  - persist user and AI messages to DB
- If not authenticated:
  - it still returns an answer, but will not persist messages
- **Response**:
  ```json
  {
    "answer": string,
    "chatId": string | null,
    "sources": any[],
    "used_queries": string[]
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Message is required" }`
  - 500: `{ error: "Failed to process chat message", details: string }`

### **GET `/api/chat`**

- **Method**: GET
- **Parameters** (Query String):
  - `chatId`: string (required if not listing)
  - `list`: "true" (optional, to list all user chats)
- **Body**: N/A
- **Response**:
  - If `list=true`: `{ chats: Chat[] }`
    - If not authenticated, returns `{ chats: [] }` (status 200)
  - Otherwise: `{ messages: Message[] }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "chatId is required" }`
  - 500: `{ error: "Failed to fetch chat data", details: string }`

### **DELETE `/api/chat`**

- **Method**: DELETE
- **Parameters** (Query String):
  - `chatId`: string (required)
- **Body**: N/A
- **Response**: `{ success: true }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "chatId is required" }`
  - 401: `{ error: "Authentication required" }`
  - 500: `{ error: "Failed to delete chat", details: string }`

---

### **GET `/api/chat/courses`**

- **Method**: GET
- **Parameters** (Query String):
  - `userId`: string (required)
  - `userRole`: "student" | "instructor" (required)
- **Body**: N/A
- **Response**: Array of Course objects

**Important behavior note**:

- For `userRole=student` it currently returns an empty array (`[]`) because the student-course fetch is marked TODO in the code.
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Missing userId or userRole parameter" }` or `{ error: "Invalid userRole parameter" }`
  - 500: `{ error: "Failed to fetch decks" }`

---

### **POST `/api/chat/create`**

- **Method**: POST
- **Parameters**: None
- **Body** (JSON):
  - `name`: string (required)
- **Response**: `{ chat: Chat }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Chat name is required" }`
  - 401: `{ error: "Authentication required" }`
  - 500: `{ error: "Failed to create chat", details: string }`

---

### **GET `/api/chat/decks/dropdown`**

- **Method**: GET
- **Parameters** (Query String):
  - `courseId`: string (required)
- **Body**: N/A
- **Response**: Array of deck objects
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Missing courseId parameter" }`
  - 500: `{ error: "Failed to fetch decks" }`

---

### **GET `/api/chat/decks/search`**

- **Method**: GET
- **Parameters** (Query String):
  - `searchTerm`: string (required, non-empty)
- **Body**: N/A
- **Response**: Array of deck objects
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Missing searchTerm parameter" }`
  - 500: `{ error: "Failed to fetch decks" }`

---

## **5. INSTRUCTOR ROUTES** (`/api/instructor/*`)

### **GET `/api/instructor/courses`**

- **Method**: GET
- **Parameters** (Query String):
  - `instructorId`: string (required)
- **Body**: N/A
- **Response**: Whatever `getInstructorCoursesData(instructorId)` returns (used for instructor course listing)
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "instructorId is required" }`
  - 500: `{ error: "Failed to fetch dashboard data", message: string }`

---

### **GET `/api/instructor/courses/[courseId]`**

- **Method**: GET
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body**: N/A
- **Response**: Course detail object
- **Success Status**: 200
- **Error Status**:
  - 404: `{ error: "Course not found" }`
  - 500: `{ error: string }`

### **PATCH `/api/instructor/courses/[courseId]`**

- **Method**: PATCH
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body** (JSON):
  - `code`: string (optional)
  - `name`: string (optional)
  - `description`: string (optional)
  - `semester`: string (optional)
  - `status`: string (optional)
  - `instructorId`: string (optional)
- **Response**: Updated course object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "courseId is required" }`
  - 500: `{ error: "Failed to update course", message: string }`

---

### **GET `/api/instructor/dashboard`**

- **Method**: GET
- **Parameters** (Query String):
  - `instructorId`: string (required)
- **Body**: N/A
- **Response**: Dashboard data object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "instructorId is required" }`
  - 500: `{ error: "Failed to fetch dashboard data", message: string }`

---

### **GET `/api/instructor/courses/[courseId]/assignments`**

- **Method**: GET
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body**: N/A
- **Response**: Array of assignments
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "courseId is required" }`
  - 500: `{ error: "Failed to fetch assignments data", message: string }`

### **POST `/api/instructor/courses/[courseId]/assignments`**

- **Method**: POST
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body** (JSON):
  - `title`: string (required)
  - `description`: string | null (optional)
  - `instructions`: string | null (optional)
  - `dueDate`: string (required, ISO date format)
  - `maxPoints`: number (required)
  - `status`: string (required)
  - `templateId`: string | null (optional)
  - `attachmentUrl`: string | null (optional)
  - `instructorId`: string (required)
- **Response**: Created assignment object
- **Success Status**: 201
- **Error Status**:
  - 400: `{ error: "courseId is required" }` or `{ error: "instructorId is required" }` or `{ error: "dueDate is required" }` or `{ error: "Invalid dueDate format" }`
  - 403: `{ error: "not authorized" }`
  - 404: `{ error: "Course not found" }`
  - 500: `{ error: "Failed to create assignment", message: string }`

---

### **GET `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: GET
- **Parameters** (URL Path):
  - `courseId`: string (required)
  - `assignmentId`: string (required)
- **Body**: N/A
- **Response**: Assignment detail object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }`
  - 404: `{ error: "Assignment not found" }`
  - 500: `{ error: "Failed to fetch assignment", message: string }`

### **PATCH `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: PATCH
- **Parameters** (URL Path):
  - `courseId`: string (required)
  - `assignmentId`: string (required)
- **Body** (JSON):
  - `title`: string (required)
  - `description`: string | null (optional)
  - `instructions`: string | null (optional)
  - `dueDate`: string (required, ISO date format)
  - `maxPoints`: number (required)
  - `status`: string (required)
  - `templateId`: string | null (optional)
  - `attachmentUrl`: string | null (optional)
  - `instructorId`: string (required)
- **Response**: Updated assignment object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }` or `{ error: "instructorId is required" }` or `{ error: "dueDate is required" }` or `{ error: "Invalid dueDate format" }`
  - 403: `{ error: "not authorized" }`
  - 404: `{ error: "Assignment not found" }`
  - 500: `{ error: "Failed to update assignment", message: string }`

### **DELETE `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: DELETE
- **Parameters** (URL Path):
  - `courseId`: string (required)
  - `assignmentId`: string (required)
- **Body** (JSON):
  - `instructorId`: string (required)
- **Response**: `{ success: true }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }` or `{ error: "instructorId is required" }`
  - 403: `{ error: "not authorized" }`
  - 404: `{ error: "Assignment not found" }`
  - 500: `{ error: "Failed to delete assignment", message: string }`

---

### **GET `/api/instructor/courses/[courseId]/decks`**

- **Method**: GET
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body**: N/A
- **Response**: `{ decks: Deck[] }`
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch decks", message: string }`

---

### **POST `/api/instructor/courses/[courseId]/modules`**

- **Method**: POST
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body** (JSON):
  - `title`: string (required)
  - `type`: string (required)
  - `status`: string (required)
  - `content`: string | null (optional)
  - `attachmentUrl`: string | null (optional)
  - `startsAt`: string | null (optional)
  - `endsAt`: string | null (optional)
  - `templateId`: string | null (optional)
  - `instructorId`: string (required)
- **Response**: Created module object
- **Success Status**: 201
- **Error Status**:
  - 400: `{ error: "Instructor ID is required" }` or `{ error: "Title, type, and status are required" }`
  - 500: `{ error: "Failed to create module", message: string }`

---

### **PUT `/api/instructor/courses/[courseId]/modules/[moduleId]`**

- **Method**: PUT
- **Parameters** (URL Path):
  - `courseId`: string (required)
  - `moduleId`: string (required)
- **Body** (JSON):
  - `title`: string (required)
  - `type`: string (required)
  - `status`: string (required)
  - `content`: string | null (optional)
  - `attachmentUrl`: string | null (optional)
  - `startsAt`: string | null (optional)
  - `endsAt`: string | null (optional)
  - `templateId`: string | null (optional)
  - `instructorId`: string (required)
- **Response**: Updated module object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Instructor ID is required" }` or `{ error: "Title, type, and status are required" }`
  - 500: `{ error: "Failed to update module", message: string }`

### **DELETE `/api/instructor/courses/[courseId]/modules/[moduleId]`**

- **Method**: DELETE
- **Parameters** (URL Path):
  - `courseId`: string (required)
  - `moduleId`: string (required)
- **Body** (JSON):
  - `instructorId`: string (required)
- **Response**: `{ success: true }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "Instructor ID is required" }`
  - 500: `{ error: "Failed to delete module", message: string }`

---

### **POST `/api/instructor/courses/[courseId]/quizes`**

- **Method**: POST
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body** (JSON):
  - `questions`: any[] (required)
  - `courseId`: string (required)
  - `moduleTitle`: string (required)
  - `status`: string (required)
  - `instructorId`: string (required)
  - `quizDescription`: string (optional)
- **Response**: `{ message: "Quiz created successfully" }`
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to create quiz", message: string }`

---

### **POST `/api/instructor/courses/[courseId]/quizes/auto-fill`**

- **Method**: POST
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body** (JSON):
  - `deckIds`: string[] (required)
  - `questionCounts`: object (required)
  - `quizDescription`: string (optional)
- **Response**: Generated quiz object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to generate AI quiz", message: string }`

---

### **GET `/api/instructor/courses/[courseId]/templates`**

- **Method**: GET
- **Parameters** (URL Path):
  - `courseId`: string (required)
- **Body**: N/A
- **Response**: Array of template objects
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ error: "Failed to fetch course templates" }`

---

### **GET `/api/instructor/submission/[submissionId]`**

- **Method**: GET
- **Parameters** (URL Path):
  - `submissionId`: string (required)
- **Body**: N/A
- **Response**: Submission detail object
- **Success Status**: 200
- **Error Status**: 500
- **Error Response**: `{ message: "Failed to fetch submission details", error }`

### **PUT `/api/instructor/submission/[submissionId]`**

- **Method**: PUT
- **Parameters** (URL Path):
  - `submissionId`: string (required)
- **Body** (JSON):
  - `grade`: number (required)
  - `feedback`: string (required)
  - `instructor_id`: string (required)
- **Response**: Updated submission object
- **Success Status**: 200
- **Error Status**:
  - 400: `{ message: "Missing required fields" }`
  - 500: `{ message: "Failed to update submission", error }`

---

### **POST `/api/instructor/submission/[submissionId]/auto-grade`**

- **Method**: POST
- **Parameters** (URL Path):
  - `submissionId`: string (required)
- **Body** (JSON - flexible structure):
  - `assignment_attachment_url`: string | null (optional)
  - `submission_attachment_url`: string | null (optional)
  - `max_points`: number (required)
  - `description`: string | null (optional)
  - `instructions`: string | null (optional)
  - `submission_id`: string (optional, must match URL param)
  - `content`: string | null (optional)
  - **OR** use nested objects:
    - `assignment`: { `attachment_url`, `max_points`, `description`, `instructions` }
    - `submission`: { `content`, `attachment_url` }
- **Response**:
  ```json
  {
    "grade": number,
    "feedback": string | null
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - 400: Various validation errors including:
    - `{ error: "max_points must be a valid number" }`
    - `{ error: "submissionId is required" }`
    - `{ error: "submission_id does not match route submissionId" }`
    - `{ error: "content and submission_attachment_url cannot both be empty" }`
    - `{ error: "assignment_attachment_url, description and instructions cannot all be empty" }`
  - 502: `{ error: "AI returned an invalid grade" }` or `{ error: "AI returned a grade outside the allowed range (0-maxPoints)" }`
  - 500: `{ error: "Failed to auto-grade submission", message: string }`

---

## **6. STORAGE ROUTES** (`/api/storage/*`)

### **POST `/api/storage/assignments`**

- **Method**: POST
- **Parameters**: None
- **Body** (FormData):
  - `file`: File (required)
  - `courseId`: string (required)
- **Response**:
  ```json
  {
    "path": string,
    "url": string
  }
  ```
- **Success Status**: 201
- **Error Status**:
  - 400: `{ error: "A file must be provided" }` or `{ error: "courseId is required" }`
  - 500: `{ error: "Failed to upload file", message: string }`

### **DELETE `/api/storage/assignments`**

- **Method**: DELETE
- **Parameters**: None
- **Body** (JSON):
  - `path`: string (required)
- **Response**: `{ success: true }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "File path is required" }`
  - 500: `{ error: "Failed to delete file", message: string }`

---

### **POST `/api/storage/modules`**

- **Method**: POST
- **Parameters**: None
- **Body** (FormData):
  - `file`: File (required) - must be video, PDF, PPT, or PPTX
  - `courseId`: string (required)
  - `moduleType`: string (optional, but required as "Slides" for PDF/PPTX ingestion)
  - `instructorId`: string (required for Slides ingestion)
- **Response**:
  - For videos (uploaded to Google Drive):
    ```json
    {
      "path": string (fileId),
      "url": string (webViewLink),
      "publicUrl": string,
      "fileId": string
    }
    ```
  - For PDF/PPTX (uploaded to Supabase):
    ```json
    {
      "path": string,
      "url": string
    }
    ```
- **Success Status**: 201
- **Error Status**:
  - 400:
    - `{ error: "A file must be provided" }`
    - `{ error: "courseId is required" }`
    - `{ error: "instructorId is required for Slides ingestion" }`
    - `{ error: "Unsupported file type." }`
  - 500: `{ error: "Failed to upload file to Google Drive", message: string }`

### **DELETE `/api/storage/modules`**

- **Method**: DELETE
- **Parameters**: None
- **Body** (JSON):
  - `path`: string (required) - either a Supabase path (with /) or Google Drive fileId
- **Response**: `{ success: true }`
- **Success Status**: 200
- **Error Status**:
  - 400: `{ error: "File path (fileId) is required" }`
  - 500: `{ error: "Failed to delete file from Google Drive", message: string }`

---

---

## Notes & gotchas (based on the actual implementation)

- **`/api/admin/users`**: folder exists but the route file is missing; endpoints are not implemented yet.
- **Chat persistence** happens only when the user is authenticated (cookie session).
- **`/api/chat/courses` student mode** currently returns `[]` (TODO in the route).
- **`/api/instructor/courses/[courseId]/quizes`** currently reads `courseId` from the JSON body (not the URL param). The URL still includes `[courseId]`, but the handler doesn’t use it.
- **File upload: modules**
  - Videos are uploaded to **Google Drive** and the API returns `url: webViewLink`.
  - PDFs/PPT/PPTX are uploaded to **Supabase storage**.
  - Ingestion into the “Slides” pipeline happens only when `moduleType === "Slides"`.

## Endpoint count

The repo currently contains **these active route handlers** (by folder):

- Admin: analytics, courses (CRUD), students (CRUD), teachers (CRUD + search)
- Auth: me
- Authentication: logout (only)
- Chat: chat (GET/POST/DELETE), create, courses, decks dropdown, decks search
- Instructor: courses list, dashboard, course detail (GET/PATCH), assignments (GET/POST), assignment detail (GET/PATCH/DELETE), decks (GET), modules (POST/PUT/DELETE), quizes (POST), auto-fill (POST), templates (GET), submission detail (GET/PUT), auto-grade (POST)
- Storage: assignments (upload/delete), modules (upload/delete)

**Breakdown by Category:**

1. **Admin Routes** (9 endpoints): Analytics, Courses (CRUD), Students (CRUD), Teachers (CRUD + Search)
2. **Auth Routes** (1 endpoint): Current user check
3. **Authentication Routes** (1 endpoint): Logout (others commented out)
4. **Chat Routes** (6 endpoints): Main chat, Courses, Create, Decks (dropdown + search)
5. **Instructor Routes** (18 endpoints): Dashboard, Courses, Assignments (CRUD), Modules (CRUD), Quizzes, Templates, Submissions (grade + auto-grade), Decks
6. **Storage Routes** (4 endpoints): Assignments (upload/delete), Modules (upload/delete with Google Drive + Supabase support)

### **Key Patterns Observed:**

- **Error Handling**: All routes return consistent error format with `error` and optional `message` fields
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (internal error), 502 (bad gateway for AI issues)
- **Authentication**: Most routes check for user authentication via `getCurrentUser()`
- **File Uploads**: Use FormData with proper file type validation
- **Storage Strategy**: Videos go to Google Drive, PDFs/PPTX go to Supabase Storage
- **AI Integration**: Auto-grading and quiz generation endpoints
- **RAG Chat**: Supports both general RAG and deck-specific chat modes
