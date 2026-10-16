**PRODUCT REQUIREMENTS DOCUMENT**

Aplikasi Pendaftaran, Kelas, dan Tugas Bimbingan Belajar

**PORTAL BELAJAR LANGKAH JUARA**

# **1\. Ringkasan Eksekutif**

**Bimbel Langkah Juara** adalah bimbingan belajar kecil di Makassar untuk siswa SMP dan SMA, dengan sekitar 60 siswa, 5 tutor, dan 1 staf administrasi. Pendaftaran masih lewat formulir kertas dan WhatsApp, jadwal kelas dikirim lewat grup, presensi dicatat di buku, materi tersebar di grup WhatsApp, dan nilai tugas dicatat tutor sendiri-sendiri. Akibatnya staf sulit memastikan siapa yang sudah terdaftar, siswa sering ketinggalan jadwal dan materi, dan pemilik tidak bisa melihat kehadiran maupun nilai di satu tempat.

Portal Belajar Langkah Juara menggantikan formulir kertas, buku presensi, dan grup WhatsApp dengan satu aplikasi web di belajar.langkahjuara.id. Aplikasi dipakai siswa, tutor, staf, dan pemilik lewat peramban, dari ponsel maupun laptop.

**Yang membuat aplikasi ini pas untuk Langkah Juara:**

* Satu tempat untuk belajar. Siswa melihat jadwal, materi, dan tugas kelasnya dari aplikasi yang sama.

* Masuk tanpa membuat kata sandi baru. Siswa bisa masuk dengan akun Google yang sudah dimiliki.

* Setiap peran langsung tiba di halamannya. Siswa ke Beranda, staf ke Dasbor Staf, tutor ke Dasbor Tutor, pemilik ke Dasbor Admin.

* Nilai tetap pribadi. Siswa hanya bisa membuka nilai miliknya sendiri, termasuk bila alamat halaman diubah.

* Presensi dan nilai tercatat di kelasnya, bukan di catatan pribadi tutor.

* Laporan tanpa menyalin. Rekap siswa aktif, kehadiran, dan jumlah kelas tersusun sendiri dari data.

**Yang tidak dibangun di v1:** pembayaran online, akun orang tua, video pembelajaran dan kuis otomatis, rapor PDF, notifikasi WhatsApp dan email, gaji tutor, dan aplikasi seluler. Detail di Bab 9\.

# **2\. Pengguna & Peran**

## **2.1 Empat pemegang akun**

Aplikasi dipegang empat peran. Peran disimpan di profil setiap pengguna, bukan di akun login.

| Peran | Siapa | Tugas utama |
| :---- | :---- | :---- |
| **Siswa** | Siswa SMP dan SMA, misalnya Raka (kelas 12, Intensif UTBK) dan Salsa (kelas 8, Matematika SMP) | Mendaftar program, mengikuti kelas, membuka materi, mengumpulkan tugas, melihat nilainya |
| **Staf** | Staf administrasi, Kak Fira | Memeriksa pendaftaran, menyusun kelas dan jadwal, melihat data siswa |
| **Tutor** | Pengajar, misalnya Kak Dimas dan Kak Nadia | Membuat pertemuan, mengisi presensi, membuat tugas, dan memberi nilai di kelas yang ia ajar |
| **Super Admin** | Pemilik bimbel, Pak Arif | Membuka semua halaman peran lain, ditambah mengelola pengguna, program, dan laporan |

Alur kerjanya: siswa mengajukan pendaftaran ke satu program. Staf mengecek pembayaran di luar aplikasi, menyetujui pendaftaran, lalu memasukkan siswa ke kelas. Tutor membuat pertemuan, mengisi presensi, dan memberi tugas. Siswa mengumpulkan tugas dan melihat nilainya. Pemilik membaca laporan setiap bulan.

## **2.2 Pengunjung dan cara mendapat peran**

Pengunjung adalah siapa pun yang membuka belajar.langkahjuara.id tetapi belum masuk. Pengunjung hanya bisa membuka halaman Daftar dan Masuk.

* Setiap akun baru, baik lewat email maupun Google, otomatis berperan **siswa**.

* Peran **staf**, **tutor**, dan **super\_admin** hanya bisa diberikan Super Admin lewat menu Kelola Pengguna.

