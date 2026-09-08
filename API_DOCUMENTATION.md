# Camproxi API Documentation — Student & Agent Endpoints

This document provides a comprehensive and detailed reference for all **Student** and **Agent** endpoints in the Camproxi Unified Backend API.

---

## 1. Global Conventions & Authentication

### Base URL
```
http://localhost:3000 (Development)
https://<production-domain> (Production)
```

### Authentication Mechanisms
1. **HTTP-only Cookies:**
   - **Student & Admin Portals:** Stored in cookie `access_token`.
   - **Agent Portal:** Stored in cookie `jwt` or `access_token`.
2. **Bearer Authorization Header (Supported as fallback for all guards & mobile clients):**
   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```

### Standard Error Format
All errors conform to standard NestJS HTTP responses:
```json
{
  "statusCode": 400,
  "timestamp": "2026-09-07T12:00:00.000Z",
  "path": "/api/student/...",
  "message": "Detailed error message or validation errors array",
  "errorType": "Bad Request"
}
```

---

## 2. Student Portal Endpoints (`/api/student/*`)

All student endpoints (except unauthenticated auth endpoints) require authentication via `StudentAuthGuard`. The authenticated payload injects `req.user` containing `{ sub: string, email: string, schoolId: string, portal: 'STUDENT' }`.

---

### 2.1 Student Authentication (`/api/student/auth`)

#### `POST /api/student/auth/create`
Registers a new student user and sets the HTTP-only `access_token` cookie.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@student.edu",
    "password": "Password123!",
    "phone": "+2348012345678",
    "schoolId": "64f8a12b3c4d5e6f7a8b9c0d",
    "campusName": "Main Campus",
    "longitude": 3.3792,
    "latitude": 6.5244
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "res": {
      "id": "64f8a12b3c4d5e6f7a8b9c0e",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@student.edu",
      "phone": "+2348012345678",
      "schoolId": "64f8a12b3c4d5e6f7a8b9c0d",
      "campusName": "Main Campus",
      "isverified": false,
      "createdAt": "2026-09-07T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

#### `POST /api/student/auth/login`
Authenticates a student and sets the `access_token` cookie.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@student.edu",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "64f8a12b3c4d5e6f7a8b9c0e",
      "email": "john@student.edu",
      "name": "John Doe"
    }
  }
  ```

#### `POST /api/student/auth/logout`
Clears authentication cookies.
- **Auth Required:** No
- **Response (`200 OK`):**
  ```json
  {
    "message": "Logout successful"
  }
  ```

#### `GET /api/student/auth/email/:email`
Checks user existence by email.
- **Auth Required:** No
- **Response (`200 OK`):** User object or `null`.

#### `GET /api/student/auth/username/:username`
Checks user existence by username.
- **Auth Required:** No
- **Response (`200 OK`):** User object or `null`.

#### `POST /api/student/auth/forgot-password`
Generates and sends a password reset OTP to email.
- **Request Body:** `{ "email": "john@student.edu" }`
- **Response (`200 OK`):** `{ "message": "Password reset OTP sent to your email" }`

#### `POST /api/student/auth/reset-password`
Verifies reset OTP and updates password.
- **Request Body:**
  ```json
  {
    "email": "john@student.edu",
    "otp": "123456",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Response (`200 OK`):** `{ "message": "Password reset successfully" }`

---

### 2.2 Student Profile (`/api/student/profile`)

#### `GET /api/student/profile/school`
Returns the school and campus details for the authenticated student.
- **Auth Required:** StudentAuthGuard
- **Response (`200 OK`):**
  ```json
  {
    "id": "64f8a12b3c4d5e6f7a8b9c0d",
    "name": "University of Lagos",
    "code": "UNILAG",
    "campus": ["Main Campus", "Idi Araba"]
  }
  ```

#### `PATCH /api/student/profile/update`
Updates student profile fields and optional profile picture.
- **Auth Required:** StudentAuthGuard
- **Content-Type:** `multipart/form-data` or `application/json`
- **Form/Body Fields:**
  - `firstName` (optional)
  - `lastName` (optional)
  - `phone` (optional)
  - `bio` (optional)
  - `profileImage` (optional file)
- **Response (`200 OK`):** Updated user profile object.

#### `POST /api/student/profile/send-verification`
Dispatches an email verification OTP.
- **Auth Required:** StudentAuthGuard
- **Response (`200 OK`):** `{ "message": "Verification OTP sent to email" }`

#### `POST /api/student/profile/verify-email`
Validates email verification OTP.
- **Request Body:** `{ "otp": "123456" }`
- **Response (`200 OK`):** `{ "message": "Email verified successfully" }`

#### `POST /api/student/profile/send-phone-verification`
Dispatches an SMS verification OTP to the student's registered phone.
- **Auth Required:** StudentAuthGuard
- **Response (`200 OK`):** `{ "message": "Verification OTP sent to phone" }`

#### `POST /api/student/profile/verify-phone`
Validates SMS verification OTP.
- **Request Body:** `{ "otp": "123456" }`
- **Response (`200 OK`):** `{ "message": "Phone number verified successfully" }`

#### `POST /api/student/profile/change-password`
Changes current student password.
- **Request Body:**
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```
- **Response (`200 OK`):** `{ "message": "Password changed successfully" }`

---

### 2.3 Student Users & Directory (`/api/student/users`)

#### `GET /api/student/users`
Lists verified student accounts (paginated). Sensitive credentials and OTPs are stripped.
- **Query Params:** `page` (default: 1), `limit` (default: 20)
- **Response (`200 OK`):** Array of user records with school information.

#### `GET /api/student/users/me`
Fetches the profile of the currently logged-in student.
- **Response (`200 OK`):** Detailed user object (excluding passwords and tokens).

#### `GET /api/student/users/agent/:id`
Retrieves public profile details of an agent by ID.
- **Response (`200 OK`):** Agent profile object with associated school information.

#### `GET /api/student/users/:id`
Retrieves public student profile details by user ID.
- **Response (`200 OK`):** User profile object.

---

### 2.4 Student Catalog Items (`/api/student/items`)

Fetches verified (`status: 'verified'`) and available items within the student's assigned campus.

#### `GET /api/student/items/products`
Lists available products for the student's campus.

#### `GET /api/student/items/products/:id`
Gets product details by product ID.

#### `GET /api/student/items/properties`
Lists vacant properties (`isVacant: true`, `status: 'verified'`) for the campus.

#### `GET /api/student/items/properties/:id`
Gets property details by property ID.

#### `GET /api/student/items/services`
Lists available services for the campus.

#### `GET /api/student/items/services/:id`
Gets service details by service ID.

---

### 2.5 Student Stores (`/api/student/stores`)

#### `GET /api/student/stores`
Lists all vendor stores operating within the student's campus where the agent is active.
- **Response (`200 OK`):** Array of Store objects including agent details.

#### `GET /api/student/stores/agent/:agentId`
Fetches all stores owned by a specific agent within the student's campus.
- **Params:** `agentId` (Agent MongoDB ID)
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "66a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Campus Gadgets Store",
      "description": "Electronics and phone accessories",
      "bannerImage": "https://res.cloudinary.com/...",
      "address": "Block B, Student Center",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "agent": {
        "id": "66a1b2c3d4e5f6a7b8c9d000",
        "firstName": "Alex",
        "lastName": "Vendor",
        "companyName": "Campus Gadgets Ltd",
        "email": "alex@gadgets.com",
        "phone": "+2348000000000",
        "whatsapp": "+2348000000000",
        "products": [
          {
            "id": "66a1b2c3d4e5f6a7b8c9d999",
            "name": "Wireless Earbuds",
            "price": 15000,
            "images": [...],
            "averageRating": 4.5
          }
        ]
      }
    }
  ]
  ```

#### `GET /api/student/stores/:id`
Fetches a single store by store ID with active vendor products.
- **Params:** `id` (Store ID)
- **Response (`200 OK`):** Store object.

---

### 2.6 Student Service Workers (`/api/student/workers`)

#### `GET /api/student/workers`
Lists all verified service workers available for hire in the student's school campus.

#### `GET /api/student/workers/agent/:agentId`
Fetches all service workers registered under a specific agent within the student's campus.
- **Params:** `agentId` (Agent MongoDB ID)
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "66f1234567890abcdef12345",
      "agentId": "66a1b2c3d4e5f6a7b8c9d000",
      "firstName": "David",
      "lastName": "Smith",
      "role": "Plumber & Electrician",
      "phone": "+2348099998888",
      "profileImage": "https://res.cloudinary.com/...",
      "isAvailable": true,
      "createdAt": "2026-08-10T12:00:00.000Z",
      "agent": {
        "id": "66a1b2c3d4e5f6a7b8c9d000",
        "firstName": "Alex",
        "lastName": "Manager",
        "companyName": "Campus Facilities",
        "email": "alex@facilities.com",
        "phone": "+2348000000000"
      }
    }
  ]
  ```

#### `GET /api/student/workers/:id`
Retrieves a specific service worker's profile by ID.

---

### 2.7 Student Saved Items / Bookmarks (`/api/student/saved`)

#### `POST /api/student/saved`
Saves an item for the authenticated student (idempotent, prevents duplicate records).
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT"
  }
  ```
- **Values for `itemCategory`:** `"PRODUCT"`, `"PROPERTY"`, `"SERVICE"`.

#### `GET /api/student/saved`
Lists all saved items for the student with fully populated item details.

#### `GET /api/student/saved/:id`
Retrieves a single saved bookmark record.

#### `DELETE /api/student/saved/:id`
Removes a specific saved item from the student's bookmarks.

#### `DELETE /api/student/saved`
Clears all saved items for the authenticated student.

---

### 2.8 Student Requests (`/api/student/requests`)

#### `POST /api/student/requests`
Submits an inquiry/booking request to an agent for an item.
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PROPERTY",
    "itemName": "Self-con Hostel Room 4",
    "message": "Hello, is this room still available for inspection tomorrow?"
  }
  ```

#### `GET /api/student/requests`
Lists all booking and inquiry requests submitted by the student.

---

### 2.9 Student Reviews & Ratings (`/api/student/*`)

#### `POST /api/student/ratings`
Submits or updates a rating (1-5) for an item.
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT",
    "rating": 5
  }
  ```

#### `DELETE /api/student/ratings/:itemId`
Removes the student's rating for the specified item.

#### `POST /api/student/reviews`
Submits a written review comment for an item.
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT",
    "comment": "Great product, fast pickup on campus!"
  }
  ```

#### `DELETE /api/student/reviews/:id`
Deletes a review written by the student.

#### `GET /api/student/reviews/me`
Lists all reviews posted by the student.

#### `GET /api/student/ratings/me`
Lists all ratings given by the student.

---

### 2.10 Student Search (`/api/student/search`)

#### `GET /api/student/search`
Cross-category search across verified products, properties, and services within the student's campus.
- **Query Params:**
  - `q`: Search keyword (matched against name and description)
  - `category`: `"ALL"` | `"PRODUCT"` | `"PROPERTY"` | `"SERVICE"` (default: `"ALL"`)
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sortBy`: `"price_asc"` | `"price_desc"` | `"rating_desc"`

---

### 2.11 Student Notifications (`/api/student/notifications`)

#### `GET /api/student/notifications`
Retrieves in-app notifications for the student.

#### `PATCH /api/student/notifications/:id/read`
Marks a specific notification as read.

#### `PATCH /api/student/notifications/read-all`
Marks all notifications as read.

#### `GET /api/student/notifications/settings`
Retrieves notification preferences.

#### `PATCH /api/student/notifications/settings`
Updates notification preferences (e.g. email, inApp, marketing).

#### `POST /api/student/notifications/push-token`
Registers an Expo/FCM push token for mobile alerts:
- **Request Body:** `{ "token": "ExponentPushToken[xxxxxxxxxxxxxx]" }`

#### `DELETE /api/student/notifications/push-token`
Unregisters a push token.

---

### 2.12 Student Chat (`/api/student/chats`)

Protected with BOLA verification: students can only access conversations they are part of.

#### `GET /api/student/chats`
Lists all conversations involving the student.

#### `GET /api/student/chats/:chatId`
Retrieves metadata of a specific chat session.

#### `POST /api/student/chats/initiate`
Finds or creates a chat conversation between the student and an agent.
- **Request Body:**
  ```json
  {
    "agentId": "66a1b2c3d4e5f6a7b8c9d000",
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PROPERTY"
  }
  ```

#### `GET /api/student/chats/:chatId/messages`
Retrieves paginated chat history for the conversation.
- **Query Params:** `limit` (default: 50), `skip` (default: 0)

#### `PATCH /api/student/chats/:chatId/read`
Marks unread messages sent by the agent as read.

---

### 2.13 Student Reports (`/api/student/reports`)

#### `POST /api/student/reports`
Submits an incident or grievance report to platform administration.
- **Request Body:**
  ```json
  {
    "targetType": "AGENT",
    "targetId": "66a1b2c3d4e5f6a7b8c9d000",
    "reason": "FRAUD",
    "description": "Agent refused refund after canceled order",
    "evidence": ["https://res.cloudinary.com/..."]
  }
  ```

#### `GET /api/student/reports`
Lists reports filed by the student.

---

## 3. Agent Portal Endpoints (`/api/agent/*`)

Agent endpoints require authentication via `AgentAuthGuard` unless specified. The authenticated payload injects `req.agent` containing `{ id: string, email: string, role: Role, schoolId: string, campusName: string, portal: 'AGENT' }`.

Role-based restrictions use `RolesGuard` with roles:
- `AGENT` (Real estate / property agent)
- `VENDOR` (Product seller / store owner)
- `SERVICE_PROVIDER` (Services / technicians)

---

### 3.1 Agent Authentication & Profile (`/api/agent`)

#### `POST /api/agent/register`
Registers a new agent account and sets auth cookie.
- **Request Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@agent.com",
    "password": "Password123!",
    "phone": "+2348098765432",
    "whatsapp": "+2348098765432",
    "companyName": "Jane Real Estate",
    "category": "AGENT",
    "schoolId": "64f8a12b3c4d5e6f7a8b9c0d",
    "campusName": "Main Campus"
  }
  ```

#### `POST /api/agent/login`
Authenticates an agent.
- **Request Body:**
  ```json
  {
    "email": "jane@agent.com",
    "password": "Password123!"
  }
  ```

#### `POST /api/agent/logout`
Logs out agent and clears cookies.

#### `GET /api/agent/me` or `GET /api/agent/profile`
Retrieves profile of the authenticated agent (sensitive OTPs and password hashes are stripped).

#### `GET /api/agent/school`
Returns the school/campus profile assigned to the agent.

#### `GET /api/agent/student/:id`
Retrieves public student info for clients the agent is communicating with.

#### `PATCH /api/agent/profile/update`
Updates agent bio, phone, company, and optional profile image (`multipart/form-data`).

#### `POST /api/agent/send-verification` & `POST /api/agent/verify-email`
Sends and verifies email OTP (`{ "otp": "123456" }`).

#### `POST /api/agent/send-phone-verification` & `POST /api/agent/verify-phone`
Sends and verifies SMS phone OTP (`{ "otp": "123456" }`).

#### `POST /api/agent/change-password`
Changes current agent password (`{ "oldPassword": "...", "newPassword": "..." }`).

#### `POST /api/agent/forgot-password` & `POST /api/agent/reset-password`
Initiates password reset via email OTP and sets new password.

#### `DELETE /api/agent/profile`
Deletes agent account and clears session.

---

### 3.2 Agent Properties (`/api/agent/properties`)
*Requires Role: `AGENT`*

#### `POST /api/agent/properties`
Creates a property listing with up to 10 images (`multipart/form-data`).
- **Form Fields:** `name`, `description`, `price`, `type`, `location`, `amenities`, `images` (files).

#### `GET /api/agent/properties`
Lists all property listings owned by the authenticated agent.

#### `GET /api/agent/properties/:id`
Fetches a single property owned by the agent.

#### `PATCH /api/agent/properties/:id`
Updates property details and uploads additional images.

#### `DELETE /api/agent/properties/:id`
Deletes property and removes associated Cloudinary assets.

#### `GET /api/agent/properties/fetch/students/:schoolId`
- **Guard:** `StudentAuthGuard`
- Fetches verified properties for students within their school.

---

### 3.3 Agent Products (`/api/agent/products`)
*Requires Role: `VENDOR`*

#### `POST /api/agent/products`
Creates a product listing with up to 10 images (`multipart/form-data`).

#### `GET /api/agent/products`
Lists all products owned by the vendor.

#### `GET /api/agent/products/:id`
Fetches a single product owned by the vendor.

#### `PATCH /api/agent/products/:id`
Updates product price, stock status, description, and images.

#### `DELETE /api/agent/products/:id`
Deletes a product listing.

#### `GET /api/agent/products/fetch/students`
- **Guard:** `StudentAuthGuard`
- Fetches verified products for students in the school.

---

### 3.4 Agent Services (`/api/agent/services`)
*Requires Role: `SERVICE_PROVIDER`*

#### `POST /api/agent/services`
Creates a service listing (`multipart/form-data`).

#### `GET /api/agent/services`
Lists services owned by the service provider.

#### `GET /api/agent/services/:id`
Fetches a single service.

#### `PATCH /api/agent/services/:id`
Updates service details, pricing, available days, and hours.

#### `DELETE /api/agent/services/:id`
Deletes a service listing.

#### `GET /api/agent/services/fetch/students/:schoolId`
- **Guard:** `StudentAuthGuard`
- Fetches verified services for students in their campus.

---

### 3.5 Agent Stores (`/api/agent/store`)

#### `GET /api/agent/store`
Lists all stores created by the authenticated vendor agent.

#### `GET /api/agent/store/:id`
Fetches details of a specific store owned by the agent.

#### `POST /api/agent/store`
Creates a new store banner and storefront.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: Store name
  - `description`: Store bio/description
  - `address`: Store physical pickup address
  - `bannerImage`: (optional file upload)
  - `location`: `{ "latitude": ..., "longitude": ... }`
  - `operatingHours`: Opening hours metadata

#### `PATCH /api/agent/store/:id`
Updates store profile and banner image.

#### `DELETE /api/agent/store/:id`
Deletes the store.

---

### 3.6 Agent Service Workers (`/api/agent/workers`)

#### `GET /api/agent/workers`
Lists all technicians and service staff registered by the agent.

#### `GET /api/agent/workers/:id`
Fetches details of a specific service worker.

#### `POST /api/agent/workers`
Registers a new worker under the agent's account.
- **Content-Type:** `multipart/form-data`
- **Fields:** `firstName`, `lastName`, `role`, `phone`, `profileImage` (file).

#### `PATCH /api/agent/workers/:id`
Updates worker role, contact details, or profile image.

#### `DELETE /api/agent/workers/:id`
Removes a service worker.

---

### 3.7 Agent Requests & Booking Inquiries (`/api/agent/requests`)

#### `GET /api/agent/requests`
Retrieves all customer requests for the agent's items.

#### `PATCH /api/agent/requests/:id/respond`
Approves or rejects a student booking request.
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "responseMessage": "Inspection confirmed for 2 PM tomorrow."
  }
  ```
- **Allowed `status` values:** `"APPROVED"`, `"REJECTED"`.

---

### 3.8 Agent Reviews & Feedback (`/api/agent/reviews`)

#### `GET /api/agent/reviews/item/:itemId`
Fetches customer reviews for an item owned by the agent.

#### `GET /api/agent/reviews/item/:itemId/ratings`
Fetches aggregated rating metrics for the item.

#### `POST /api/agent/reviews/:id/reply`
Replies to a student's review on an item owned by the agent.
- **Request Body:**
  ```json
  {
    "agentReply": "Thank you for the positive feedback!"
  }
  ```

---

### 3.9 Agent Metrics & Analytics (`/api/agent/metrics`)

#### `GET /api/agent/metrics`
Calculates dashboard metrics across items, requests, and reviews.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "inventory": {
        "properties": 12,
        "products": 45,
        "services": 3,
        "total": 60
      },
      "requests": {
        "pending": 4,
        "approved": 20,
        "rejected": 2,
        "total": 26
      },
      "reviews": {
        "total": 18,
        "averageRating": 4.67
      }
    }
  }
  ```

---

### 3.10 Agent Notifications (`/api/agent/notifications`)

#### `GET /api/agent/notifications`
Lists notifications for the agent.

#### `PATCH /api/agent/notifications/:id/read`
Marks a notification as read.

#### `PATCH /api/agent/notifications/read-all`
Marks all notifications as read.

---

### 3.11 Agent Chat (`/api/agent/chats`)

#### `GET /api/agent/chats`
Lists conversations involving the agent.

#### `GET /api/agent/chats/:chatId`
Fetches conversation details (protected against unauthorized agents).

#### `POST /api/agent/chats/initiate`
Initiates or resumes a chat with a student.
- **Request Body:**
  ```json
  {
    "studentId": "64f8a12b3c4d5e6f7a8b9c0e",
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT"
  }
  ```

#### `GET /api/agent/chats/:chatId/messages`
Retrieves chat history.
- **Query Params:** `limit` (default: 50), `skip` (default: 0)

#### `PATCH /api/agent/chats/:chatId/read`
Marks unread student messages as read.

---

### 3.12 Agent Reports (`/api/agent/reports`)

#### `POST /api/agent/reports`
Submits a dispute or report to administration.
- **Request Body:**
  ```json
  {
    "targetType": "STUDENT",
    "targetId": "64f8a12b3c4d5e6f7a8b9c0e",
    "reason": "HARASSMENT",
    "description": "Student was abusive during item inspection",
    "evidence": []
  }
  ```

#### `GET /api/agent/reports`
Lists reports filed by the agent.

---

## 4. WebSocket Real-Time Chat & Notifications

### Connection
- **Namespace / URL:** `ws://localhost:3000` (or `wss://...`)
- **Handshake Authentication:**
  Sends `access_token` (or `jwt`) via handshake cookie, handshake `auth.token`, or `Authorization: Bearer <token>` header.

### Chat Events
| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinChat` | Client -> Server | `{ "chatId": "string" }` | Joins chat room (validates user membership). |
| `leaveChat` | Client -> Server | `{ "chatId": "string" }` | Leaves chat room. |
| `sendMessage` | Client -> Server | `{ "chatId": "string", "content": "string" }` | Sends message. `senderId` and `senderType` are derived securely from socket state. |
| `newMessage` | Server -> Client | Message Object | Broadcasts message to room participants. |
| `typing` | Client -> Server / Server -> Client | `{ "chatId": "string", "userId": "string", "isTyping": boolean }` | Real-time typing indicators. |
| `readMessages` | Client -> Server | `{ "chatId": "string" }` | Marks messages read and emits `messagesRead`. |

### Notification Events
| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `notification` | Server -> Client | Notification Object | Real-time push alert sent directly to the targeted student or agent. |
