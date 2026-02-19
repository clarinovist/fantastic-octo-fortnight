# Mentor Management System — Design Document

**Tanggal**: 10 Februari 2026
**Status**: Draft — Menunggu Review

---

## 1. Ringkasan

Membangun **Sistem Manajemen Murid** sebagai aplikasi terpisah (`mentor/`) yang memungkinkan mentor mengelola murid dan melacak pendapatan. Murid tetap membayar les melalui **flow booking Lesprivate yang sudah ada**. Lesprivate mengambil komisi 5-10% dari setiap transaksi dan sisanya masuk ke saldo mentor yang bisa di-redeem.

### Tujuan Bisnis
- Revenue stream baru melalui komisi transaksi mentor-murid.
- Menjadikan Lesprivate sebagai **tools wajib** bagi mentor freelance.
- Funnel akuisisi user baru melalui invite link mentor.

---

## 2. Arsitektur

### Aplikasi Terpisah
| Aspek | Detail |
|-------|--------|
| **Folder** | `/mentor` |
| **Domain** | `mentor.lesprivate.my.id` |
| **Tech Stack** | Next.js (clone dari `admin/`) |
| **Port** | TBD (dev), TBD (prod) |
| **Boilerplate** | Clone `admin/` — auth, proxy, layout |

### Diagram Arsitektur
```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX                                 │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ homepage │ frontend │  admin   │ backend  │  mentor  │   │
│  │  :3000   │  :7002   │  :3001   │  :8082   │  :TBD    │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Model Bisnis

| Parameter | Detail |
|-----------|--------|
| **Model** | Commission-Based |
| **Komisi** | 5-10% per transaksi |
| **Pembayaran** | Murid bayar ke platform (Xendit) |
| **Saldo Mentor** | Escrow — saldo masuk setelah dipotong komisi |
| **Redeem/Withdraw** | Manual oleh admin (MVP), otomatis via Xendit Payout (future) |

---

## 4. Flow Utama

### 4.1 Onboarding Murid (Invite Link)

```
Mentor generate invite link
        │
        ▼
mentor.lesprivate.my.id/join/{MENTOR_CODE}
        │
        ▼
  ┌─────────────────┐
  │ Sudah punya     │
  │ akun?           │
  └────────┬────────┘
     ┌─────┴─────┐
   BELUM        SUDAH
     │            │
     ▼            ▼
  Register      Login
     │            │
     └─────┬──────┘
           ▼
  Otomatis terdaftar sebagai
  murid dari mentor tersebut
  (insert ke mentor_students)
```

**Catatan Teknis**:
- `mentor_code` disimpan di cookie/session saat murid buka link.
- Saat register/login, backend cek `mentor_code` dan insert relasi ke `mentor_students`.
- Flow register yang ada di `frontend/` perlu dimodifikasi untuk menangkap `mentor_code` dari query param.

### 4.2 Pembayaran & Balance

Murid membayar les melalui **flow booking Lesprivate yang sudah ada** (bukan invoice dari mentor).

```
Murid booking les via platform (flow existing)
        │
        ▼
Murid bayar via Xendit (flow existing)
        │
        ▼
Webhook: pembayaran berhasil (flow existing)
        │
        ▼
┌── [BARU] Cek apakah tutor punya mentor_balance ──┐
│                                                    │
├── Hitung komisi (5-10%)                           │
├── Tambah saldo mentor (amount - komisi)           │
├── Catat di balance_transactions                   │
└── Update mentor_balances                          │
└────────────────────────────────────────────────────┘
```

**Catatan**: Tidak ada invoice terpisah dari mentor — semua pembayaran mengalir lewat sistem booking yang sudah berjalan. Yang baru hanya **pencatatan saldo** setelah pembayaran berhasil.

### 4.3 Redeem / Withdraw (MVP)

```
Mentor klik "Tarik Saldo" di dashboard
        │
        ▼
Input jumlah + nomor rekening
        │
        ▼
Status: PENDING
        │
        ▼
Admin dapat notifikasi
        │
        ▼
Admin transfer manual ke rekening mentor
        │
        ▼
Admin update status → COMPLETED
        │
        ▼