* Akun Super Admin pertama: Pak Arif mendaftar lewat /daftar seperti biasa, lalu pengembang mengubah field role dokumennya menjadi super\_admin lewat konsol Firebase, atau meminta agen AI lewat Firebase MCP (cari uid berdasarkan email, ubah role). Kata sandi tidak pernah disimpan di Firestore.

## **2.3 Hak akses per modul**

| Modul | Siswa | Staf | Tutor | Super Admin |
| :---- | :---- | :---- | :---- | :---- |
| Beranda, Kelas Saya, Tugas | Penuh, hanya miliknya | Tidak tampil | Tidak tampil | Penuh |
| Program | Lihat, ajukan pendaftaran | Tidak tampil | Tidak tampil | Penuh |
| Profil | Ubah nama dan HP orang tua | Ubah nama | Ubah nama | Ubah nama |
| Dasbor Staf, Pendaftaran, Kelola Kelas | Tidak tampil | Penuh | Tidak tampil | Penuh |
| Data Siswa | Tidak tampil | Lihat | Tidak tampil | Lihat |
| Dasbor Tutor | Tidak tampil | Tidak tampil | Penuh | Penuh |
| Kelas yang Diajar, Tugas dan Nilai | Tidak tampil | Tidak tampil | Penuh, hanya kelas yang ia ajar | Penuh |
| Dasbor Admin, Program (Admin), Laporan | Tidak tampil | Tidak tampil | Tidak tampil | Penuh |
| Kelola Pengguna | Tidak tampil | Tidak tampil | Tidak tampil | Penuh, termasuk mengubah peran |

## **2.4 Yang tidak boleh dilihat tiap peran**

| Data | Siswa | Staf | Tutor | Super Admin |
| :---- | :---- | :---- | :---- | :---- |
| Kelas, tugas, dan nilai miliknya | Lihat | Tidak berlaku | Tidak berlaku | Lihat |
| Nilai dan jawaban siswa lain | **Tidak tampil** | **Tidak tampil** | Lihat, hanya kelas yang ia ajar | Lihat |
| Kelas yang diajar tutor lain | **Tidak tampil** | Lihat | **Tidak tampil** | Lihat |
| Memberi atau mengubah nilai | **Tidak bisa** | **Tidak bisa** | Hanya kelas yang ia ajar | Bisa |
| Field role siapa pun | Lihat miliknya, tidak bisa diubah | Tidak bisa diubah | Lihat miliknya, tidak bisa diubah | Lihat dan ubah |

Menu yang tidak boleh dibuka tidak ditampilkan sama sekali. Selain itu, halamannya tetap menolak bila alamatnya diketik langsung, dan datanya tetap ditolak oleh Security Rules bila diminta lewat konsol peramban.

# **3\. Lingkup Produk**

Aplikasi web. Buka lewat peramban, tanpa instal dari Play Store.

## **3.1 Peta modul**

Siswa  
  Beranda  
  Program  
  Kelas Saya ▼  
    Daftar Kelas · Rincian Kelas  
  Tugas  
  Profil

Staf  
  Dasbor Staf  
  Pendaftaran  
  Kelola Kelas ▼  
    Daftar Kelas · Rincian Kelas  
  Data Siswa

Tutor  
  Dasbor Tutor  
  Kelas yang Diajar  
  Tugas dan Nilai

Super Admin (semua menu Siswa, Staf, dan Tutor, ditambah)  
  Dasbor Admin  
  Kelola Pengguna  
  Program  
  Laporan

Modul tanpa panah \= menu tunggal. Modul dengan panah \= bisa buka-tutup. Profil tersedia untuk semua peran.

## **3.2 Batas fitur v1**

| Termasuk v1 | Tidak termasuk v1 |
| :---- | :---- |
| Daftar dan masuk dengan email atau Google, empat peran, pendaftaran program dengan status, penyusunan kelas, pertemuan dengan tautan materi, presensi, tugas dengan batas waktu, nilai dan komentar, kelola pengguna dan program, laporan bulanan | Pembayaran online, akun orang tua, video pembelajaran, kuis otomatis, rapor PDF, notifikasi WhatsApp dan email, gaji tutor, aplikasi seluler |

# **4\. Kebutuhan Fungsional**

Bagian ini menjelaskan setiap modul dari sudut pandang pengguna: siapa menekan apa, mengisi apa, dan sistem merespons apa.

## **4.0 Ringkasan modul**

