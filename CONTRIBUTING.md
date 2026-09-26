# Contributing

Thank you for considering a contribution to Two-Export Comparator.

The project intentionally stays focused: compare two datasets locally and explain what does not match.

## Before opening code changes

- Keep the privacy-first architecture.
- Do not introduce accounts, cloud file storage, analytics, telemetry or unrelated SaaS features.
- Do not put parser or comparison logic inside UI components.
- Imported values must be rendered safely.
- Avoid silent guessing for ambiguous data.
- Keep dependencies minimal.

## Development

~~~bash
npm install
npm run dev
npm run build
~~~

## Translations

Translations are a first-class contribution area.

See [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).

A translation PR should normally:

1. add a locale file under src/i18n/locales/;
2. register it in src/i18n/locales/index.js;
3. keep the same message keys as English;
4. translate meaning, not code identifiers or source-data column names;
5. run the project and inspect the main workflow;
6. optionally add a README.xx.md translation.

## Tests

As the real engine is introduced, tests must protect behavior rather than merely execute code.

A regression test should fail when the protected behavior is removed or restored to the previous broken behavior.

## Scope

Good contribution areas include:

- parsers and file-format support;
- normalization;
- deterministic matching;
- security hardening;
- accessibility;
- performance;
- translations;
- documentation;
- test fixtures.

Large scope expansions should be discussed before implementation.
