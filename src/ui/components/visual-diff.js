import { el } from '../renderers/dom.js';
import { t } from '../../i18n/index.js';

const ATTENTION_STATUSES = new Set([
  'MISMATCH',
  'ONLY_A',
  'ONLY_B',
  'DUPLICATE',
  'AMBIGUOUS',
]);

export class VisualDiff {
  constructor(store) {
    this.store = store;
    this.root = el('div', { class: 'visual-diff' });
    this.render();
  }

  render() {
    const records = this.store.result?.records ?? [];
    this.root.replaceChildren(
      ...records.map((record) => this._renderPair(record))
    );
  }

  _renderPair(record) {
    const attention = ATTENTION_STATUSES.has(record.status);
    const statusClass = attention ? 'attention' : 'matched';

    return el('article', {
      class: 'visual-diff__pair',
      dataset: { status: record.status, tone: statusClass },
    }, [
      this._renderSide('A', record),
      this._renderStatus(record),
      this._renderSide('B', record),
    ]);
  }

  _renderSide(side, record) {
    const isA = side === 'A';
    const data = isA ? record.displayA : record.displayB;
    const rowNumber = isA ? record.source?.rowA : record.source?.rowB;
    const missing =
      (record.status === 'ONLY_A' && !isA) ||
      (record.status === 'ONLY_B' && isA);

    if (missing) {
      return el('div', {
        class: 'visual-diff__side visual-diff__side--missing',
      }, [
        el('div', {
          class: 'visual-diff__missing-label',
          text: t('visual.notInFile'),
        }),
      ]);
    }

    const entries = Object.entries(data ?? {});

    return el('div', { class: 'visual-diff__side' }, [
      el('div', { class: 'visual-diff__side-head' }, [
        el('span', {
          class: 'visual-diff__file-label',
          text: isA ? t('visual.fileA') : t('visual.fileB'),
        }),
        el('span', {
          class: 'visual-diff__row',
          text: rowNumber != null ? t('visual.row', { row: rowNumber }) : '—',
        }),
      ]),
      el('div', { class: 'visual-diff__record-key', text: record.keyLabel }),
      el('div', { class: 'visual-diff__fields' },
        entries.map(([field, value]) =>
          el('div', {
            class: 'visual-diff__field',
            dataset: {
              changed: this._fieldChanged(record, side, field) ? 'true' : 'false',
            },
          }, [
            el('span', { class: 'visual-diff__field-name', text: field }),
            el('span', { class: 'visual-diff__field-value', text: String(value ?? '—') }),
          ])
        )
      ),
    ]);
  }

  _fieldChanged(record, side, field) {
    if (record.status !== 'MISMATCH') return false;

    const target = String(field).toLowerCase();

    return (record.differences ?? []).some((difference) => {
      const explicit = side === 'A' ? difference.fieldA : difference.fieldB;
      if (explicit) return String(explicit).toLowerCase() === target;

      const generic = String(difference.field ?? '').toLowerCase();
      return generic === target;
    });
  }

  _renderStatus(record) {
    let label = t('visual.matched');

    if (record.status === 'MISMATCH') label = t('visual.changed');
    else if (record.status === 'ONLY_A') label = t('visual.onlyA');
    else if (record.status === 'ONLY_B') label = t('visual.onlyB');
    else if (record.status === 'DUPLICATE' || record.status === 'AMBIGUOUS') label = t('visual.ambiguous');

    return el('div', {
      class: 'visual-diff__status',
      dataset: { status: record.status },
      text: label,
    });
  }
}