| Modul | Peran | Tujuan |
| :---- | :---- | :---- |
| Daftar dan Masuk | Semua | Pintu masuk dengan email atau Google, lalu diarahkan sesuai peran |
| Beranda | Siswa | Jadwal kelas berikutnya dan tugas yang belum dikumpulkan |
| Program | Siswa | Melihat program aktif dan mengajukan pendaftaran |
| Kelas Saya | Siswa | Jadwal, pertemuan, materi, dan tugas kelas yang diikuti |
| Tugas | Siswa | Mengumpulkan tautan jawaban dan melihat nilai |
| Profil | Semua | Melihat data diri dan memperbarui nama |
| Dasbor Staf | Staf | Pendaftaran menunggu dan kelas hari ini |
| Pendaftaran | Staf | Menyetujui atau menolak pendaftaran |
| Kelola Kelas | Staf | Membuat kelas, memilih tutor, memasukkan siswa, mengatur jadwal |
| Data Siswa | Staf | Daftar siswa dan kontak orang tua, hanya dibaca |
| Dasbor Tutor | Tutor | Kelas yang diajar hari ini |
| Kelas yang Diajar | Tutor | Membuat pertemuan dan mengisi presensi |
| Tugas dan Nilai | Tutor | Membuat tugas, melihat pengumpulan, memberi nilai |
| Dasbor Admin | Super Admin | Ringkasan bimbel untuk pemilik |
| Kelola Pengguna | Super Admin | Mengubah peran dan menonaktifkan akun |
| Program (Admin) | Super Admin | Mengatur daftar program |
| Laporan | Super Admin | Rekap siswa aktif, kehadiran, dan jumlah kelas per tutor |

## **4.1 Daftar dan Masuk**

Dua halaman publik, keduanya dengan tombol **Masuk dengan Google**.

**Langkah siswa baru mendaftar:**

1. Salsa membuka belajar.langkahjuara.id/daftar.

2. Mengisi Nama\*, Email\*, dan Kata sandi\*, lalu mengklik Daftar. Atau mengklik Masuk dengan Google.

3. Sistem membuat akun dan profil berperan siswa, lalu membawa Salsa ke /beranda.

**Langkah masuk:**

1. Pengguna membuka /masuk, mengisi email dan kata sandi, atau mengklik Masuk dengan Google.

2. Sistem membaca peran dari profil. Siswa diarahkan ke /beranda, staf ke /staf, tutor ke /tutor, dan super\_admin ke /admin.

**Perilaku otomatis:** pengguna Google yang masuk pertama kali tidak melewati halaman Daftar, jadi profilnya dibuat saat itu juga. Profil yang sudah ada tidak boleh tertimpa saat pengguna masuk lagi. Pengguna tetap masuk walau halaman dimuat ulang. Pengguna yang sudah masuk lalu membuka /masuk atau /daftar langsung diarahkan ke halamannya. Akun yang dinonaktifkan ditolak dengan pesan “Akun Anda dinonaktifkan. Hubungi staf Langkah Juara”.

**Validasi:** email wajib dan unik, kata sandi minimal 6 karakter.

**Batasan v1:** lupa kata sandi tidak termasuk.

## **4.2 Beranda**

Tujuan: siswa tahu jadwal berikutnya dan tugas yang harus dikerjakan tanpa membuka menu lain.

Isi kartu di /beranda:

* **Kelas berikutnya:** nama kelas, hari, jam, dan tempat. Contoh: “Intensif UTBK A, Selasa 16.00, Ruang 2”.

* **Tugas belum dikumpulkan:** tugas miliknya yang belum dikumpulkan, diurutkan dari batas waktu terdekat.

* Bila belum punya kelas: “Anda belum terdaftar di kelas mana pun” dengan tombol **Lihat Program**.

**Perilaku otomatis:** isi ditarik dari kelas yang memuat uid siswa di siswaIds. Mengklik kartu melompat ke rincian kelas atau halaman tugasnya.

## **4.3 Program**

**Tampilan:** di /program, kartu per program aktif berisi Nama, Jenjang, Jumlah Pertemuan, dan Harga. Di bawahnya daftar Pendaftaran Saya dengan status sebagai pil berwarna: Menunggu, Aktif, Ditolak.

**Langkah siswa mendaftar program:**

1. Raka membuka /program dan mengklik **Ajukan Pendaftaran** pada kartu Intensif UTBK.

