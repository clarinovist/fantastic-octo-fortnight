# Lesprivate - API Documentation

Dokumentasi lengkap REST API backend Lesprivate.

**Base URL**: `http://localhost:8080/v1` (development) | `https://api.lesprivate.id/v1` (production)

**Swagger UI**: `http://localhost:8080/swagger/index.html`

---

## Authentication

Semua protected endpoints membutuhkan header:
```
Authorization: Bearer <access_token>
```

---

## Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "metadata": {
    "page": 1,
    "page_size": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "error_code"
}
```

---

## 1. Authentication Endpoints

### Register User
```http
POST /v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student"  // student | tutor
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

---

### Google OAuth Login
```http
POST /v1/auth/google
Content-Type: application/json

{
  "id_token": "google_id_token",
  "role": "student"  // required for new users
}
```

---

### Refresh Token
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Verify Email
```http
POST /v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

---

### Forgot Password
```http
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

### Reset Password
```http
POST /v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

---

### Check User
```http
POST /v1/auth/check-user
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

## 2. Profile Endpoints

### Get Current User Profile
```http
GET /v1/me
Authorization: Bearer <token>
```

---

### Update Profile
```http
PUT /v1/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+6281234567890",
  "bio": "Experienced tutor",
  "avatar_url": "https://..."
}
```

---

### Update Profile Location
```http
PUT /v1/profile/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "address": "Jakarta, Indonesia"
}
```

---

## 3. Course Endpoints

### List Courses (Public)
```http
GET /v1/courses
Authorization: Bearer <token>

Query Parameters:
- page (int): Page number, default 1
- pageSize (int): Items per page, default 10
- category_id (uuid): Filter by category
- sub_category_id (uuid): Filter by sub category
- location_id (uuid): Filter by location
- search (string): Search keyword
- sort (string): Sort field
- sortDirection (string): asc | desc
```

---

### Get Course Detail
```http
GET /v1/courses/{id}
Authorization: Bearer <token>
```

---

### Get Related Courses
```http
GET /v1/courses/{id}/related
Authorization: Bearer <token>
```

---

### Get Course Booking Info
```http
GET /v1/courses/{id}/booking
Authorization: Bearer <token>
```

---

## 4. Tutor Course Endpoints

### Create Course (Tutor)
```http
POST /v1/tutors/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Matematika Dasar",
  "description": "Kursus matematika untuk pemula",
  "category_id": "uuid",
  "sub_category_id": "uuid",
  "price": 150000,
  "duration": 60,
  "location_id": "uuid"
}
```

---

### List My Courses (Tutor)
```http
GET /v1/tutors/courses
Authorization: Bearer <token>

Query Parameters:
- status (string): Filter by status
- page, pageSize, sort, sortDirection
```

---

### Get My Course Detail (Tutor)
```http
GET /v1/tutors/courses/{id}
Authorization: Bearer <token>
```

---

### Update Course (Tutor)
```http
PUT /v1/tutors/courses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Matematika Lanjutan",
  "description": "Updated description",
  "price": 200000
}
```

---

### Delete Course (Tutor)
```http
DELETE /v1/tutors/courses/{id}
Authorization: Bearer <token>
```

---

### Submit Course for Review
```http
POST /v1/tutors/courses/{id}/submit
Authorization: Bearer <token>
```

---

### Publish Course
```http
PUT /v1/tutors/courses/{id}/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_active": true
}
```

---

## 5. Tutor Document Endpoints

### List Documents
```http
GET /v1/tutors/documents
Authorization: Bearer <token>
```

---

### Upload Document
```http
POST /v1/tutors/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ijazah S1",
  "type": "certificate",
  "file_url": "https://..."
}
```

---

### Delete Document
```http
DELETE /v1/tutors/documents/{id}
Authorization: Bearer <token>
```

---

## 6. Student Booking Endpoints

### Create Booking
```http
POST /v1/students/booking
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "uuid",
  "booking_date": "2026-01-20",
  "booking_time": "10:00",
  "timezone": "Asia/Jakarta"
}
```

---

### List My Bookings (Student)
```http
GET /v1/students/booking
Authorization: Bearer <token>

Query Parameters:
- page, pageSize, sort, sortDirection
```

---

### Get Booking Detail
```http
GET /v1/students/booking/{id}
Authorization: Bearer <token>
```

---

### Report Booking Issue
```http
POST /v1/students/booking/{id}/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Tutor tidak hadir",
  "description": "Detail masalah..."
}
```

---

## 7. Tutor Booking Endpoints

### List Bookings (Tutor)
```http
GET /v1/tutors/booking
Authorization: Bearer <token>
```

---

### Get Booking Detail (Tutor)
```http
GET /v1/tutors/booking/{id}
Authorization: Bearer <token>
```

---

### Approve Booking
```http
PUT /v1/tutors/booking/{id}/approve
Authorization: Bearer <token>
```

---

### Decline Booking
```http
PUT /v1/tutors/booking/{id}/decline
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Jadwal bentrok"
}
```

---

## 8. Review Endpoints

### List Student Reviews
```http
GET /v1/students/reviews
Authorization: Bearer <token>
```

---

### Update Student Review
```http
PUT /v1/students/reviews/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Tutor sangat membantu!"
}
```

---

### List Tutor Reviews
```http
GET /v1/tutors/reviews
Authorization: Bearer <token>
```

---

### Update Tutor Review (Response)
```http
PUT /v1/tutors/reviews/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Terima kasih atas review-nya!"
}
```

