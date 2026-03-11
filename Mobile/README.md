# Tiza B2B Native

Expo-based React Native app created from the web screens in `Mobile/src/app/pages`.

## Run

```bash
npm install
npm run start
```

Useful targets:

```bash
npm run android
npm run web
npm run typecheck
```

## Sentry

Sentry is configured with the `tiza-mobil-app` DSN in `App.tsx`. The Expo config plugin is enabled in `app.json`, and Metro is wrapped through `metro.config.js` so source maps and debug metadata can be uploaded during native builds.

For source map and debug symbol upload, provide your Sentry auth token at build time:

```bash
SENTRY_AUTH_TOKEN=your_org_auth_token
```

The Expo plugin is configured for:

- org: `aed-industry`
- project: `tiza-mobil-app`
