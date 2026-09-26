import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { AppEvents } from '../../app/app-events.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export class ToastHost {
  constructor(store) {
    this.store = store;

    this.root = el('div', {
      class: 'toast-host',
      role: 'region',
    });

    store.addEventListener('change', () => this._render());
    store.addEventListener(AppEvents.TOAST_SHOWN, () => this._render());
    store.addEventListener(AppEvents.TOAST_DISMISSED, () => this._render());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._render());

    this._render();
  }

  _render() {
    this.root.setAttribute('aria-label', t('toast.notifications'));

    replaceChildren(
      this.root,
      this.store.toasts.map((toast) => {
        const title = toast.titleKey ? t(toast.titleKey) : toast.title;
        const message = toast.messageKey ? t(toast.messageKey) : toast.message;

        return el('div', {
          class: 'toast toast--floating',
          dataset: { severity: toast.severity },
          role: toast.severity === 'error' ? 'alert' : 'status',
        }, [
          icon(toast.severity === 'error' ? Icons.alert : Icons.check, { size: 14 }),
          el('div', { class: 'toast__body' }, [
            el('div', { class: 'u-weight-semi', text: title }),
            message
              ? el('div', { class: 'u-text-sm u-text-muted', text: message })
              : null,
          ]),
          el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--icon btn--sm',
            'aria-label': t('toast.dismiss'),
            title: t('toast.dismiss'),
            onclick: () => this.store.dismissToast(toast.id),
          }, [icon(Icons.x, { size: 12 })]),
        ]);
      })
    );
  }
}
