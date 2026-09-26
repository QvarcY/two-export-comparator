# Security policy

## Data-safety principle

Two-Export Comparator is designed around local browser processing. File contents should not be sent to a backend as part of the normal comparison workflow.

## Reporting a vulnerability

Please avoid publishing security-sensitive details in a public issue before a fix is available.

When reporting a problem, include:

- affected version/commit;
- browser and operating system;
- minimal reproduction steps;
- whether the issue can expose imported file contents;
- whether export generation is involved.

Do **not** attach real confidential business exports. Use a minimal synthetic fixture instead.

## Sensitive areas

Security review should pay particular attention to:

- imported cell values rendered in the DOM;
- CSV formula injection in generated exports;
- malformed CSV/TSV input;
- resource exhaustion from large files;
- accidental network requests;
- persistence of imported data;
- future third-party dependencies.

## Supported versions

The project is currently pre-release. Security fixes target the active development branch until the first public release is tagged.
