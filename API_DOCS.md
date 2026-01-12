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

### 1.5) Signup to create account and get token

**POST** `/api/authentication/signup/email`

- **Body** (JSON):
  - `email`: string (required)
  - `password`: string (required)
  - `fullName`: string (required)
  - `role`: string (required) - "student", "teacher", or "instructor"
- **Success** (201):
  - `{ token: string }`
- **Errors**:
  - 400: `{ error: "email, password, fullName, and role are required" }` or `{ error: string }` (duplicate user)
  - 500: `{ error: "Failed to signup", message: string }` or `{ error: "Failed to create session" }`

**Signup creates a user account and immediately returns an auth token** - no separate login needed!

### 1.6) Google authentication (Najah domain only)

**POST** `/api/authentication/google`

- **Body** (JSON):
  - `idToken`: string (required) - Google ID token from Google Identity Services
- **Success** (200):
  - `{ token: string }`
- **Errors**:
  - 400: `{ error: "idToken is required" }`
  - 403: `{ error: string }` (invalid domain - only najah.edu and najah.edu.jo allowed)
  - 500: `{ error: "Failed to authenticate with Google", message: string }` or `{ error: "Failed to create session" }`

**How it works:**

1. Frontend obtains Google ID token via Google Identity Services (GSI)
2. Backend verifies the token and checks Najah domain restriction
3. If user exists with this Google account → login
4. If user exists with this email (but not linked to Google) → link Google account and login
5. If new user → create account and login
6. Returns session token for mobile or sets cookie for web

**Domain restriction:**

- Only emails ending with `@najah.edu` or `@najah.edu.jo` are allowed
- Domain verification happens server-side (never trust frontend!)

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
> - Authentication endpoints: signup (`/api/authentication/signup/email`) and logout are active. Login uses `/api/auth/token`. Some other endpoints under `/api/authentication/*` are legacy and **not active** (kept for reference).

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
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "overviewMetrics": {
      "total_users": 150,
      "active_users": 45,
      "total_courses": 25,
      "active_courses": 20,
      "total_assignments": 180,
      "published_assignments": 150,
      "total_submissions": 1200,
      "graded_submissions": 800,
      "total_chats": 500,
      "total_messages": 5000
    },
    "userEngagement": {
      "dailyActive": 45,
      "weeklyActive": 120,
      "monthlyActive": 140,
      "newUsersToday": 3,
      "newUsersThisWeek": 15,
      "newUsersThisMonth": 25,
      "usersByRole": {
        "students": 120,
        "instructors": 25,
        "admins": 5
      }
    },
    "coursePopularity": [
      {
        "course_id": "uuid",
        "course_code": "CS101",
        "course_name": "Introduction to Computer Science",
        "student_count": 50,
        "assignment_count": 8,
        "submission_count": 400,
        "average_grade": 85.5
      }
    ],
    "submissionTrends": [
      {
        "date": "2024-01-15",
        "not_started": 10,
        "in_progress": 5,
        "submitted": 20,
        "graded": 15
      }
    ],
    "submissionStatus": {
      "not_started": 100,
      "in_progress": 50,
      "submitted": 200,
      "graded": 850,
      "total": 1200
    },
    "chatStats": {
      "total_chats": 500,
      "total_messages": 5000,
      "average_messages_per_chat": 10.0,
      "unique_users_with_chats": 80,
      "messages_today": 50,
      "messages_this_week": 300,
      "messages_this_month": 1200,
      "user_messages": 2500,
      "ai_messages": 2500
    },
    "courseStatus": {
      "active": 20,
      "archived": 3,
      "draft": 2
    },
    "assignmentStatus": {
      "draft": 20,
      "published": 150,
      "closed": 10
    }
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to fetch analytics data",
    "message": "Database connection error"
  }
  ```
- **Notes**: Uses RPC function `get_admin_analytics()` from SQL

---

### **GET `/api/admin/courses`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "description": "Basic programming concepts",
      "semester": "Fall 2024",
      "instructor_id": "uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to fetch courses data",
    "message": "Database query failed"
  }
  ```

### **POST `/api/admin/courses`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Basic programming concepts",
    "semester": "Fall 2024",
    "instructor_id": "uuid",
    "status": "active"
  }
  ```
  - `code`: string (required) - Unique course code
  - `name`: string (required) - Course name
  - `description`: string | null (optional) - Course description
  - `semester`: string | null (optional) - Semester identifier
  - `instructor_id`: string (required) - UUID of instructor profile
  - `status`: string (optional, default: "active") - One of: "active", "archived", "draft"
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Basic programming concepts",
    "semester": "Fall 2024",
    "instructor_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Success Status**: 201
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to create course",
    "message": "Duplicate course code or invalid instructor_id"
  }
  ```

