# NAZARITH CAPITAL V8.0 — PANDUAN DEPLOYMENT KE NETLIFY

Nazarith Capital V8.0 dibangun dengan arsitektur **Zero-Build Vanilla ES Standards**. Artinya, proyek ini tidak memerlukan bundler yang rumit seperti Webpack/Vite untuk berjalan di production, sehingga dapat langsung di-deploy ke **Netlify**, **Vercel**, **GitHub Pages**, atau hosting statis lainnya dalam hitungan detik.

---

## Opsi 1: Deployment Drag-and-Drop ke Netlify (Paling Cepat — 1 Menit)

1. Masuk ke dashboard akun [Netlify](https://app.netlify.com).
2. Buka menu **Sites** → Tarik ke bawah ke bagian bertuliskan:  
   *"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"*.
3. Buka File Explorer di komputer Anda dan arahkan ke folder:  
   `C:\Users\USER\.gemini\antigravity\scratch\nazarith-v8`
4. Drag (seret) folder `nazarith-v8` tersebut ke browser Netlify.
5. Netlify akan langsung mengunggah file dan memberikan URL website aktif (contoh: `https://nazarith-capital.netlify.app`).

---

## Opsi 2: Deployment via Git Repository (GitHub / GitLab)

1. Inisialisasi Git di folder proyek:
   ```bash
   cd C:\Users\USER\.gemini\antigravity\scratch\nazarith-v8
   git init
   git add .
   git commit -m "feat: Nazarith Capital V8.0 Institutional Release"
   ```
2. Hubungkan ke repository GitHub Anda:
   ```bash
   git remote add origin https://github.com/USERNAME/nazarith-capital-v8.git
   git branch -M main
   git push -u origin main
   ```
3. Di dashboard Netlify, klik **Add new site** → **Import an existing project** → Pilih **GitHub**.
4. Pilih repository `nazarith-capital-v8`.
5. Pengaturan Build:
   - **Base directory**: Biarkan kosong
   - **Build command**: Biarkan kosong (tidak perlu build step)
   - **Publish directory**: `.` (root direktori)
6. Klik **Deploy site**.

---

## Opsi 3: Pengaturan Environment Variables di Netlify (Opsional)

Jika Anda ingin Supabase URL dan Anon Key terkonfigurasi otomatis untuk semua pengunjung:
1. Di Netlify, buka **Site configuration** → **Environment variables**.
2. Tambahkan variable:
   - `SUPABASE_URL`: URL project Supabase Anda
   - `SUPABASE_ANON_KEY`: Anon key public Supabase Anda
3. Trigger deploy ulang. Pengunjung tidak perlu lagi menginput URL secara manual di menu Settings!
