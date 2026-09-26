# Two-Export Comparator — Roadmap / Attīstības plāns

This file is the canonical development ledger for the project.  
Šis fails ir projekta galvenais attīstības žurnāls.

**Rule / Noteikums:** every meaningful development round updates this file with completed work, verification and the next target. / Pēc katras nozīmīgas izstrādes kārtas šis fails tiek atjaunināts ar paveikto, pārbaudi un nākamo mērķi.

Status: ✅ complete · 🟡 in progress · ⬜ planned · ⛔ blocked

## Phase 0 — Concept and architecture / Ideja un arhitektūra ✅

- ✅ Narrow product definition: compare two exports and explain differences.
- ✅ Browser-first, local-processing privacy model.
- ✅ Stable service boundary between UI and future engine.
- ✅ AppStore + AppController separation.
- ✅ MockComparisonService for deterministic UI development.
- ✅ Baseline Git repository and frontend branch strategy.

## Phase 1 — Frontend prototype and project foundation / Frontend prototips un projekta pamats ✅

- ✅ Modern dark-first UI prototype.
- ✅ File A / File B panels.
- ✅ Mapping workspace retained as Expert Mode.
- ✅ Automatic compare path after two files are selected.
- ✅ Side-by-side Visual Diff becomes the primary result experience.
- ✅ Compare progress screen.
- ✅ Results cards, table and record drawer.
- ✅ Safe DOM renderer using textContent for imported values.
- ✅ Pagination instead of rendering the whole result set.
- ✅ English + Latvian i18n registry foundation.
- ✅ Language selector driven by locale registry.
- ✅ Live EN/LV switching without page reload.
- ✅ Language switching preserves in-memory files and mapping state.
- ✅ EN/LV coverage through the main workflow.
- ✅ English and Latvian README.
- ✅ Translation contribution guide.
- ✅ Canonical roadmap.
- ✅ One real main landmark instead of duplicate main IDs.
- ✅ Mock file replacement keeps stable A/B slot IDs.
- ✅ Comparison failure returns to a usable mapping state.
- ✅ Package metadata aligned with the Vite 7 lockfile baseline.
- ✅ Repository line-ending policy added.
- ✅ Clean production build verified locally with Vite 7.3.6.
- ⬜ Source-generated parser warnings still need code-based localization.

**Exit criteria:** complete bilingual UI, clean build, no duplicate IDs, package metadata consistent, no known frontend blocker.

## Phase 2 — Real file inspection and parsing / Īsta failu pārbaude un parsēšana ✅

- ✅ Replace mock file inspection in BrowserComparisonService.
- ✅ CSV parser with quoted fields and multiline quoted values.
- ✅ TSV support.
- ✅ Comma / semicolon / tab delimiter detection.
- ✅ UTF-8 and UTF-8 BOM handling.
- ✅ Detect replacement characters and fail instead of silently showing corrupted UTF-8.
- ✅ Header discovery and safe preview.
- ✅ Row and column metadata with basic type inference.
- ✅ 50 MiB file-size guard and malformed quoted-field error.
- ✅ Parser fixtures for BOM, delimiter detection, quoted commas and multiline values.

**Exit criteria:** real CSV/TSV files can be inspected locally without upload and parser fixtures prove edge-case behavior.

## Phase 3 — Mapping and normalization / Kolonnu savienošana un normalizācija 🟡

- ✅ Exact text keys.
- ✅ Composite keys are supported by the mapping/indexing model.
- ✅ Trim / case / repeated-whitespace normalization.
- ✅ Explicit numeric parsing for dot/comma decimals.
- ✅ Conservative date handling: ISO and unambiguous local dates normalize automatically; ambiguous local dates are never guessed.
- ✅ Expert settings can explicitly select ISO, DD/MM/YYYY or MM/DD/YYYY per file when needed.
- ✅ Numeric tolerance: absolute and percentage.
- ✅ Deterministic column mapping suggestions without AI.
- ✅ Conservative key-confidence margin prevents silent auto-selection when multiple identifier keys are equally plausible.
- ✅ Known semantic groups are not auto-paired across conflicting meanings.
- 🟡 Basic mapping validation exists; error UX still needs hardening.

**Exit criteria:** mappings are explicit, auditable and never silently guess ambiguous formats.

## Phase 4 — Comparison engine / Salīdzināšanas dzinējs ✅

- ✅ Hash-map indexing; avoids O(n²) pair scans.
- ✅ MATCHED.
- ✅ ONLY_A.
- ✅ ONLY_B.
- ✅ MISMATCH.
- ✅ DUPLICATE.
- ✅ AMBIGUOUS.
- ✅ Source row traceability.
- ✅ Deterministic pairing rules for unique keys.
- ✅ Duplicate/ambiguous keys are surfaced instead of silently accepted as matches.
- ✅ 10k-row end-to-end parse/comparison regression baseline with a broad non-quadratic guard.

**Exit criteria:** removing or breaking any comparison rule causes the relevant regression fixture to fail.

## Phase 5 — Export, privacy and security hardening / Eksports, privātums un drošība 🟡

