# Roadmap & Checklist Pengerjaan Tugas Mandiri Sesi 6
## Portal Belajar Langkah Juara (Bimbel)

Dokumen ini memantau progres pengerjaan Tugas Mandiri Sesi 6 sesuai instruksi dan PRD Langkah Juara.

---

## 📌 Status Ringkasan
- **Pilihan PRD**: PRD 2 — Portal Belajar Langkah Juara (Bimbel)
- **Target Platform**: Next.js (App Router, JavaScript, Tailwind), Firebase (Auth & Firestore), Netlify
- **4 Peran**:
  1. `siswa` (peran awal / default)
  2. `staf` (Kak Fira)
  3. `tutor` (Kak Dimas / Kak Nadia)
  4. `super_admin` (Pak Arif)

---

## 📋 Tahap Pengerjaan & Checklist

### Tahap 1: Rancang Dulu (Dokumentasi)
- [x] Buat file `docs/rancangan.md`
- [x] Susun Matriks Akses (Bab 4 PRD: Pengunjung, Siswa, Staf, Tutor, Super Admin)
- [x] Susun Peta Route untuk seluruh halaman di Bab 4:
  - `/masuk`, `/daftar`
  - `/beranda`, `/program`, `/kelas`, `/kelas/[id]`, `/tugas/[id]`, `/profil`
  - `/staf`, `/staf/pendaftaran`, `/staf/kelas`, `/staf/kelas/[id]`, `/staf/siswa`
  - `/tutor`, `/tutor/kelas/[id]`, `/tutor/tugas/[id]`
  - `/admin`, `/admin/pengguna`, `/admin/pengguna/[id]`, `/admin/program`, `/admin/laporan`
- [x] Jawab 4 Pertanyaan Kunci Bimbel dengan rujukan subbab PRD:
  1. *Bolehkah staf mengubah nilai tugas?*
  2. *Bolehkah Kak Dimas membuka kelas Kak Nadia?*
  3. *Bolehkah Raka melihat nilai Salsa?*
  4. *Halaman mana saja yang boleh dibuka Pak Arif?*

---

### Tahap 2: Siapkan Proyek & Firebase
- [x] Tentukan folder kerja proyek (langsung di root `d:\Bootcamp\Tugas Mandiri`)
- [x] Simpan teks PRD ke `docs/PRD.md` di folder proyek
- [x] Inisialisasi kerangka Next.js (App Router, JS, Tailwind)
- [x] Buat halaman-halaman Bab 4 (UI mockup/kerangka awal sesuai Bab 5, tanpa guard)
- [x] Buat proyek Firebase Console & hubungkan Firebase Web App (`lib/firebase.js`, `.env.local`)
- [x] Konfigurasi Firestore Database (mode uji coba sementara)
- [x] Isi *seed data* 7 koleksi Firestore sesuai PRD 7.1 (`users`, `program`, `pendaftaran`, `kelas`, `pertemuan`, `tugas`, `pengumpulan`)
- [x] Aktifkan Auth Provider: **Email/Password** & **Google** + pastikan `localhost` ada di Authorized Domains

---

### Tahap 3: Login & Dokumen Users
- [x] Buat UI & logika autentikasi di `/masuk` dan `/daftar` (Email & Password + Google)
- [x] Logika pembuatan dokumen `users/{uid}`:
  - Field: `nama`, `email`, `noHp`, `noHpOrangTua`, `role: "siswa"`, `aktif: true`, `dibuatPada`
  - **Penting**: Jangan menimpa dokumen jika sudah ada!
  - **Penting**: Jangan pernah simpan password di Firestore!
- [x] Tampilkan nama dan peran pengguna di bilah atas (Navbar / Header)

---

### Tahap 4: Super Admin Pertama & Kelola Pengguna
- [x] Daftarkan akun pemilik (`arif@langkahjuara.id`) lewat `/daftar`
- [x] Naikkan peran akun Pak Arif menjadi `role: "super_admin"` via Firebase Console / Firebase MCP
- [x] Bangun halaman **Kelola Pengguna** (`/admin/pengguna` dan detail/edit `/admin/pengguna/[id]`):
  - Hanya bisa diakses `super_admin`
  - Fitur ubah role (`siswa`, `staf`, `tutor`, `super_admin`) & switch `aktif` (nonaktifkan akun)
  - Super admin tidak bisa mendowngrade / menonaktifkan dirinya sendiri
