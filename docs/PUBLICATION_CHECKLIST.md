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

- [ ] 375 px width.
- [ ] 768 px width.
- [ ] 1280 px or wider.

Verify:

- [ ] no horizontal page overflow;
- [ ] file cards remain readable;
- [ ] Visual Diff stacks cleanly on narrow screens;
- [ ] buttons remain reachable;
- [ ] long filenames/values do not break layout.

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

Do **not** change visibility until the manual checklist above is acceptable.

When ready:

1. Change repository visibility from Private to Public.
2. Upload the prepared 1280×640 Social Preview image.
3. Re-open the public repository in a logged-out/private browser window.
4. Verify README images, release links, license, topics and issue templates.
5. Confirm no confidential sample data or screenshots are present.
6. Confirm the public release still says prerelease/alpha.

## Scope reminder

Publication is not a reason to add features.

Core remains:

```text
2 files → automatic local comparison → Visual Diff → optional export
```
