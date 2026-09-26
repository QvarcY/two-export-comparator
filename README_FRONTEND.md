# Frontend architecture notes

The public project description lives in [README.md](README.md) and [README.lv.md](README.lv.md).

The frontend is intentionally separated from the future comparison engine:

~~~text
UI / views / components
        ↓
AppController + AppStore
        ↓
ComparisonService
        ↓
MockComparisonService     (current prototype)
BrowserComparisonService  (future production engine)
~~~

## Commands

~~~bash
npm install
npm run dev
npm run build
npm run preview
~~~

## Important

Do not implement parser, normalization or comparison algorithms inside UI components.

Language files live under src/i18n/locales/. See [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