- [x] Buat 3 akun uji lainnya (Siswa, Staf, Tutor) dan set perannya via halaman Kelola Pengguna

---

### Tahap 5: Pengalihan & Route Guard
- [x] Pasang pengalihan otomatis setelah login berdasarkan role:
  - `siswa` $\to$ `/beranda`
  - `staf` $\to$ `/staf`
  - `tutor` $\to$ `/tutor`
  - `super_admin` $\to$ `/admin`
- [x] Pasang **Route Guard** di tiap kelompok rute:
  - Kelompok Siswa: `/beranda`, `/program`, `/kelas/*`, `/tugas/*`
  - Kelompok Staf: `/staf/*`
  - Kelompok Tutor: `/tutor/*`
  - Kelompok Admin: `/admin/*`
- [x] Tampilkan layar **Memuat...** (loading state) sampai profil/role selesai dibaca (mencegah flicker "Akses Ditolak")
- [x] Halaman **Akses Ditolak** yang ramah jika role tidak sesuai (dengan tombol kembali)
- [x] Pastikan `super_admin` dapat membuka semua kelompok halaman

---

### Tahap 6: Uji dengan Empat Akun (Testing Matrix)
- [x] Buat file `docs/uji.md`
- [x] Isi minimal 16 skenario pengujian:
  - Pengunjung belum masuk
  - Akun Siswa (Raka)
  - Akun Staf (Kak Fira)
  - Akun Tutor (Kak Dimas)
  - Akun Super Admin (Pak Arif)
- [x] Uji skenario muat ulang halaman (page refresh) tanpa logout atau flicker penolakan
- [x] Centang seluruh hasil pengujian yang lolos (25 skenario)

---

### Tahap 7: Alur Inti Bimbel (End-to-End dengan Firestore)
Alur wajib yang harus berjalan dengan data nyata:
- [x] 1. Siswa mengajukan pendaftaran program di `/program` (status: `menunggu`)
- [x] 2. Staf menyetujui pendaftaran di `/staf/pendaftaran` (status berubah jadi `aktif`)
- [x] 3. Staf memasukkan siswa ke kelas di `/staf/kelas/[id]` (update `siswaIds` di dokumen kelas)
- [x] 4. Tutor membuat tugas baru di `/tutor/kelas/[id]` (tersimpan di koleksi `tugas`)
- [x] 5. Siswa melihat tugas di `/beranda` atau `/kelas/[id]`, lalu mengumpulkan tautan jawaban di `/tugas/[id]` (tersimpan di koleksi `pengumpulan`)
- [x] 6. Tutor memeriksa jawaban & memberi nilai + komentar di `/tutor/tugas/[id]`
- [x] 7. Siswa melihat nilai dan komentar yang diberikan tutor di `/tugas/[id]`

---

### Tahap 8: Tayang (Deployment) & Pengumpulan
- [x] Siapkan repositori Git & berkas konfigurasi Netlify (`netlify.toml`)
- [ ] Push kode ke GitHub & hubungkan ke Netlify
- [ ] Set Environment Variables di Netlify (`NEXT_PUBLIC_FIREBASE_*`)
- [ ] Daftarkan domain Netlify (misal: `https://xxx.netlify.app`) ke Firebase Authentication **Authorized Domains**
- [ ] Uji login Google dan 4 akun di alamat Netlify yang sudah tayang
- [x] Siapkan seluruh dokumen pengumpulan:
  - `docs/rancangan.md`
  - `docs/uji.md`
  - 4 Email akun uji & password:
    1. Super Admin: `arif@langkahjuara.id`
    2. Staf: `fira@langkahjuara.id`
    3. Tutor: `dimas@langkahjuara.id`
    4. Siswa: `raka@langkahjuara.id`
