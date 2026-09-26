# Contributing to Two-Export Comparator

Thanks for helping improve the project.

The project intentionally stays focused:

> **Take two files and visually show what is different.**

Please read [PROJECT_SCOPE.md](docs/PROJECT_SCOPE.md) before proposing a large feature.

## Development setup

```bash
npm install
npm test
npm run dev
```

Before opening a PR:

```bash
npm test
npm run build
```

## Pull request expectations

A good PR should:

- solve one clear problem;
- keep parser/comparison logic outside UI components;
- preserve local-first behavior;
- avoid unnecessary dependencies;
- include or update tests for behavioral changes;
- update documentation when behavior changes;
- update `ROADMAP.md` when completing a planned development round.

## Tests

Tests should prove behavior, not merely execute code.

For a bug fix, the preferred regression test should:

1. fail on the broken behavior;
2. pass with the fix;
3. fail again if the protected behavior is removed.

Realistic synthetic fixtures are preferred over tests that only mock everything away.

## Privacy and test data

Never commit real customer, accounting, banking, payment, or other confidential exports.

Use synthetic fixture data only.

## Translations

Translations are a first-class contribution area.

See [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).

A translation PR should normally:

1. copy an existing locale under `src/i18n/locales/`;
2. keep the same message keys;
3. translate message values naturally;
4. register the locale in `src/i18n/locales/index.js`;
5. test the full primary workflow;
6. optionally add a `README.xx.md` translation.

Do not translate imported file values or source column names. They belong to the user data.

## Good contribution areas

- CSV/TSV edge cases;
- deterministic matching;
- normalization;
- duplicate/ambiguity handling;
- security hardening;
- accessibility;
- performance;
- translations;
- documentation;
- regression fixtures.

## Large features

Please discuss large scope changes before implementing them.

A feature that is technically impressive but makes the default workflow harder to understand is unlikely to belong in the core.
