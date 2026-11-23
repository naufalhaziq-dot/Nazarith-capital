# NAZARITH CAPITAL V8.0 — Institutional Trading Intelligence

> *“Do not build for the market of today. Build for the world that does not exist yet.”*  
> — **NAZARITH CAPITAL** | Founder & Creator: **Naufalhaziq Azfarimifdhal Agfi**

---

## Ringkasan Proyek

**Nazarith Capital V8.0** adalah platform manajemen trading institusional yang dirancang untuk trader profesional, prop firm funding candidates, dan quantitative analysts. Platform ini mengintegrasikan Trading Journal tingkat lanjut, Multi-Account Portfolio Management, Real-time Risk Intelligence, Quantitative Analytics, Backtest Lab dengan Simulasi Monte Carlo, Research Vault, Market Watchlist, Macro Event Planner, dan sinkronisasi Cloud berbasis Supabase (Auth, PostgreSQL, Row-Level Security, Storage).

Platform ini mempertahankan 100% identitas desain dark institutional yang prestisius serta seluruh data dan fitur dari versi V3.0 sebelumnya.

---

## Fitur Utama V8.0

1. **Advanced Portfolio Intelligence & Multi-Account:**
   - Pemisahan akun terisolasi: Prop Firm Challenge, Funded, Evaluation, dan Personal.
   - Total portfolio balance, aggregate realized P&L, dan capital concentration meter.
   - Interactive SVG Profit Bar Chart & Cumulative Equity Curve Trajectory dengan tab waktu (Daily, Weekly, Monthly, Yearly).
2. **Advanced Trading Journal:**
   - Input transaksi mendalam: Entry, Stop Loss, Take Profit, Lot Size, Risk %, R:R, Sesi (London, NY, Asia, Overlap), Asset Class, Setup Type, Pre/Post Emotion, Mistake Tags (FOMO, Revenge, Moved SL, Overleveraged), dan Notes.
   - Unggah hingga 3 screenshot chart per trade dengan kompresi Canvas otomatis dan lightbox viewer.
   - Toolbar filter multi-dimensi (hasil, arah, sesi, tag kesalahan, pencarian instan).
3. **Institutional Analytics & Heatmap:**
   - Win rate breakdown berdasarkan Pair, Session, Hari dalam seminggu, dan Strategi.
   - Expectancy per closed trade, Payoff ratio, dan Max consecutive streaks.
   - Monthly Performance Heatmap: matriks kalender tahun x bulan dengan pewarnaan gradien berbasis persentase return.
   - Underwater Drawdown Analysis Chart: visualisasi kedalaman drawdown dari peak historis.
4. **Backtest Lab & Monte Carlo Simulation:**
   - Resampling 1.000 iterasi acak berbasis histori transaksi aktual.
   - Proyeksi kurva ekuitas persentil: P5 (Worst Case), P50 (Median), dan P95 (Best Case).
   - Estimasi probabilitas kehancuran modal (Ruin Probability 50% Drawdown).
   - R-Multiple Distribution Histogram (-1R, 0R, 1R, 2R, 3R, 5R+).
   - Transparansi metodologi: membedakan simulasi histori jurnal dengan candle backtest OHLC.
5. **Risk Management Intelligence:**
   - Kalkulator position sizing multi-instrumen (Forex, Gold XAUUSD, Indices, Crypto) dengan estimasi pip value dan cash risk.
   - Risk Circuit Breakers: warning banner otomatis jika kerugian harian atau total drawdown mendekati/menembus batas toleransi.
   - Risk of Ruin Estimator (formula Ralph Vince & Perry Kaufman).
6. **Automated Trading Analyst:**
   - Deteksi algoritmik otomatis: setup paling profitabel, sesi paling konsisten, pair dengan expectancy tertinggi, dan total biaya kerugian akibat kesalahan psikologis.
   - Arsitektur proxy AI via Supabase Edge Function (`/functions/v1/ai-analyst`) untuk integrasi aman dengan Groq / OpenAI / Gemini tanpa mengekspos API key di frontend.
