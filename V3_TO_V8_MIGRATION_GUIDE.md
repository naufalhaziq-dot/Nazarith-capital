# Nazarith Capital — Local Data Migration Guide

## Existing browser data
The standalone edition keeps the existing `nazareth_capital_v1` browser storage key for compatibility with earlier local versions. When opened in the same browser profile, it can continue using the locally stored account records it can read.

## Moving data to another device or browser
1. Open the old site in the browser profile that contains your trading records.
2. Sign in and open **Data & Backup**.
3. Export a JSON backup.
4. Open the standalone edition on the destination device/browser.
5. Register or sign in to the intended local account.
6. Open **Data & Backup** and import the JSON backup.

## Important
- There is no automatic cloud migration or multi-device synchronization.
- Keep multiple backup copies in a safe location.
- Importing a backup may replace or merge records according to the import option shown in the application. Review the confirmation prompt before proceeding.
