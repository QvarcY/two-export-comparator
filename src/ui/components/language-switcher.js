import { el } from '../renderers/dom.js';
import { getLocale, getSupportedLocales, setLocale, t } from '../../i18n/index.js';

export function LanguageSwitcher() {
  const current = getLocale();

  const select = el('select', {
    class: 'language-switcher__select',
    'aria-label': t('language.label'),
    title: t('language.label'),
    onchange: (event) => setLocale(event.target.value),
  });

  for (const locale of getSupportedLocales()) {
    const option = el('option', {
      value: locale.code,
      text: locale.shortLabel,
      title: locale.nativeName,
    });
    if (locale.code === current) option.selected = true;
    select.appendChild(option);
  }

  return el('div', { class: 'language-switcher' }, [select]);
}
