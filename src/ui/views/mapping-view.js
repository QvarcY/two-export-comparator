import { el } from '../renderers/dom.js';
import { MappingEditor } from '../components/mapping-editor.js';

export class MappingView {
  /**
   * @param {import('../../app/app-store.js').AppStore} store
   * @param {import('../../services/comparison-service.js').ComparisonService} service
   */
  constructor(store, service) {
    this.store = store;
    this.editor = new MappingEditor(store, service);

    this.root = el('main', { class: 'app-main', id: 'main', hidden: '' }, [
      el('div', { class: 'u-container' }, [this.editor.root]),
    ]);

    this._sync();
    store.addEventListener('state', () => this._sync());
  }

  _sync() {
    const active = ['MAPPING', 'READY_TO_COMPARE'].includes(this.store.state);
    this.root.hidden = !active;
  }
}