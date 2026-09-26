import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { formatCount } from '../renderers/format.js';
import { AppEvents } from '../../app/app-events.js';

const STATUS_LABEL = {
  MATCHED: 'Matched',
  ONLY_A: 'Only A',
  ONLY_B: 'Only B',
  MISMATCH: 'Mismatch',
  DUPLICATE: 'Duplicate',
  AMBIGUOUS: 'Ambiguous',
};

const PAGE_SIZE = 50;

/**
 * ResultsTable — paginated result presentation. Never renders all rows.
 * Holds no authoritative dataset; it reads from AppStore.
 */
export class ResultsTable {
  /** @param {import('../../app/app-store.js').AppStore} store */
  constructor(store) {
    this.store = store;
    this.page = 0;
    this.root = el('div', { class: 'results-table' });
    store.addEventListener('change', () => this._render());
    store.addEventListener('state', () => this._render());
    this._render();
  }

  _filtered() {
    const all = this.store.result?.records ?? [];
    const f = this.store.resultFilter;
    return f === 'ALL' ? all : all.filter((r) => r.status === f);
  }

  _render() {
    if (this.store.state !== 'RESULTS' || !this.store.result) {
      replaceChildren(this.root, []);
      return;
    }

    const rows = this._filtered();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (this.page >= totalPages) this.page = totalPages - 1;
    const slice = rows.slice(this.page * PAGE_SIZE, this.page * PAGE_SIZE + PAGE_SIZE);

    if (rows.length === 0) {
      replaceChildren(this.root, [
        el('div', { class: 'results-table__empty' }, [
          icon(Icons.check, { size: 20 }),
          el('span', { text: 'Nothing in this category.' }),
        ]),
      ]);
      return;
    }

    const table = el('table', { class: 'results-table__table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { scope: 'col', text: 'Status' }),
          el('th', { scope: 'col', text: 'Key' }),
          el('th', { scope: 'col', class: 'u-text-mono', text: 'Row A' }),
          el('th', { scope: 'col', class: 'u-text-mono', text: 'Row B' }),
          el('th', { scope: 'col', text: '' }),
        ]),
      ]),
      el('tbody', {}, slice.map((rec) => this._renderRow(rec))),
    ]);

    replaceChildren(this.root, [
      el('div', { class: 'results-table__scroll' }, [table]),
      this._renderPager(rows.length, totalPages),
    ]);
  }

  _renderRow(rec) {
    return el('tr', {
      class: 'results-table__row',
      tabindex: '0',
      dataset: { status: rec.status },
      role: 'button',
      'aria-label': `Open record ${rec.keyLabel}`,
      onclick: () => this._open(rec.id),
      onkeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._open(rec.id);
        }
      },
    }, [
      el('td', {}, [
        el('span', { class: 'badge', dataset: { status: rec.status }, text: STATUS_LABEL[rec.status] ?? rec.status }),
      ]),
      el('td', { class: 'u-text-mono results-table__key', text: rec.keyLabel }),
      el('td', { class: 'u-text-mono u-text-muted', text: rec.source?.rowA ?? '—' }),
      el('td', { class: 'u-text-mono u-text-muted', text: rec.source?.rowB ?? '—' }),
      el('td', { class: 'results-table__chevron' }, [icon(Icons.arrowRight, { size: 14 })]),
    ]);
  }

  _open(id) {
    this.store.patch({ openRecordId: id });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_RECORD_OPENED, { detail: { id } }));
  }

  _renderPager(total, totalPages) {
    if (totalPages <= 1) {
      return el('div', { class: 'results-table__pager' }, [
        el('span', { class: 'u-text-sm u-text-muted', text: `${formatCount(total)} records` }),
      ]);
    }
    const prev = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      disabled: this.page === 0 ? 'true' : null,
      onclick: () => { this.page = Math.max(0, this.page - 1); this._render(); },
    }, ['← Prev']);
    const next = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      disabled: this.page >= totalPages - 1 ? 'true' : null,
      onclick: () => { this.page = Math.min(totalPages - 1, this.page + 1); this._render(); },
    }, ['Next →']);
    return el('div', { class: 'results-table__pager' }, [
      el('span', { class: 'u-text-sm u-text-muted', text: `${formatCount(total)} records · page ${this.page + 1} of ${totalPages}` }),
      el('div', { class: 'u-flex u-gap-2' }, [prev, next]),
    ]);
  }
}