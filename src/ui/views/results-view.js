import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { formatCount } from '../renderers/format.js';
import { SummaryCard } from '../components/summary-card.js';
import { ResultsTable } from '../components/results-table.js';
import { RecordDetailDrawer } from '../components/record-detail-drawer.js';
import { AppEvents } from '../../app/app-events.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

const CARDS = [
  { status: 'ALL', labelKey: 'results.all' },
  { status: 'MISMATCH', labelKey: 'results.mismatch' },
  { status: 'ONLY_A', labelKey: 'results.onlyA' },
  { status: 'ONLY_B', labelKey: 'results.onlyB' },
  { status: 'DUPLICATE', labelKey: 'results.duplicate' },
  { status: 'AMBIGUOUS', labelKey: 'results.ambiguous' },
  { status: 'MATCHED', labelKey: 'results.matched' },
];

export class ResultsView {
  constructor(store) {
    this.store = store;
    this.table = new ResultsTable(store);
    this.drawer = new RecordDetailDrawer(store);

    this.root = el('section', { class: 'app-main', hidden: '' });
    store.addEventListener('state', () => this._sync());
    store.addEventListener('change', () => this._sync());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._sync());
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
    const summary = this.store.result.summary;

    if (status === 'ALL') return this.store.result.records.length;
    if (status === 'MISMATCH') return summary.mismatched;
    if (status === 'ONLY_A') return summary.onlyA;
    if (status === 'ONLY_B') return summary.onlyB;
    if (status === 'DUPLICATE') return summary.duplicates;
    if (status === 'AMBIGUOUS') return summary.ambiguous;
    if (status === 'MATCHED') return summary.matched;
    return 0;
  }

  _setFilter(status) {
    this.store.patch({ resultFilter: status });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_FILTER_CHANGED, {
      detail: { status },
    }));
    this._render();
  }

  _render() {
    const summary = this.store.result.summary;

    const cards = CARDS.map((card) =>
      new SummaryCard({
        status: card.status,
        label: t(card.labelKey),
        count: this._countFor(card.status),
        active: this.store.resultFilter === card.status,
        onClick: () => this._setFilter(card.status),
      }).root
    );

    replaceChildren(this.root, [
      el('div', { class: 'u-container' }, [
        el('header', { class: 'results-header' }, [
          el('div', {}, [
            el('h2', { class: 'results-header__title', text: t('results.complete') }),
            el('p', {
              class: 'results-header__sub u-text-muted',
              text: t('results.rowsSummary', {
                a: formatCount(summary.totalA),
                b: formatCount(summary.totalB),
              }),
            }),
          ]),
          el('div', { class: 'results-header__actions' }, [
            el('button', {
              type: 'button',
              class: 'btn btn--ghost',
              onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.RESET_REQUESTED)),
            }, [icon(Icons.refresh, { size: 14 }), t('results.startOver')]),
            el('button', {
              type: 'button',
              class: 'btn btn--primary',
              onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.EXPORT_REQUESTED, {
                detail: { format: 'csv' },
              })),
            }, [icon(Icons.table, { size: 14 }), t('results.exportCsv')]),
          ]),
        ]),
        el('div', {
          class: 'summary-grid',
          role: 'tablist',
          'aria-label': t('results.filters'),
        }, cards),
        this.table.root,
      ]),
      this.drawer.root,
    ]);
  }
}