2. Sistem menyimpan pendaftaran berstatus menunggu dan menampilkan “Pendaftaran terkirim. Selesaikan pembayaran di kantor Langkah Juara”.

3. Setelah Kak Fira menyetujui, status berubah menjadi Aktif. Bila ditolak, catatan staf tampil di bawah statusnya.

**Validasi:** siswa tidak bisa mengajukan program yang sama bila pendaftarannya masih menunggu atau aktif. Pendaftaran yang ditolak boleh diajukan ulang. Siswa tidak bisa mengubah status pendaftarannya sendiri.

## **4.4 Kelas Saya**

**Tampilan daftar:** di /kelas, kartu per kelas yang diikuti siswa berisi Nama Kelas, Tutor, Hari, Jam, dan Tempat.

**Tampilan rincian:** di /kelas/ diikuti ID kelas. Berisi jadwal dan tempat atau tautan daring, daftar Pertemuan (Tanggal, Topik, tautan Materi), dan daftar Tugas (Judul, Batas Waktu, Status).

**Langkah siswa membuka materi:**

1. Salsa membuka Kelas Saya → mengklik kelas Matematika SMP B.

2. Melihat pertemuan terakhir bertopik “Persamaan Linear Satu Variabel” dan mengklik tautan Materi.

**Perilaku otomatis:** rincian hanya terbuka untuk siswa di kelas itu, tutornya, staf, dan Super Admin. Bila ID di alamat diganti dengan ID kelas lain, siswa melihat “Kelas tidak ditemukan”.

## **4.5 Tugas**

**Tampilan:** di /tugas/ diikuti ID tugas. Berisi Judul, Deskripsi, Batas Waktu, Status, kolom Tautan Jawaban, lalu Nilai dan Komentar bila sudah dinilai.

**Langkah siswa mengumpulkan tugas:**

1. Raka membuka tugas “Latihan Penalaran Umum 3” dari Beranda.

2. Menempel tautan Google Drive jawabannya di kolom Tautan Jawaban\* → Kumpulkan.

3. Status berubah menjadi Dikumpulkan. Setelah Kak Dimas menilai, Raka melihat Nilai 85 beserta komentarnya.

**Perilaku otomatis:** status dihitung dari data. **Belum dikumpulkan:** belum ada pengumpulan dan batas waktu belum lewat. **Dikumpulkan:** tautan terkirim, belum dinilai. **Dinilai:** tutor sudah mengisi nilai. **Terlambat:** batas waktu lewat tanpa pengumpulan.

**Validasi:** tautan wajib diawali https\://. Pengumpulan hanya bisa dikirim sebelum batas waktu, dan tautan bisa diganti selama batas waktu belum lewat dan belum dinilai. Siswa tidak bisa mengisi nilai atau komentar. Siswa di luar kelas tugas itu melihat “Tugas tidak ditemukan”.

## **4.6 Profil**

Di /profil. Menampilkan nama, email, nomor HP, nomor HP orang tua, dan peran. Siswa bisa mengubah nama, nomor HP, dan nomor HP orang tua. Peran lain bisa mengubah nama dan nomor HP. Email dan peran tidak bisa diubah dari halaman ini.

**Validasi:** nomor HP dan nomor HP orang tua hanya angka, 10 sampai 13 digit, diawali 08\.

## **4.7 Dasbor Staf**

Halaman yang langsung terlihat setelah staf masuk, di /staf. Isi kartu:

* **Pendaftaran menunggu:** jumlah pendaftaran berstatus menunggu.

* **Kelas hari ini:** kelas yang jadwalnya jatuh hari ini, dengan jam, tutor, dan tempat.

**Langkah staf memeriksa pagi hari:**

1. Kak Fira masuk → Dasbor Staf terbuka.

2. Melihat Pendaftaran menunggu: 4 → mengklik angka 4 → masuk Pendaftaran dengan saringan Menunggu.

## **4.8 Pendaftaran**

**Tampilan:** di /staf/pendaftaran, tabel dengan kolom Nama Siswa, Program, Tanggal, Status. Saringan status: Semua, Menunggu, Aktif, Ditolak.

**Langkah staf memutuskan:**

1. Raka membayar di kantor. Kak Fira mencocokkan bukti bayar di luar aplikasi.

