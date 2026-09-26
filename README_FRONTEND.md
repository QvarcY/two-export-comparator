# Frontend architecture notes

The public project description lives in [README.md](README.md) and [README.lv.md](README.lv.md).

The application is intentionally split so UI code does not own parser or comparison logic:

~~~text
UI / views / components
        ↓
AppController + AppStore
        ↓
ComparisonService
        ↓
BrowserComparisonService
        ↓
engine/
  parsing · normalization · mapping suggestions · comparison
~~~

`MockComparisonService` remains available for deterministic UI development, but the application now uses `BrowserComparisonService` by default.

## Commands

~~~bash
npm install
npm test
npm run dev
npm run build
npm run preview
~~~

## Important

Do not implement parser, normalization or comparison algorithms inside UI components.

Keep the default workflow simple:

~~~text
2 files → automatic local comparison → Visual Diff
~~~

Manual mapping belongs under Expert settings.

Language files live under `src/i18n/locales/`. See [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
