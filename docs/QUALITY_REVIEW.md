# Alpha quality review

This document records what is currently protected automatically and what still requires a manual or deployment-specific review.

## Automated in CI

The current test suite protects:

- CSV and TSV parser behavior;
- malformed quoted fields;
- UTF-8 replacement-character rejection;
- duplicate headers and empty files;
- deterministic matching outcomes;
- ambiguous automatic-key rejection;
- semantic mapping conflicts;
- absolute and percentage numeric tolerance;
- conservative date normalization;
- explicit Expert Mode date formats;
- CSV formula-injection protection;
- English/Latvian translation-key parity;
- no network APIs in application source;
- no persistent browser-storage APIs in application source;
- no unsafe HTML/code execution assignments;
- no third-party script/style/font loads in the entry HTML;
- a 10,000-row local parse + comparison performance regression guard.

## Still manual or deployment-specific

The following should not be claimed as complete until reviewed in the final hosting environment:

- hosting-level Content Security Policy headers (the static build already embeds a restrictive meta CSP);
- keyboard-only walkthrough of every primary action;
- screen-reader walkthrough;
- color-contrast audit;
- responsive review on representative mobile/tablet sizes;
- download behavior across supported browsers;
- offline/static hosting verification;
- public-demo hosting verification.

## Scope rule

Quality work must not turn the project into a larger product. The core path remains:

```text
2 files → automatic local comparison → Visual Diff → optional export
```