2. Kak Fira membuka Pendaftaran, memilih saringan Menunggu, lalu mengklik pendaftaran Raka.

3. Mengklik **Setujui**. Status menjadi aktif dan baris keluar dari saringan Menunggu.

4. Untuk pendaftaran yang tidak dibayar, Kak Fira mengisi Catatan Staf\* lalu mengklik **Tolak**.

**Perilaku otomatis:** saringan ikut tersimpan di alamat, misalnya /staf/pendaftaran?status=menunggu. Bila tautannya dibagikan ke Pak Arif, ia melihat daftar yang sama.

**Validasi:** status hanya bernilai menunggu, aktif, atau ditolak. Catatan Staf wajib saat menolak.

## **4.9 Kelola Kelas**

**Tampilan daftar:** di /staf/kelas, tabel dengan kolom Nama Kelas, Program, Tutor, Hari, Jam, Jumlah Siswa, dan tombol **Buat Kelas**.

**Langkah staf membuat kelas dan memasukkan siswa:**

1. Kak Fira mengklik Buat Kelas, mengisi Nama Kelas\* “Intensif UTBK A”, memilih Program\*, Tutor\* (dari pengguna berperan tutor), Hari\*, Jam\*, dan Tempat\* (ruang atau tautan daring) → Simpan.

2. Rincian kelas terbuka di /staf/kelas/ diikuti ID kelas.

3. Mengklik **Tambah Siswa**. Muncul siswa yang pendaftarannya aktif untuk program itu.

4. Mencentang Raka → Simpan. Raka langsung melihat kelas ini di Kelas Saya.

**Validasi:** hanya siswa dengan pendaftaran aktif untuk program kelas itu yang bisa dimasukkan. Staf tidak bisa membuat pertemuan, mengisi presensi, atau memberi nilai.

**Batasan v1:** jadwal tidak diperiksa bentrok antar kelas atau antar ruang.

## **4.10 Data Siswa**

**Tampilan:** di /staf/siswa, tabel dengan kolom Nama, Email, Nomor HP Orang Tua, Program, dan kolom pencarian nama. Program diambil dari pendaftaran berstatus aktif.

Kak Fira memakai halaman ini untuk mencari kontak orang tua, misalnya saat Salsa dua kali tidak hadir.

**Validasi:** halaman ini hanya untuk membaca. Staf tidak bisa melihat atau mengubah nilai.

## **4.11 Dasbor Tutor**

Halaman yang langsung terlihat setelah tutor masuk, di /tutor. Isi kartu:

* **Kelas hari ini:** kelas yang ia ajar dan jadwalnya jatuh hari ini.

* **Semua kelas saya:** daftar semua kelas yang ia ajar.

**Perilaku otomatis:** hanya kelas dengan tutorId sama dengan uid tutor yang masuk yang tampil.

## **4.12 Kelas yang Diajar**

**Tampilan:** di /tutor/kelas/ diikuti ID kelas. Berisi daftar siswa, pertemuan, dan tugas, dengan tombol **Buat Pertemuan** dan **Buat Tugas**.

**Langkah tutor membuat pertemuan dan mengisi presensi:**

1. Kak Nadia membuka kelas Matematika SMP B dari Dasbor Tutor.

2. Mengklik Buat Pertemuan, mengisi Tanggal\*, Topik\*, dan Tautan Materi → Simpan.

3. Mencentang siswa yang hadir → Simpan Presensi.

4. Salsa melihat pertemuan baru beserta tautan materinya di Kelas Saya.

**Validasi:** tautan materi bila diisi wajib diawali https\://. Bila Kak Nadia mengganti ID di alamat dengan kelas Kak Dimas, tampil Akses Ditolak.

## **4.13 Tugas dan Nilai**

**Langkah tutor membuat tugas:**

1. Kak Dimas membuka kelas Intensif UTBK A → Buat Tugas.

2. Mengisi Judul\*, Deskripsi\*, dan Batas Waktu\* → Simpan. Tugas muncul di Beranda setiap siswa di kelas itu.

**Tampilan pengumpulan:** di /tutor/tugas/ diikuti ID tugas, tabel dengan kolom Nama Siswa, Status, Waktu Kumpul, Tautan, Nilai, Komentar.

**Langkah tutor memberi nilai:**

1. Kak Dimas membuka tautan jawaban Raka dan memeriksanya.

