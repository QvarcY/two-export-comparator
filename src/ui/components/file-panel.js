import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { AppEvents } from '../../app/app-events.js';
import { formatBytes, formatCount, orDash, delimiterLabel } from '../renderers/format.js';

/**
 * FilePanel — renders a single file slot (A or B).
 * Does NOT read or parse file contents itself.
 * Emits FILE_A_SELECTED / FILE_B_SELECTED / FILE_A_REMOVED / FILE_B_REMOVED.
 */
export class FilePanel {
  /**
   * @param {{ slot: 'A' | 'B' }} config
   */
  constructor({ slot }) {
    this.slot = slot;
    this.fileEvent = slot === 'A' ? AppEvents.FILE_A_SELECTED : AppEvents.FILE_B_SELECTED;
    this.removeEvent = slot === 'A' ? AppEvents.FILE_A_REMOVED : AppEvents.FILE_B_REMOVED;

    this.root = el('section', {
      class: 'file-panel',
      dataset: { slot, state: 'empty' },
      'aria-label': `File ${slot}`,
    });

    /** @type {import('../../models/contracts.js').FileInspection | null} */
    this.inspection = null;

    /** @type {'empty' | 'loading' | 'ready' | 'warning' | 'error'} */
    this.state = 'empty';

    /** @type {string | null} */
    this.errorMessage = null;

    this.input = el('input', {
      type: 'file',
      accept: '.csv,.tsv,text/csv,text/tab-separated-values',
      class: 'visually-hidden',
      'aria-label': `Choose File ${slot}`,
    });
    this.input.addEventListener('change', () => {
      const file = this.input.files?.[0];
      if (file) this._emitSelect(file);
      this.input.value = '';
    });

    this._render();
  }

  /**
   * Update the panel with new inspection data.
   * @param {import('../../models/contracts.js').FileInspection | null} inspection
   */
  setInspection(inspection) {
    this.inspection = inspection;
    if (!inspection) {
      this.state = 'empty';
      this.errorMessage = null;
    } else if (inspection.warnings?.some((w) => w.severity === 'error')) {
      this.state = 'error';
      this.errorMessage = inspection.warnings.find((w) => w.severity === 'error')?.title ?? 'Something went wrong';
    } else if (inspection.warnings?.length) {
      this.state = 'warning';
    } else {
      this.state = 'ready';
    }
    this._render();
  }

  /** Show a loading state while the service inspects the file. */
  setLoading() {
    this.state = 'loading';
    this._render();
  }

  /**
   * Show an error state.
   * @param {string} message
   */
  setError(message) {
    this.state = 'error';
    this.errorMessage = message;
    this._render();
  }

  /** @private */
  _emitSelect(file) {
    window.dispatchEvent(new CustomEvent(this.fileEvent, { detail: { file } }));
  }

  /** @private */
  _emitRemove() {
    window.dispatchEvent(new CustomEvent(this.removeEvent));
  }

  /** @private */
  _openPicker() {
    this.input.click();
  }

  /** @private */
  _render() {
    this.root.dataset.state = this.state;
    replaceChildren(this.root, [
      this.input,
      this._renderHeader(),
      this._renderBody(),
    ]);
  }

