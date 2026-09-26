# Translation guide

Two-Export Comparator uses a small locale registry instead of embedding language logic into the comparison engine.

## Current official locales

- en — English
- lv — Latviešu

## Add a UI language

1. Copy src/i18n/locales/en.js.
2. Rename it to the ISO-style language code you want to add, for example de.js or pl.js.
3. Translate every message value. Do not rename message keys.
4. Import the file in src/i18n/locales/index.js.
5. Add one registry entry containing:
   - code
   - nativeName
   - shortLabel
   - messages
6. Run npm run dev.
7. Select the language from the header.
8. Check file selection, mapping, progress, results, errors and accessibility labels.
9. Run npm run build.

The language selector is generated from the registry, so a correctly registered language appears automatically.

## Important rules

- Do not translate source file column names or imported business data.
- Keep placeholders such as {slot}, {shown}, {total}, {count}, {page} unchanged.
- Do not add HTML to translation values.
- Keep translations concise enough for buttons and narrow screens.
- Translate meaning naturally; word-for-word translation is not required.
- English is the fallback locale.

## README translations

A contributor may also add a README translation:

~~~text
README.de.md
README.pl.md
README.fr.md
~~~

Then add the new language link to the language line at the top of README.md and other maintained README translations.

## Privacy note

Language preference is not stored together with business-file contents. The initial implementation uses a URL language parameter and browser-language detection instead of persisting imported business data.
