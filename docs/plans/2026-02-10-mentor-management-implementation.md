# Mentor Management System — Implementation Plan

**Referensi**: [Design Document](file:///Users/nugroho/Documents/lesprivate/docs/plans/2026-02-10-mentor-management-system-design.md)

---

## Goal

Mengimplementasikan MVP Mentor Management System: aplikasi terpisah (`mentor/`) dengan fitur manajemen murid (via invite link), riwayat booking, sistem saldo (balance), dan penarikan dana (withdrawal). Murid membayar les melalui flow booking Lesprivate yang sudah ada — webhook diperluas untuk mencatat saldo mentor.

## Architecture

```
mentor/ (Next.js 16 — clone dari admin/)
   ↕ API calls
backend/ (Go — Chi Router, GORM)
   ↕ Database
MySQL (5 tabel baru)
```

## Tech Stack
- **Frontend (mentor/)**: Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, SWR
- **Backend**: Go 1.24, Chi Router, GORM, Xendit (existing)
- **Database**: MySQL 8.0

---

## Task Breakdown

### Task 1: Database Models & Migration

**Goal**: Membuat 5 model baru dan auto-migrate.

#### [NEW] `backend/internal/model/mentor_student.go`
```go
type MentorStudent struct {
    ID        uuid.UUID  `gorm:"type:char(36);primaryKey"`
    TutorID   uuid.UUID  `gorm:"type:char(36);not null;uniqueIndex:idx_tutor_student"`
    StudentID uuid.UUID  `gorm:"type:char(36);not null;uniqueIndex:idx_tutor_student"`
    JoinedAt  time.Time  `gorm:"autoCreateTime"`
    Status    string     `gorm:"type:enum('active','inactive');default:'active'"`
    CreatedAt time.Time
    UpdatedAt time.Time

    Tutor   Tutor   `gorm:"foreignKey:TutorID"`
    Student Student `gorm:"foreignKey:StudentID"`
}
```

#### [NEW] `backend/internal/model/mentor_balance.go`
```go
type MentorBalance struct {
    ID        uuid.UUID       `gorm:"type:char(36);primaryKey"`
    TutorID   uuid.UUID       `gorm:"type:char(36);not null;uniqueIndex"`
    Balance   decimal.Decimal `gorm:"type:decimal(15,2);default:0"`
    UpdatedAt time.Time

    Tutor Tutor `gorm:"foreignKey:TutorID"`
}

type BalanceTransactionType string
const (
    BalanceTransactionCredit BalanceTransactionType = "credit"
    BalanceTransactionDebit  BalanceTransactionType = "debit"
)

type BalanceTransaction struct {
    ID            uuid.UUID              `gorm:"type:char(36);primaryKey"`
    TutorID       uuid.UUID              `gorm:"type:char(36);not null;index"`
    Type          BalanceTransactionType  `gorm:"type:enum('credit','debit');not null"`
    Amount        decimal.Decimal         `gorm:"type:decimal(15,2);not null"`
    Commission    decimal.Decimal         `gorm:"type:decimal(15,2);default:0"`
    ReferenceType string                  `gorm:"type:varchar(50)"`
    ReferenceID   uuid.UUID               `gorm:"type:char(36)"`
    Description   string                  `gorm:"type:varchar(255)"`
    CreatedAt     time.Time
}
```

#### [NEW] `backend/internal/model/withdrawal_request.go`
```go
type WithdrawalStatus string
const (
    WithdrawalStatusPending    WithdrawalStatus = "pending"
    WithdrawalStatusProcessing WithdrawalStatus = "processing"
    WithdrawalStatusCompleted  WithdrawalStatus = "completed"
    WithdrawalStatusRejected   WithdrawalStatus = "rejected"
)

type WithdrawalRequest struct {
    ID            uuid.UUID        `gorm:"type:char(36);primaryKey"`
    TutorID       uuid.UUID        `gorm:"type:char(36);not null;index"`
    Amount        decimal.Decimal  `gorm:"type:decimal(15,2);not null"`
    BankName      string           `gorm:"type:varchar(100)"`
    AccountNumber string           `gorm:"type:varchar(50)"`
    AccountName   string           `gorm:"type:varchar(100)"`
    Status        WithdrawalStatus `gorm:"type:enum('pending','processing','completed','rejected');default:'pending'"`
    AdminNote     string           `gorm:"type:varchar(500)"`
    ProcessedAt   *time.Time
    ProcessedBy   uuid.NullUUID    `gorm:"type:char(36)"`
    CreatedAt     time.Time
    UpdatedAt     time.Time

    Tutor Tutor `gorm:"foreignKey:TutorID"`
}
```

#### [NEW] `backend/internal/model/mentor_invite_code.go`
```go
type MentorInviteCode struct {
    ID        uuid.UUID `gorm:"type:char(36);primaryKey"`
    TutorID   uuid.UUID `gorm:"type:char(36);not null;uniqueIndex"`
    Code      string    `gorm:"type:varchar(50);not null;uniqueIndex"`
    CreatedAt time.Time

    Tutor Tutor `gorm:"foreignKey:TutorID"`
}
```

#### [MODIFY] `backend/cmd/app/main.go`
- Menambahkan 5 model baru ke `db.AutoMigrate()`.

---

### Task 2: Repositories

**Goal**: CRUD repository untuk setiap model baru. Mengikuti pola existing di `backend/internal/repositories/`.

#### [NEW] `backend/internal/repositories/mentor_student.go`
- `Create(ctx, *MentorStudent) error`
- `GetByTutorAndStudent(ctx, tutorID, studentID) (*MentorStudent, error)`
- `ListByTutor(ctx, tutorID, filter) ([]MentorStudent, Metadata, error)`
- `Delete(ctx, id) error`
- `CountByTutor(ctx, tutorID) (int64, error)`

#### [NEW] `backend/internal/repositories/mentor_balance.go`
- `GetOrCreate(ctx, tutorID) (*MentorBalance, error)`
- `UpdateBalance(ctx, tutorID, amount) error` — menggunakan `gorm.Expr("balance + ?", amount)` untuk atomicity
- `CreateTransaction(ctx, *BalanceTransaction) error`
- `ListTransactions(ctx, tutorID, filter) ([]BalanceTransaction, Metadata, error)`

#### [NEW] `backend/internal/repositories/withdrawal.go`
- `Create(ctx, *WithdrawalRequest) error`
- `GetByID(ctx, id) (*WithdrawalRequest, error)`
- `ListByTutor(ctx, tutorID, filter) ([]WithdrawalRequest, Metadata, error)`
- `ListAll(ctx, filter) ([]WithdrawalRequest, Metadata, error)` — untuk admin
- `Update(ctx, *WithdrawalRequest) error`

#### [NEW] `backend/internal/repositories/mentor_invite_code.go`
- `GetOrCreateByTutor(ctx, tutorID) (*MentorInviteCode, error)` — auto-generate kode jika belum ada
- `GetByCode(ctx, code) (*MentorInviteCode, error)`

---

### Task 3: Services

**Goal**: Business logic layer. Mengikuti pola existing di `backend/internal/services/`.

#### [NEW] `backend/internal/services/mentor_student.go`
```go
type MentorStudentService struct {
    mentorStudent *repositories.MentorStudentRepository
    inviteCode    *repositories.MentorInviteCodeRepository
}
```
- `JoinByCode(ctx, code, studentID) error` — validasi kode, cek duplikat, insert relasi
- `ListStudents(ctx, tutorID, filter) ([]MentorStudent, Metadata, error)`
- `RemoveStudent(ctx, tutorID, studentID) error`
- `GetInviteCode(ctx, tutorID) (string, error)`

#### [NEW] `backend/internal/services/mentor_balance.go`
```go
type MentorBalanceService struct {
    balance    *repositories.MentorBalanceRepository
    withdrawal *repositories.WithdrawalRepository
    config     *config.Config   // untuk persentase komisi
}
```
- `CreditFromBooking(ctx, tutorID, bookingAmount, bookingID) error` — hitung komisi, update saldo, catat transaksi
- `GetBalance(ctx, tutorID) (*MentorBalance, error)`
- `ListTransactions(ctx, tutorID, filter) ([]BalanceTransaction, Metadata, error)`
- `RequestWithdrawal(ctx, tutorID, amount, bankInfo) error` — validasi saldo cukup, buat request
- `ListWithdrawals(ctx, tutorID, filter) ([]WithdrawalRequest, Metadata, error)`

#### [NEW] `backend/internal/services/mentor_balance_admin.go`
- `ListAllWithdrawals(ctx, filter) ([]WithdrawalRequest, Metadata, error)`
- `ApproveWithdrawal(ctx, withdrawalID, adminID) error` — update status, debit saldo, catat transaksi
- `RejectWithdrawal(ctx, withdrawalID, adminID, note) error`

#### [MODIFY] `backend/internal/services/webhook.go`
- Di `handleWebhookXenditPaymentSessionCompleted()`, **setelah** update payment & student, tambahkan:
```go
// Credit mentor balance from booking payment
go func() {
    if err := s.mentorBalance.CreditFromBooking(
        context.Background(),
        payment.TutorID,  // perlu cek field yang sesuai
        payment.Amount,
        payment.ID,
    ); err != nil {
        logger.ErrorCtx(...).Err(err).Msg("failed to credit mentor balance")
    }
}()
```

---

### Task 4: API Handlers & Routes

**Goal**: Handler layer dan registrasi route. Mengikuti pola di `backend/internal/handlers/v1/`.

#### [NEW] `backend/internal/handlers/v1/mentor_student.go`
- `ListMentorStudents` — GET `/v1/mentor/students`
- `GetMentorStudent` — GET `/v1/mentor/students/:id`
- `RemoveMentorStudent` — DELETE `/v1/mentor/students/:id`
- `GetMentorInviteCode` — GET `/v1/mentor/invite-code`

#### [NEW] `backend/internal/handlers/v1/mentor_balance.go`
- `GetMentorDashboard` — GET `/v1/mentor/dashboard`
- `GetMentorBalance` — GET `/v1/mentor/balance`
- `ListMentorTransactions` — GET `/v1/mentor/balance/transactions`
- `RequestWithdrawal` — POST `/v1/mentor/withdrawals`
- `ListMentorWithdrawals` — GET `/v1/mentor/withdrawals`

#### [NEW] `backend/internal/handlers/v1/mentor_booking.go`
- `ListMentorBookings` — GET `/v1/mentor/bookings`
- `GetMentorBooking` — GET `/v1/mentor/bookings/:id`

#### [NEW] `backend/internal/handlers/v1/admin/withdrawal.go`
- `ListWithdrawals` — GET `/v1/admin/withdrawals`
- `ApproveWithdrawal` — PUT `/v1/admin/withdrawals/:id/approve`
- `RejectWithdrawal` — PUT `/v1/admin/withdrawals/:id/reject`

#### [NEW] `backend/internal/handlers/v1/invite.go`
- `JoinByInviteCode` — POST `/v1/join/:code`

#### [NEW] `backend/internal/model/dto/mentor.go`
- DTOs: `MentorStudentResponse`, `MentorBalanceResponse`, `BalanceTransactionResponse`, `WithdrawalResponse`, `MentorDashboardResponse`, `RequestWithdrawalRequest`

#### [MODIFY] `backend/internal/handlers/v1/api.go`
- Tambah fields: `mentorStudent`, `mentorBalance`
- Tambah route group di `Router()`:
```go
r.Route("/mentor", func(r chi.Router) {
    r.Use(middleware.JWTAuth(a.jwt))
    // TODO: tambah middleware role check untuk tutor

    r.Get("/dashboard", a.GetMentorDashboard)
    r.Get("/invite-code", a.GetMentorInviteCode)

    r.Route("/students", func(r chi.Router) {
        r.Get("/", a.ListMentorStudents)
        r.Get("/{id}", a.GetMentorStudent)
        r.Delete("/{id}", a.RemoveMentorStudent)
    })

    r.Route("/bookings", func(r chi.Router) {
        r.Get("/", a.ListMentorBookings)
        r.Get("/{id}", a.GetMentorBooking)
    })

    r.Get("/balance", a.GetMentorBalance)
    r.Get("/balance/transactions", a.ListMentorTransactions)

    r.Route("/withdrawals", func(r chi.Router) {
        r.Post("/", a.RequestWithdrawal)
        r.Get("/", a.ListMentorWithdrawals)
    })
})

// Public invite route (no auth required)
r.Post("/join/{code}", a.JoinByInviteCode)
```

#### [MODIFY] `backend/internal/handlers/v1/admin/api.go`
- Tambah route withdrawal management di admin group

#### [MODIFY] `backend/cmd/app/main.go`
- Wire semua repository, service, handler baru ke DI chain

---

### Task 5: Mentor Frontend App (`mentor/`)

**Goal**: Setup project Next.js baru berdasarkan `admin/` boilerplate.

#### [NEW] `mentor/` — project directory
- Clone struktur dari `admin/`:
  - `package.json` (rename ke `les-private-mentor`)
  - `next.config.ts` (standalone output)
  - `Dockerfile` (port 3002)
  - `proxy.ts` (middleware auth)
  - `tsconfig.json`
  - `postcss.config.mjs`
  - `eslint.config.mjs`
  - `components.json`
  - `.env` (NEXT_BASE_API_URL)
  - `.gitignore`

#### [NEW] `mentor/services/base.ts`
- Clone dari `admin/services/base.ts`

#### [NEW] `mentor/utils/` — shared utilities
- `constants/cookies.ts` — TOKEN_KEY
- `types.ts` — BaseResponse, Metadata

#### [NEW] `mentor/components/ui/` — shadcn/ui components
- Copy yang diperlukan dari `admin/components/ui/`

---

### Task 6: Mentor Dashboard Pages

**Goal**: Implementasi semua halaman UI di mentor app.

#### [NEW] `mentor/services/mentor.ts`
```typescript
// API service functions
export async function getDashboard(): Promise<BaseResponse<DashboardData>>
export async function getStudents(page, pageSize): Promise<BaseResponse<Student[]>>
export async function getInviteCode(): Promise<BaseResponse<InviteCode>>
export async function getBalance(): Promise<BaseResponse<BalanceData>>
export async function getTransactions(page, pageSize): Promise<BaseResponse<Transaction[]>>
export async function getBookings(page, pageSize): Promise<BaseResponse<Booking[]>>
export async function requestWithdrawal(data): Promise<BaseResponse<void>>
export async function getWithdrawals(page, pageSize): Promise<BaseResponse<Withdrawal[]>>
export async function removeStudent(id): Promise<BaseResponse<void>>
```

#### [NEW] Pages:
| File | Deskripsi |
|------|-----------|
| `mentor/app/(dashboard)/dashboard/page.tsx` | Overview: saldo, jumlah murid, booking terbaru |
| `mentor/app/(dashboard)/students/page.tsx` | List murid + invite link + copy button |
| `mentor/app/(dashboard)/bookings/page.tsx` | Riwayat booking dari murid |
| `mentor/app/(dashboard)/wallet/page.tsx` | Saldo, transaksi, form withdraw |
| `mentor/app/(dashboard)/settings/page.tsx` | Profil, rekening bank |
| `mentor/app/login/page.tsx` | Login page (tutor only) |
| `mentor/app/layout.tsx` | Root layout |
| `mentor/app/(dashboard)/layout.tsx` | Dashboard layout dengan sidebar |

#### [NEW] `mentor/components/sidebar.tsx`
- Sidebar navigation: Dashboard, Murid Saya, Booking, Wallet, Settings

---

### Task 7: Invite Link Integration di Frontend

**Goal**: Modifikasi `frontend/` agar support invite code dari mentor.

#### [MODIFY] `frontend/` — Invite flow
- Buat halaman `/join/[code]` yang validasi invite code dan redirect ke register/login
- Simpan `mentor_code` di cookie saat user buka invite link
- Setelah register/login, panggil `POST /v1/join/:code` untuk establish relasi

---

### Task 8: Admin Withdrawal Management

**Goal**: Tambah halaman withdrawal management di `admin/`.

#### [NEW] `admin/app/(dashboard)/withdrawals/page.tsx`
- List semua withdrawal requests
- Tombol Approve / Reject per request

#### [NEW] `admin/services/withdrawal.ts`
- `getWithdrawals(filter)`, `approveWithdrawal(id)`, `rejectWithdrawal(id, note)`

---

### Task 9: Docker & Deployment Config

**Goal**: Tambahkan `mentor/` ke Docker Compose dan Nginx.

#### [NEW] `mentor/Dockerfile`
- Clone dari `admin/Dockerfile`, ubah EXPOSE ke 3002

#### [MODIFY] `docker-compose.yml`
- Tambah service `mentor` yang build dari `mentor/`

#### [MODIFY] Nginx config (production)
- Tambah server block untuk `mentor.lesprivate.id` → proxy ke `mentor:3002`

---

## Verification Plan

### Manual Verification

#### 1. Backend API Testing
```bash
# Jalankan backend dulu
cd backend && go run cmd/app/main.go

# Test invite code generation (perlu token tutor)
curl -H "Authorization: Bearer <TUTOR_TOKEN>" \
  http://localhost:8080/v1/mentor/invite-code

# Test join by invite code (perlu token student)
curl -X POST -H "Authorization: Bearer <STUDENT_TOKEN>" \
  http://localhost:8080/v1/join/<CODE>

# Test list students
curl -H "Authorization: Bearer <TUTOR_TOKEN>" \
  http://localhost:8080/v1/mentor/students

# Test balance
curl -H "Authorization: Bearer <TUTOR_TOKEN>" \
  http://localhost:8080/v1/mentor/balance

# Test request withdrawal
curl -X POST -H "Authorization: Bearer <TUTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "bank_name": "BCA", "account_number": "1234567890", "account_name": "Test"}' \
  http://localhost:8080/v1/mentor/withdrawals
```

#### 2. Frontend Verification
```bash
# Jalankan mentor app
cd mentor && npm run dev

# Buka http://localhost:3002/login — login sebagai tutor
# Cek halaman dashboard, students, bookings, wallet, settings
```

#### 3. Build Verification
```bash
# Backend build check
cd backend && go build ./...

# Mentor app lint + build check
cd mentor && npm run lint && npm run build

# Admin app lint + build (karena ada halaman withdrawal baru)
cd admin && npm run lint && npm run build
```

### User Manual Verification
- Kakak bisa test dari live dev environment:
  1. Login sebagai tutor di mentor dashboard
  2. Copy invite link dan share ke akun student test
  3. Login sebagai student, buka invite link, pastikan relasi terbentuk
  4. Buat booking dari student, bayar, cek saldo mentor bertambah
  5. Request withdrawal, approve dari admin dashboard
