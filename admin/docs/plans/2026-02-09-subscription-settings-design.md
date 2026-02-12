# Subscription Settings Page — Brainstorming Design

## Problem Statement

Halaman **Subscription Settings** (`app/(dashboard)/subscriptions/page.tsx`) saat ini **sepenuhnya static/mocked** menggunakan `useState`. Padahal sudah ada infrastruktur backend dan components yang siap pakai:

| Aspek | Status |
|-------|--------|
| **Student Premium** (subscription prices) | ✅ Backend API ada (`/v1/admin/subscription-prices`), service + action + form + list component sudah siap |
| **Base Tutor Commission** | ❌ Tidak ada backend API / service |
| **Yearly Discount** | ❌ Tidak ada backend API / service |
| **Feature Toggles** (AI, Support, Analytics, Offline) | ❌ Tidak ada backend API / service |
| **Recent Transactions** | ❌ Hardcoded dummy data |

---

## Pendekatan 1: Connect Student Premium Only (Recommended ⭐)

### Apa yang dilakukan
Hanya menghubungkan field **Student Premium** ke backend API yang sudah ada, sisanya tetap static untuk sekarang.

### Perubahan
1. Ubah `page.tsx` dari `"use client"` → Server Component yang fetch data via `getSubscriptionPricess()`
2. Pindahkan interactive parts ke Client Component baru (e.g. `SubscriptionSettingsClient.tsx`)
3. Gunakan **existing** `subscription-form.tsx` dan `updateSubscriptionPricesAction` untuk save
4. Commission, Discount, Toggles → tetap static, tapi beri label `(Coming Soon)` atau disabled state

### Trade-offs
| Pro | Con |
|-----|-----|
| Cepat & minim risiko | Commission/Discount/Toggles masih mocked |
| Memanfaatkan infrastruktur yang sudah matang | User mungkin bingung hanya sebagian yang tersimpan |
| Tidak butuh backend changes | — |
| Bisa langsung di-test end-to-end | — |

### Effort: ~2-3 jam

---

## Pendekatan 2: Connect Premium + Mock API untuk Commission & Discount

### Apa yang dilakukan
Selain mengkoneksi Student Premium, buat juga **service layer** untuk Commission & Discount yang mengasumsikan backend endpoint akan ada (atau menggunakan local storage / mock API sebagai placeholder).

### Perubahan
1. Semua dari Pendekatan 1
2. Buat `services/settings.tsx` dengan fungsi `getSettings()` dan `updateSettings()`
3. Buat `utils/types/settings.ts` untuk tipe `PlatformSettings`
4. Buat `actions/settings.ts` untuk server actions
5. Jika backend belum ready → gunakan fallback/default values dan tunjukkan toast "Backend not yet connected"

### Trade-offs
| Pro | Con |
|-----|-----|
| UI lebih "lengkap" dan responsive | Lebih banyak code yang belum functional |
| Siap pakai saat backend ready | Risiko user merasa fitur sudah jalan padahal belum |
| Service layer sudah terstruktur | Perlu maintain mock data |

### Effort: ~4-5 jam

---

## Pendekatan 3: Full Redesign + Reuse Existing Components

### Apa yang dilakukan
Redesign total halaman subscriptions agar menggunakan **existing components** (`SubscriptionList` + `SubscriptionForm`) sebagai bagian utama, lalu tambahkan section terpisah untuk settings lain.

### Perubahan
1. Halaman utama menampilkan `SubscriptionList` (tabel subscription prices dari backend)
2. Edit via dialog menggunakan `SubscriptionForm` yang sudah ada
3. Tambahkan tab/section terpisah untuk "Platform Settings" (Commission, Discount)
4. Feature Toggles sebagai sidebar card

### Trade-offs
| Pro | Con |
|-----|-----|
| Reuse component maximum, DRY | Redesign UI substantial, mungkin beda dari design saat ini |
| Tabel subscription lebih powerful (edit inline) | Effort besar jika design harus matching |
| Clear separation antara "Pricing" dan "Settings" | Mungkin perlu approval dari tim design |

### Effort: ~6-8 jam

---

## Rekomendasi

> **Pendekatan 1 (Connect Student Premium Only)** adalah langkah paling pragmatis.

**Alasan:**
1. **YAGNI** — Commission, Discount, Toggles belum ada backend-nya. Membuat mock/placeholder hanya menambah tech debt.
2. **Incremental delivery** — Kita bisa deliver value nyata (Student Premium tersimpan ke backend) dalam waktu singkat.
3. **Existing infra** — Service, action, dan form component sudah siap pakai.
4. **Clear UX feedback** — Section yang belum connected bisa diberi badge "Coming Soon" agar user tidak bingung.

Ketika backend untuk Commission/Discount/Toggles sudah available, kita bisa iterate ke Pendekatan 2 atau 3.

---

## Pertanyaan untuk User

1. **Apakah Pendekatan 1 (Connect Student Premium saja) sudah cukup untuk saat ini?** Atau Anda prefer salah satu pendekatan lain?
2. **Apakah ada rencana backend untuk Commission/Discount/Toggles?** Jika ya, kita bisa menyiapkan service layer-nya sekarang (Pendekatan 2).
3. **Apakah design halaman saat ini sudah final?** Atau boleh kita ganti ke layout berbasis `SubscriptionList` table (Pendekatan 3)?
