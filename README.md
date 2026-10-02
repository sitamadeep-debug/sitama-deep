# SITAMA-DEEP (SMK Negeri Wonosalam - GEMPITA 2026)

**Sistem Informasi Telaah Modul Ajar untuk Pembelajaran Mendalam (Deep Learning)**  
*Penggerak Standardisasi Perencanaan Pembelajaran dan Umpan Balik Guru*  
Inovasi Kepemimpinan Pembelajaran: **Sudarso, S.Pd.** (Kepala SMK Negeri Wonosalam, Kab. Jombang, Jawa Timur)

---

## 🌟 Fitur Utama

1. **4 Level Hak Akses / Tingkatan Akun**:
   - **Admin Sistem**: Manajemen akun, master data rombel/mapel, rubrik 47 indikator, audit log.
   - **Kepala Sekolah & Waka Kurikulum**: Dashboard eksekutif kepemimpinan, radar chart 6 dimensi, telaah interaktif 47 indikator (*live scoring* /188), tombol *quick-presets*, umpan balik, pengesahan modul.
   - **Guru Pengampu**: Form pengunggahan modul berbasis Deep Learning (*Mindful, Meaningful, Joyful*), lembar rincian skor per indikator, alur revisi bertingkat (v1 $\rightarrow$ v2).
   - **Tendik / Tata Usaha**: Buku kendali arsip kurikulum, verifikasi berkas fisik/rak, penerbitan kode registrasi resmi (`ARSIP-2025/...`), cetak tanda terima penyerahan berkas.
2. **47 Indikator Rubrik Baku Deep Learning**: Menghasilkan skor 0–188 dengan skala kelayakan (Sangat Layak, Layak, Layak Dengan Revisi, Perlu Revisi, Belum Layak).
3. **Dokumen Kedinasan Siap Cetak (Print-Ready)**:
   - Lembar Hasil Penelaahan Modul Ajar resmi Cabdin Jombang & SMKN Wonosalam.
   - Buku Kendali & Register Arsip Kurikulum Bagian Tata Usaha.
   - Tanda Terima Penyerahan Dokumen Fisik.
4. **Keamanan & Pemulihan Akun**:
   - Registrasi Mandiri Akun Baru (*New User*).
   - Pemulihan Sandi (*Forgot Password*) dengan simulasi OTP Webmail SMKN Wonosalam.
5. **Dukungan Bilingual**: Indonesia 🇮🇩 dan English 🇬🇧.

---

## 🚀 Panduan Deployment: GitHub $\rightarrow$ Supabase $\rightarrow$ Vercel

### 1. Push ke GitHub Repository
```bash
git init
git add .
git commit -m "feat: inisialisasi aplikasi SITAMA-DEEP GEMPITA 2026"
git branch -M main
git remote add origin https://github.com/USERNAME/sitama-deep.git
git push -u origin main
```

### 2. Setup Supabase (Cloud Database)
1. Buat proyek baru di [https://supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase.
3. Buka file `supabase-schema.sql` di proyek ini, salin seluruh kodenya, lalu klik **Run**.
   - Ini akan otomatis membuat semua tabel (`profiles`, `modules`, `reviews`, `tendik_verifications`, `notifications`, `audit_logs`) dan mengisi data awal (*seed data*).
4. Buat Storage Bucket untuk modul PDF:
   - Masuk ke menu **Storage** $\rightarrow$ **New Bucket** $\rightarrow$ beri nama: `modules` (set ke *Public*).
5. Ambil kredensial API:
   - Buka **Project Settings** $\rightarrow$ **API**.
   - Catat **Project URL** dan **anon public key**.

### 3. Hubungkan ke Vercel
1. Masuk ke [https://vercel.com](https://vercel.com).
2. Klik **Add New Project** $\rightarrow$ **Import Git Repository** (pilih repositori `sitama-deep` Anda dari GitHub).
3. Di bagian **Build and Output Settings**, biarkan default (karena aplikasi ini merupakan Single Page Application murni).
4. Klik **Deploy**! Aplikasi Anda langsung live di domain `https://sitama-deep.vercel.app`.

### 4. Aktivasi Koneksi Supabase di Aplikasi
Setelah aplikasi online di Vercel:
1. Buka aplikasi Anda di browser.
2. Klik badge **☁️ Supabase Cloud** di header atas.
3. Masukkan **Supabase URL** dan **Anon Key** yang Anda peroleh dari Supabase.
4. Klik **Simpan & Hubungkan**. Aplikasi kini tersinkronisasi penuh dengan cloud database Supabase!

---

## 💻 Akun Demo Lokal / Standby
- **Admin**: `admin` / `password123`
- **Kepala Sekolah**: `kepsek` / `password123`
- **Waka Kurikulum**: `waka_kurikulum` / `password123`
- **Guru ATP**: `guru_atp` / `password123`
- **Guru Kuliner**: `guru_kuliner` / `password123`
- **Tendik / Tata Usaha**: `tendik_tu` / `password123`

---
SITAMA-DEEP © 2026 SMK Negeri Wonosalam, Cabang Dinas Pendidikan Kabupaten Jombang, Jawa Timur.
