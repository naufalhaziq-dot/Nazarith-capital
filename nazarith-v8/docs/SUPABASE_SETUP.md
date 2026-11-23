# NAZARITH CAPITAL V8.0 — PANDUAN LENGKAP SETUP SUPABASE CLOUD

Dokumen ini memandu Anda dalam menyiapkan infrastruktur backend **Supabase** untuk sinkronisasi cloud, autentikasi multi-perangkat, dan penyimpanan screenshot chart pada platform **Nazarith Capital V8.0**.

---

## 1. Buat Proyek Baru di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan masuk ke dashboard akun Anda.
2. Klik tombol **New Project**.
3. Masukkan rincian proyek:
   - **Name**: `nazarith-capital-v8`
   - **Database Password**: Buat password yang kuat dan simpan di tempat aman.
   - **Region**: Pilih region terdekat dengan lokasi Anda (misalnya: *Singapore* untuk pengguna Asia Tenggara).
4. Klik **Create new project** dan tunggu proses provisioning database selesai (sekitar 1-2 menit).

---

## 2. Dapatkan API Credentials
1. Di sidebar dashboard Supabase, buka menu **Project Settings** (ikon roda gigi) → **API**.
2. Salin nilai berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **Project API keys** → `anon` `public` (contoh string JWT berawalan `eyJhbGci...`)

> [!CAUTION]
> **PERINGATAN KEAMANAN KRITIS:**
> **JANGAN PERNAH** memasukkan atau menyalin kunci `service_role` (secret) ke browser atau frontend! 
> Kunci `service_role` memiliki bypass terhadap seluruh Row-Level Security. Hanya gunakan kunci `anon` `public` pada frontend Nazarith Capital.

---

## 3. Eksekusi Skrip Database PostgreSQL & RLS

Platform Nazarith Capital V8.0 telah dilengkapi dengan file SQL siap pakai:

### Langkah A: Buat Tabel & Relasi
1. Di dashboard Supabase, buka menu **SQL Editor**.
2. Klik **New Query**.
3. Buka file [supabase/schema.sql](file:///C:/Users/USER/.gemini/antigravity/scratch/nazarith-v8/supabase/schema.sql), salin seluruh isinya, dan tempelkan ke SQL Editor.
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Pastikan muncul notifikasi **Success. No rows returned**.

### Langkah B: Pasang Kebijakan Row Level Security (RLS)
1. Buka kembali **SQL Editor** → **New Query**.
2. Buka file [supabase/rls_policies.sql](file:///C:/Users/USER/.gemini/antigravity/scratch/nazarith-v8/supabase/rls_policies.sql), salin seluruh isinya, dan tempelkan ke SQL Editor.
3. Klik tombol **Run**.
4. Semua 14 tabel kini terlindungi secara ketat: trader hanya dapat mengakses, mengubah, dan menghapus datanya sendiri berdasarkan `auth.uid() = user_id`.

---

## 4. Konfigurasi Storage Bucket (Screenshot Chart)

1. Di sidebar dashboard Supabase, buka menu **Storage**.
2. Periksa apakah bucket bernama `trade-attachments` sudah otomatis dibuat (skrip SQL pada langkah B telah mengeksekusi pembuatan bucket).
3. Jika belum muncul, klik **New Bucket**:
   - **Bucket name**: `trade-attachments`
   - **Public bucket**: Aktifkan (centang `Public bucket` agar URL foto chart dapat dirender di browser).
4. Klik **Save**.

---

## 5. Hubungkan Supabase ke Website Nazarith Capital V8.0

1. Buka website **Nazarith Capital V8.0** di browser.
2. Buka menu **Settings** (di sidebar kiri bawah).
3. Temukan panel **Cloud Infrastructure — Supabase Backend**.
4. Masukkan **Supabase Project URL** dan **Supabase Anon Key** yang Anda peroleh dari Langkah 2.
5. Klik **Save & Connect Supabase**.
6. Badge status akan berubah menjadi **● Connected to Supabase Cloud**.

Sekarang setiap transaksi, akun prop firm, setup SMC, dan catatan riset akan disinkronkan secara aman ke cloud PostgreSQL Anda!
