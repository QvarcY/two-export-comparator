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

## Phase 1 — Frontend prototype and project foundation / Frontend prototips un projekta pamats 🟡

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
- 🟡 Clean production build verification pending.
- 🟡 Source-generated parser warnings will move to code-based localization in Phase 2.

**Exit criteria:** complete bilingual UI, clean build, no duplicate IDs, package metadata consistent, no known frontend blocker.

## Phase 2 — Real file inspection and parsing / Īsta failu pārbaude un parsēšana ⬜

- ⬜ Replace mock file inspection in BrowserComparisonService.
- ⬜ CSV parser with quoted fields and multiline quoted values.
- ⬜ TSV support.
- ⬜ Comma / semicolon / tab delimiter detection.
- ⬜ UTF-8 and UTF-8 BOM handling.
- ⬜ Clear unsupported-encoding error.
- ⬜ Header discovery and safe preview.
- ⬜ Row and column metadata.
- ⬜ File-size and malformed-input safeguards.
- ⬜ Parser fixtures for real edge cases.

**Exit criteria:** real CSV/TSV files can be inspected locally without upload and parser fixtures prove edge-case behavior.

## Phase 3 — Mapping and normalization / Kolonnu savienošana un normalizācija ⬜

- ⬜ Exact text keys.
- ⬜ Composite keys.
- ⬜ Trim / case / repeated-whitespace normalization.
- ⬜ Explicit numeric parsing for dot/comma decimals.
- ⬜ Conservative date handling.
- ⬜ User-selected ambiguous date format.
- ⬜ Numeric tolerance: absolute and percentage.
- ⬜ Deterministic column mapping suggestions without AI.
- ⬜ Mapping validation and readable error states.

**Exit criteria:** mappings are explicit, auditable and never silently guess ambiguous formats.

## Phase 4 — Comparison engine / Salīdzināšanas dzinējs ⬜

- ⬜ Hash-map indexing; avoid O(n²) pair scans.
- ⬜ MATCHED.
- ⬜ ONLY_A.
- ⬜ ONLY_B.
- ⬜ MISMATCH.
- ⬜ DUPLICATE.
- ⬜ AMBIGUOUS.
- ⬜ Source row traceability.
- ⬜ Deterministic pairing rules.
- ⬜ No silent first-match behavior for duplicate/ambiguous records.
- ⬜ Large-file performance tests.

**Exit criteria:** removing or breaking any comparison rule causes the relevant regression fixture to fail.

## Phase 5 — Export, privacy and security hardening / Eksports, privātums un drošība ⬜

- ⬜ Result CSV export.
- ⬜ Filtered exports.
- ⬜ CSV formula-injection protection.
- ⬜ CSP suitable for static deployment, including connect-src 'none' where deployment permits it.
- ⬜ No analytics, telemetry or external data APIs.
- ⬜ No business-file content in localStorage, IndexedDB or cookies.
- ⬜ Security review of imported values and generated downloads.
- ⬜ Privacy explanation verified against actual behavior.

## Phase 6 — Quality gate / Kvalitātes vārti ⬜

- ⬜ Unit tests.
- ⬜ Behavior-driven fixture tests.
- ⬜ Integration tests.
- ⬜ Regression tests that fail on the pre-fix behavior.
- ⬜ Accessibility audit: keyboard, labels, focus, screen reader semantics.
- ⬜ Responsive review.
- ⬜ EN/LV translation completeness check.
- ⬜ Contributor translation validation.
- ⬜ Performance baseline for large files.
- ⬜ Dependency audit.

## Phase 7 — Distribution / Izplatīšana ⬜

- ⬜ GitHub Pages deployment.
- ⬜ Offline-capable static build.
- ⬜ Evaluate a self-contained single HTML release.
- ⬜ Release checksums where useful.
- ⬜ Public demo with sample data only.
- ⬜ Verify that demo hosting never receives selected business files.

## Phase 8 — Public open-source release / Publisks open-source release ⬜

- ⬜ Final project name/branding review.
- ⬜ MIT license and public repository metadata.
- ⬜ CONTRIBUTING polish.
- ⬜ Issue and PR templates.
- ⬜ Good first issues.
- ⬜ Help-wanted issues for parsers, formats and translations.
- ⬜ First tagged release.
- ⬜ Public launch documentation and screenshots.

---

## Development rounds / Izstrādes kārtas

| Date | Round | Status | What changed / Kas mainīts |
| --- | --- | --- | --- |
| 2026-09-26 | R0 — Scaffold | ✅ | Vite project, service boundary, initial repository baseline. |
| 2026-09-26 | R1 — Frontend prototype | ✅ | File panels, mapping UI, progress view, result dashboard and drawer added. |
| 2026-09-26 | R2 — i18n + documentation foundation | ✅ | EN/LV locale registry, bilingual README, translation guide, roadmap, line-ending policy and package cleanup. |
| 2026-09-26 | R3 — Live i18n + frontend cleanup | ✅ | Fixed language-switch reset/crash, wired EN/LV through the workflow, kept files in memory during locale changes, simplified mapping and fixed mock slot replacement/error recovery. |
| 2026-09-26 | R4 — Visual Diff pivot | 🟡 | Product flow changed to Upload → automatic comparison → side-by-side Visual Diff. Manual mapping moved behind Expert settings. Build and UX verification pending. |

## Next target / Nākamais mērķis

**R4 exit check:** pull the Visual Diff prototype, verify that two selected files lead directly to the visual result, confirm red difference highlighting and neutral matches, then continue with the real CSV/TSV inspector.
