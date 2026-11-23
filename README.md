# Nazarith Capital V8.0 — Standalone Edition

## Included
- Existing Nazarith Capital V8.0 interface and local-first modules.
- SMC Academy with visual lessons and educational candlestick charts.
- Entry Model Library, Advanced Rule Builder, and Entry Simulator.
- Local email/password registration and login.
- Multi-account trading workspaces isolated by account.
- Trade journal, analytics, uploads, and JSON/CSV backup tools.

## Architecture
- Static frontend: HTML, CSS, and JavaScript.
- Authentication and data storage: browser Local Storage.
- Hosting: Netlify or any static hosting provider.
- No Supabase project, SDK, URL, anon key, SQL schema, or cloud connection is required.

## Deploy to Netlify
1. Upload this project folder to a GitHub repository, or drag the project folder into Netlify Drop.
2. For Git-based deployment, set the publish directory to the repository root and leave the build command empty.
3. Netlify serves `index.html` automatically.

## Important limitations
- Accounts and trading data are stored only in the current browser profile on the current device. The same email on another device does not synchronize data.
- Clearing browser data, using private browsing, or changing browser profiles may make local data unavailable. Export JSON backups regularly from **Data & Backup**.
- Local-only authentication is not equivalent to server-side authentication. Do not use it to protect highly sensitive information.
- SMC Academy charts are educational OHLC illustrations, not live market data.
- Journal metrics depend on the accuracy and completeness of manually entered trades.