  /** @private */
  _renderHeader() {
    return el('header', { class: 'file-panel__header' }, [
      el('div', { class: 'file-panel__label' }, [
        el('span', { class: 'file-panel__slot', text: `FILE ${this.slot}` }),
        this.inspection
          ? el('span', {
              class: 'file-panel__name u-truncate',
              text: this.inspection.name,
              title: this.inspection.name,
            })
          : el('span', { class: 'file-panel__name file-panel__name--empty', text: 'No file selected' }),
      ]),
      this.inspection
        ? el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--icon',
            'aria-label': `Remove File ${this.slot}`,
            title: 'Remove',
            onclick: () => this._emitRemove(),
          }, [icon(Icons.x, { size: 14 })])
        : null,
    ]);
  }

  /** @private */
  _renderBody() {
    switch (this.state) {
      case 'loading':
        return this._renderLoading();
      case 'ready':
      case 'warning':
        return this._renderReady();
      case 'error':
        return this._renderError();
      case 'empty':
      default:
        return this._renderDropzone();
    }
  }

  /** @private */
  _renderDropzone() {
    const zone = el('button', {
      type: 'button',
      class: 'file-panel__dropzone',
      'aria-label': `Choose File ${this.slot} — CSV or TSV`,
      onclick: () => this._openPicker(),
    }, [
      el('div', { class: 'file-panel__dropzone-icon' }, [icon(Icons.upload, { size: 22 })]),
      el('div', { class: 'file-panel__dropzone-text' }, [
        el('span', { class: 'file-panel__dropzone-primary', text: 'Drop CSV/TSV or browse' }),
        el('span', { class: 'file-panel__dropzone-secondary', text: 'Files stay in this browser' }),
      ]),
    ]);

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.dataset.dragover = 'true';
    });
    zone.addEventListener('dragleave', () => {
      delete zone.dataset.dragover;
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      delete zone.dataset.dragover;
      const file = e.dataTransfer?.files?.[0];
      if (file) this._emitSelect(file);
    });

    return zone;
  }

  /** @private */
  _renderLoading() {
    return el('div', { class: 'file-panel__body file-panel__body--loading' }, [
      el('div', { class: 'skeleton skeleton--line skeleton--w60' }),
      el('div', { class: 'skeleton skeleton--line skeleton--w40' }),
      el('div', { class: 'skeleton skeleton--line skeleton--w80' }),
      el('div', { class: 'skeleton skeleton--block' }),
    ]);
  }

  /** @private */
  _renderReady() {
    const i = this.inspection;
    const children = [];

    children.push(el('dl', { class: 'file-panel__meta' }, [
      this._metaItem('Rows', formatCount(i.rowCount)),
      this._metaItem('Columns', formatCount(i.columns.length)),
      this._metaItem('Delimiter', delimiterLabel(i.delimiter)),
      this._metaItem('Encoding', orDash(i.encoding)),
      this._metaItem('Size', formatBytes(i.sizeBytes)),
    ]));

    if (i.warnings?.length) {
      children.push(el('div', { class: 'file-panel__warnings' },
        i.warnings.slice(0, 3).map((w) =>
          el('div', {
            class: 'toast',
            dataset: { severity: w.severity },
            role: w.severity === 'error' ? 'alert' : 'status',
          }, [
            icon(Icons.alert, { size: 14 }),
            el('div', {}, [
              el('div', { class: 'u-weight-semi', text: w.title }),
              w.message ? el('div', { class: 'u-text-sm u-text-muted', text: w.message }) : null,
            ]),
          ])
        )
      ));
    }

    if (i.previewRows?.length && i.columns?.length) {
      children.push(this._renderPreview(i));
    }

    return el('div', { class: 'file-panel__body' }, children);
  }

  /** @private */
  _metaItem(label, value) {
    return el('div', { class: 'file-panel__meta-item' }, [
      el('dt', { class: 'file-panel__meta-label', text: label }),
      el('dd', { class: 'file-panel__meta-value', text: value }),
    ]);
  }

  /** @private */
  _renderPreview(i) {
    const cols = i.columns.slice(0, 5);

    const thead = el('thead', {}, [
      el('tr', {}, cols.map((c) =>
        el('th', { scope: 'col', text: c.label, title: c.label })
      )),
    ]);

    const tbody = el('tbody', {}, i.previewRows.slice(0, 5).map((row) =>
      el('tr', {}, cols.map((c) =>
        el('td', { text: orDash(row[c.id]) })
      ))
    ));

    return el('div', { class: 'file-panel__preview' }, [
      el('div', { class: 'file-panel__preview-label u-text-xs u-text-faint', text: 'PREVIEW' }),
      el('div', { class: 'file-panel__preview-scroll' }, [
        el('table', { class: 'file-panel__preview-table' }, [thead, tbody]),
      ]),
      i.rowCount && i.rowCount > i.previewRows.length
        ? el('div', {
            class: 'file-panel__preview-foot u-text-xs u-text-faint',
            text: `Showing ${Math.min(i.previewRows.length, 5)} of ${formatCount(i.rowCount)} rows`,
          })
        : null,
    ]);
  }

  /** @private */
  _renderError() {
    return el('div', { class: 'file-panel__body' }, [
      el('div', { class: 'toast', dataset: { severity: 'error' }, role: 'alert' }, [
        icon(Icons.alert, { size: 16 }),
        el('div', {}, [
          el('div', { class: 'u-weight-semi', text: "We couldn't read that file" }),
          el('div', { class: 'u-text-sm u-text-muted', text: this.errorMessage ?? 'Try a different CSV or TSV export.' }),
        ]),
      ]),
      el('button', {
        type: 'button',
        class: 'btn btn--secondary btn--sm u-mt-2',
        onclick: () => this._openPicker(),
      }, [icon(Icons.refresh, { size: 14 }), 'Choose another file']),
    ]);
  }
}