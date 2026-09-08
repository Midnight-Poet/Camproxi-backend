# Camproxi API Documentation — Student Portal Endpoints

This document provides a comprehensive and detailed reference for all **Student Portal** endpoints in the Camproxi Unified Backend API.

---

## 1. Global Conventions & Authentication

### Base URL
```
http://localhost:3000 (Development)
https://<production-domain> (Production)
```

### Authentication Mechanisms
1. **HTTP-only Cookie:**
   Stored in cookie: `access_token`
2. **Authorization Header (Fallback / Mobile clients):**
   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```

All authenticated requests inject the student user payload into `req.user`:
```typescript
{
  sub: string;       // Student User ID
  email: string;     // Student Email
  schoolId: string;  // Campus / School ID
  portal: 'STUDENT'; // Role portal identifier
}
```

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "timestamp": "2026-09-07T12:00:00.000Z",
  "path": "/api/student/...",
  "message": "Error details or validation message",
  "errorType": "Bad Request"
}
```

---

## 2. Authentication (`/api/student/auth`)

### `POST /api/student/auth/create`
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

---

### `POST /api/student/auth/login`
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

---

### `POST /api/student/auth/logout`
Clears authentication cookies.
- **Auth Required:** No
- **Response (`200 OK`):**
  ```json
  {
    "message": "Logout successful"
  }
  ```

---

### `GET /api/student/auth/email/:email`
Checks user existence by email.
- **Auth Required:** No
- **Response (`200 OK`):** User object or `null`.

---

### `GET /api/student/auth/username/:username`
Checks user existence by username.
- **Auth Required:** No
- **Response (`200 OK`):** User object or `null`.

---

### `POST /api/student/auth/forgot-password`
Generates and sends a password reset OTP to email.
- **Request Body:** `{ "email": "john@student.edu" }`
- **Response (`200 OK`):** `{ "message": "Password reset OTP sent to your email" }`

---

### `POST /api/student/auth/reset-password`
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

## 3. Profile Management (`/api/student/profile`)

### `GET /api/student/profile/school`
Returns the school and campus details for the authenticated student.
- **Auth Required:** Yes
- **Response (`200 OK`):**
  ```json
  {
    "id": "64f8a12b3c4d5e6f7a8b9c0d",
    "name": "University of Lagos",
    "code": "UNILAG",
    "campus": ["Main Campus", "Idi Araba"]
  }
  ```

---

### `PATCH /api/student/profile/update`
Updates student profile fields and optional profile picture.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data` or `application/json`
- **Fields:**
  - `firstName` (optional string)
  - `lastName` (optional string)
  - `phone` (optional string)
  - `bio` (optional string)
  - `profileImage` (optional file upload)
- **Response (`200 OK`):** Updated user profile object.

---

### `POST /api/student/profile/send-verification`
Dispatches an email verification OTP.
- **Auth Required:** Yes
- **Response (`200 OK`):** `{ "message": "Verification OTP sent to email" }`

---

### `POST /api/student/profile/verify-email`
Validates email verification OTP.
- **Auth Required:** Yes
- **Request Body:** `{ "otp": "123456" }`
- **Response (`200 OK`):** `{ "message": "Email verified successfully" }`

---

### `POST /api/student/profile/send-phone-verification`
Dispatches an SMS verification OTP to the student's registered phone.
- **Auth Required:** Yes
- **Response (`200 OK`):** `{ "message": "Verification OTP sent to phone" }`

---

### `POST /api/student/profile/verify-phone`
Validates SMS verification OTP.
- **Auth Required:** Yes
- **Request Body:** `{ "otp": "123456" }`
- **Response (`200 OK`):** `{ "message": "Phone number verified successfully" }`

---

### `POST /api/student/profile/change-password`
Changes current student password.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```
- **Response (`200 OK`):** `{ "message": "Password changed successfully" }`

---

## 4. User Directory (`/api/student/users`)

