import { AppEvents } from './app-events.js';

export class AppStore extends EventTarget {
  constructor() {
    super();

    this.state = 'EMPTY';
    this.fileA = null;
    this.fileB = null;
    this.fileLoadingA = false;
    this.fileLoadingB = false;
    this.mapping = null;
    this.mappingValid = false;
    this.progress = null;
    this.result = null;
    this.resultFilter = 'ALL';
    this.openRecordId = null;
    this.toasts = [];
  }

  setState(next) {
    if (this.state === next) return;

    const previous = this.state;
    this.state = next;
    this.dispatchEvent(new CustomEvent('state', {
      detail: { prev: previous, next },
    }));
  }

  patch(patch) {
    Object.assign(this, patch);
    this.dispatchEvent(new CustomEvent('change', { detail: patch }));
  }

  pushToast(toast) {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    this.toasts = [...this.toasts, { id, ...toast }];
    this.dispatchEvent(new CustomEvent(AppEvents.TOAST_SHOWN, {
      detail: { id, ...toast },
    }));
    return id;
  }

  dismissToast(id) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.dispatchEvent(new CustomEvent(AppEvents.TOAST_DISMISSED, {
      detail: { id },
    }));
  }
}
