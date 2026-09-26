import { el } from '../renderers/dom.js';
import {
  getLocale,
  getSupportedLocales,
  LOCALE_CHANGE_EVENT,
  setLocale,
  t,
} from '../../i18n/index.js';

export function LanguageSwitcher() {
  const select = el('select', {
    class: 'language-switcher__select',
    onchange: (event) => setLocale(event.target.value),
  });

  for (const locale of getSupportedLocales()) {
    select.appendChild(el('option', {
      value: locale.code,
      text: locale.shortLabel,
      title: locale.nativeName,
    }));
  }

  const sync = () => {
    select.value = getLocale();
    select.setAttribute('aria-label', t('language.label'));
    select.title = t('language.label');
  };

  window.addEventListener(LOCALE_CHANGE_EVENT, sync);
  sync();

  return el('div', { class: 'language-switcher' }, [select]);
}
