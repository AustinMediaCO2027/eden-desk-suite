# Eden Desk Web-to-APK Build Plan

This branch converts the existing Vite/React Eden Desk application into a production PWA and Android app package using Capacitor and cloud CI.

## Delivery sequence

1. Production web application and installable PWA
2. Supabase authentication, database, storage, and entitlement model
3. Offline persistence and background synchronisation
4. Invoice, quotation, receipt, statement, and PDF workflows
5. Capacitor Android wrapper
6. Huawei IAP native bridge and backend verification
7. GitHub Actions build pipeline for test APK and signed release package
8. Device QA and AppGallery release preparation

## User-owned requirements

- Huawei organisation developer approval
- Huawei Merchant Service approval
- AppGallery Connect app record
- `agconnect-services.json`
- Huawei IAP product IDs and server credentials
- Android signing keystore stored as encrypted CI secrets
- Physical Huawei device for final payment and lifecycle testing

Secrets must never be committed to the repository.
