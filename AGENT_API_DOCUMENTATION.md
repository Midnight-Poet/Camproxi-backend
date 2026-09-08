# Camproxi API Documentation — Agent Portal Endpoints

This document provides a comprehensive and detailed reference for all **Agent Portal** endpoints in the Camproxi Unified Backend API.

---

## 1. Global Conventions & Authentication

### Base URL
```
http://localhost:3000 (Development)
https://<production-domain> (Production)
```

### Authentication Mechanisms
1. **HTTP-only Cookie:**
   Stored in cookie: `jwt` or `access_token`
2. **Authorization Header (Fallback / Mobile clients):**
   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```

All authenticated agent requests inject the agent payload into `req.agent`:
```typescript
{
  id: string;          // Agent ID
  email: string;       // Agent Email
  role: Role;          // 'AGENT' | 'VENDOR' | 'SERVICE_PROVIDER'
  schoolId: string;    // School / Institution ID
  campusName: string;  // Primary campus name
  portal: 'AGENT';     // Role portal identifier
}
```

### Role-Based Access Control
Certain routes use `@Roles(Role)` and `RolesGuard`:
- `AGENT`: Real estate and housing agents (manages properties).
- `VENDOR`: Product sellers and merchants (manages products and stores).
- `SERVICE_PROVIDER`: Service providers, technicians, artisans (manages services).

---

## 2. Authentication & Profile (`/api/agent`)

### `POST /api/agent/register`
Registers a new agent account and sets the authentication cookie.
- **Auth Required:** No
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
- **Allowed `category` values:** `"AGENT"`, `"VENDOR"`, `"SERVICE_PROVIDER"`.
- **Response (`201 Created`):** Agent profile object (excluding password) and auth cookie.

---

### `POST /api/agent/login`
Authenticates an agent and sets auth cookie.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "jane@agent.com",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login successful",
    "agent": {
      "id": "64f8a12b3c4d5e6f7a8b9c0e",
      "email": "jane@agent.com",
      "companyName": "Jane Real Estate",
      "category": "AGENT"
    }
  }
  ```

---

### `POST /api/agent/logout`
Logs out the agent and clears authentication cookies.
- **Auth Required:** No
- **Response (`200 OK`):** `{ "message": "Logged out successfully" }`

---

### `GET /api/agent/me` or `GET /api/agent/profile`
Retrieves the profile of the authenticated agent.
- **Auth Required:** Yes
- **Response (`200 OK`):** Full agent profile object (password hash, verification OTPs, and expiry dates are omitted).

---

### `GET /api/agent/school`
Returns the school and campus metadata assigned to the agent.
- **Auth Required:** Yes

---

### `GET /api/agent/student/:id`
Retrieves public information of a student client communicating with the agent.
- **Auth Required:** Yes
- **Params:** `id` (Student User ID)

---

### `PATCH /api/agent/profile/update`
Updates agent bio, contact, company name, and optional profile image.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data` or `application/json`
- **Fields:**
  - `firstName` (optional string)
  - `lastName` (optional string)
  - `companyName` (optional string)
  - `phone` (optional string)
  - `whatsapp` (optional string)
  - `address` (optional string)
  - `bio` (optional string)
  - `profileImage` (optional file upload)
- **Response (`200 OK`):** Updated agent profile object.

---

### `POST /api/agent/send-verification` & `POST /api/agent/verify-email`
Sends and verifies an email OTP.
- **Auth Required:** Yes
- **Verify Request Body:** `{ "otp": "123456" }`

---

### `POST /api/agent/send-phone-verification` & `POST /api/agent/verify-phone`
Sends and verifies an SMS OTP to the agent's phone.
- **Auth Required:** Yes
- **Verify Request Body:** `{ "otp": "123456" }`

---

### `POST /api/agent/change-password`
Changes current agent password.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```

---

### `POST /api/agent/forgot-password` & `POST /api/agent/reset-password`
Initiates password reset via email OTP and sets new password.
- **Forgot Request Body:** `{ "email": "jane@agent.com" }`
- **Reset Request Body:** `{ "email": "...", "otp": "...", "newPassword": "..." }`

---

### `DELETE /api/agent/profile`
Permanently deletes the agent account and clears authentication cookies.
- **Auth Required:** Yes

---

## 3. Properties (`/api/agent/properties`)
*Protected by `AgentAuthGuard` and `@Roles(Role.AGENT)`*

