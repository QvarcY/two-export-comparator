import { el } from '../renderers/dom.js';
import { MappingEditor } from '../components/mapping-editor.js';

export class MappingView {
  constructor(store, service) {
    this.store = store;
    this.editor = new MappingEditor(store, service);

    this.root = el('section', { class: 'app-main', hidden: '' }, [
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
