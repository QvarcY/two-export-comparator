import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { orDash } from '../renderers/format.js';
import { AppEvents } from '../../app/app-events.js';

const STATUS_LABEL = {
  MATCHED: 'Matched',
  ONLY_A: 'Only A',
  ONLY_B: 'Only B',
  MISMATCH: 'Mismatch',
  DUPLICATE: 'Duplicate',
  AMBIGUOUS: 'Ambiguous',
};

const STATUS_EXPLAIN = {
  MATCHED: 'Key exists in both files and all compared values pass.',
  ONLY_A: 'Record exists only in File A.',
  ONLY_B: 'Record exists only in File B.',
  MISMATCH: 'Key matched, but one or more compared fields differ.',
  DUPLICATE: 'The same normalized key occurs multiple times.',
  AMBIGUOUS: 'The engine cannot determine a unique pairing safely. No guess was made.',
};

/**
 * RecordDetailDrawer — side-by-side inspection. Never mutates source rows.
 */
export class RecordDetailDrawer {
  /** @param {import('../../app/app-store.js').AppStore} store */
  constructor(store) {
    this.store = store;
    this.root = el('aside', {
      class: 'record-drawer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Record detail',
      hidden: '',
    });
    store.addEventListener('change', () => this._sync());
    store.addEventListener('state', () => this._sync());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.store.openRecordId) this._close();
    });
    this._sync();
  }

  _close() {
    this.store.patch({ openRecordId: null });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_RECORD_CLOSED));
  }

  _sync() {
    const id = this.store.openRecordId;
    if (!id || this.store.state !== 'RESULTS') {
      this.root.hidden = true;
      replaceChildren(this.root, []);
      return;
    }
    const rec = this.store.result?.records.find((r) => r.id === id);
    if (!rec) {
      this.root.hidden = true;
      return;
    }
    this.root.hidden = false;
    this._render(rec);
  }

  _render(rec) {
    const backdrop = el('div', {
      class: 'record-drawer__backdrop',
      onclick: () => this._close(),
    });

    const panel = el('div', { class: 'record-drawer__panel' }, [
      this._renderHead(rec),
      this._renderExplain(rec),
      this._renderSideBySide(rec),
      rec.differences?.length ? this._renderDifferences(rec) : null,
    ]);

    replaceChildren(this.root, [backdrop, panel]);
  }

  _renderHead(rec) {
    return el('header', { class: 'record-drawer__head' }, [
      el('div', { class: 'record-drawer__head-main' }, [
        el('span', { class: 'badge', dataset: { status: rec.status }, text: STATUS_LABEL[rec.status] ?? rec.status }),
        el('span', { class: 'record-drawer__key u-text-mono', text: rec.keyLabel }),
      ]),
      el('button', {
        type: 'button',
        class: 'btn btn--ghost btn--icon',
        'aria-label': 'Close',
        onclick: () => this._close(),
      }, [icon(Icons.x, { size: 16 })]),
    ]);
  }

  _renderExplain(rec) {
    return el('p', { class: 'record-drawer__explain', text: STATUS_EXPLAIN[rec.status] ?? '' });
  }

  _renderSideBySide(rec) {
    const fields = new Set([
      ...Object.keys(rec.displayA ?? {}),
      ...Object.keys(rec.displayB ?? {}),
    ]);
    return el('div', { class: 'record-drawer__grid' }, [
      this._renderSide('File A', rec.source?.rowA, rec.displayA ?? {}, fields, rec.differences),
      this._renderSide('File B', rec.source?.rowB, rec.displayB ?? {}, fields, rec.differences),
    ]);
  }

  _renderSide(title, rowNum, data, fields, differences) {
    const diffFields = new Set((differences ?? []).map((d) => d.field));
    return el('div', { class: 'record-drawer__side' }, [
      el('div', { class: 'record-drawer__side-head' }, [
        el('span', { class: 'record-drawer__side-title', text: title }),
        el('span', { class: 'record-drawer__side-row u-text-mono u-text-muted', text: rowNum != null ? `row ${rowNum}` : '—' }),
      ]),
      el('dl', { class: 'record-drawer__fields' }, [...fields].map((f) => {
        const isDiff = diffFields.has(f.toLowerCase());
        return el('div', {
          class: 'record-drawer__field',
          dataset: { diff: isDiff ? 'true' : 'false' },
        }, [
          el('dt', { class: 'record-drawer__field-label', text: f }),
          el('dd', { class: 'record-drawer__field-value u-text-mono', text: orDash(data[f]) }),
        ]);
      })),
    ]);
  }

  _renderDifferences(rec) {
    return el('div', { class: 'record-drawer__diffs' }, [
      el('h4', { class: 'record-drawer__diffs-title', text: 'Differences' }),
      el('ul', { class: 'record-drawer__diffs-list' }, rec.differences.map((d) =>
        el('li', { class: 'record-drawer__diff' }, [
          el('span', { class: 'record-drawer__diff-field u-text-mono', text: d.field }),
          el('span', { class: 'record-drawer__diff-values' }, [
            el('span', { class: 'record-drawer__diff-a', text: String(d.valueA ?? '—') }),
            el('span', { class: 'record-drawer__diff-arrow', text: '→' }),
            el('span', { class: 'record-drawer__diff-b', text: String(d.valueB ?? '—') }),
          ]),
          d.delta != null ? el('span', { class: 'record-drawer__diff-delta u-text-mono', text: `Δ ${d.delta}` }) : null,
        ])
      )),
    ]);
  }
}