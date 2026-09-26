import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { orDash } from '../renderers/format.js';
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

export class RecordDetailDrawer {
  constructor(store) {
    this.store = store;
    this._isOpen = false;
    this._previousFocus = null;

    this.root = el('aside', {
      class: 'record-drawer',
      role: 'dialog',
      'aria-modal': 'true',
      hidden: '',
    });

    store.addEventListener('change', () => this._sync());
    store.addEventListener('state', () => this._sync());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._sync());

    document.addEventListener('keydown', (event) => {
      if (!this._isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        this._close();
        return;
      }

      if (event.key === 'Tab') this._trapFocus(event);
    });

    this._sync();
  }

  _close() {
    this.store.patch({ openRecordId: null });
    window.dispatchEvent(new CustomEvent(AppEvents.RESULT_RECORD_CLOSED));
  }

  _sync() {
    this.root.setAttribute('aria-label', t('record.detail'));

    const id = this.store.openRecordId;
    if (!id || this.store.state !== 'RESULTS') {
      const shouldRestoreFocus = this._isOpen;
      this._isOpen = false;
      this.root.hidden = true;
      replaceChildren(this.root, []);

      if (shouldRestoreFocus) {
        const target = this._previousFocus;
        this._previousFocus = null;
        queueMicrotask(() => {
          if (target instanceof HTMLElement && target.isConnected) target.focus();
        });
      }
      return;
    }

    const record = this.store.result?.records.find((item) => item.id === id);
    if (!record) {
      this.root.hidden = true;
      return;
    }

    if (!this._isOpen) {
      this._isOpen = true;
      this._previousFocus = document.activeElement;
    }

    this.root.hidden = false;
    this._render(record);

    queueMicrotask(() => {
      const closeButton = this.root.querySelector('[data-dialog-close="true"]');
      if (closeButton instanceof HTMLElement && !this.root.contains(document.activeElement)) {
        closeButton.focus();
      }
    });
  }

  _render(record) {
    const backdrop = el('div', {
      class: 'record-drawer__backdrop',
      onclick: () => this._close(),
    });

    const panel = el('div', { class: 'record-drawer__panel' }, [
      this._renderHead(record),
      this._renderExplain(record),
      this._renderSideBySide(record),
      record.differences?.length ? this._renderDifferences(record) : null,
    ]);

    replaceChildren(this.root, [backdrop, panel]);
  }

  _renderHead(record) {
    const statusKey = STATUS_KEY[record.status];

    return el('header', { class: 'record-drawer__head' }, [
      el('div', { class: 'record-drawer__head-main' }, [
        el('span', {
          class: 'badge',
          dataset: { status: record.status },
          text: statusKey ? t(statusKey) : record.status,
        }),
        el('span', { class: 'record-drawer__key u-text-mono', text: record.keyLabel }),
      ]),
      el('button', {
        type: 'button',
        class: 'btn btn--ghost btn--icon',
        'aria-label': t('record.close'),
        title: t('record.close'),
        dataset: { dialogClose: 'true' },
        onclick: () => this._close(),
      }, [icon(Icons.x, { size: 16 })]),
    ]);
  }

  _trapFocus(event) {
    const focusable = [...this.root.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((node) => node instanceof HTMLElement && !node.hidden);

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  _renderExplain(record) {
    return el('p', {
      class: 'record-drawer__explain',
      text: t('record.explain.' + record.status),
    });
  }

  _renderSideBySide(record) {
    const fields = new Set([
      ...Object.keys(record.displayA ?? {}),
      ...Object.keys(record.displayB ?? {}),
    ]);

    return el('div', { class: 'record-drawer__grid' }, [
      this._renderSide(
        t('record.fileA'),
        record.source?.rowA,
        record.displayA ?? {},
        fields,
        record.differences
      ),
      this._renderSide(
        t('record.fileB'),
        record.source?.rowB,
        record.displayB ?? {},
        fields,
        record.differences
      ),
    ]);
  }

  _renderSide(title, rowNumber, data, fields, differences) {
    const differenceFields = new Set(
      (differences ?? []).map((difference) => String(difference.field).toLowerCase())
    );

    return el('div', { class: 'record-drawer__side' }, [
      el('div', { class: 'record-drawer__side-head' }, [
        el('span', { class: 'record-drawer__side-title', text: title }),
        el('span', {
          class: 'record-drawer__side-row u-text-mono u-text-muted',
          text: rowNumber != null ? t('record.row', { row: rowNumber }) : '—',
        }),
      ]),
      el('dl', { class: 'record-drawer__fields' }, [...fields].map((field) => {
        const isDifferent = differenceFields.has(String(field).toLowerCase());

        return el('div', {
          class: 'record-drawer__field',
          dataset: { diff: isDifferent ? 'true' : 'false' },
        }, [
          el('dt', { class: 'record-drawer__field-label', text: field }),
          el('dd', {
            class: 'record-drawer__field-value u-text-mono',
            text: orDash(data[field]),
          }),
        ]);
      })),
    ]);
  }

  _renderDifferences(record) {
    return el('div', { class: 'record-drawer__diffs' }, [
      el('h4', { class: 'record-drawer__diffs-title', text: t('record.differences') }),
      el('ul', { class: 'record-drawer__diffs-list' }, record.differences.map((difference) =>
        el('li', { class: 'record-drawer__diff' }, [
          el('span', {
            class: 'record-drawer__diff-field u-text-mono',
            text: difference.field,
          }),
          el('span', { class: 'record-drawer__diff-values' }, [
            el('span', {
              class: 'record-drawer__diff-a',
              text: String(difference.valueA ?? '—'),
            }),
            el('span', { class: 'record-drawer__diff-arrow', text: '→' }),
            el('span', {
              class: 'record-drawer__diff-b',
              text: String(difference.valueB ?? '—'),
            }),
          ]),
          difference.delta != null
            ? el('span', {
                class: 'record-drawer__diff-delta u-text-mono',
                text: 'Δ ' + difference.delta,
              })
            : null,
        ])
      )),
    ]);
  }
}