### **PATCH `/api/admin/courses`**

- **Method**: PATCH
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Updated description",
    "semester": "Spring 2024",
    "instructor_id": "uuid",
    "status": "active"
  }
  ```
  - `id`: string (required) - Course UUID
  - `code`: string (required) - Unique course code
  - `name`: string (required) - Course name
  - `description`: string | null (optional) - Course description
  - `semester`: string | null (optional) - Semester identifier
  - `instructor_id`: string (required) - UUID of instructor profile
  - `status`: string (required) - One of: "active", "archived", "draft"
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Updated description",
    "semester": "Spring 2024",
    "instructor_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to update course",
    "message": "Course not found or validation error"
  }
  ```

### **DELETE `/api/admin/courses`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid"
  }
  ```
  - `id`: string (required) - Course UUID to delete
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Basic programming concepts",
    "semester": "Fall 2024",
    "instructor_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to delete course",
    "message": "Course not found or has dependencies"
  }
  ```

---

### **GET `/api/admin/students`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "role": "student",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "avatar_url": null,
      "bio": null,
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to fetch students data",
    "message": "Database query failed"
  }
  ```

### **POST `/api/admin/students`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }
  ```
  - `full_name`: string (required) - Student's full name
  - `email`: string (required) - Unique email address
  - `password`: string (required) - Password (will be hashed)
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "role": "student",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": null,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
  ```
- **Success Status**: 201
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to create student",
    "message": "Email already exists or validation error"
  }
  ```

### **PATCH `/api/admin/students`**

- **Method**: PATCH
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid",
    "full_name": "John Doe Updated",
    "email": "john.doe.updated@example.com",
    "password": "newPassword123"
  }
  ```
  - `id`: string (required) - Student UUID
  - `full_name`: string (required) - Student's full name
  - `email`: string (required) - Email address
  - `password`: string (optional) - New password (only if updating password)
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "role": "student",
    "full_name": "John Doe Updated",
    "email": "john.doe.updated@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to update student",
    "message": "Student not found or validation error"
  }
  ```

### **DELETE `/api/admin/students`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid"
  }
  ```
  - `id`: string (required) - Student UUID to delete
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "role": "student",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to delete student",
    "message": "Student not found or has dependencies (enrollments, submissions)"
  }
  ```

---

### **GET `/api/admin/teachers`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "role": "instructor",
      "full_name": "Dr. Jane Smith",
      "email": "jane.smith@example.com",
      "avatar_url": null,
      "bio": "Professor of Computer Science",
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to fetch teachers data",
    "message": "Database query failed"
  }
  ```

### **POST `/api/admin/teachers`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "full_name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "password": "securePassword123"
  }
  ```
  - `full_name`: string (required) - Teacher's full name
  - `email`: string (required) - Unique email address
  - `password`: string (required) - Password (will be hashed)
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "role": "instructor",
    "full_name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": null,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
  ```
- **Success Status**: 201
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to create teacher",
    "message": "Email already exists or validation error"
  }
  ```

### **PATCH `/api/admin/teachers`**

- **Method**: PATCH
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid",
    "full_name": "Dr. Jane Smith Updated",
    "email": "jane.smith.updated@example.com",
    "password": "newPassword123"
  }
  ```
  - `id`: string (required) - Teacher UUID
  - `full_name`: string (required) - Teacher's full name
  - `email`: string (required) - Email address
  - `password`: string (optional) - New password (only if updating password)
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "role": "instructor",
    "full_name": "Dr. Jane Smith Updated",
    "email": "jane.smith.updated@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to update teacher",
    "message": "Teacher not found or validation error"
  }
  ```

### **DELETE `/api/admin/teachers`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "id": "uuid"
  }
  ```
  - `id`: string (required) - Teacher UUID to delete
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "role": "instructor",
    "full_name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "avatar_url": null,
    "bio": null,
    "last_active": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to delete teacher",
    "message": "Teacher not found or has dependencies (courses)"
  }
  ```

---

