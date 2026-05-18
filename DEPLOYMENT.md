# Deployment guide

## Web (static, near-zero cost)

Expo Router can export a static site:

```bash
npx expo export --platform web
```

Upload the generated `dist/` folder to **Cloudflare Pages**, **Netlify**, or **GitHub Pages**. No database server — web build uses **op-sqlite / WASM** paths depending on Expo version; if web SQLite is blocked in a given browser, treat web as companion read-only or gate web behind “export import” — for production web parity, verify `expo-sqlite` web support on your target SDK in Expo docs before marketing web.

> **Note:** Primary value is **native** (reliable SQLite file on disk). Ship native first; web is optional.

## iOS & Android (EAS Build — free tier limits)

1. Install EAS CLI: `npm i -g eas-cli` (or `npx eas-cli`).
2. Log in: `eas login`
3. From the project root: `eas build:configure`
4. Production builds:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

5. Submit to stores:

```bash
eas submit -p ios --latest
eas submit -p android --latest
```

Update `app.json` `ios.bundleIdentifier` and `android.package` to your real identifiers before the first store build.

## OTA updates (optional, low cost)

Expo Updates can deliver JS/asset hotfixes without a full store review in many cases — still subject to Apple/Google policy. Configure `expo-updates` when you need it; it is **not** enabled in this starter to keep the stack minimal.

## Operational checklist

- [ ] Replace placeholder icons/splash (`scripts/generate-placeholders.js` output).
- [ ] Set unique bundle id / application id.
- [ ] Add privacy policy URL (even for on-device data, stores ask questions).
- [ ] Run `eas credentials` once per platform to manage signing.
- [ ] Turn on `expo-updates` only if you accept the extra moving parts.
