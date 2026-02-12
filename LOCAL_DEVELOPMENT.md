# Lesprivate - Local Development Setup

Panduan lengkap untuk menjalankan semua komponen Lesprivate di komputer lokal.

## Prerequisites

Pastikan sudah terinstall:

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | 20+ | `brew install node` |
| Go | 1.24+ | `brew install go` |
| Docker | Latest | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) |

---

## Quick Start

### 1. Setup Database dengan Docker

```bash
# Buat Docker network
docker network create lesprivate

# Jalankan MySQL
docker run -d \
  --name lesprivate-mysql \
  --network lesprivate \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=lesprivate \
  -p 3306:3306 \
  mysql:8

# Jalankan Redis
docker run -d \
  --name lesprivate-redis \
  --network lesprivate \
  -p 6379:6379 \
  redis:6
```

**Verifikasi:**
```bash
docker ps  # Pastikan mysql dan redis running
```

---

### 2. Setup Backend (Go API)

```bash
cd backend

# Copy environment file
cp .env.example .env
```

**Edit `.env` dengan konfigurasi berikut:**
```env
APP.ENV=development
APP.NAME=les-private
APP.PORT=8080
APP.URL=http://localhost:8080

DB.WRITE.HOST=localhost
DB.WRITE.NAME=lesprivate
DB.WRITE.USER=root
DB.WRITE.PASSWORD=password
DB.WRITE.PORT=3306
DB.WRITE.ENABLE_MIGRATION=true

DB.READ.HOST=localhost
DB.READ.NAME=lesprivate
DB.READ.USER=root
DB.READ.PASSWORD=password
DB.READ.PORT=3306

REDIS.HOST=localhost
REDIS.PORT=6379
REDIS.PASSWORD=
REDIS.DB=0

JWT.KEY=your-local-jwt-secret-key
JWT.EXPIRES_IN=1h
JWT.REFRESH_EXPIRES_IN=24h
```

**Jalankan Backend:**
```bash
# Install dependencies
go mod download

# Install dev tools
go install github.com/swaggo/swag/cmd/swag@latest
go install github.com/google/wire/cmd/wire@latest

# Generate code
go generate ./...

# Run server
go run main.go
```

✅ Backend berjalan di: **http://localhost:8080**  
📖 Swagger docs: **http://localhost:8080/swagger/index.html**

---

### 3. Setup Admin Dashboard

```bash
cd admin

# Install dependencies
npm install

# Buat environment file
echo "NEXT_BASE_API_URL=http://localhost:8080" > .env.local

# Jalankan dev server
npm run dev
```

✅ Admin berjalan di: **http://localhost:3000**

---

### 4. Setup Frontend (Customer App)

```bash
cd frontend

# Install dependencies
npm install

# Copy dan edit environment file
cp .env.example .env
```

**Edit `.env`:**
```env
NEXT_BASE_API_URL=http://localhost:8080
NEXT_GOOGLE_KEY=your-google-maps-api-key
NEXT_GOOGLE_AUTH_CLIENT_ID=your-google-oauth-client-id
NEXT_GOOGLE_AUTH_CLIENT_SECRET=your-google-oauth-client-secret
```

**Jalankan dengan port berbeda:**
```bash
npm run dev -- -p 3001
```

✅ Frontend berjalan di: **http://localhost:3001**

---

### 5. Setup Homepage (Landing Page)

```bash
cd homepage

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

✅ Homepage berjalan di: **http://localhost:5173**

---

## Summary - All Running Services

| Service | URL | Status Check |
|---------|-----|--------------|
| **Backend API** | http://localhost:8080 | http://localhost:8080/swagger |
| **Admin Dashboard** | http://localhost:3000 | Open in browser |
| **Frontend Customer** | http://localhost:3001 | Open in browser |
| **Homepage** | http://localhost:5173 | Open in browser |
| **MySQL** | localhost:3306 | `docker ps` |
| **Redis** | localhost:6379 | `docker ps` |

---

## Troubleshooting

### Database Connection Error
```bash
# Pastikan MySQL container running
docker ps | grep mysql

# Restart jika perlu
docker restart lesprivate-mysql
```

### Port Already in Use
```bash
# Cek process yang pakai port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Go Generate Error
```bash
# Pastikan tools terinstall
which swag
which wire

# Install ulang jika perlu
go install github.com/swaggo/swag/cmd/swag@latest
go install github.com/google/wire/cmd/wire@latest
```

### Node Modules Error
```bash
# Hapus dan install ulang
rm -rf node_modules package-lock.json
npm install
```

---

## Stop All Services

```bash
# Stop Docker containers
docker stop lesprivate-mysql lesprivate-redis

# Atau hapus sekalian
docker rm -f lesprivate-mysql lesprivate-redis
```

---

## Tips Development

1. **Gunakan terminal terpisah** untuk setiap service
2. **Hot reload** sudah aktif di semua Next.js apps
3. **Swagger docs** sangat membantu untuk test API
4. **Database migrations** otomatis jalan saat backend start

---

## Next Steps

Setelah semua berjalan, kamu bisa:
1. Akses Admin di http://localhost:3000 untuk setup data awal
2. Buat akun tutor dan student
3. Test flow booking di Frontend
