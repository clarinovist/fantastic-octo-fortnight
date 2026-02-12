# Ghost Elements & Pending Functionality

Berikut adalah daftar elemen antarmuka (UI) yang saat ini bersifat statis ("ghost objects") dan perlu dihubungkan dengan backend atau logika frontend di tahap selanjutnya.

## Global (Layout)
- [ ] **Search Bar (Header):** Input pencarian global belum berfungsi.
- [ ] **Notifications:** Tombol notifikasi belum menampilkan data real-time.
- [ ] **Profile Dropdown:** Menu profil user belum memiliki aksi (Logout, Profile, dll).

## Dashboard Overview
- [ ] **KPI Cards:** Angka (Revenue, Tutors, dll) dan grafik sparkline masih hardcoded.
- [ ] **Revenue Chart:** Masih menggunakan SVG statis. Perlu diganti dengan library chart (misal: Recharts) yang terhubung data API.
- [ ] **Filter Waktu:** Dropdown "Last 12 Months" tidak mengubah data chart.
- [ ] **Recent Activity:** List aktivitas masih data dummy.
- [ ] **Top Categories:** List kategori masih data dummy.

## Tutors Page
- [ ] **Add Tutor Button:** Belum membuka form atau modal create.
- [ ] **Search Input:** Belum memfilter tabel.
- [ ] **Filters (Status, Subjects):** Dropdown belum memfilter data tabel.
- [ ] **Sort:** Tombol sort belum berfungsi.
- [ ] **Table Data:** Data tutor masih hardcoded.
- [ ] **Row Actions (Three dots):** Menu Edit/Delete belum ada fungsinya.
- [ ] **Pagination:** Tombol Next/Prev dan angka halaman tidak mengubah data.

## Students Page
- [ ] **Register Student Button:** Belum membuka form create.
- [ ] **Search Input:** Belum memfilter tabel.
- [ ] **Filters (Status, Grade):** Belum berfungsi.
- [ ] **Filter Button:** Tombol filter tambahan belum ada aksi.
- [ ] **Table Data:** Data student masih hardcoded.
- [ ] **Row Actions:** Menu action belum berfungsi.
- [ ] **Pagination:** Belum berfungsi.

## Courses Page
- [ ] **Create Course Button:** Belum membuka form create.
- [ ] **Course Cards:** Data course (judul, gambar, stats) masih dummy.
- [ ] **Active/Draft Toggle:** Switch belum mengubah status course di backend.
- [ ] **Edit Button:** Belum mengarah ke halaman edit atau membuka modal edit.

## Next Steps
Untuk mengaktifkan elemen-elemen ini, kita perlu:
1.  **Integrasi API:** Membuat service untuk fetch data dari backend.
2.  **State Management:** Mengatur state untuk filter, search, dan pagination.
3.  **Forms:** Membuat halaman/modal untuk Create dan Edit data.
4.  **Interactive Charts:** Mengimplementasikan library charting untuk dashboard.