### `POST /api/agent/properties`
Creates a new property listing with up to 10 images.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: Property title (string)
  - `description`: Detailed description (string)
  - `price`: Rent / lease price (number)
  - `type`: E.g. `"SELF_CONTAINED"`, `"SINGLE_ROOM"`, `"FLAT"`
  - `location`: Address / directions (string)
  - `amenities`: Array or JSON string of amenities
  - `images`: Image file uploads (up to 10)
- **Response (`201 Created`):** Created property record.

---

### `GET /api/agent/properties`
Lists all properties owned by the authenticated agent.
- **Response (`200 OK`):** Array of Property records.

---

### `GET /api/agent/properties/:id`
Fetches a single property owned by the agent.
- **Params:** `id` (Property ID)

---

### `PATCH /api/agent/properties/:id`
Updates property information and adds new images.
- **Content-Type:** `multipart/form-data`
- **Fields:** Any updatable property field, plus `newImages` file array.

---

### `DELETE /api/agent/properties/:id`
Deletes a property listing and deletes stored images on Cloudinary.
- **Params:** `id` (Property ID)

---

### `GET /api/agent/properties/fetch/students/:schoolId`
- **Auth Required:** `StudentAuthGuard`
- Allows authenticated students to fetch verified properties within the specified school.

---

## 4. Products (`/api/agent/products`)
*Protected by `AgentAuthGuard` and `@Roles(Role.VENDOR)`*

### `POST /api/agent/products`
Creates a new product listing with up to 10 images.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: Product title (string)
  - `description`: Product details (string)
  - `price`: Unit price (number)
  - `category`: Category string
  - `condition`: `"NEW"` | `"USED"`
  - `images`: Image files (up to 10)
- **Response (`201 Created`):** Created product record.

---

### `GET /api/agent/products`
Lists all products owned by the vendor.
- **Response (`200 OK`):** Array of Product records.

---

### `GET /api/agent/products/:id`
Fetches a single product owned by the vendor.
- **Params:** `id` (Product ID)

---

### `PATCH /api/agent/products/:id`
Updates product details and adds new images.
- **Content-Type:** `multipart/form-data`
- **Fields:** Any updatable product field, plus `newImages` file array.

---

### `DELETE /api/agent/products/:id`
Deletes a product listing.
- **Params:** `id` (Product ID)

---

### `GET /api/agent/products/fetch/students`
- **Auth Required:** `StudentAuthGuard`
- Allows authenticated students to fetch verified products for their campus.

---

## 5. Services (`/api/agent/services`)
*Protected by `AgentAuthGuard` and `@Roles(Role.SERVICE_PROVIDER)`*

### `POST /api/agent/services`
Creates a new service listing with up to 10 images.
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: Service title (string)
  - `description`: Detailed service description (string)
  - `price`: Starting / flat price (number)
  - `availableDays`: Array or JSON string of available days
  - `time`: Available time window string
  - `images`: Service images (files)

---

### `GET /api/agent/services`
Lists all services owned by the service provider.
- **Response (`200 OK`):** Array of Service records.

---

### `GET /api/agent/services/:id`
Fetches a single service owned by the provider.
- **Params:** `id` (Service ID)

---

### `PATCH /api/agent/services/:id`
Updates service details and adds new images.
- **Content-Type:** `multipart/form-data`
- **Fields:** Service fields, plus `newImages` file array.

---

### `DELETE /api/agent/services/:id`
Deletes a service listing.
- **Params:** `id` (Service ID)

---

### `GET /api/agent/services/fetch/students/:schoolId`
- **Auth Required:** `StudentAuthGuard`
- Allows authenticated students to fetch verified services within their school campus.

---

## 6. Stores (`/api/agent/store`)

### `GET /api/agent/store`
Lists all stores created by the authenticated vendor agent.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of Store records.

---

### `GET /api/agent/store/:id`
Fetches details of a specific store owned by the agent.
- **Auth Required:** Yes
- **Params:** `id` (Store ID)

---

