import { el } from '../renderers/dom.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export function SkipLink() {
  const link = el('a', {
    href: '#main',
    class: 'skip-link',
  });

  const sync = () => {
    link.textContent = t('skip.content');
  };

  window.addEventListener(LOCALE_CHANGE_EVENT, sync);
  sync();

  return link;
}