7. **SMC Setup Lab (Preserved & Elevated):**
   - Evaluasi 9 faktor konfluensi Smart Money Concepts (Bias HTF, Liquidity Sweep, MSS/CHOCH, Displacement, FVG, Order Block POI, Premium/Discount, Session, News).
   - Planned R:R, score 0-100, grading A-D, dan riwayat review persisten per akun.
8. **Research Vault & Playbook:**
   - Dokumentasi hipotesis pasar, SMC playbooks, kategori, dan pencarian instan.
9. **Market Watchlist:**
   - Pemantauan multi-instrumen, bias institusional (Bullish/Bearish/Neutral), key level, dan trading plan dengan indikator status feed yang transparan.
10. **Trading Calendar & Daily Review:**
    - Grid kalender bulanan interaktif dengan pewarnaan hari profit (hijau) dan loss (merah) serta rekapitulasi harian.
11. **Psychology Tracker:**
    - Distribusi emosi trader, meter kualitas eksekusi, dan refleksi harian (discipline score 1-10).
12. **Macro Event Planner:**
    - Register jadwal rilis berita ekonomi, restriksi trading 15 menit sebelum news, dan catatan rencana.
13. **Data & Backup Center:**
    - Ekspor JSON (termasuk foto) dan Ekspor CSV.
    - Impor JSON/CSV dengan validasi skema dan deteksi duplikat transaksi cerdas.
    - Cloud Backup Snapshot.
14. **Dual-Mode Cloud Infrastructure (Supabase):**
    - Berjalan instan dalam mode Local-First Offline (menggunakan browser storage) atau terhubung ke Supabase Cloud (Auth, PostgreSQL, Row-Level Security, Storage).
    - Auto-migrasi data V3.0 ke cloud saat login pertama kali.

---

## Struktur Direktori Proyek

```
nazarith-v8/
├── index.html                   # Single-Page Application Entry Point
├── README.md                    # Dokumentasi Proyek
├── assets/
│   ├── css/
│   │   ├── theme.css            # Variabel warna dark institutional, tipografi, keyframe animations
│   │   ├── layout.css           # Grid workspace, topbar, fixed sidebar, responsive layout
│   │   ├── components.css       # Cards, stats, tables, buttons, form controls, modals, toasts
│   │   └── modules.css          # Styling modul: Equity charts, Monte Carlo, Heatmap, SMC Lab, Calendar
│   └── js/
│       ├── config.js            # Default configuration, storage keys, feature flags
│       ├── supabase-client.js   # Supabase client SDK wrapper, Auth, DB CRUD, Storage
│       ├── storage.js           # Local-first storage adapter dengan isolasi akun
│       ├── calculations.js      # Pure mathematical engine (Win rate, Drawdown, Monte Carlo, Kelly)
│       ├── migration.js         # Auto-migration data V3.0 ke V8.0 dan sinkronisasi Supabase
│       ├── components/
│       │   └── ui.js            # UI Helper: Modals, Toasts, Formatters, Lightbox
│       ├── modules/
│       │   ├── accounts.js      # Multi-account management (Challenge, Funded, Personal)
│       │   ├── portfolio.js     # Executive dashboard & interactive equity curve
│       │   ├── journal.js       # Advanced trade journal, search filters, chart upload
│       │   ├── analytics.js     # Institutional analytics, heatmap, underwater chart
│       │   ├── backtest.js      # Backtest lab & 1,000 runs Monte Carlo engine
│       │   ├── risk.js          # Position size calculator, loss limits, risk of ruin
│       │   ├── analyst.js       # Trading analyst AI proxy & algorithmic edge discovery
│       │   ├── smclab.js        # SMC Setup Lab 9-factor confluence scoring
│       │   ├── strategy.js      # Strategy documentation & trading playbook
│       │   ├── research.js      # Research vault for market hypotheses
│       │   ├── watchlist.js     # Multi-instrument watchlist & key levels
│       │   ├── calendar.js      # Trading calendar & daily profit/loss grid
│       │   ├── psychology.js    # Psychology tracker & daily reflection log
│       │   ├── capital.js       # Capital allocation across accounts
│       │   ├── reports.js       # Comprehensive printable performance report
│       │   ├── events.js        # Macro event planner & pre-news restrictions
│       │   ├── backup.js        # Data & Backup Center (CSV/JSON export/import)
│       │   └── settings.js      # Settings, Supabase config, session management
│       └── app.js               # Main Router & Global Lifecycle Orchestrator
├── supabase/
│   ├── schema.sql               # Skema PostgreSQL lengkap untuk Supabase SQL Editor
│   ├── rls_policies.sql         # Kebijakan Row Level Security (RLS) & Storage policies
│   └── functions/
│       └── ai-analyst/
│           └── index.ts         # Supabase Edge Function (Server-side AI Proxy)
├── tests/
│   ├── calculations.test.js     # Unit test suite (Node.js & Browser runnable)
│   └── test-runner.html         # Visual in-browser test runner
├── docs/
│   ├── SUPABASE_SETUP.md        # Panduan setup Supabase langkah demi langkah
│   ├── V3_TO_V8_MIGRATION_GUIDE.md # Panduan migrasi data pengguna V3 ke V8
│   ├── DEPLOYMENT_NETLIFY.md    # Panduan deployment ke Netlify / Vercel
│   ├── FEATURE_MATRIX.md        # Matriks fitur aktif vs integrasi eksternal
│   └── TEST_REPORT.md           # Laporan pengujian ke-16 aspek fungsional
└── v3-backup/
    └── index.v3.html            # Backup source code asli V3.0
```