### `POST /api/agent/store`
Creates a new store profile and uploads a banner image.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`: Store name (string)
  - `description`: Store bio/description (string)
  - `address`: Physical pickup address (string)
  - `bannerImage`: Banner image file upload (optional)
  - `location`: `{ "latitude": ..., "longitude": ... }`
  - `operatingHours`: Schedule metadata
- **Response (`201 Created`):** Created Store record.

---

### `PATCH /api/agent/store/:id`
Updates store details and banner image.
- **Auth Required:** Yes
- **Params:** `id` (Store ID)

---

### `DELETE /api/agent/store/:id`
Deletes a store record.
- **Auth Required:** Yes
- **Params:** `id` (Store ID)

---

## 7. Service Workers (`/api/agent/workers`)

### `GET /api/agent/workers`
Lists all technicians and service staff registered by the agent.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of ServiceWorker records.

---

### `GET /api/agent/workers/:id`
Fetches details of a specific service worker.
- **Auth Required:** Yes
- **Params:** `id` (Worker ID)

---

### `POST /api/agent/workers`
Registers a new worker under the agent's account.
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `firstName`: Worker's first name (string)
  - `lastName`: Worker's last name (string)
  - `role`: Specialty or trade, e.g. "Plumber" (string)
  - `phone`: Contact phone number (string)
  - `profileImage`: Profile picture file (optional)

---

### `PATCH /api/agent/workers/:id`
Updates worker role, phone number, or profile picture.
- **Auth Required:** Yes
- **Params:** `id` (Worker ID)

---

### `DELETE /api/agent/workers/:id`
Removes a service worker.
- **Auth Required:** Yes
- **Params:** `id` (Worker ID)

---

## 8. Requests & Booking Inquiries (`/api/agent/requests`)

### `GET /api/agent/requests`
Retrieves all customer requests submitted for the agent's items.
- **Auth Required:** Yes
- **Response (`200 OK`):** Array of Request records.

---

### `PATCH /api/agent/requests/:id/respond`
Approves or rejects a student booking request.
- **Auth Required:** Yes
- **Params:** `id` (Request ID)
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "responseMessage": "Inspection confirmed for 2 PM tomorrow."
  }
  ```
- **Allowed `status` values:** `"APPROVED"`, `"REJECTED"`.

---

## 9. Reviews & Feedback (`/api/agent/reviews`)

### `GET /api/agent/reviews/item/:itemId`
Fetches customer reviews for an item owned by the agent.
- **Auth Required:** Yes
- **Params:** `itemId` (Item ID)

---

### `GET /api/agent/reviews/item/:itemId/ratings`
Fetches aggregated rating metrics for an item.
- **Auth Required:** Yes
- **Params:** `itemId` (Item ID)

---

### `POST /api/agent/reviews/:id/reply`
Replies to a student's review on an item owned by the agent.
- **Auth Required:** Yes
- **Params:** `id` (Review ID)
- **Request Body:**
  ```json
  {
    "agentReply": "Thank you for doing business with us!"
  }
  ```

---

## 10. Metrics & Dashboard Analytics (`/api/agent/metrics`)

### `GET /api/agent/metrics`
Calculates real-time dashboard metrics using database aggregation queries.
- **Auth Required:** Yes
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

## 11. Notifications (`/api/agent/notifications`)

### `GET /api/agent/notifications`
Lists all notifications for the agent.
- **Auth Required:** Yes

---

### `PATCH /api/agent/notifications/:id/read`
Marks a notification as read.
- **Auth Required:** Yes
- **Params:** `id` (Notification ID)

---

### `PATCH /api/agent/notifications/read-all`
Marks all notifications as read.
- **Auth Required:** Yes

---

## 12. Real-Time Chat (`/api/agent/chats`)

Chat access verifies that the authenticated agent is a participant in the conversation.

### `GET /api/agent/chats`
Lists all conversations involving the agent.
- **Auth Required:** Yes

---

### `GET /api/agent/chats/:chatId`
Fetches conversation details.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)

---

### `POST /api/agent/chats/initiate`
Initiates or resumes a chat with a student.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "studentId": "64f8a12b3c4d5e6f7a8b9c0e",
    "itemId": "66a1b2c3d4e5f6a7b8c9d999",
    "itemCategory": "PRODUCT"
  }
  ```

---

### `GET /api/agent/chats/:chatId/messages`
Retrieves chat message history.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)
- **Query Params:** `limit` (default: 50), `skip` (default: 0)

---

### `PATCH /api/agent/chats/:chatId/read`
Marks unread student messages as read.
- **Auth Required:** Yes
- **Params:** `chatId` (Chat ID)

---

## 13. Reports (`/api/agent/reports`)

### `POST /api/agent/reports`
Submits a dispute or grievance report against a user to platform administration.
- **Auth Required:** Yes
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

---

### `GET /api/agent/reports`
Lists reports filed by the agent.
- **Auth Required:** Yes
