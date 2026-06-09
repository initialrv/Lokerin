# Lokerin

Production-oriented, **offline-first** job application tracker for iOS, Android, and web (Expo). All data is stored in **SQLite on the device** — no paid backend required for core functionality.

## Prerequisites

- Node.js 20 LTS (recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) via `npx` (no global install required)

## Setup

```bash
cd lokerin
npm install
node scripts/generate-placeholders.js
npm run typecheck
npx expo start
```

The placeholder script writes minimal valid PNGs into `assets/` so Metro can bundle icons. Replace those files with real branding before store submission.

## Scripts

| Script        | Purpose                          |
| ------------- | -------------------------------- |
| `npm start`   | Start Metro + Expo dev tools     |
| `npm run ios` | Open iOS simulator (macOS)     |
| `npm run android` | Open Android emulator      |
| `npm run web` | Run web target                   |
| `npm run typecheck` | `tsc --noEmit`             |
| `npm run lint`    | ESLint (after install)     |

## Environment variables

No secrets are required for the default build. Optional future keys (e.g. AdMob, Sentry, Supabase) belong in `.env` — see `.env.example`.

## Architecture (short)

- **UI:** Expo Router (file-based navigation) + React Native primitives.
- **Persistence:** `expo-sqlite` with versioned SQL migrations in `src/db/migrations.ts`.
- **Data access:** Thin repository layer in `src/repositories/applicationsRepository.ts`.
- **Bootstrap:** `DatabaseProvider` opens DB once, surfaces loading/error, and gates navigation.

See `DEPLOYMENT.md` for shipping builds and `MONETIZATION.md` for revenue options that preserve low ops cost.

## Database schema (SQLite)

Table `applications`:

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | TEXT PK | UUID string |
| `company`, `role` | TEXT | Required |
| `status` | TEXT | `draft\|applied\|screening\|interview\|offer\|rejected\|withdrawn` |
| `applied_at`, `next_follow_up_at` | TEXT NULL | ISO timestamps (free-form entry) |
| `location`, `job_url`, `salary_note`, `notes` | TEXT NULL | |
| `created_at`, `updated_at` | TEXT | ISO timestamps |

Table `interviews`:

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | TEXT PK | UUID |
| `application_id` | TEXT FK | `ON DELETE CASCADE` |
| `title` | TEXT | Required |
| `scheduled_at`, `notes` | TEXT NULL | |
| `created_at` | TEXT | ISO |

Indexes: `applications(status)`, `applications(updated_at DESC)`, `interviews(application_id)`.
- [ ] Verify JSON export and share sheet on real hardware (iOS and Android).
- [ ] Run `eas build` production profiles; use internal testing tracks first.
- [ ] If adding ads or IAP later, update metadata and privacy labels before release.
