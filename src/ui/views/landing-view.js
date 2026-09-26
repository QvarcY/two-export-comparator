import { el, icon, Icons } from '../renderers/dom.js';
import { FilePanel } from '../components/file-panel.js';
import { PrivacyNote } from '../components/privacy-note.js';
import { t } from '../../i18n/index.js';

export class LandingView {
  /** @param {import('../../app/app-store.js').AppStore} store */
  constructor(store) {
    this.store = store;
    this.filePanelA = new FilePanel({ slot: 'A' });
    this.filePanelB = new FilePanel({ slot: 'B' });

    this.root = el('section', { class: 'landing' }, [
      el('section', { class: 'landing__hero' }, [
        el('h1', { class: 'landing__title' }, [
          t('landing.titlePrefix'),
          el('span', { class: 'landing__title-accent', text: t('landing.titleAccent') }),
        ]),
        el('p', {
          class: 'landing__subtitle',
          text: t('landing.subtitle'),
        }),
      ]),
      el('section', { class: 'landing__workflow', 'aria-label': t('landing.fileSelection') }, [
        this.filePanelA.root,
        el('div', { class: 'landing__connector', 'aria-hidden': 'true' }, [icon(Icons.arrowRight, { size: 18 })]),
        this.filePanelB.root,
      ]),
      el('div', { class: 'landing__footer' }, [PrivacyNote()]),
    ]);

    this._syncFromStore();
    store.addEventListener('change', () => this._syncFromStore());
    store.addEventListener('state', () => this._syncFromStore());
  }

  _syncFromStore() {
    this.filePanelA.setInspection(this.store.fileA);
    this.filePanelB.setInspection(this.store.fileB);
  }
}