### **GET `/api/admin/teachers/search`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**:
  - `q`: string (required) - Search query (email or name)
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "role": "instructor",
    "full_name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "avatar_url": null,
    "bio": "Professor of Computer Science",
    "last_active": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "Search query is required" }`
  - **404**: `{ error: "Teacher not found", searched: "jane.smith@example.com" }`
  - **500**: `{ error: "Failed to search for teacher", message: "Database error" }`

---

## **2. AUTH ROUTES** (`/api/auth/*`)

### **GET `/api/auth/me`**

- **Method**: GET
- **Authentication**: Uses session cookie or Bearer token
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "user": {
      "id": "uuid",
      "role": "student",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "avatar_url": null,
      "bio": null,
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
  ```
  Or if not authenticated:
  ```json
  {
    "user": null
  }
  ```
- **Success Status**: 200 (always returns 200, even if not authenticated)
- **Error**: Returns `{ user: null }` on error (still status 200)
- **Notes**: Uses `getCurrentUser()` which checks both cookie session and Bearer token

### **POST `/api/auth/token`**

- **Method**: POST
- **Authentication**: Not required (this is the login endpoint)
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }
  ```
  - `email`: string (required) - User email address
  - `password`: string (required) - User password
- **Response** (200):
  ```json
  {
    "token": "encrypted_session_token_string"
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "email and password are required" }`
  - **401**: `{ error: "Invalid email or password" }` or `{ error: "User not found" }`
  - **500**: `{ error: "Failed to login", message: "Internal server error" }` or `{ error: "Failed to create session" }`
- **Notes**:
  - Creates a cookie session AND returns the same session token as Bearer token
  - Token is the encrypted session payload used by web cookie (`session`)
  - Mobile apps should store this token and send it as `Authorization: Bearer <token>`

---

## **3. AUTHENTICATION ROUTES** (`/api/authentication/*`)

### **POST `/api/authentication/logout`**

- **Method**: POST
- **Authentication**: Uses server-side `logout()` service (cookie/session logout)
- **Parameters**: None
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "error": "Failed to log out."
  }
  ```
- **Notes**: Clears the session cookie on the server side

### Active endpoints

#### **POST `/api/authentication/signup/email`** ✅

- **Method**: POST
- **Authentication**: None (public signup endpoint)
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "fullName": "John Doe",
    "role": "student"
  }
  ```
- **Response** (201):
  ```json
  {
    "token": "encrypted_session_value"
  }
  ```
- **Success Status**: 201
- **Error Status**:
  - **400**: `{ error: "email, password, fullName, and role are required" }` or `{ error: string }` (duplicate user)
  - **500**: `{ error: "Failed to signup", message: string }` or `{ error: "Failed to create session" }`

**Mobile-friendly signup endpoint**:

- Creates user in database with hashed password
- Creates the normal cookie session
- Returns the same session value as a Bearer token for React Native apps
- React Native can store the returned token and send it via: `Authorization: Bearer <token>`

### Legacy / inactive endpoints

The following exist in the tree but are **commented out** (legacy Supabase auth):

- `POST /api/authentication/login/email`
- `POST /api/authentication/login/google`
- `GET  /api/authentication/login/google/callback`
- `POST /api/authentication/signup/google`
- `GET  /api/authentication/signup/google/callback`

If you plan to re-enable them, the code needs to be restored (uncommented and adapted to your new cookie-based auth flow).

---

## **4. CHAT ROUTES** (`/api/chat/*`)

### **POST `/api/chat`**

- **Method**: POST
- **Authentication**: Optional (works without auth, but won't persist messages)
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "chatId": "uuid",
    "message": "What is machine learning?",
    "conversationHistory": [
      {
        "role": "USER",
        "content": "Hello",
        "created_at": "2024-01-15T10:00:00Z"
      },
      {
        "role": "AI",
        "content": "Hello! How can I help you?",
        "created_at": "2024-01-15T10:00:01Z"
      }
    ],
    "useDecksChat": false,
    "deckIds": ["deck-id-1", "deck-id-2"]
  }
  ```
  - `chatId`: string | null (optional) - Existing chat UUID. If not provided and user is authenticated, a new chat will be auto-created
  - `message`: string (required) - User's message/question
  - `conversationHistory`: Message[] (optional) - Previous messages in the conversation. If not provided and `chatId` exists, messages will be loaded from DB
  - `useDecksChat`: boolean (optional) - If true, uses deck-specific RAG chat instead of general RAG
  - `deckIds`: string[] (optional) - Array of deck IDs. Only used when `useDecksChat === true`

**Auth behavior**:

- If the request has an authenticated user (via cookie or Bearer token), the API will:
  - auto-create a chat when `chatId` is not provided (chat name is generated from first 50 chars of message)
  - persist user and AI messages to DB
- If not authenticated:

  - it still returns an answer, but will not persist messages
  - `chatId` will be `null` in response

- **Response** (200):
  ```json
  {
    "answer": "Machine learning is a subset of artificial intelligence...",
    "chatId": "uuid",
    "sources": [
      {
        "deck_id": "deck-id-1",
        "slide_number": 5,
        "content": "Relevant slide content..."
      }
    ],
    "used_queries": ["machine learning definition", "ML basics"]
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "Message is required" }`
  - **500**: `{ error: "Failed to process chat message", details: "AI service error or database error" }`

### **GET `/api/chat`**

- **Method**: GET
- **Authentication**: Optional (required for listing chats, optional for getting messages)
- **Parameters**: None
- **Query Parameters**:
  - `chatId`: string (required if not listing) - Chat UUID to fetch messages for
  - `list`: "true" (optional) - If set to "true", returns list of all user's chats instead of messages
- **Body**: N/A
- **Response** (200):

  If `list=true`:

  ```json
  {
    "chats": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "What is machine learning?",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

  If not authenticated with `list=true`, returns: `{ chats: [] }`

  Otherwise (with `chatId`):

  ```json
  {
    "messages": [
      {
        "id": "uuid",
        "chat_id": "uuid",
        "role": "USER",
        "content": "What is machine learning?",
        "created_at": "2024-01-15T10:00:00Z",
        "metadata": null
      },
      {
        "id": "uuid",
        "chat_id": "uuid",
        "role": "AI",
        "content": "Machine learning is...",
        "created_at": "2024-01-15T10:00:01Z",
        "metadata": {
          "sources": [...],
          "used_queries": [...]
        }
      }
    ]
  }
  ```

- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "chatId is required" }`
  - **500**: `{ error: "Failed to fetch chat data", details: "Database error" }`

### **DELETE `/api/chat`**

- **Method**: DELETE
- **Authentication**: Required
- **Parameters**: None
- **Query Parameters**:
  - `chatId`: string (required) - Chat UUID to delete
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "chatId is required" }`
  - **401**: `{ error: "Authentication required" }`
  - **500**: `{ error: "Failed to delete chat", details: "Database error" }`

---

### **GET `/api/chat/courses`**

- **Method**: GET
- **Authentication**: Not required
- **Parameters**: None
- **Query Parameters**:
  - `userId`: string (required) - User UUID
  - `userRole`: "student" | "instructor" (required) - User role
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "description": "Basic programming concepts",
      "semester": "Fall 2024",
      "instructor_id": "uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Success Status**: 200
- **Important behavior note**:
  - For `userRole=student` it currently returns an empty array (`[]`) because the student-course fetch is marked TODO in the code.
- **Error Status**:
  - **400**: `{ error: "Missing userId or userRole parameter" }` or `{ error: "Invalid userRole parameter" }`
  - **500**: `{ error: "Failed to fetch decks" }`

---

### **POST `/api/chat/create`**

- **Method**: POST
- **Authentication**: Required
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "name": "New Chat Session"
  }
  ```
  - `name`: string (required) - Chat name/title
- **Response** (200):
  ```json
  {
    "chat": {
      "id": "uuid",
      "user_id": "uuid",
      "name": "New Chat Session",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "Chat name is required" }`
  - **401**: `{ error: "Authentication required" }`
  - **500**: `{ error: "Failed to create chat", details: "Database error" }`

---

### **GET `/api/chat/decks/dropdown`**

- **Method**: GET
- **Authentication**: Not required
- **Parameters**: None
- **Query Parameters**:
  - `courseId`: string (required) - Course UUID
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "deck_id": "deck-123",
      "filename": "lecture-1.pdf",
      "file_type": "pdf",
      "attachment_url": "https://...",
      "total_slides": 50,
      "uploaded_at": "2024-01-01T00:00:00Z",
      "uploaded_by": "uuid",
      "metadata": {}
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "Missing courseId parameter" }`
  - **500**: `{ error: "Failed to fetch decks" }`

---

### **GET `/api/chat/decks/search`**

- **Method**: GET
- **Authentication**: Not required
- **Parameters**: None
- **Query Parameters**:
  - `searchTerm`: string (required, non-empty) - Search term for deck name/filename
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "deck_id": "deck-123",
      "filename": "lecture-1.pdf",
      "file_type": "pdf",
      "attachment_url": "https://...",
      "total_slides": 50,
      "uploaded_at": "2024-01-01T00:00:00Z",
      "uploaded_by": "uuid",
      "metadata": {}
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "Missing searchTerm parameter" }`
  - **500**: `{ error: "Failed to fetch decks" }`

---

## **5. INSTRUCTOR ROUTES** (`/api/instructor/*`)

### **GET `/api/instructor/courses`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**:
  - `instructorId`: string (required) - Instructor UUID
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "description": "Basic programming concepts",
      "semester": "Fall 2024",
      "instructor_id": "uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "student_count": 50,
      "total_assignments": 8
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "instructorId is required" }`
  - **500**: `{ error: "Failed to fetch dashboard data", message: "Database error" }`
- **Notes**: Uses `getInstructorCoursesData(instructorId)` service function

---

### **GET `/api/instructor/courses/[courseId]`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science",
    "description": "Basic programming concepts",
    "semester": "Fall 2024",
    "instructor_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "modules": [...],
    "assignments": [...]
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **404**: `{ error: "Course not found" }`
  - **500**: `{ error: "Database error" }`

### **PATCH `/api/instructor/courses/[courseId]`**

- **Method**: PATCH
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "code": "CS101",
    "name": "Introduction to Computer Science Updated",
    "description": "Updated description",
    "semester": "Spring 2024",
    "status": "active",
    "instructorId": "uuid"
  }
  ```
  - `code`: string (optional) - Course code
  - `name`: string (optional) - Course name
  - `description`: string (optional) - Course description
  - `semester`: string (optional) - Semester identifier
  - `status`: string (optional) - One of: "active", "archived", "draft"
  - `instructorId`: string (optional) - Instructor UUID
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "code": "CS101",
    "name": "Introduction to Computer Science Updated",
    "description": "Updated description",
    "semester": "Spring 2024",
    "instructor_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "courseId is required" }`
  - **500**: `{ error: "Failed to update course", message: "Database error" }`

---

### **GET `/api/instructor/dashboard`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**:
  - `instructorId`: string (required) - Instructor UUID
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "activeCourses": [
      {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Computer Science",
        "description": "Basic programming concepts",
        "semester": "Fall 2024",
        "instructor_id": "uuid",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "student_count": 50,
        "total_assignments": 8,
        "total_modules": 12,
        "published_modules": 10
      }
    ],
    "assignments": [
      {
        "id": "uuid",
        "course_id": "uuid",
        "title": "Assignment 1",
        "description": null,
        "instructions": null,
        "due_date": "2024-01-20T23:59:59Z",
        "max_points": 100,
        "status": "published",
        "template_id": null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "ungraded_count": 5,
        "submission_count": 45,
        "graded_count": 40,
        "course_code": "CS101",
        "course_name": "Introduction to Computer Science",
        "attachment_url": null
      }
    ],
    "activities": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "course_id": "uuid",
        "assignment_id": "uuid",
        "template_id": null,
        "activity_type": "submission_graded",
        "description": "Graded assignment submission",
        "created_at": "2024-01-15T10:00:00Z",
        "course_code": "CS101",
        "course_name": "Introduction to Computer Science"
      }
    ]
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "instructorId is required" }`
  - **500**: `{ error: "Failed to fetch dashboard data", message: "Database error" }`
- **Notes**: Uses RPC function `get_instructor_dashboard_overview()` from SQL. Returns a JSONB object with three arrays: `activeCourses`, `assignments`, and `activities`.

---

### **GET `/api/instructor/courses/[courseId]/assignments`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "course_id": "uuid",
      "title": "Assignment 1",
      "description": "Complete the following exercises",
      "instructions": "Submit your work by the due date",
      "due_date": "2024-01-20T23:59:59Z",
      "max_points": 100,
      "status": "published",
      "template_id": null,
      "attachment_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "instructor_id": "uuid",
      "course_code": "CS101",
      "course_name": "Introduction to Computer Science",
      "student_count": 50,
      "submission_count": 45,
      "graded_count": 40
    }
  ]
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "courseId is required" }`
  - **500**: `{ error: "Failed to fetch assignments data", message: "Database error" }`

### **POST `/api/instructor/courses/[courseId]/assignments`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "title": "Assignment 1",
    "description": "Complete the following exercises",
    "instructions": "Submit your work by the due date",
    "dueDate": "2024-01-20T23:59:59Z",
    "maxPoints": 100,
    "status": "published",
    "templateId": null,
    "attachmentUrl": "https://...",
    "instructorId": "uuid"
  }
  ```
  - `title`: string (required) - Assignment title
  - `description`: string | null (optional) - Assignment description
  - `instructions`: string | null (optional) - Assignment instructions
  - `dueDate`: string (required, ISO date format) - Due date/time
  - `maxPoints`: number (required) - Maximum points for the assignment
  - `status`: string (required) - One of: "draft", "published", "closed"
  - `templateId`: string | null (optional) - Circuit template UUID
  - `attachmentUrl`: string | null (optional) - URL to assignment attachment
  - `instructorId`: string (required) - Instructor UUID (for authorization check)
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Assignment 1",
    "description": "Complete the following exercises",
    "instructions": "Submit your work by the due date",
    "due_date": "2024-01-20T23:59:59Z",
    "max_points": 100,
    "status": "published",
    "template_id": null,
    "attachment_url": "https://...",
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
  ```
- **Success Status**: 201
- **Error Status**:
  - **400**: `{ error: "courseId is required" }` or `{ error: "instructorId is required" }` or `{ error: "dueDate is required" }` or `{ error: "Invalid dueDate format" }`
  - **403**: `{ error: "not authorized" }` (instructor doesn't own the course)
  - **404**: `{ error: "Course not found" }`
  - **500**: `{ error: "Failed to create assignment", message: "Database error" }`

---

### **GET `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: GET
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
  - `assignmentId`: string (required) - Assignment UUID
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Assignment 1",
    "description": "Complete the following exercises",
    "instructions": "Submit your work by the due date",
    "due_date": "2024-01-20T23:59:59Z",
    "max_points": 100,
    "status": "published",
    "template_id": null,
    "attachment_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "instructor_id": "uuid",
    "course_code": "CS101",
    "course_name": "Introduction to Computer Science",
    "student_count": 50,
    "submission_count": 45,
    "graded_count": 40,
    "submissions": [...]
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }`
  - **404**: `{ error: "Assignment not found" }`
  - **500**: `{ error: "Failed to fetch assignment", message: "Database error" }`

### **PATCH `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: PATCH
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
  - `assignmentId`: string (required) - Assignment UUID
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "title": "Assignment 1 Updated",
    "description": "Updated description",
    "instructions": "Updated instructions",
    "dueDate": "2024-01-25T23:59:59Z",
    "maxPoints": 100,
    "status": "published",
    "templateId": null,
    "attachmentUrl": "https://...",
    "instructorId": "uuid"
  }
  ```
  - `title`: string (required) - Assignment title
  - `description`: string | null (optional) - Assignment description
  - `instructions`: string | null (optional) - Assignment instructions
  - `dueDate`: string (required, ISO date format) - Due date/time
  - `maxPoints`: number (required) - Maximum points
  - `status`: string (required) - One of: "draft", "published", "closed"
  - `templateId`: string | null (optional) - Circuit template UUID
  - `attachmentUrl`: string | null (optional) - URL to assignment attachment
  - `instructorId`: string (required) - Instructor UUID (for authorization check)
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Assignment 1 Updated",
    "description": "Updated description",
    "instructions": "Updated instructions",
    "due_date": "2024-01-25T23:59:59Z",
    "max_points": 100,
    "status": "published",
    "template_id": null,
    "attachment_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }` or `{ error: "instructorId is required" }` or `{ error: "dueDate is required" }` or `{ error: "Invalid dueDate format" }`
  - **403**: `{ error: "not authorized" }` (instructor doesn't own the course)
  - **404**: `{ error: "Assignment not found" }`
  - **500**: `{ error: "Failed to update assignment", message: "Database error" }`

### **DELETE `/api/instructor/courses/[courseId]/assignments/[assignmentId]`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `courseId`: string (required) - Course UUID
  - `assignmentId`: string (required) - Assignment UUID
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "instructorId": "uuid"
  }
  ```
  - `instructorId`: string (required) - Instructor UUID (for authorization check)
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "courseId is required" }` or `{ error: "assignmentId is required" }` or `{ error: "instructorId is required" }`
  - **403**: `{ error: "not authorized" }` (instructor doesn't own the course)
  - **404**: `{ error: "Assignment not found" }`
  - **500**: `{ error: "Failed to delete assignment", message: "Database error" }`

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
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `submissionId`: string (required) - Submission UUID
- **Query Parameters**: None
- **Body**: N/A
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "assignment_id": "uuid",
    "student_id": "uuid",
    "circuit_id": null,
    "status": "submitted",
    "submitted_at": "2024-01-15T10:00:00Z",
    "grade": null,
    "feedback": null,
    "graded_at": null,
    "graded_by": null,
    "created_at": "2024-01-10T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "content": "Student's submission text",
    "attachment_url": "https://...",
    "student": {
      "id": "uuid",
      "role": "student",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "avatar_url": null,
      "bio": null,
      "last_active": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "assignment": {
      "id": "uuid",
      "course_id": "uuid",
      "title": "Assignment 1",
      "description": "Complete the following exercises",
      "instructions": "Submit your work by the due date",
      "due_date": "2024-01-20T23:59:59Z",
      "max_points": 100,
      "status": "published",
      "template_id": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "attachment_url": "https://...",
      "course": {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Computer Science",
        "description": "Basic programming concepts",
        "semester": "Fall 2024",
        "instructor_id": "uuid",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```
- **Success Status**: 200
- **Error Status**: 500
- **Error Response** (500):
  ```json
  {
    "message": "Failed to fetch submission details",
    "error": "Database error"
  }
  ```
- **Notes**: Uses view `v_instructor_submission_detail` from SQL

### **PUT `/api/instructor/submission/[submissionId]`**

- **Method**: PUT
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `submissionId`: string (required) - Submission UUID
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "grade": 85.5,
    "feedback": "Good work! However, you could improve on...",
    "instructor_id": "uuid"
  }
  ```
  - `grade`: number (required) - Grade/score (0 to max_points)
  - `feedback`: string (required) - Instructor feedback
  - `instructor_id`: string (required) - Instructor UUID (for tracking who graded)
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "assignment_id": "uuid",
    "student_id": "uuid",
    "circuit_id": null,
    "status": "graded",
    "submitted_at": "2024-01-15T10:00:00Z",
    "grade": 85.5,
    "feedback": "Good work! However, you could improve on...",
    "graded_at": "2024-01-15T12:00:00Z",
    "graded_by": "uuid",
    "created_at": "2024-01-10T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "content": "Student's submission text",
    "attachment_url": "https://..."
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ message: "Missing required fields" }`
  - **500**: `{ message: "Failed to update submission", error: "Database error" }`
- **Notes**: Updates submission status to "graded" automatically via trigger

---

### **POST `/api/instructor/submission/[submissionId]/auto-grade`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters** (URL Path):
  - `submissionId`: string (required) - Submission UUID
- **Query Parameters**: None
- **Body** (JSON - flexible structure):

  **Option 1: Flat structure**

  ```json
  {
    "assignment_attachment_url": "https://...",
    "submission_attachment_url": "https://...",
    "max_points": 100,
    "description": "Assignment description",
    "instructions": "Assignment instructions",
    "submission_id": "uuid",
    "content": "Student's submission text content"
  }
  ```

  **Option 2: Nested structure**

  ```json
  {
    "assignment": {
      "attachment_url": "https://...",
      "max_points": 100,
      "description": "Assignment description",
      "instructions": "Assignment instructions"
    },
    "submission": {
      "content": "Student's submission text content",
      "attachment_url": "https://..."
    }
  }
  ```

  **Fields:**

  - `assignment_attachment_url` or `assignment.attachment_url`: string | null (optional) - Assignment file URL
  - `submission_attachment_url` or `submission.attachment_url`: string | null (optional) - Submission file URL
  - `max_points` or `assignment.max_points`: number (required) - Maximum points for the assignment
  - `description` or `assignment.description`: string | null (optional) - Assignment description
  - `instructions` or `assignment.instructions`: string | null (optional) - Assignment instructions
  - `submission_id`: string (optional) - Must match URL param `submissionId` if provided
  - `content` or `submission.content`: string | null (optional) - Student's text submission

- **Response** (200):
  ```json
  {
    "grade": 87.5,
    "feedback": "The submission demonstrates good understanding of the concepts. The analysis is thorough, but could benefit from more examples. Overall, well done!"
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: Various validation errors:
    - `{ error: "max_points must be a valid number" }`
    - `{ error: "submissionId is required" }`
    - `{ error: "submission_id does not match route submissionId" }`
    - `{ error: "content and submission_attachment_url cannot both be empty" }`
    - `{ error: "assignment_attachment_url, description and instructions cannot all be empty" }`
  - **502**: `{ error: "AI returned an invalid grade" }` or `{ error: "AI returned a grade outside the allowed range (0-100)" }`
  - **500**: `{ error: "Failed to auto-grade submission", message: "AI service error" }`
- **Notes**:
  - Uses AI service to automatically grade submissions
  - Grade is rounded to 2 decimal places
  - Grade must be between 0 and max_points
  - At least one of assignment fields (attachment_url, description, instructions) must be provided
  - At least one of submission fields (content, attachment_url) must be provided

---

## **6. STORAGE ROUTES** (`/api/storage/*`)

### **POST `/api/storage/assignments`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (FormData):
  - `file`: File (required) - File to upload
  - `courseId`: string (required) - Course UUID
- **Response** (201):
  ```json
  {
    "path": "course-uuid/1234567890-assignment.pdf",
    "url": "https://supabase-storage-url/assignments/course-uuid/1234567890-assignment.pdf"
  }
  ```
- **Success Status**: 201
- **Error Status**:
  - **400**: `{ error: "A file must be provided" }` or `{ error: "courseId is required" }`
  - **500**: `{ error: "Failed to upload file", message: "Storage service error" }`
- **Notes**:
  - Uploads to Supabase Storage bucket "assignments"
  - File path format: `{courseId}/{timestamp}-{filename}`
  - Returns both storage path and public URL

### **DELETE `/api/storage/assignments`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "path": "course-uuid/1234567890-assignment.pdf"
  }
  ```
  - `path`: string (required) - Storage path to delete
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "File path is required" }`
  - **500**: `{ error: "Failed to delete file", message: "Storage service error" }`
- **Notes**: Deletes file from Supabase Storage bucket "assignments"

---

### **POST `/api/storage/modules`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (FormData):
  - `file`: File (required) - Must be video (video/\*), PDF (application/pdf), PPT (application/vnd.ms-powerpoint), or PPTX (application/vnd.openxmlformats-officedocument.presentationml.presentation)
  - `courseId`: string (required) - Course UUID
  - `moduleType`: string (optional) - Module type. Required as "Slides" for PDF/PPTX ingestion into RAG pipeline
  - `instructorId`: string (required for Slides ingestion) - Instructor UUID (required when `moduleType === "Slides"`)
- **Response** (201):

  **For videos (uploaded to Google Drive):**

  ```json
  {
    "path": "google-drive-file-id",
    "url": "https://drive.google.com/file/d/file-id/view",
    "publicUrl": "https://drive.google.com/uc?export=download&id=file-id",
    "fileId": "google-drive-file-id"
  }
  ```

  **For PDF/PPTX (uploaded to Supabase Storage):**

  ```json
  {
    "path": "course-uuid/1234567890-lecture.pdf",
    "url": "https://supabase-storage-url/modules/course-uuid/1234567890-lecture.pdf"
  }
  ```

- **Success Status**: 201
- **Error Status**:
  - **400**:
    - `{ error: "A file must be provided" }`
    - `{ error: "courseId is required" }`
    - `{ error: "instructorId is required for Slides ingestion" }`
    - `{ error: "Unsupported file type." }`
  - **500**: `{ error: "Failed to upload file to Google Drive", message: "Storage service error" }`
- **Notes**:
  - Videos are uploaded to **Google Drive** and return `webViewLink` as `url`
  - PDFs/PPT/PPTX are uploaded to **Supabase Storage** bucket "modules"
  - Ingestion into slide_decks table and RAG pipeline happens only when `moduleType === "Slides"`
  - File path format for Supabase: `{courseId}/{timestamp}-{filename}`

### **DELETE `/api/storage/modules`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "path": "google-drive-file-id"
  }
  ```
  or
  ```json
  {
    "path": "course-uuid/1234567890-lecture.pdf"
  }
  ```
  - `path`: string (required) - Either a Supabase path (contains "/") or Google Drive fileId (no "/")
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "File path (fileId) is required" }`
  - **500**: `{ error: "Failed to delete file from Google Drive", message: "Storage service error" }`
- **Notes**:
  - Automatically detects storage type based on path format
  - Paths with "/" are treated as Supabase Storage paths
  - Paths without "/" are treated as Google Drive fileIds

---

### **POST `/api/storage/submissions`**

- **Method**: POST
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (FormData):
  - `file`: File (required) - File to upload
  - `courseId`: string (required) - Course UUID
  - `assignmentId`: string (required) - Assignment UUID
  - `studentId`: string (required) - Student UUID
- **Response** (201):
  ```json
  {
    "path": "course-uuid/assignment-uuid/student-uuid/1234567890-submission.pdf",
    "url": "https://supabase-storage-url/submissions/course-uuid/assignment-uuid/student-uuid/1234567890-submission.pdf"
  }
  ```
- **Success Status**: 201
- **Error Status**:
  - **400**:
    - `{ error: "A file must be provided" }`
    - `{ error: "courseId is required" }`
    - `{ error: "assignmentId is required" }`
    - `{ error: "studentId is required" }`
  - **500**: `{ error: "Failed to upload file", message: "Storage service error" }`
- **Notes**:
  - Uploads to Supabase Storage bucket "submissions"
  - File path format: `{courseId}/{assignmentId}/{studentId}/{timestamp}-{filename}`
  - Returns both storage path and public URL

### **DELETE `/api/storage/submissions`**

- **Method**: DELETE
- **Authentication**: Not enforced at route level
- **Parameters**: None
- **Query Parameters**: None
- **Body** (JSON):
  ```json
  {
    "path": "course-uuid/assignment-uuid/student-uuid/1234567890-submission.pdf"
  }
  ```
  - `path`: string (required) - Storage path to delete
- **Response** (200):
  ```json
  {
    "success": true
  }
  ```
- **Success Status**: 200
- **Error Status**:
  - **400**: `{ error: "File path is required" }`
  - **500**: `{ error: "Failed to delete file", message: "Storage service error" }`
- **Notes**: Deletes file from Supabase Storage bucket "submissions"

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
