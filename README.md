# Two-Export Comparator

[English](README.md) · [Latviešu](README.lv.md)

**Two files in. Differences out. No account. No upload. No cloud database.**

Two-Export Comparator is a privacy-first browser utility for comparing two exported datasets and finding records that are missing, duplicated, ambiguous, or different.

The long-term goal is deliberately narrow: **drop two exports, map the relevant columns, compare them locally, inspect the differences, export the result.**

> **Current status:** frontend prototype and architecture foundation. The production CSV/TSV parser and real comparison engine are not implemented yet. The current interface uses deterministic mock data while the engine is built behind a stable service contract.

## Why this project exists

Small businesses regularly export data from banks, shops, payment systems, inventory tools, CRMs, accounting tools and spreadsheets. The difficult part is often not producing the export — it is answering a simple question:

**What does not match between these two files?**

Typical examples:

- bank export vs invoice export;
- shop orders vs payment provider export;
- warehouse export vs store export;
- old supplier list vs new supplier list;
- two reports that should contain the same references and amounts.

This project is not intended to become an ERP, CRM, accounting suite or cloud data platform.

## Privacy model

Business files may contain sensitive commercial or personal data, so the application is designed around local processing.

Planned production rules:

- file contents are processed in the browser;
- files are not uploaded by the application;
- no account is required;
- no application database stores imported files;
- no analytics or telemetry is required for the comparison workflow;
- no external JavaScript CDN is required;
- imported values are rendered with safe DOM APIs;
- closing or refreshing the page clears in-memory business data.

This architecture reduces unnecessary data transfer, but the project does **not** make blanket legal claims such as “100% GDPR compliant”.

## Workflow

~~~text
DROP FILE A + FILE B
        ↓
AUTOMATIC LOCAL ANALYSIS
        ↓
SIDE-BY-SIDE VISUAL DIFF
        ↓
RED = DIFFERENCE / NEUTRAL = MATCH
        ↓
OPTIONAL EXPERT SETTINGS
        ↓
EXPORT REPORT
~~~

## Result categories

| Status | Meaning |
| --- | --- |
| MATCHED | A unique record pair was found and compared values pass. |
| ONLY_A | A record exists only in File A. |
| ONLY_B | A record exists only in File B. |
| MISMATCH | The key matched, but one or more compared values differ. |
| DUPLICATE | The same normalized key occurs multiple times. |
| AMBIGUOUS | A unique safe pairing cannot be determined; the engine must not guess. |

## Architecture

~~~text
src/
├── app/          application state and controller
├── i18n/         locale registry and translations
├── models/       stable DTO / service contracts
├── services/     mock and future browser comparison service
├── ui/
│   ├── components/
│   ├── renderers/
│   └── views/
└── styles/
~~~

The UI talks only to the ComparisonService boundary. The production parser, normalizers and comparison engine will live behind BrowserComparisonService so the interface does not need to be redesigned when the real engine replaces the mock.

## Languages

The first official UI languages are:

- English (EN)
- Latvian / Latviešu (LV)

The language selector is generated from a locale registry. Contributors can add another language without changing comparison logic.

See [Translation guide](docs/TRANSLATIONS.md).

README translations may be added as README.xx.md files and linked from the language line at the top.

## Development

~~~bash
npm install
npm run dev
npm run build
npm run preview
~~~

Node/Vite is used only for development and static bundling. The production application remains a browser-side static application.

## Roadmap

The detailed, continuously maintained roadmap is in [ROADMAP.md](ROADMAP.md).

High-level path:

1. ✅ Project concept and architecture baseline
2. 🟡 Frontend prototype, bilingual UI foundation and documentation
3. ⬜ Real CSV/TSV inspection and parsing
4. ⬜ Normalization and column mapping rules
5. ⬜ Deterministic comparison engine
6. ⬜ Export, privacy and security hardening
7. ⬜ Test fixtures, performance and accessibility
8. ⬜ Offline build and public distribution
9. ⬜ Public release and contributor ecosystem

**Roadmap rule:** every meaningful development round must update ROADMAP.md so the repository shows what changed, what is verified and what comes next.

## Contributing

Contributions are welcome once the relevant area is stable enough to work on safely. Translation contributions are intentionally low-friction.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Design principles

- One focused job, done well.
- Local-first where practical.
- No silent guessing when data is ambiguous.
- Behavior over decorative feature count.
- Minimal dependencies.
- Accessible controls, not drag-and-drop only.
- Tests must prove behavior and must fail when the protected behavior is broken.

## License

MIT — see [LICENSE](LICENSE).
