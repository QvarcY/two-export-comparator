# Changelog

All notable project changes will be recorded here.

The project is currently in pre-release development.

## [0.1.0-alpha.1] - 2026-09-26

First functional alpha of Two-Export Comparator.

### Added

- local CSV and TSV file inspection in the browser;
- comma, semicolon and tab delimiter detection;
- quoted and multiline CSV field parsing;
- UTF-8 and UTF-8 BOM handling;
- basic text, number and date type inference;
- deterministic automatic column-pair suggestions;
- local hash-map based comparison;
- `MATCHED`, `MISMATCH`, `ONLY_A`, `ONLY_B`, `DUPLICATE` and `AMBIGUOUS` result states;
- numeric tolerance support;
- side-by-side Visual Diff;
- CSV result export with spreadsheet formula-injection protection;
- English and Latvian UI;
- bilingual README and translation contribution guide;
- project scope, security and contribution documentation;
- GitHub issue and pull-request templates;
- GitHub Actions test/build CI.

### Privacy model

Selected business files are processed in browser memory for the normal comparison workflow. The application does not require accounts, cloud upload, analytics or telemetry.

### Known alpha limitations

- automatic matching still needs broader regression coverage;
- ambiguous date formats need explicit handling;
- large-file performance still needs a measured baseline;
- accessibility and responsive audits are not yet complete;
- offline/static distribution is still planned.

