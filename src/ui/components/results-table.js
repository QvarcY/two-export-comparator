import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { formatCount } from '../renderers/format.js';
import { AppEvents } from '../../app/app-events.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

const STATUS_KEY = {
  MATCHED: 'results.matched',
  ONLY_A: 'results.onlyA',
  ONLY_B: 'results.onlyB',
  MISMATCH: 'results.mismatch',
  DUPLICATE: 'results.duplicate',
  AMBIGUOUS: 'results.ambiguous',
};

const PAGE_SIZE = 50;

export class ResultsTable {
  constructor(store) {
    this.store = store;
    this.page = 0;
    this.root = el('div', { class: 'results-table' });

    store.addEventListener('change', () => this._render());
    store.addEventListener('state', () => this._render());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._render());

    this._render();
  }

  _filtered() {
    const records = this.store.result?.records ?? [];
    const filter = this.store.resultFilter;
    return filter === 'ALL'
      ? records
      : records.filter((record) => record.status === filter);
  }

  _render() {
    if (this.store.state !== 'RESULTS' || !this.store.result) {
      replaceChildren(this.root, []);
      return;
    }

    const rows = this._filtered();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

    if (this.page >= totalPages) this.page = totalPages - 1;

    const pageRows = rows.slice(
      this.page * PAGE_SIZE,
      this.page * PAGE_SIZE + PAGE_SIZE
    );

    if (rows.length === 0) {
      replaceChildren(this.root, [
        el('div', { class: 'results-table__empty' }, [
          icon(Icons.check, { size: 20 }),
          el('span', { text: t('results.nothing') }),
        ]),
      ]);
      return;
    }

    const table = el('table', { class: 'results-table__table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', { scope: 'col', text: t('results.status') }),
          el('th', { scope: 'col', text: t('results.key') }),
          el('th', { scope: 'col', class: 'u-text-mono', text: t('results.rowA') }),
          el('th', { scope: 'col', class: 'u-text-mono', text: t('results.rowB') }),
          el('th', { scope: 'col', text: '' }),
        ]),
      ]),
      el('tbody', {}, pageRows.map((record) => this._renderRow(record))),
    ]);

    replaceChildren(this.root, [
      el('div', { class: 'results-table__scroll' }, [table]),
      this._renderPager(rows.length, totalPages),
    ]);
  }

  _renderRow(record) {
    const statusKey = STATUS_KEY[record.status];
    const statusLabel = statusKey ? t(statusKey) : record.status;

    return el('tr', {
      class: 'results-table__row',
      tabindex: '0',
      dataset: { status: record.status },
      role: 'button',
      'aria-label': t('results.openRecord', { key: record.keyLabel }),
      onclick: () => this._open(record.id),
      onkeydown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this._open(record.id);
        }
      },
    }, [
      el('td', {}, [
        el('span', {
          class: 'badge',
          dataset: { status: record.status },
          text: statusLabel,
        }),
      ]),
      el('td', { class: 'u-text-mono results-table__key', text: record.keyLabel }),
      el('td', { class: 'u-text-mono u-text-muted', text: record.source?.rowA ?? '—' }),
      el('td', { class: 'u-text-mono u-text-muted', text: record.source?.rowB ?? '—' }),
      el('td', { class: 'results-table__chevron' }, [
        icon(Icons.arrowRight, { size: 14 }),
      ]),
    ]);
  }

  _open(id) {
    this.store.patch({ openRecordId: id });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_RECORD_OPENED, {
      detail: { id },
    }));
  }

  _renderPager(total, totalPages) {
    if (totalPages <= 1) {
      return el('div', { class: 'results-table__pager' }, [
        el('span', {
          class: 'u-text-sm u-text-muted',
          text: t('results.records', { count: formatCount(total) }),
        }),
      ]);
    }

    const previous = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      disabled: this.page === 0 ? 'true' : null,
      onclick: () => {
        this.page = Math.max(0, this.page - 1);
        this._render();
      },
    }, [t('results.prev')]);

    const next = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm',
      disabled: this.page >= totalPages - 1 ? 'true' : null,
      onclick: () => {
        this.page = Math.min(totalPages - 1, this.page + 1);
        this._render();
      },
    }, [t('results.next')]);

    return el('div', { class: 'results-table__pager' }, [
      el('span', {
        class: 'u-text-sm u-text-muted',
        text: t('results.page', {
          count: formatCount(total),
          page: this.page + 1,
          pages: totalPages,
        }),
      }),
      el('div', { class: 'u-flex u-gap-2' }, [previous, next]),
    ]);
  }
}
