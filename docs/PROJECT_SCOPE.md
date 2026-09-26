# Project scope

Two-Export Comparator should remain intentionally small.

## Core promise

> Take two files and visually show what is different.

The default workflow should remain:

```text
2 files → automatic local comparison → visual differences → optional export
```

## In scope

- CSV / TSV parsing
- deterministic matching
- visual difference highlighting
- duplicate / ambiguity handling
- safe local processing
- result export
- accessibility
- performance
- translation support
- narrowly-scoped Expert settings

## Not core scope

The project should not grow into:

- ERP
- CRM
- accounting software
- cloud file storage
- collaboration workspace
- project management
- BI/dashboard suite
- user-account platform
- scheduled data synchronization
- generic spreadsheet editor
- AI chat interface

A future feature may still be useful, but usefulness alone is not enough to put it in the core.

## Feature test

Before adding a feature, ask:

1. Does it directly help compare two files?
2. Does it reduce the time to understand a difference?
3. Can it stay optional if most users do not need it?
4. Does it preserve local-first/privacy-first behavior?
5. Can we test it deterministically?

If most answers are no, the feature should stay out.

## UX rule

The normal user should not need to understand:

- keys;
- normalization;
- tolerance terminology;
- schema mapping;
- parser internals.

Those concepts may exist internally or under Expert settings, but the primary flow must remain understandable without documentation.
