# Nazarith Capital V8.0

## Included
- Original Nazarith Capital V3.0 interface and existing modules retained.
- Added SMC Academy with visual schematic lessons.
- Added Entry Model Library: Liquidity Sweep + MSS, FVG Retracement, Order Block Retest, OTE / Premium-Discount, Turtle Soup and Unicorn / Breaker + FVG.
- Added Advanced Rule Builder (hard and weighted soft rules).
- Added guided Entry Simulator (schematic training scenario).
- Added Supabase email/password authentication and cloud workspace snapshot sync.
- Added SQL table and Row Level Security policies.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. In `index.html`, replace `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_ANON_KEY` inside `NAZARITH_SUPABASE_CONFIG`.
4. Use only the Supabase anon/public key in browser code. NEVER expose the service_role key.
5. Configure Supabase Authentication URL Configuration with your Netlify site URL and allowed redirect URLs.
6. Deploy `index.html` to Netlify. Keep the SQL file as your setup reference.

## Important limitations
- The current cloud layer stores each user's workspace in one JSONB row. RLS scopes that row to `auth.uid()`. This preserves the V3 data model and account separation but is a migration-friendly snapshot design, not a normalized analytics schema.
- Existing V3 localStorage data is not automatically merged into a new cloud account. Export/backup legacy data before migrating it.
- SMC charts are schematic educational diagrams, not live or historical OHLC.
- A verified historical-data Backtest Lab, broker integration, live market feed, automated trade execution and AI analyst are not claimed as implemented.
- Metrics remain journal-derived and depend on accurate trade entries.
