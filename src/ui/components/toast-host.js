import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { AppEvents } from '../../app/app-events.js';

/**
 * ToastHost — renders transient messages from AppStore.toasts.
 */
export class ToastHost {
  /** @param {import('../../app/app-store.js').AppStore} store */
  constructor(store) {
    this.store = store;
    this.root = el('div', {
      class: 'toast-host',
      role: 'region',
      'aria-label': 'Notifications',
    });

    store.addEventListener('change', () => this._render());
    store.addEventListener(AppEvents.TOAST_SHOWN, () => this._render());
    store.addEventListener(AppEvents.TOAST_DISMISSED, () => this._render());

    this._render();
  }

  /** @private */
  _render() {
    replaceChildren(
      this.root,
      this.store.toasts.map((t) =>
        el('div', {
          class: 'toast toast--floating',
          dataset: { severity: t.severity },
          role: t.severity === 'error' ? 'alert' : 'status',
        }, [
          icon(t.severity === 'error' ? Icons.alert : Icons.check, { size: 14 }),
          el('div', { class: 'toast__body' }, [
            el('div', { class: 'u-weight-semi', text: t.title }),
            t.message ? el('div', { class: 'u-text-sm u-text-muted', text: t.message }) : null,
          ]),
          el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--icon btn--sm',
            'aria-label': 'Dismiss',
            onclick: () => this.store.dismissToast(t.id),
          }, [icon(Icons.x, { size: 12 })]),
        ])
      )
    );
  }
}