# NAZARITH CAPITAL V8.0 — DAFTAR FITUR & MATRIKS INTEGRASI EKSTERNAL

Dokumen ini memetakan secara transparan modul dan fitur yang **berfungsi penuh secara bawaan (*native/out-of-the-box*)** dibandingkan fitur yang **memerlukan konfigurasi API eksternal**.

---

## 1. Fitur yang Berfungsi Penuh (100% Native & Teruji)

| Modul | Status | Keterangan Fungsionalitas |
|---|---|---|
| **Executive Dashboard** | ✅ AKTIF | Real-time equity, realized net P&L, win rate closed, profit factor, max drawdown, period realization (daily, weekly, monthly, yearly). |
| **Interactive Equity Charts** | ✅ AKTIF | SVG bar chart histogram dan cumulative equity line trajectory interaktif dengan tab horizon (Daily, Weekly, Monthly, Yearly). |
| **Multi-Account Isolation** | ✅ AKTIF | Prop firm categories (Challenge, Funded, Evaluation, Personal), alokasi modal, switching instan, isolasi total data per akun. |
| **Advanced Trade Journal** | ✅ AKTIF | Input lengkap (Entry, SL, TP, Lots, Risk %, R:R, Session, Market, Setup, Emotion pre/post, Mistake tags), multi-filter toolbar. |
| **Chart Verification Upload** | ✅ AKTIF | Unggah hingga 3 screenshot per transaksi dengan kompresi Canvas otomatis dan lightbox viewer. |
| **Institutional Analytics** | ✅ AKTIF | Win rate breakdown by Pair, Session, Day of Week, Strategy; Expectancy; Max consecutive streaks; Payoff ratio; Underwater drawdown chart. |
| **Monthly Performance Heatmap** | ✅ AKTIF | Matriks performa kalender tahun x bulan dengan pewarnaan gradien berbasis persentase return modal aktual. |
| **Backtest & Monte Carlo Lab** | ✅ AKTIF | Resampling 1.000 iterasi acak berbasis riwayat transaksi aktual; proyeksi persentil P5, P50, P95; probabilitas kehancuran modal (ruin). |
| **R-Multiple Distribution** | ✅ AKTIF | Histogram visual frekuensi realisasi R-multiple (-1R, 0R, 1R, 2R, 3R, 5R+). |
| **Risk Management Intelligence** | ✅ AKTIF | Kalkulator position sizing multi-instrumen (Forex, Gold, Index, Crypto) dengan estimasi pip value dan cash risk. |
| **Risk Circuit Breakers** | ✅ AKTIF | Warning banner otomatis jika kerugian harian mendekati atau menembus batas Daily Loss Limit atau Max Drawdown. |
| **Risk of Ruin Estimator** | ✅ AKTIF | Model probabilitas Ralph Vince & Perry Kaufman berbasis win rate aktual, payoff ratio, dan persentase risiko modal. |
| **Automated Trading Analyst** | ✅ AKTIF | Audit algoritmik mendeteksi setup paling profitabel, sesi paling konsisten, pair dengan expectancy tertinggi, dan total biaya kerugian akibat kesalahan psikologis (FOMO, Overleveraged). |
| **SMC Setup Lab** | ✅ AKTIF | Evaluasi 9 faktor konfluensi Smart Money Concepts, planned R:R, grading A-D, dan penyimpanan riwayat review. |
| **Strategy Lab** | ✅ AKTIF | Dokumentasi SOP model trading, timeframe, dan parameter konfluensi. |
| **Research Vault & Playbook** | ✅ AKTIF | Repositori hipotesis pasar, studi chart, kategori, dan pencarian instan. |
| **Market Watchlist** | ✅ AKTIF | Daftar pantau multi-instrumen, bias institusional (Bullish/Bearish/Neutral), key level, dan trading plan. |
| **Trading Calendar** | ✅ AKTIF | Grid kalender bulanan dengan pewarnaan visual hari profit (hijau) dan loss (merah) serta rekapitulasi harian. |
| **Psychology Tracker** | ✅ AKTIF | Distribusi emosi trader, meter kualitas eksekusi, dan refleksi harian (discipline score 1-10). |
| **Capital Allocation** | ✅ AKTIF | Konsolidasi seluruh akun prop firm dan personal, pelacakan ekuitas agregat, dan meter konsentrasi modal. |
| **Performance Reports** | ✅ AKTIF | Laporan kuantitatif konsolidasi siap cetak (Print / PDF) dengan metodologi institusional. |
| **Macro Event Planner** | ✅ AKTIF | Jadwal rilis berita ekonomi manual, aturan restriksi trading 15 menit sebelum news, dan catatan rencana. |
| **Data & Backup Center** | ✅ AKTIF | Ekspor JSON (termasuk foto), Ekspor CSV, Impor JSON/CSV dengan validasi skema dan deteksi duplikat transaksi. |
| **Dual-Mode Storage Engine** | ✅ AKTIF | Dapat berjalan offline via localStorage maupun tersinkronisasi ke Supabase Cloud. |

---

## 2. Fitur yang Mendukung Integrasi Eksternal (Optional / Plug-in)

Sesuai instruksi pada Master Prompt, platform Nazarith Capital **TIDAK PERNAH menampilkan data pasar palsu atau event simulasi palsu**. Fitur berikut telah disiapkan arsitekturnya dan siap dihubungkan saat API key eksternal diisi:

| Fitur Eksternal | Provider yang Didukung | Kebutuhan Konfigurasi | Status Bawaan (Saat Tanpa API Key) |
|---|---|---|---|
| **Cloud Synchronization & Multi-Device** | Supabase Cloud | Masukkan Supabase Project URL dan Anon Key di menu Settings. | Berjalan dalam **Local-First Offline Mode** menggunakan penyimpanan lokal browser yang aman. |
| **Cloud Chart Storage Bucket** | Supabase Storage (`trade-attachments`) | Bucket dibuat otomatis via skrip SQL Supabase. | Foto chart disimpan dalam format Base64 terkompresi di storage lokal. |
| **AI Institutional Trading Analyst** | Groq LLaMA-3.3 / OpenAI GPT-4o via Supabase Edge Function | Jalankan `supabase functions deploy ai-analyst` dan set API key di secrets server. | Sistem menggunakan **Engine Algoritmik Kuantitatif Bawaan** untuk menganalisis edge dan biaya kesalahan psikologis secara instan. |
| **Live WebSocket Quotes & Economic Calendar** | Finnhub / ForexFactory API | Masukkan Finnhub API Key di menu Settings. | Beroperasi dalam **Local Surveillance Mode** dengan banner status jujur (menampilkan key level dan jadwal manual trader). |
