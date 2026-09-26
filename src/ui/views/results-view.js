import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { formatCount } from '../renderers/format.js';
import { SummaryCard } from '../components/summary-card.js';
import { ResultsTable } from '../components/results-table.js';
import { RecordDetailDrawer } from '../components/record-detail-drawer.js';
import { AppEvents } from '../../app/app-events.js';

const CARDS = [
  { status: 'ALL', label: 'All' },
  { status: 'MISMATCH', label: 'Mismatch' },
  { status: 'ONLY_A', label: 'Only A' },
  { status: 'ONLY_B', label: 'Only B' },
  { status: 'DUPLICATE', label: 'Duplicate' },
  { status: 'AMBIGUOUS', label: 'Ambiguous' },
  { status: 'MATCHED', label: 'Matched' },
];

export class ResultsView {
  constructor(store) {
    this.store = store;
    this.table = new ResultsTable(store);
    this.drawer = new RecordDetailDrawer(store);

    this.root = el('section', { class: 'app-main', hidden: '' });
    store.addEventListener('state', () => this._sync());
    store.addEventListener('change', () => this._sync());
    this._sync();
  }

  _sync() {
    const active = this.store.state === 'RESULTS' && this.store.result;
    this.root.hidden = !active;
    if (!active) {
      replaceChildren(this.root, []);
      return;
    }
    this._render();
  }

  _countFor(status) {
    const s = this.store.result.summary;
    if (status === 'ALL') return s.matched + s.onlyA + s.onlyB + s.mismatched + s.duplicates + s.ambiguous;
    if (status === 'MISMATCH') return s.mismatched;
    if (status === 'ONLY_A') return s.onlyA;
    if (status === 'ONLY_B') return s.onlyB;
    if (status === 'DUPLICATE') return s.duplicates;
    if (status === 'AMBIGUOUS') return s.ambiguous;
    if (status === 'MATCHED') return s.matched;
    return 0;
  }

  _setFilter(status) {
    this.store.patch({ resultFilter: status });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_FILTER_CHANGED, { detail: { status } }));
    this._render();
  }

  _render() {
    const s = this.store.result.summary;

    const cards = CARDS.map((c) =>
      new SummaryCard({
        status: c.status,
        label: c.label,
        count: this._countFor(c.status),
        active: this.store.resultFilter === c.status,
        onClick: () => this._setFilter(c.status),
      }).root
    );

    replaceChildren(this.root, [
      el('div', { class: 'u-container' }, [
        el('header', { class: 'results-header' }, [
          el('div', {}, [
            el('h2', { class: 'results-header__title', text: 'Comparison complete' }),
            el('p', {
              class: 'results-header__sub u-text-muted',
              text: formatCount(s.totalA) + ' rows in File A · ' + formatCount(s.totalB) + ' rows in File B',
            }),
          ]),
          el('div', { class: 'results-header__actions' }, [
            el('button', {
              type: 'button',
              class: 'btn btn--ghost',
              onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.RESET_REQUESTED)),
            }, [icon(Icons.refresh, { size: 14 }), 'Start over']),
            el('button', {
              type: 'button',
              class: 'btn btn--primary',
              onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.EXPORT_REQUESTED, { detail: { format: 'csv' } })),
            }, [icon(Icons.table, { size: 14 }), 'Export CSV']),
          ]),
        ]),
        el('div', { class: 'summary-grid', role: 'tablist', 'aria-label': 'Result filters' }, cards),
        this.table.root,
      ]),
      this.drawer.root,
    ]);
  }
}