---

## 9. Subscription Endpoints

### Get Subscription Prices
```http
GET /v1/students/subscriptions/prices
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Monthly",
      "price": 99000,
      "duration_days": 30
    },
    {
      "id": "uuid",
      "name": "Yearly",
      "price": 999000,
      "duration_days": 365
    }
  ]
}
```

---

### Get My Subscription
```http
GET /v1/students/subscriptions
Authorization: Bearer <token>
```

---

### Create Subscription
```http
POST /v1/students/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "price_id": "uuid"
}
```

---

### Cancel Subscription
```http
POST /v1/students/subscriptions/{id}/cancel
Authorization: Bearer <token>
```

---

### Create Invoice
```http
POST /v1/students/subscriptions/{id}/invoice
Authorization: Bearer <token>
```

---

## 10. Notification Endpoints

### List Notifications
```http
GET /v1/notifications
Authorization: Bearer <token>
```

---

### Mark as Read
```http
PUT /v1/notifications/{id}/read
Authorization: Bearer <token>
```

---

### Dismiss Notification
```http
PUT /v1/notifications/{id}/dismiss
Authorization: Bearer <token>
```

---

### Delete Notification
```http
DELETE /v1/notifications/{id}
Authorization: Bearer <token>
```

---

## 11. Lookup Endpoints

### Get Locations
```http
GET /v1/locations
```

---

### Get Course Categories
```http
GET /v1/course-categories
```

---

### Get Trending Categories
```http
GET /v1/course-categories/trending
```

---

### Get Sub Categories
```http
GET /v1/course-categories/{categoryId}/sub
```

---

### Get Lookups
```http
GET /v1/lookups
```

---

## 12. File Upload

### Upload File
```http
POST /v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "data": {
    "url": "https://storage.lesprivate.id/uploads/..."
  }
}
```

---

## 13. Webhook Endpoints

### Xendit Payment Webhook
```http
POST /v1/webhook/xendit
Content-Type: application/json

{
  "external_id": "subscription_uuid",
  "status": "PAID",
  "amount": 99000
}
```

---

## 14. Admin Endpoints

> Semua endpoint admin membutuhkan role `admin`

### Dashboard Statistics
```http
GET /v1/admin/dashboard/statistic-user
GET /v1/admin/dashboard/statistic-subscription
GET /v1/admin/dashboard/statistic-tutor
GET /v1/admin/dashboard/statistic-student
GET /v1/admin/dashboard/statistic-category
GET /v1/admin/dashboard/statistic-course
GET /v1/admin/dashboard/statistic-tutor-view
GET /v1/admin/dashboard/statistic-category-view
Authorization: Bearer <admin_token>
```

---

### Course Management (Admin)
```http
GET    /v1/admin/courses              # List all courses
POST   /v1/admin/courses              # Create course
GET    /v1/admin/courses/{id}         # Get course detail
PUT    /v1/admin/courses/{id}         # Update course
DELETE /v1/admin/courses/{id}         # Delete course
POST   /v1/admin/courses/{id}/approve # Approve course
POST   /v1/admin/courses/{id}/reject  # Reject course
Authorization: Bearer <admin_token>
```

---

### Student Management (Admin)
```http
GET    /v1/admin/students                  # List students
GET    /v1/admin/students/{id}             # Get student detail
POST   /v1/admin/students                  # Create student
PUT    /v1/admin/students/{id}             # Update student
DELETE /v1/admin/students                  # Delete student
POST   /v1/admin/students/{id}/change-role # Change role to tutor
Authorization: Bearer <admin_token>
```

---

### Tutor Management (Admin)
```http
GET    /v1/admin/tutors                               # List tutors
GET    /v1/admin/tutors/{id}                          # Get tutor detail
POST   /v1/admin/tutors                               # Create tutor
PUT    /v1/admin/tutors/{id}                          # Update tutor
DELETE /v1/admin/tutors                               # Delete tutor
POST   /v1/admin/tutors/{id}/change-role              # Change role to student
GET    /v1/admin/tutors/{tutorId}/documents           # Get tutor documents
POST   /v1/admin/tutors/{tutorId}/documents           # Create document
PUT    /v1/admin/tutors/{tutorId}/documents/{id}/{status} # Update doc status
GET    /v1/admin/tutors/{tutorId}/courses             # Get tutor courses
Authorization: Bearer <admin_token>
```

---

### Review Management (Admin)
```http
PUT    /v1/admin/student-reviews/{id}  # Update student review
DELETE /v1/admin/student-reviews/{id}  # Delete student review
PUT    /v1/admin/tutor-reviews/{id}    # Update tutor review
DELETE /v1/admin/tutor-reviews/{id}    # Delete tutor review
Authorization: Bearer <admin_token>
```

---

### Booking Management (Admin)
```http
GET  /v1/admin/bookings                         # List all bookings
GET  /v1/admin/bookings/{id}                    # Get booking detail
POST /v1/admin/bookings/{id}/reminder-student   # Send reminder to student
POST /v1/admin/bookings/{id}/reminder-tutor     # Send reminder to tutor
Authorization: Bearer <admin_token>
```

---

### Subscription Pricing (Admin)
```http
GET /v1/admin/subscription-prices      # List prices
PUT /v1/admin/subscription-prices/{id} # Update price
Authorization: Bearer <admin_token>
```

---

### Send Notification (Admin)
```http
POST /v1/admin/notifications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated endpoints
