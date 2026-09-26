import { el, icon, Icons } from '../renderers/dom.js';
import { t } from '../../i18n/index.js';

/**
 * PrivacyNote — accurately states local processing. No legal guarantees.
 */
export function PrivacyNote() {
  return el('div', { class: 'privacy-note', role: 'note' }, [
    icon(Icons.shield, { size: 14 }),
    el('span', { text: t('privacy.local') }),
  ]);
}