### `GET /api/student/users`
Lists verified student accounts (paginated). Sensitive credentials and OTPs are stripped.
- **Auth Required:** Yes
- **Query Params:** `page` (default: 1), `limit` (default: 20)
- **Response (`200 OK`):** Paginated array of user objects.

---

### `GET /api/student/users/me`
Fetches the profile of the currently logged-in student.
- **Auth Required:** Yes
- **Response (`200 OK`):** Detailed user object (excluding passwords and tokens).

---

### `GET /api/student/users/agent/:id`
Retrieves public profile details of an agent by ID.
- **Auth Required:** Yes
- **Response (`200 OK`):** Agent profile object with associated school information.

---

### `GET /api/student/users/:id`
Retrieves public student profile details by user ID.
- **Auth Required:** Yes
- **Response (`200 OK`):** User profile object.

---

## 5. Catalog Items (`/api/student/items`)

All items returned are automatically scoped to the student's school and must be verified (`status: 'verified'`) and available/vacant.

### Products
- **`GET /api/student/items/products`** — Lists verified & available products for student's school.
- **`GET /api/student/items/products/:id`** — Retrieves product details by ID.

### Properties
- **`GET /api/student/items/properties`** — Lists verified & vacant properties for student's school.
- **`GET /api/student/items/properties/:id`** — Retrieves property details by ID.

### Services
- **`GET /api/student/items/services`** — Lists verified & available services for student's school.
- **`GET /api/student/items/services/:id`** — Retrieves service details by ID.

---

## 6. Stores (`/api/student/stores`)

### `GET /api/student/stores`
Lists all vendor stores operating within the student's campus.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of Store objects including agent details.

---

### `GET /api/student/stores/agent/:agentId`
Fetches all stores owned by a specific agent within the student's campus.
- **Auth Required:** Yes
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

---

### `GET /api/student/stores/:id`
Fetches a single store by store ID with its verified products.
- **Auth Required:** Yes
- **Params:** `id` (Store ID)
- **Response (`200 OK`):** Store object.

---

## 7. Service Workers (`/api/student/workers`)

### `GET /api/student/workers`
Lists all verified service workers available for hire in the student's school campus.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of service workers.

---

### `GET /api/student/workers/agent/:agentId`
Fetches all service workers registered under a specific agent within the student's campus.
- **Auth Required:** Yes
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

---

### `GET /api/student/workers/:id`
Retrieves a specific service worker's profile by ID.
- **Auth Required:** Yes
- **Params:** `id` (Worker ID)
- **Response (`200 OK`):** Worker object.

---

## 8. Saved Items / Bookmarks (`/api/student/saved`)

### `POST /api/student/saved`
Saves an item for the authenticated student (idempotent, prevents duplicate records).
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT"
  }
  ```
- **Allowed `itemCategory` values:** `"PRODUCT"`, `"PROPERTY"`, `"SERVICE"`.

---

### `GET /api/student/saved`
Lists all saved items for the student with fully populated item details.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of saved item records.

---

### `GET /api/student/saved/:id`
Retrieves a single saved bookmark record.
- **Auth Required:** Yes
- **Params:** `id` (Saved record ID)

---

### `DELETE /api/student/saved/:id`
Removes a specific saved item from the student's bookmarks.
- **Auth Required:** Yes
- **Params:** `id` (Saved record ID)

---

### `DELETE /api/student/saved`
Clears all saved items for the authenticated student.
- **Auth Required:** Yes
- **Response (`200 OK`):** Deletion count result.

---

## 9. Requests (`/api/student/requests`)

### `POST /api/student/requests`
Submits an inquiry or booking request to an agent for an item. The item must belong to the student's school.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PROPERTY",
    "itemName": "Self-con Hostel Room 4",
    "message": "Hello, is this room still available for inspection tomorrow?"
  }
  ```

---

### `GET /api/student/requests`
Lists all booking and inquiry requests submitted by the student.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of Request records.

