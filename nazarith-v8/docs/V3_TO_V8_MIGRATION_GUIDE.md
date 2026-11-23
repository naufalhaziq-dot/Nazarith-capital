# NAZARITH CAPITAL — PANDUAN MIGRASI DATA V3.0 KE V8.0

Dokumen ini menjelaskan bagaimana pengguna versi **V3.0** dapat berpindah ke **V8.0 Institutional** dengan aman, tanpa risiko kehilangan histori trading, jurnal, catatan SMC, atau foto chart.

---

## 1. Arsitektur Kompatibilitas Otomatis (Zero-Friction Migration)

Nazarith Capital V8.0 dirancang dengan layer kompatibilitas mundur (*backward-compatibility*) otomatis di dalam engine `storage.js` dan `migration.js`:

1. **Pendeteksian Storage Key V3.0:**
   Saat pertama kali membuka file `index.html` V8.0, sistem otomatis memindai kunci penyimpanan localStorage lama:
   - `nazareth_capital_v1_users`
   - `nazarith_capital_v1_users`
   - `NAZARITH_CAPITAL_users`
   - `nazareth_capital_v1_session`
2. **Normalisasi Skema Transaksi:**
   Setiap transaksi dari V3.0 otomatis diaudit dan dilengkapi dengan atribut institusional baru:
   - `trade_date` (dipetakan dari `date`)
   - `entry_price` (dipetakan dari `entry`)
   - `stop_loss` (dipetakan dari `stop`)
   - `take_profit` (dipetakan dari `target`)
   - `risk_percentage` (dipetakan dari `risk`)
   - `risk_reward` (dipetakan dari `rr`)
   - `mistake_tag` (default: `None` jika belum ada)
   - `emotion_before` & `emotion_after` (dipetakan dari `emotion`)
   - `session` (default: `London` jika kosong)
3. **Isolasi Akun Multi-Account:**
   Jika pada V3.0 Anda hanya memiliki akun tunggal, V8.0 otomatis mengonversinya menjadi akun terisolasi pertama bernama **"Main Institutional Account"** tanpa mengubah saldo atau histori transaksi Anda.

---

## 2. Cara Melakukan Migrasi di Browser Anda

### Metode 1: Migrasi Otomatis (Dalam Browser yang Sama)
Jika Anda membuka V8.0 pada browser yang sebelumnya sudah pernah digunakan untuk membuka V3.0:
1. Buka `index.html` V8.0 di browser Anda.
2. Jika sesi sebelumnya masih aktif, dashboard V8.0 akan langsung menampilkan seluruh transaksi dan akun Anda yang sudah dimigrasikan.
3. Jika muncul layar login, masukkan email dan password yang Anda gunakan di V3.0.
4. Anda akan melihat seluruh data transaksi, strategi, dan catatan Anda tetap utuh 100%.

### Metode 2: Migrasi Menggunakan File Cadangan JSON (Antar Perangkat / Browser Baru)
Jika Anda membuka V8.0 di komputer atau browser yang berbeda:
1. Buka V3.0 lama Anda → Buka menu **Data & Backup** → Klik **Export full JSON backup**. File bernama `nazarith-backup-YYYY-MM-DD.json` akan terunduh.
2. Buka V8.0 di browser baru Anda → Buat akun atau masuk ke workspace.
3. Buka menu **Data & Backup** → Di panel **Import & Restore Data**, klik **Select JSON Backup File**.
4. Pilih file JSON dari V3.0 yang tadi diunduh.
5. Modal validasi data V8.0 akan muncul dan menampilkan jumlah trade yang ditemukan serta status deteksi duplikat.
6. Klik **Append Unique** atau **Replace Entire Journal**. Seluruh transaksi akan langsung masuk ke jurnal V8.0.

---

## 3. Sinkronisasi Data Lokal ke Supabase Cloud

Setelah data V3.0 termigrasi di browser:
1. Buka menu **Settings** → Masukkan **Supabase URL** dan **Anon Key** Anda → Klik **Save & Connect Supabase**.
2. Buka menu **Data & Backup** → Klik tombol **☁ Sync to Supabase Cloud**.
3. Sistem akan otomatis mengunggah seluruh akun dan transaksi lokal Anda ke database PostgreSQL Supabase dengan deteksi duplikat cerdas.
4. Data Anda sekarang tersimpan aman di cloud dan dapat diakses dari perangkat mana pun!
