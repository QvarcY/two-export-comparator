import { el } from '../renderers/dom.js';
import { t } from '../../i18n/index.js';

export function SkipLink() {
  return el('a', {
    href: '#main',
    class: 'skip-link',
    text: t('skip.content'),
  });
}
