# Tabel Pengujian Sistem: Portal Belajar Langkah Juara

Dokumen ini disusun sebagai pemenuhan **Tahap 6 (Uji dengan Empat Akun)** pada Tugas Mandiri Sesi 6 Bootcamp AI Web Programming, berdasarkan dokumen **PRD Tugas Portal Belajar Langkah Juara**.

---

## 1. Akun Uji Coba

| No | Peran | Nama | Email Akun Uji | Status Akun |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Super Admin** | Pak Arif | `arif@langkahjuara.id` | Aktif |
| 2 | **Staf** | Kak Fira | `fira@langkahjuara.id` | Aktif |
| 3 | **Tutor** | Kak Dimas | `dimas@langkahjuara.id` | Aktif |
| 4 | **Siswa** | Raka | `raka@langkahjuara.id` | Aktif |

*Catatan: Kata sandi seluruh akun uji dikirimkan secara terpisah melalui pesan pribadi kepada trainer.*

---

## 2. Matriks Pengujian Hak Akses & Route Guard (Minimal 16 Baris)

Pengujian dilakukan dengan mengetikkan langsung alamat URL di bilah pencarian peramban (browser) untuk setiap akun, menguji skenario otorisasi, penolakan akses (*route guard*), dan perilaku pemuatan ulang (*page reload*).

| No | Pengguna / Akun | Halaman Dituju | Tindakan yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian | Lolos? |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Belum Masuk** (Pengunjung) | `/beranda` | Ketik langsung di address bar | Dialihkan otomatis ke `/masuk` | Dialihkan ke `/masuk` | [x] |
| 2 | **Belum Masuk** (Pengunjung) | `/staf` | Ketik langsung di address bar | Dialihkan otomatis ke `/masuk` | Dialihkan ke `/masuk` | [x] |
| 3 | **Belum Masuk** (Pengunjung) | `/tutor` | Ketik langsung di address bar | Dialihkan otomatis ke `/masuk` | Dialihkan ke `/masuk` | [x] |
| 4 | **Belum Masuk** (Pengunjung) | `/admin` | Ketik langsung di address bar | Dialihkan otomatis ke `/masuk` | Dialihkan ke `/masuk` | [x] |
| 5 | **Siswa** (`raka@langkahjuara.id`) | `/masuk` | Masuk dengan email & password | Dialihkan otomatis ke `/beranda` | Tiba di `/beranda` | [x] |
| 6 | **Siswa** (`raka@langkahjuara.id`) | `/beranda` | Muat ulang (*refresh*) halaman | Tampil indikator memuat, tetap di `/beranda` tanpa flicker | Tetap di `/beranda` tanpa flicker | [x] |
| 7 | **Siswa** (`raka@langkahjuara.id`) | `/staf` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 8 | **Siswa** (`raka@langkahjuara.id`) | `/tutor` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 9 | **Siswa** (`raka@langkahjuara.id`) | `/admin` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 10 | **Staf** (`fira@langkahjuara.id`) | `/masuk` | Masuk dengan email & password | Dialihkan otomatis ke `/staf` | Tiba di `/staf` | [x] |
| 11 | **Staf** (`fira@langkahjuara.id`) | `/staf` | Muat ulang (*refresh*) halaman | Tampil indikator memuat, tetap di `/staf` tanpa flicker | Tetap di `/staf` tanpa flicker | [x] |
| 12 | **Staf** (`fira@langkahjuara.id`) | `/beranda` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 13 | **Staf** (`fira@langkahjuara.id`) | `/tutor` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 14 | **Staf** (`fira@langkahjuara.id`) | `/admin` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 15 | **Tutor** (`dimas@langkahjuara.id`) | `/masuk` | Masuk dengan email & password | Dialihkan otomatis ke `/tutor` | Tiba di `/tutor` | [x] |
| 16 | **Tutor** (`dimas@langkahjuara.id`) | `/tutor` | Muat ulang (*refresh*) halaman | Tampil indikator memuat, tetap di `/tutor` tanpa flicker | Tetap di `/tutor` tanpa flicker | [x] |
| 17 | **Tutor** (`dimas@langkahjuara.id`) | `/beranda` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 18 | **Tutor** (`dimas@langkahjuara.id`) | `/staf` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 19 | **Tutor** (`dimas@langkahjuara.id`) | `/admin` | Ketik langsung di address bar | Muncul tampilan **Akses Ditolak** | Muncul Akses Ditolak | [x] |
| 20 | **Super Admin** (`arif@langkahjuara.id`) | `/masuk` | Masuk dengan email & password | Dialihkan otomatis ke `/admin` | Tiba di `/admin` | [x] |
| 21 | **Super Admin** (`arif@langkahjuara.id`) | `/admin` | Muat ulang (*refresh*) halaman | Tampil indikator memuat, tetap di `/admin` | Tetap di `/admin` | [x] |
| 22 | **Super Admin** (`arif@langkahjuara.id`) | `/beranda` | Buka halaman siswa | Halaman terbuka penuh tanpa penolakan | Halaman terbuka | [x] |
| 23 | **Super Admin** (`arif@langkahjuara.id`) | `/staf` | Buka halaman staf | Halaman terbuka penuh tanpa penolakan | Halaman terbuka | [x] |
| 24 | **Super Admin** (`arif@langkahjuara.id`) | `/tutor` | Buka halaman tutor | Halaman terbuka penuh tanpa penolakan | Halaman terbuka | [x] |
| 25 | **Akun Nonaktif** | `/masuk` | Coba akses setelah dinonaktifkan | Ditampilkan pesan akun dinonaktifkan | Muncul peringatan akun dinonaktifkan | [x] |

---

## 3. Uji Alur Inti Bimbel Langkah Juara (End-to-End Firestore)

| Langkah | Peran | Modul & Subbab PRD | Yang Dilakukan | Status Hasil di Firestore | Lolos? |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Siswa** (Raka) | Program (4.3) | Klik Ajukan Pendaftaran ke "Intensif UTBK" | Dokumen `pendaftaran` bertambah dengan `status: "menunggu"` | [x] |
| 2 | **Staf** (Kak Fira) | Pendaftaran (4.8) | Klik Setujui pada pendaftaran Raka | Field status berubah menjadi `aktif` | [x] |
| 3 | **Staf** (Kak Fira) | Kelola Kelas (4.9) | Buat kelas "Intensif UTBK A" (Tutor: Kak Dimas) & masukkan Raka | Dokumen `kelas` tersimpan, `siswaIds` memuat UID Raka | [x] |
| 4 | **Tutor** (Kak Dimas) | Kelas yang Diajar (4.13) | Buat Tugas "Latihan UTBK Mandiri 1" | Dokumen `tugas` tersimpan dengan batas waktu | [x] |
| 5 | **Siswa** (Raka) | Tugas Siswa (4.5) | Buka tugas dari Beranda & kumpulkan tautan Google Drive | Dokumen `pengumpulan` tersimpan, status `Dikumpulkan` | [x] |
| 6 | **Tutor** (Kak Dimas) | Tugas & Nilai (4.13) | Buka jawaban Raka, beri nilai 88 & feedback | Field `nilai: 88` dan `komentar` tersimpan di Firestore | [x] |
| 7 | **Siswa** (Raka) | Tugas Siswa (4.5) | Buka kembali rincian tugas miliknya | Nilai 88 dan komentar tutor tampil dengan rapi | [x] |
