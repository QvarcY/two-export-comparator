import { localeRegistry } from './locales/index.js';

const FALLBACK_LOCALE = 'en';
export const LOCALE_CHANGE_EVENT = 'tec:localechange';

function normalizeLocale(value) {
  return String(value || '').trim().toLowerCase().split('-')[0];
}

function detectLocale() {
  const url = new URL(window.location.href);
  const fromUrl = normalizeLocale(url.searchParams.get('lang'));
  if (localeRegistry[fromUrl]) return fromUrl;

  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const code = normalizeLocale(candidate);
    if (localeRegistry[code]) return code;
  }

  return FALLBACK_LOCALE;
}

let activeLocale = detectLocale();

function applyDocumentLocale() {
  document.documentElement.lang = activeLocale;
  document.documentElement.dataset.locale = activeLocale;
}

applyDocumentLocale();

export function getLocale() {
  return activeLocale;
}

export function getSupportedLocales() {
  return Object.values(localeRegistry).map(({ code, nativeName, shortLabel }) => ({
    code,
    nativeName,
    shortLabel,
  }));
}

export function t(key, params = {}) {
  const current = localeRegistry[activeLocale]?.messages ?? {};
  const fallback = localeRegistry[FALLBACK_LOCALE]?.messages ?? {};
  const raw = current[key] ?? fallback[key] ?? key;

  return String(raw).replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(params, name)
      ? String(params[name])
      : '{' + name + '}';
  });
}

export function setLocale(locale) {
  const next = normalizeLocale(locale);
  if (!localeRegistry[next] || next === activeLocale) return;

  const previous = activeLocale;
  activeLocale = next;
  applyDocumentLocale();

  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);

  try {
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    // The language switch must still work if the URL cannot be rewritten.
  }

  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, {
    detail: { previous, current: next },
  }));
}