2. Mengisi Nilai\* 85 dan Komentar → Simpan. Status Raka berubah menjadi Dinilai.

**Validasi:** nilai bilangan bulat 0 sampai 100\. Hanya tutor kelas itu dan Super Admin yang bisa mengisi nilai dan komentar.

## **4.14 Dasbor Admin**

Halaman yang langsung terlihat setelah Super Admin masuk, di /admin. Isi kartu:

* **Siswa aktif:** jumlah siswa dengan minimal satu pendaftaran aktif.

* **Pendaftaran bulan ini:** jumlah pendaftaran bulan berjalan.

* **Rata-rata kehadiran:** persentase kehadiran semua pertemuan bulan berjalan.

**Perilaku otomatis:** semua angka dihitung dari data, tanpa masukan manual. Mengklik kartu membuka Laporan. Super Admin juga melihat semua menu Staf, Tutor, dan Siswa.

## **4.15 Kelola Pengguna**

**Tampilan:** di /admin/pengguna, tabel dengan kolom Nama, Email, Peran, Aktif, dengan pencarian nama dan saringan peran.

**Langkah Super Admin memberi peran tutor:**

1. Kak Nadia mendaftar lewat /daftar dan otomatis berperan siswa.

2. Pak Arif membuka Kelola Pengguna → mengklik nama Kak Nadia. Rincian terbuka di /admin/pengguna/ diikuti ID pengguna.

3. Mengubah Peran menjadi tutor → Simpan. Saat Kak Nadia masuk lagi, ia diarahkan ke /tutor.

Untuk tutor yang berhenti, Pak Arif mematikan Aktif → Simpan. Akun itu tidak bisa masuk lagi, tetapi datanya tetap tersimpan.

**Validasi:** peran hanya bernilai siswa, staf, tutor, atau super\_admin. Super Admin tidak bisa menurunkan peran atau menonaktifkan akunnya sendiri.

## **4.16 Program (Admin)**

**Tampilan:** di /admin/program, tabel dengan kolom Nama, Jenjang, Jumlah Pertemuan, Harga, Aktif, dan tombol **Tambah Program**.

**Langkah Super Admin menambah program:**

1. Pak Arif mengklik Tambah Program.

2. Mengisi Nama\*, memilih Jenjang\* SMP atau SMA, mengisi Jumlah Pertemuan\* dan Harga\*, menyalakan Aktif → Simpan. Program langsung tampil di /program.

**Validasi:** jumlah pertemuan dan harga berupa angka lebih dari 0\. Program yang sudah dipakai kelas tidak dihapus, cukup dimatikan Aktif-nya.

## **4.17 Laporan**

**Tampilan:** di /admin/laporan, pilihan bulan, lalu tiga tabel: siswa aktif per program, kehadiran per kelas (rata-rata persentase hadir), dan jumlah kelas per tutor (jumlah kelas dan jumlah pertemuan bulan itu).

**Langkah pemilik menyusun rekap bulanan:**

1. Pak Arif membuka Laporan dan memilih bulan Oktober.

2. Memuat ulang halaman. Bulan Oktober tetap terpilih karena tersimpan di alamat.

**Perilaku otomatis:** angka dihitung dari data pendaftaran, kelas, dan pertemuan, tidak disimpan terpisah.

**Batasan v1:** ekspor Excel dan PDF tidak termasuk.

# **5\. Identitas Visual & Prinsip Antarmuka**

Tampilan bersih dengan menu samping, panel putih, dan tema terang. Mengikuti warna Langkah Juara.

## **5.1 Warna**

| Nama | Kode | Pakai untuk |
| :---- | :---- | :---- |
| Oranye Juara | \#EA580C | Tombol utama, menu aktif, bilah atas |
| Latar aplikasi | \#F7F5F2 | Latar di belakang panel |
| Panel | \#FFFFFF | Panel isi halaman |
| Teks | \#1F2937 | Teks utama |
| Teks redup | \#5A6B78 | Keterangan dan label |

## **5.2 Warna status**

| Status | Kode |
| :---- | :---- |
| Menunggu, Dikumpulkan | \#F59E0B |
| Aktif, Dinilai | \#15A66A |
| Ditolak, Terlambat | \#E53935 |
| Belum dikumpulkan | \#6B7280 |

## **5.3 Tipografi**

* Font UI: Inter (400, 500, 600, 700). Fallback: system-ui.

