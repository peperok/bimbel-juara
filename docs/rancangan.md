# Rancangan Sistem: Portal Belajar Langkah Juara

Dokumen ini disusun sebagai pemenuhan **Tahap 1 (Rancang Dulu)** pada Tugas Mandiri Sesi 6 Bootcamp AI Web Programming, berdasarkan dokumen **PRD Tugas Portal Belajar Langkah Juara**.

---

## 1. Matriks Akses Fitur

Matriks ini memetakan seluruh fitur fungsional dari Bab 4 PRD ke 5 kategori pengguna: Pengunjung, Siswa (Pelanggan), Staf (Staf Depan), Tutor (Tenaga Ahli), dan Super Admin (Pemilik).

**Keterangan Simbol:**
- `✓` : Memiliki akses penuh
- `✕` : Tidak memiliki akses / ditolak
- `✓ sendiri` : Akses terbatas hanya pada data/kelas/tugas milik pengguna yang bersangkutan

| No | Fitur (Subbab PRD) | Pengunjung | Siswa | Staf | Tutor | Super Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | Mendaftar akun email & Google (4.1) | ✓ | ✕ | ✕ | ✕ | ✕ |
| 2 | Masuk akun email & Google (4.1) | ✓ | ✕ | ✕ | ✕ | ✕ |
| 3 | Melihat Beranda jadwal & tugas belum selesai (4.2) | ✕ | ✓ sendiri | ✕ | ✕ | ✓ |
| 4 | Melihat daftar program aktif (4.3) | ✕ | ✓ | ✕ | ✕ | ✓ |
| 5 | Mengajukan pendaftaran program (4.3) | ✕ | ✓ sendiri | ✕ | ✕ | ✓ |
| 6 | Melihat daftar pendaftaran saya & status (4.3) | ✕ | ✓ sendiri | ✕ | ✕ | ✓ |
| 7 | Melihat daftar & rincian Kelas Saya (4.4) | ✕ | ✓ sendiri | ✕ | ✕ | ✓ |
| 8 | Mengakses tautan materi pertemuan kelas (4.4) | ✕ | ✓ sendiri | ✕ | ✕ | ✓ |
| 9 | Mengumpulkan tugas / perbarui tautan jawaban (4.5) | ✕ | ✓ sendiri | ✕ | ✕ | ✕ |
| 10 | Melihat nilai dan komentar tugas (4.5) | ✕ | ✓ sendiri | ✕ | ✓ sendiri | ✓ |
| 11 | Melihat profil & ubah nama / HP (4.6) | ✕ | ✓ sendiri | ✓ sendiri | ✓ sendiri | ✓ sendiri |
| 12 | Mengubah nomor HP orang tua (4.6) | ✕ | ✓ sendiri | ✕ | ✕ | ✕ |
| 13 | Melihat Dasbor Staf (pendaftaran & kelas hari ini) (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 14 | Melihat daftar pendaftaran dengan filter status (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 15 | Menyetujui pendaftaran program (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 16 | Menolak pendaftaran dengan catatan staf (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 17 | Membuat kelas baru, pilih tutor, jadwal & tempat (4.9) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 18 | Memasukkan siswa aktif ke dalam kelas (4.9) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 19 | Melihat data siswa & kontak HP orang tua (4.10) | ✕ | ✕ | ✓ | ✕ | ✓ |
| 20 | Melihat Dasbor Tutor (kelas diajar hari ini & semua) (4.11) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 21 | Membuat pertemuan & tautan materi kelas diajar (4.12) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 22 | Mengisi & menyimpan presensi siswa di pertemuan (4.12) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 23 | Membuat tugas baru di kelas yang diajar (4.13) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 24 | Memeriksa pengumpulan tugas kelas yang diajar (4.13) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 25 | Memberi dan mengubah nilai & komentar tugas (4.13) | ✕ | ✕ | ✕ | ✓ sendiri | ✓ |
| 26 | Melihat Dasbor Admin (rekap ringkasan bimbel) (4.14) | ✕ | ✕ | ✕ | ✕ | ✓ |
| 27 | Melihat daftar pengguna & filter role / pencarian (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| 28 | Mengubah role pengguna (siswa, staf, tutor, super_admin) (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| 29 | Menonaktifkan / mengaktifkan akun pengguna (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| 30 | Menambah dan mengelola program belajar bimbel (4.16) | ✕ | ✕ | ✕ | ✕ | ✓ |
| 31 | Melihat laporan bulanan (siswa aktif, hadir, kelas/tutor) (4.17) | ✕ | ✕ | ✕ | ✕ | ✓ |

---

## 2. Peta Route Halaman

Setiap halaman di Bab 4 PRD memiliki aturan rute guard yang ketat. Pengguna yang belum masuk akan dialihkan ke `/masuk`, sedangkan pengguna dengan peran yang tidak berhak akan melihat tampilan **Akses Ditolak**. Super Admin (`super_admin`) memiliki hak akses membuka seluruh halaman.

| Halaman | Alamat URL | Peran yang Boleh Membuka | Bila Belum Masuk | Bila Peran Lain |
| :--- | :--- | :--- | :--- | :--- |
| **Daftar Akun** | `/daftar` | Pengunjung (Publik) | Tetap di `/daftar` | Dialihkan ke halaman sesuai peran |
| **Masuk Akun** | `/masuk` | Pengunjung (Publik) | Tetap di `/masuk` | Dialihkan ke halaman sesuai peran |
| **Beranda Siswa** | `/beranda` | `siswa`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Katalog Program** | `/program` | `siswa`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Daftar Kelas Saya** | `/kelas` | `siswa`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Rincian Kelas Siswa** | `/kelas/[id]` | `siswa` (anggota kelas), `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak / Tidak Ditemukan |
| **Detail & Kumpul Tugas** | `/tugas/[id]` | `siswa` (anggota kelas), `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak / Tidak Ditemukan |
| **Profil Pengguna** | `/profil` | `siswa`, `staf`, `tutor`, `super_admin` | Dialihkan ke `/masuk` | (Semua peran berhak membuka profil sendiri) |
| **Dasbor Staf** | `/staf` | `staf`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Kelola Pendaftaran** | `/staf/pendaftaran` | `staf`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Kelola Kelas (Staf)** | `/staf/kelas` | `staf`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Rincian Kelas (Staf)** | `/staf/kelas/[id]` | `staf`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Data Siswa & Kontak** | `/staf/siswa` | `staf`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Dasbor Tutor** | `/tutor` | `tutor`, `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Rincian Kelas Diajar** | `/tutor/kelas/[id]` | `tutor` (pengampu kelas), `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Pemeriksaan Tugas & Nilai**| `/tutor/tugas/[id]` | `tutor` (pengampu kelas), `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Dasbor Super Admin** | `/admin` | `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Kelola Pengguna** | `/admin/pengguna` | `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Detail Kelola Pengguna** | `/admin/pengguna/[id]` | `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Kelola Program Bimbel** | `/admin/program` | `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |
| **Laporan Bulanan** | `/admin/laporan` | `super_admin` | Dialihkan ke `/masuk` | Halaman Akses Ditolak |

---

## 3. Jawaban Keputusan Wajib

Berikut adalah jawaban 4 pertanyaan keputusan penting untuk studi kasus Bimbel Langkah Juara beserta rujukan subbab PRD:

### 1. Bolehkah staf mengubah nilai tugas?
> **Jawaban: TIDAK BOLEH.**  
> **Dasar PRD:**
> - **Bab 2.4 (Yang tidak boleh dilihat tiap peran):** Pada baris *"Memberi atau mengubah nilai"*, kolom Staf tertulis tegas **"Tidak bisa"**.
> - **Subbab 4.9:** *"Staf tidak bisa membuat pertemuan, mengisi presensi, atau memberi nilai."*
> - **Subbab 4.10:** *"Halaman ini hanya untuk membaca. Staf tidak bisa melihat atau mengubah nilai."*
> - Hak memberi dan mengubah nilai hanya diberikan kepada Tutor pengampu kelas tersebut dan Super Admin (Subbab 4.13).

### 2. Bolehkah Kak Dimas membuka kelas Kak Nadia?
> **Jawaban: TIDAK BOLEH.**  
> **Dasar PRD:**
> - **Bab 2.4:** Pada baris *"Kelas yang diajar tutor lain"*, kolom Tutor tertulis **"Tidak tampil"**.
> - **Subbab 4.11:** *"Hanya kelas dengan tutorId sama dengan uid tutor yang masuk yang tampil."*
> - **Subbab 4.12:** *"Bila Kak Nadia mengganti ID di alamat dengan kelas Kak Dimas, tampil Akses Ditolak."*
> - Hal yang sama berlaku untuk Kak Dimas jika mencoba membuka ID kelas milik Kak Nadia.

### 3. Bolehkah Raka melihat nilai Salsa?
> **Jawaban: TIDAK BOLEH.**  
> **Dasar PRD:**
> - **Bab 1 (Ringkasan Eksekutif):** *"Nilai tetap pribadi. Siswa hanya bisa membuka nilai miliknya sendiri, termasuk bila alamat halaman diubah."*
> - **Bab 2.4:** Pada baris *"Nilai dan jawaban siswa lain"*, kolom Siswa tertulis tegas **"Tidak tampil"**.
> - **Subbab 4.5:** *"Siswa di luar kelas tugas itu melihat 'Tugas tidak ditemukan'"*, dan data pengumpulan nilai diakses berdasarkan `siswaId` siswa yang login. Raka tidak memiliki hak melihat dokumen pengumpulan atau nilai milik Salsa.

### 4. Halaman mana saja yang boleh dibuka Pak Arif?
> **Jawaban: SEMUA HALAMAN.**  
> **Dasar PRD:**
> - **Bab 2.1:** *"Super Admin (Pak Arif) - Membuka semua halaman peran lain, ditambah mengelola pengguna, program, dan laporan."*
> - **Bab 2.3 & Bab 3.1:** Super Admin memiliki hak akses menu Siswa, Staf, Tutor, dan modul khusus Super Admin (`/admin`, `/admin/pengguna`, `/admin/program`, `/admin/laporan`).
> - **Subbab 4.14:** *"Super Admin juga melihat semua menu Staf, Tutor, dan Siswa."*
> - **Subbab 6.2:** *"super_admin boleh membuka semua halaman."*