- ✅ Result CSV export.
- ⬜ Filtered exports.
- ✅ CSV formula-injection protection.
- ✅ Production build injects a static CSP with `connect-src 'none'`; final host should still prefer equivalent HTTP headers.
- ✅ No analytics, telemetry or external data APIs in the comparison flow.
- ✅ No business-file content stored in localStorage, IndexedDB or cookies.
- ✅ Automated source invariants reject network/storage APIs and unsafe HTML/code execution; production dist is verified for CSP and external entry resources.
- ✅ Privacy claims are protected by automated source invariants for network and persistent browser storage APIs.

## Phase 6 — Quality gate / Kvalitātes vārti 🟡

- ✅ Node test coverage for parser and browser comparison service.
- ✅ Synthetic behavior fixtures for real comparison outcomes.
- ✅ Negative parser/mapping tests cover malformed quotes, corrupt UTF-8 markers, duplicate headers, empty files, ambiguous keys and semantic conflicts.
- ✅ CSV export regression coverage protects formula-like key cells.
- ⬜ Integration tests.
- ⬜ Regression tests that fail on the pre-fix behavior.
- 🟡 Code-level accessibility pass completed for keyboard controls, progress announcements and modal focus management; manual screen-reader/contrast walkthrough remains.
- ⬜ Responsive review.
- ✅ EN/LV translation key parity test.
- ⬜ Contributor translation validation.
- ✅ 10k-row parse + compare baseline runs in CI.
- ✅ High-severity dependency audit runs in CI.

## Phase 7 — Distribution / Izplatīšana ⬜

- ⬜ GitHub Pages deployment.
- 🟡 Relative-path static build is verified and can be served without a backend; full offline/PWA behavior remains intentionally unevaluated.
- ⬜ Evaluate a self-contained single HTML release.
- ⬜ Release checksums where useful.
- ⬜ Public demo with sample data only.
- ⬜ Verify that demo hosting never receives selected business files.

## Phase 8 — Public open-source release / Publisks open-source release ⬜

- ⬜ Final project name/branding review.
- 🟡 MIT license and repository metadata prepared; repository visibility remains a separate publication decision.
- ✅ CONTRIBUTING polish.
- ✅ Issue and PR templates.
- ⬜ Good first issues.
- ⬜ Help-wanted issues for parsers, formats and translations.
- ✅ Prereleases `v0.1.0-alpha.1` and `v0.1.0-alpha.2` published.
- ⬜ Public launch documentation and screenshots.

---

## Development rounds / Izstrādes kārtas

| Date | Round | Status | What changed / Kas mainīts |
| --- | --- | --- | --- |
| 2026-09-26 | R0 — Scaffold | ✅ | Vite project, service boundary, initial repository baseline. |
| 2026-09-26 | R1 — Frontend prototype | ✅ | File panels, mapping UI, progress view, result dashboard and drawer added. |
| 2026-09-26 | R2 — i18n + documentation foundation | ✅ | EN/LV locale registry, bilingual README, translation guide, roadmap, line-ending policy and package cleanup. |
| 2026-09-26 | R3 — Live i18n + frontend cleanup | ✅ | Fixed language-switch reset/crash, wired EN/LV through the workflow, kept files in memory during locale changes, simplified mapping and fixed mock slot replacement/error recovery. |
| 2026-09-26 | R4 — Visual Diff pivot | ✅ | Product flow changed to Upload → automatic comparison → side-by-side Visual Diff. Manual mapping moved behind Expert settings. |
| 2026-09-26 | R5 — Real browser engine MVP | ✅ | Replaced mock default with real local CSV/TSV parsing, automatic mapping suggestions and deterministic comparison sufficient for the Visual Diff flow. Regression fixtures pass (4/4) and production build verified locally. |
| 2026-09-26 | R6 — Repository polish | ✅ | Reworked EN/LV README around the Visual Diff product promise, documented strict project scope, strengthened contribution/security guidance, added GitHub issue/PR templates, README hero artwork and CI workflow. |
| 2026-09-26 | R7 — Alpha release preparation | ✅ | Prepared and published v0.1.0-alpha.1 prerelease metadata, changelog and release notes; simplified CI to one PR check plus one main-branch check and added concurrency cancellation. Social Preview remains deferred until repository publication. |
| 2026-09-26 | R8 — Automatic matching hardening | ✅ | Added explicit mapping roles, conservative key ambiguity rejection, semantic conflict guards and broader parser/normalization/export regression coverage without changing the primary workflow. |
| 2026-09-26 | R9 — Alpha quality gate | ✅ | Added conservative date normalization with optional Expert Mode date formats, EN/LV key parity, privacy/security source invariants and a 10k-row CI performance baseline. |
| 2026-09-26 | R10 — Accessibility + static hardening | ✅ | Added modal focus trapping/restore, real table action buttons, polite progress announcements, production CSP/static-dist verification and CI dependency auditing. `v0.1.0-alpha.2` was published successfully. |

## Next target / Nākamais mērķis

**Next:** complete the manual publication checklist, switch repository visibility only when explicitly approved, upload Social Preview, and perform the final public-page smoke check. Core comparison scope remains frozen.