* Jam, tanggal, nilai, dan harga memakai tabular-nums agar kolom rata.

## **5.4 Prinsip antarmuka**

* Menu yang tidak boleh dibuka suatu peran tidak ditampilkan. Halamannya tetap dijaga bila alamatnya diketik langsung.

* Halaman yang menolak pengguna menjelaskan alasannya dan memberi tombol kembali, tanpa kode teknis.

* Setiap halaman yang mengambil data menampilkan empat keadaan: memuat, berhasil, kosong, dan gagal dengan tombol Coba lagi.

# **6\. Kebutuhan Non-Fungsional**

## **6.1 Akses**

* Masuk dengan email dan kata sandi, atau akun Google.

* Bahasa antarmuka Indonesia.

* Pengguna tetap masuk saat halaman dimuat ulang. Selama keadaan masuk dan peran masih dibaca, aplikasi menampilkan indikator memuat dan tidak mengarahkan pengguna ke mana pun.

## **6.2 Penjagaan halaman dan data**

Dua lapis, masing-masing untuk jalur yang berbeda.

| Lapis | Menjaga | Cara |
| :---- | :---- | :---- |
| Route guard | Halaman | Pemeriksaan sebelum halaman tampil. Belum masuk diarahkan ke /masuk; peran yang tidak berhak melihat Akses Ditolak; super\_admin boleh membuka semua halaman |
| Security Rules | Data di Firestore | Setiap permintaan diperiksa: pemilik lewat siswaId, tutor lewat tutorId di kelas, anggota kelas lewat siswaIds, peran lewat profil di koleksi users |

Security Rules juga mengunci field role dan aktif (hanya Super Admin), status pendaftaran (hanya staf dan Super Admin), serta nilai dan komentar (hanya tutor kelas itu dan Super Admin), termasuk lewat konsol peramban.

## **6.3 Alamat halaman**

* Setiap halaman bisa dibuka langsung dari alamatnya dan tetap tampil saat dimuat ulang.

* Alamat yang tidak dikenal menampilkan halaman 404 dengan tombol kembali.

* Pengguna yang diarahkan ke halaman Masuk dikembalikan ke halaman tujuannya setelah berhasil masuk.

# **7\. Teknologi yang Digunakan**

| Lapisan | Teknologi | Catatan |
| :---- | :---- | :---- |
| Aplikasi web | Next.js (App Router) | Dibangun dengan agen AI di Antigravity. Setiap halaman menjadi satu folder di app/ |
| Masuk | Firebase Authentication | Email dan kata sandi, serta akun Google |
| Basis data | Cloud Firestore | Tujuh koleksi, lihat 7.1 |
| Penjagaan data | Firestore Security Rules | Menegakkan kepemilikan dan peran |
| Hosting | Netlify | Alamat Netlify didaftarkan di Authorized domains Firebase agar masuk dengan Google berjalan |

## **7.1 Struktur data Firestore**

Nama koleksi dan field mengikuti tabel ini, bukan nama buatan agen AI.

| Koleksi | Field | Tipe | Keterangan |
| :---- | :---- | :---- | :---- |
| users | ID dokumen | string | Sama dengan uid akun Firebase Authentication |
|  | nama, email | string |  |
|  | noHp, noHpOrangTua | string | Boleh kosong |
|  | role | string | siswa, staf, tutor, atau super\_admin |
|  | aktif | boolean | true saat dibuat |
|  | dibuatPada | timestamp |  |
| program | nama | string |  |
|  | jenjang | string | SMP atau SMA |
|  | jumlahPertemuan, harga | number | Harga dalam rupiah |
|  | aktif | boolean | Hanya program aktif yang tampil di siswa |
| pendaftaran | siswaId | string | uid siswa |
|  | programId | string | ID dokumen program |
|  | status | string | menunggu, aktif, atau ditolak |
|  | catatanStaf | string | Diisi staf saat menolak |
|  | dibuatPada | timestamp |  |
| kelas | nama | string |  |
|  | programId | string | ID dokumen program |
|  | tutorId | string | uid tutor pengajar |
|  | siswaIds | array of string | uid siswa di kelas ini |
|  | hari, jam, tempat | string | Contoh Selasa, 16.00, Ruang 2 |
| pertemuan | kelasId | string | ID dokumen kelas |
|  | tanggal | string | Format 2026-10-07 |
|  | topik, materiUrl | string | materiUrl boleh kosong |
|  | hadirIds | array of string | uid siswa yang hadir |
| tugas | kelasId | string | ID dokumen kelas |
|  | judul, deskripsi | string |  |
|  | batasWaktu | timestamp |  |
| pengumpulan | tugasId, siswaId | string | Tugas dan uid siswa pengumpul |
|  | kelasId | string | Kelas asal tugas, memudahkan pemeriksaan tutor pengampu |
|  | tautan | string | Tautan jawaban |
|  | dikumpulkanPada | timestamp |  |
|  | nilai | number | Kosong sampai dinilai, 0 sampai 100 |
|  | komentar | string | Diisi tutor |