Saldo mentor berkurang
```

---

## 5. Database Schema (Tambahan)

### Tabel Baru

```sql
-- Relasi mentor-murid
CREATE TABLE mentor_students (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL,     -- FK ke tutors.id
    student_id  CHAR(36) NOT NULL,     -- FK ke students.id
    joined_at   TIMESTAMP DEFAULT NOW(),
    status      ENUM('active', 'inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(tutor_id, student_id)
);

-- Saldo mentor
CREATE TABLE mentor_balances (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL UNIQUE,  -- FK ke tutors.id
    balance     DECIMAL(15,2) DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Riwayat transaksi saldo (ledger)
CREATE TABLE balance_transactions (
    id              CHAR(36) PRIMARY KEY,
    tutor_id        CHAR(36) NOT NULL,
    type            ENUM('credit', 'debit') NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    commission      DECIMAL(15,2) DEFAULT 0,
    reference_type  VARCHAR(50),          -- 'booking_payment', 'withdrawal'
    reference_id    CHAR(36),             -- FK ke booking/withdrawal
    description     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Tidak perlu tabel invoice terpisah.
-- Pembayaran menggunakan flow booking & payment yang sudah ada.
-- balance_transactions mencatat setiap pemasukan dari booking.

-- Pengajuan penarikan dana
CREATE TABLE withdrawal_requests (
    id              CHAR(36) PRIMARY KEY,
    tutor_id        CHAR(36) NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    bank_name       VARCHAR(100),
    account_number  VARCHAR(50),
    account_name    VARCHAR(100),
    status          ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending',
    admin_note      VARCHAR(500),
    processed_at    TIMESTAMP NULL,
    processed_by    CHAR(36) NULL,        -- FK ke users.id (admin)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Kode invite mentor
CREATE TABLE mentor_invite_codes (
    id          CHAR(36) PRIMARY KEY,
    tutor_id    CHAR(36) NOT NULL UNIQUE,
    code        VARCHAR(50) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API Endpoints (MVP)

### Mentor Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/mentor/dashboard` | Overview: saldo, jumlah murid, booking terbaru |
| GET | `/v1/mentor/invite-code` | Get/generate invite code |

### Student Management
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/mentor/students` | List murid mentor |
| GET | `/v1/mentor/students/:id` | Detail murid |
| DELETE | `/v1/mentor/students/:id` | Hapus relasi murid |

### Booking History (dari flow existing)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/mentor/bookings` | List booking dari murid-murid mentor |
| GET | `/v1/mentor/bookings/:id` | Detail booking |

### Balance & Withdrawal
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/mentor/balance` | Lihat saldo & riwayat transaksi |
| POST | `/v1/mentor/withdrawals` | Ajukan penarikan |
| GET | `/v1/mentor/withdrawals` | Riwayat penarikan |

### Public (Murid)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/join/:code` | Validasi invite code & redirect |

### Admin (Tambahan)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/v1/admin/withdrawals` | List semua pengajuan withdraw |
| PUT | `/v1/admin/withdrawals/:id/approve` | Approve & proses withdraw |
| PUT | `/v1/admin/withdrawals/:id/reject` | Reject withdraw |

---

## 7. Halaman UI (Mentor Dashboard)

### MVP Pages
| Route | Deskripsi |
|-------|-----------|
| `/dashboard` | Overview: saldo, statistik, aktivitas terbaru |
| `/students` | Daftar murid + invite link |
| `/bookings` | Riwayat booking dari murid-murid mentor |
| `/wallet` | Saldo, riwayat transaksi, form withdraw |
| `/settings` | Profil, rekening bank |

---

## 8. Phasing

### Phase 1: MVP ← Fokus Sekarang
- [ ] Setup project `mentor/` (boilerplate dari `admin/`)
- [ ] Database schema: `mentor_students`, `mentor_balances`, `balance_transactions`, `withdrawal_requests`, `mentor_invite_codes`
- [ ] Backend: API handlers untuk semua endpoint di atas
- [ ] Backend: Modifikasi webhook pembayaran existing untuk update saldo mentor
- [ ] Frontend: Semua halaman MVP (dashboard, students, bookings, wallet, settings)
- [ ] Admin: Halaman manage withdrawal requests
- [ ] Docker & Nginx config

### Phase 2: Growth
- [ ] Penjadwalan mandiri (kalender, availability)
- [ ] Catatan & laporan belajar per murid per sesi
- [ ] Notifikasi (reminder jadwal, invoice jatuh tempo)

### Phase 3: Retention
- [ ] Chat/komunikasi mentor-murid
- [ ] Dashboard analytics (pendapatan, tren, murid aktif)
- [ ] Upgrade redeem ke Xendit Payout (otomatis)
- [ ] Recurring invoice (langganan bulanan)

---

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Mentor tidak mau pakai karena sudah terbiasa transfer langsung | Value prop: manajemen murid otomatis, tracking pendapatan, laporan keuangan |
| Volume transaksi rendah di awal | Komisi rendah (5%) di awal sebagai insentif, naikkan setelah proven value |
| Fraud/dispute pembayaran | Escrow model melindungi kedua pihak; admin bisa mediate |
| Beban admin untuk manual withdraw | Acceptable di MVP; upgrade ke Xendit Payout saat volume tinggi |
