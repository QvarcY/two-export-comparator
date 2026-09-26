import { el, icon, Icons } from '../renderers/dom.js';

/**
 * PrivacyNote — accurately states local processing. No legal guarantees.
 */
export function PrivacyNote() {
  return el('div', { class: 'privacy-note', role: 'note' }, [
    icon(Icons.shield, { size: 14 }),
    el('span', {
      text: 'Your files are processed locally in this browser and are not uploaded by this application.',
    }),
  ]);
}