Status tugas siswa tidak disimpan. Status dihitung dari pengumpulan dan batasWaktu.

# **8\. Pengujian**

Pengujian penerimaan dilakukan per modul mengikuti alur pada Bab 4: mendaftar dengan email dan Google, masuk sebagai keempat peran, mengajukan dan memutuskan pendaftaran, membuat kelas dan memasukkan siswa, membuat pertemuan dan mengisi presensi, membuat dan mengumpulkan tugas, memberi nilai, mengubah peran, menonaktifkan akun, mengelola program, dan membaca laporan.

Termasuk di dalamnya uji tembus: dengan akun siswa mengetik /staf dan /admin secara langsung, mengganti ID di /kelas/ dengan kelas yang tidak ia ikuti, membaca nilai siswa lain lewat konsol peramban, menaikkan peran sendiri, dan mengubah status pendaftarannya sendiri menjadi aktif; dengan akun tutor membuka kelas yang diajar tutor lain; dengan akun staf mengubah nilai lewat konsol peramban. Ketujuh percobaan harus ditolak.

# **9\. Batas Lingkup Pekerjaan**

| Tidak termasuk v1 | Alasan |
| :---- | :---- |
| Pembayaran online | Pembayaran masih dicek staf di kantor |
| Akun orang tua | Orang tua dihubungi lewat nomor HP yang tercatat |
| Video pembelajaran dan kuis otomatis | Materi cukup berupa tautan, tugas dinilai tutor |
| Rapor PDF | Nilai sudah terlihat di aplikasi |
| Notifikasi WhatsApp dan email | Jadwal, tugas, dan status sudah terlihat di aplikasi |
| Gaji tutor | Diurus terpisah oleh pemilik |
| Ekspor Excel dan PDF | Laporan cukup dibaca di layar |
| Aplikasi seluler | Hanya web, bisa dibuka dari peramban ponsel |

Setelah PRD disepakati, modul, peran, dan alur inti pada Bab 4 tidak diubah lagi. Perubahan tampilan masih dimungkinkan.

# **10\. Kamus Istilah**

| Istilah | Arti |
| :---- | :---- |
| Siswa | Peran awal setiap akun baru. Mendaftar program, mengikuti kelas, dan mengumpulkan tugas miliknya |
| Staf | Peran untuk staf administrasi. Memeriksa pendaftaran dan menyusun kelas |
| Tutor | Peran untuk pengajar. Mengelola pertemuan, presensi, tugas, dan nilai di kelas yang ia ajar |
| Super Admin | Peran untuk pemilik. Membuka semua halaman, ditambah mengelola pengguna, program, dan laporan |
| Pengunjung | Orang yang membuka portal tetapi belum masuk |
| Profil | Dokumen di koleksi users yang ID-nya sama dengan uid pengguna |
| Program | Paket belajar, misalnya Intensif UTBK atau Matematika SMP |
| Pendaftaran | Pengajuan siswa untuk ikut satu program, berstatus menunggu, aktif, atau ditolak |
| Kelas | Kelompok siswa dari satu program dengan satu tutor dan jadwal tetap |
| Pertemuan | Satu kali tatap muka di kelas, berisi tanggal, topik, materi, dan presensi |
| Pengumpulan | Tautan jawaban seorang siswa untuk satu tugas, beserta nilai dan komentar |
| Belum dikumpulkan, Dikumpulkan, Dinilai, Terlambat | Empat status tugas siswa |
| Route guard | Pemeriksaan sebelum halaman tampil yang memutuskan halaman dibuka atau ditolak |
| Security Rules | Aturan Firestore yang memeriksa setiap permintaan data |