---

## 10. Reviews & Ratings (`/api/student/*`)

### `POST /api/student/ratings`
Submits or updates a rating (1-5) for an item.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT",
    "rating": 5
  }
  ```

---

### `DELETE /api/student/ratings/:itemId`
Removes the student's rating for the specified item.
- **Auth Required:** Yes
- **Params:** `itemId` (Item ID)

---

### `POST /api/student/reviews`
Submits a written review comment for an item.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT",
    "comment": "Great product, fast pickup on campus!"
  }
  ```

---

### `DELETE /api/student/reviews/:id`
Deletes a review written by the student.
- **Auth Required:** Yes
- **Params:** `id` (Review ID)

---

### `GET /api/student/reviews/me`
Lists all reviews posted by the authenticated student.
- **Auth Required:** Yes

---

### `GET /api/student/ratings/me`
Lists all ratings given by the authenticated student.
- **Auth Required:** Yes

---

## 11. Search (`/api/student/search`)

### `GET /api/student/search`
Cross-category search across verified products, properties, and services within the student's campus.
- **Auth Required:** Yes
- **Query Params:**
  - `q`: Search keyword (matched against name and description)
  - `category`: `"ALL"` | `"PRODUCT"` | `"PROPERTY"` | `"SERVICE"` (default: `"ALL"`)
  - `minPrice`: Minimum price filter (numeric)
  - `maxPrice`: Maximum price filter (numeric)
  - `sortBy`: `"price_asc"` | `"price_desc"` | `"rating_desc"`
- **Response (`200 OK`):** Array of items with `type` property attached.

---

## 12. Notifications (`/api/student/notifications`)

### `GET /api/student/notifications`
Retrieves all in-app notifications for the student.
- **Auth Required:** Yes

---

### `PATCH /api/student/notifications/:id/read`
Marks a specific notification as read.
- **Auth Required:** Yes
- **Params:** `id` (Notification ID)

---

### `PATCH /api/student/notifications/read-all`
Marks all notifications as read.
- **Auth Required:** Yes

---

### `GET /api/student/notifications/settings`
Retrieves notification preferences.
- **Auth Required:** Yes

---

### `PATCH /api/student/notifications/settings`
Updates notification preferences.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "emailNotifications": true,
    "pushNotifications": true,
    "inAppNotifications": true
  }
  ```

---

### `POST /api/student/notifications/push-token`
Registers an Expo/FCM push token for mobile push alerts.
- **Auth Required:** Yes
- **Request Body:** `{ "token": "ExponentPushToken[xxxxxxxxxxxxxx]" }`

---

### `DELETE /api/student/notifications/push-token`
Unregisters a push token.
- **Auth Required:** Yes
- **Request Body:** `{ "token": "ExponentPushToken[xxxxxxxxxxxxxx]" }`

---

## 13. Real-Time Chat (`/api/student/chats`)

Chat access is strictly verified: students can only access chats they participate in.

### `GET /api/student/chats`
Lists all chat conversations involving the student.
- **Auth Required:** Yes

---

### `GET /api/student/chats/:chatId`
Retrieves metadata of a specific chat session.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)

---

### `POST /api/student/chats/initiate`
Finds or creates a chat conversation between the student and an agent.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "agentId": "66a1b2c3d4e5f6a7b8c9d000",
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PROPERTY"
  }
  ```

---

### `GET /api/student/chats/:chatId/messages`
Retrieves paginated chat history for the conversation.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)
- **Query Params:** `limit` (default: 50), `skip` (default: 0)

---

### `PATCH /api/student/chats/:chatId/read`
Marks unread messages sent by the agent as read.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)

---

## 14. Reports (`/api/student/reports`)

### `POST /api/student/reports`
Submits an incident or grievance report to platform administration.
- **Auth Required:** Yes
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

---

### `GET /api/student/reports`
Lists reports filed by the authenticated student.
- **Auth Required:** Yes
