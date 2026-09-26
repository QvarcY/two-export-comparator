import { AppEvents } from './app-events.js';

/**
 * @typedef {'EMPTY' | 'FILES_PARTIAL' | 'FILES_READY' | 'MAPPING'
 *   | 'READY_TO_COMPARE' | 'COMPARING' | 'RESULTS' | 'ERROR'} AppStateName
 */

/**
 * AppStore — single source of truth for UI state.
 * Never persists imported business data to browser storage.
 */
export class AppStore extends EventTarget {
  constructor() {
    super();

    /** @type {AppStateName} */
    this.state = 'EMPTY';

    /** @type {import('../models/contracts.js').FileInspection | null} */
    this.fileA = null;

    /** @type {import('../models/contracts.js').FileInspection | null} */
    this.fileB = null;

    /** @type {import('../models/contracts.js').MappingConfig | null} */
    this.mapping = null;

    /** @type {boolean} */
    this.mappingValid = false;

    /** @type {import('../models/contracts.js').ProgressEvent | null} */
    this.progress = null;

    /** @type {import('../models/contracts.js').ComparisonResult | null} */
    this.result = null;

    /** @type {import('../models/contracts.js').ResultStatus | 'ALL'} */
    this.resultFilter = 'ALL';

    /** @type {string | null} */
    this.openRecordId = null;

    /** @type {Array<{ id: string, severity: string, title: string, message?: string }>} */
    this.toasts = [];
  }

  /**
   * Transition to a new state and notify subscribers.
   * @param {AppStateName} next
   */
  setState(next) {
    if (this.state === next) return;
    const prev = this.state;
    this.state = next;
    this.dispatchEvent(new CustomEvent('state', { detail: { prev, next } }));
  }

  /**
   * Merge a partial patch into the store and emit a change event.
   * @param {object} patch
   */
  patch(patch) {
    Object.assign(this, patch);
    this.dispatchEvent(new CustomEvent('change', { detail: patch }));
  }

  /**
   * Show a transient toast.
   * @param {{ severity: 'info'|'warning'|'error', title: string, message?: string }} toast
   */
  pushToast(toast) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.toasts = [...this.toasts, { id, ...toast }];
    this.dispatchEvent(new CustomEvent(AppEvents.TOAST_SHOWN, { detail: { id, ...toast } }));
    return id;
  }

  /**
   * @param {string} id
   */
  dismissToast(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.dispatchEvent(new CustomEvent(AppEvents.TOAST_DISMISSED, { detail: { id } }));
  }
}