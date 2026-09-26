import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { FilePanel } from '../components/file-panel.js';
import { PrivacyNote } from '../components/privacy-note.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export class LandingView {
  constructor(store) {
    this.store = store;
    this.filePanelA = new FilePanel({ slot: 'A' });
    this.filePanelB = new FilePanel({ slot: 'B' });
    this.root = el('section', { class: 'landing' });

    this._render();
    this._syncFromStore();

    store.addEventListener('change', () => this._syncFromStore());
    store.addEventListener('state', () => this._syncFromStore());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._render());
  }

  _render() {
    replaceChildren(this.root, [
      el('section', { class: 'landing__hero' }, [
        el('h1', { class: 'landing__title' }, [
          t('landing.titlePrefix'),
          el('span', { class: 'landing__title-accent', text: t('landing.titleAccent') }),
        ]),
        el('p', { class: 'landing__subtitle', text: t('landing.subtitle') }),
      ]),
      el('section', { class: 'landing__workflow', 'aria-label': t('landing.fileSelection') }, [
        this.filePanelA.root,
        el('div', { class: 'landing__connector', 'aria-hidden': 'true' }, [icon(Icons.arrowRight, { size: 18 })]),
        this.filePanelB.root,
      ]),
      el('div', { class: 'landing__footer' }, [PrivacyNote()]),
    ]);
  }

  _syncFromStore() {
    if (this.store.fileLoadingA) this.filePanelA.setLoading();
    else this.filePanelA.setInspection(this.store.fileA);

    if (this.store.fileLoadingB) this.filePanelB.setLoading();
    else this.filePanelB.setInspection(this.store.fileB);
  }
}
