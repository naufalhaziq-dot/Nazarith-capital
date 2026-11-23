# Nazarith Capital Standalone — Verification Notes

## Static checks performed
- Removed the Supabase JavaScript SDK import from the deployable `index.html`.
- Removed the Supabase client initialization, authentication, database reads/writes, cloud sync timer, and cloud session restoration from the deployable page.
- Kept the existing local registration/login flow and browser-based account storage.
- Updated the duplicate `index (1).html` to match `index.html`.
- Removed Supabase-only SQL/setup/client/migration files from this standalone package.
- Updated deployment and feature documentation for local-only storage.

## Manual checks recommended after deployment
1. Register a test account in a browser.
2. Add a trading account and create a sample journal trade.
3. Refresh the page and verify that the session and data remain in the same browser profile.
4. Switch accounts and confirm that journal data remains separated.
5. Export a JSON backup, then test importing it.
6. Open the site in another browser/device and confirm the data is not automatically synchronized.

## Known limitations
- Local Storage is browser- and device-specific.
- Local-only passwords are not protected by server-side authentication.
- This report records static source changes; it does not claim that the live Netlify deployment has been tested.
