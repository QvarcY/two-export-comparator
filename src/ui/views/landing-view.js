import { el, icon, Icons } from '../renderers/dom.js';
import { FilePanel } from '../components/file-panel.js';
import { PrivacyNote } from '../components/privacy-note.js';

export class LandingView {
  /** @param {import('../../app/app-store.js').AppStore} store */
  constructor(store) {
    this.store = store;
    this.filePanelA = new FilePanel({ slot: 'A' });
    this.filePanelB = new FilePanel({ slot: 'B' });

    this.root = el('main', { class: 'landing', id: 'main' }, [
      el('section', { class: 'landing__hero' }, [
        el('h1', { class: 'landing__title' }, [
          'Compare two exports. ',
          el('span', { class: 'landing__title-accent', text: "Find what doesn't match." }),
        ]),
        el('p', {
          class: 'landing__subtitle',
          text: 'Two files in. Differences out. No account, no upload, no cloud database.',
        }),
      ]),
      el('section', { class: 'landing__workflow', 'aria-label': 'File selection' }, [
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