# NAZARITH CAPITAL V8.0 — FEATURE MATRIX (STANDALONE)

The application runs without Supabase or an external database.

## Native features
- Executive Dashboard and journal-derived performance metrics.
- Interactive equity and performance charts.
- Multi-account isolation within the current browser profile.
- Trade Journal with trade details and chart screenshot uploads.
- Analytics, performance reports, risk tools, and trading calendar.
- Strategy Lab, Research Vault, Market Watchlist, and Psychology Tracker.
- SMC Setup Lab, SMC Academy, candlestick learning visuals, and Entry Model Library.
- Advanced Rule Builder and Entry Simulator.
- JSON/CSV export and import through Data & Backup.

## Storage and external services
| Component | Standalone implementation | Limitation |
|---|---|---|
| Authentication | Local browser account records | Not server-side authentication |
| User/trade data | Browser Local Storage | No cross-device synchronization |
| Chart screenshots | Browser-local data | Included in local backup where supported |
| Backup | JSON/CSV export and import | User must store backup files safely |
| Hosting | Netlify static hosting | No backend required |
| Supabase | Not included or called | No Supabase configuration required |

## Important notes
- Data is isolated by local account within the browser. Logging in with the same email on another device creates no automatic sync.
- Browser storage can be cleared. Export backups regularly.
- SMC learning charts are illustrative educational OHLC visuals, not live or historical market feeds.
- Any market/news information manually entered by the user remains the user's responsibility to verify.
