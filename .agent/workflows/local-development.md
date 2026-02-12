---
description: Cara menjalankan semua service Lesprivate di lokal untuk development
---

# Local Development Workflow

## Perbedaan dengan Monolith

| Aspek | Monolith | Lesprivate (Multi-Service) |
|-------|----------|----------------------------|
| **Start** | 1 command | 4 terminals (bisa di-script) |
| **Database** | Embedded/single | Docker container |
| **Hot Reload** | Satu proses | Tiap service punya |
| **Testing** | Semua sekaligus | Per-service |

**Tips Mental Model:**
Anggap setiap folder (`backend`, `admin`, `frontend`, `homepage`) sebagai **module** dalam monolith. Bedanya, mereka jalan di proses terpisah dan berkomunikasi via HTTP API.

---

## Quick Start (Copy-Paste)

### 1. Start Database (Docker) - Jalankan Sekali
```bash
# Jika container sudah ada, cukup start:
docker start lesprivate-mysql lesprivate-redis

# Jika belum ada, buat dulu:
docker network create lesprivate
docker run -d --name lesprivate-mysql --network lesprivate \
  -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=lesprivate \
  -p 3306:3306 mysql:8
docker run -d --name lesprivate-redis --network lesprivate \
  -p 6379:6379 redis:6
```

// turbo
### 2. Start Backend (Terminal 1)
```bash
cd backend && go run main.go
```
✅ http://localhost:8080

// turbo
### 3. Start Admin (Terminal 2)
```bash
cd admin && npm run dev
```
✅ http://localhost:3000

// turbo
### 4. Start Frontend (Terminal 3)
```bash
cd frontend && npm run dev -- -p 3001
```
✅ http://localhost:3001

// turbo
### 5. Start Homepage (Terminal 4)
```bash
cd homepage && npm run dev
```
✅ http://localhost:5173

---

## Daily Development Tips

### Fokus pada 1-2 Service
- **Backend only?** Cukup jalankan Backend + Database
- **Admin UI?** Jalankan Backend + Admin
- **Customer flow?** Jalankan Backend + Frontend

### Cek Koneksi API
- Admin/Frontend butuh Backend running
- Jika API error, cek Backend log dulu

### Stop Semua Service
```bash
# Ctrl+C di setiap terminal, lalu:
docker stop lesprivate-mysql lesprivate-redis
```

---

## Struktur Development

```
lesprivate/
├── backend/   → Go API (port 8080) - Fokus logic & database
├── admin/     → Next.js (port 3000) - Admin dashboard
├── frontend/  → Next.js (port 3001) - Customer app
└── homepage/  → Vite (port 5173) - Landing page
```

### Kapan Edit Mana?
| Task | Edit Di |
|------|---------|
| API endpoint baru | `backend/internal/handlers/` |
| Business logic | `backend/internal/services/` |
| Admin table/form | `admin/components/` |
| Customer UI | `frontend/components/` |
| Landing page | `homepage/src/` |