---

## Cara Menjalankan Secara Lokal

1. **Buka Langsung di Browser:**
   - Cukup klik dua kali (double click) file `index.html` pada browser modern apa pun (Chrome, Edge, Firefox, Brave).
   - Platform akan langsung aktif dalam mode **Local-First Offline** dengan penyimpanan lokal yang aman.
2. **Jalankan via Local HTTP Server (Opsional):**
   ```bash
   npx serve .
   ```
   Buka `http://localhost:3000` di browser Anda.

---

## Menjalankan Unit Test

Untuk memverifikasi keakuratan matematis seluruh formula trading:

- **Via Terminal (Node.js):**
  ```bash
  node -e "const Tests = require('./tests/calculations.test.js'); const results = Tests.runAllTests(); console.log('TOTAL PASSED: ' + results.filter(r => r.passed).length + ' / ' + results.length);"
  ```
- **Via Browser:**
  Buka file `tests/test-runner.html` di browser Anda untuk melihat laporan pengujian visual interaktif.

---

## Deployment ke Netlify

Proyek ini siap di-deploy secara instan:
1. Masuk ke dashboard Netlify.
2. Seret (*drag and drop*) folder `nazarith-v8` ke area deploy Netlify.
3. Website akan langsung aktif di internet dalam hitungan detik.
4. Baca detail selengkapnya di [docs/DEPLOYMENT_NETLIFY.md](docs/DEPLOYMENT_NETLIFY.md).

---

## Dokumentasi Pendukung
- [Panduan Setup Supabase Cloud](docs/SUPABASE_SETUP.md)
- [Panduan Migrasi Data V3.0 ke V8.0](docs/V3_TO_V8_MIGRATION_GUIDE.md)
- [Panduan Deployment Netlify](docs/DEPLOYMENT_NETLIFY.md)
- [Matriks Fitur & Integrasi Eksternal](docs/FEATURE_MATRIX.md)
- [Laporan Pengujian Lengkap (16 Poin Validasi)](docs/TEST_REPORT.md)
