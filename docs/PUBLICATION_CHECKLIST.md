# Publication checklist

Use this checklist before changing the repository from private to public.

## Already verified

- [x] `main` is the default branch.
- [x] EN/LV README files are present.
- [x] MIT license is present.
- [x] CONTRIBUTING and SECURITY documents are present.
- [x] Issue and PR templates are present.
- [x] Repository description and topics are configured.
- [x] `v0.1.0-alpha.1` prerelease is published.
- [x] `v0.1.0-alpha.2` prerelease is published.
- [x] CI runs tests, dependency audit and production build verification.
- [x] Production build contains restrictive CSP including `connect-src 'none'`.
- [x] 24 automated tests pass on the alpha.2 baseline.
- [x] 10,000-row performance regression baseline exists.
- [x] Social Preview image is prepared separately for upload after publication.

## Manual browser walkthrough

Perform with synthetic fixture data only.

### Keyboard-only

- [ ] Tab order reaches language selector, File A, File B and result actions logically.
- [ ] File selection controls are operable without a mouse.
- [ ] Expert settings are reachable and usable by keyboard.
- [ ] Result-detail action buttons can be activated with keyboard.
- [ ] Record dialog keeps focus inside while open.
- [ ] Escape closes the record dialog.
- [ ] Focus returns to the triggering control after the dialog closes.
- [ ] Skip-to-content link works.

### Responsive

Check at approximately:

- [x] 375 px width.
- [x] 768 px width.
- [x] 1280 px or wider.

Verify:

- [x] no horizontal page overflow;
- [x] file cards remain readable;
- [x] Visual Diff stacks cleanly on narrow screens;
- [x] buttons remain reachable;
- [x] long filenames/values do not break layout.

### Accessibility / visual

- [ ] focus rings are clearly visible;
- [ ] red is not the only cue for differences;
- [ ] status text remains understandable without color;
- [ ] text contrast is acceptable in dark mode;
- [ ] reduced-motion preference does not hide important state;
- [ ] basic screen-reader walkthrough announces headings, file controls, progress and dialog purpose sensibly.

### Export

- [ ] result CSV downloads successfully in the primary browser;
- [ ] exported mismatch text is readable;
- [ ] formula-like cells remain escaped.

## Publication action

Public alpha publication completed on 2026-09-26.

- [x] Repository visibility changed from Private to Public.
- [x] Prepared 1280×640 Social Preview uploaded by the repository owner.
- [x] Public repository metadata checked.
- [x] README and hero asset checked.
- [x] Releases checked; latest remains marked prerelease/alpha.
- [x] MIT license checked.
- [x] Topics checked.
- [x] Bug, feature and pull-request templates checked.
- [x] Latest main CI checked green.

The remaining manual-only items are screen-reader/contrast checks and any browser-specific download verification not yet exercised.

## Scope reminder

Publication is not a reason to add features.

Core remains:

```text
2 files → automatic local comparison → Visual Diff → optional export
```
