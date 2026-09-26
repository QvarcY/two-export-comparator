import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { AppEvents } from '../../app/app-events.js';
import { formatBytes, formatCount, orDash, delimiterLabel } from '../renderers/format.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export class FilePanel {
  constructor({ slot }) {
    this.slot = slot;
    this.fileEvent = slot === 'A' ? AppEvents.FILE_A_SELECTED : AppEvents.FILE_B_SELECTED;
    this.removeEvent = slot === 'A' ? AppEvents.FILE_A_REMOVED : AppEvents.FILE_B_REMOVED;

    this.root = el('section', {
      class: 'file-panel',
      dataset: { slot, state: 'empty' },
    });

    this.inspection = null;
    this.state = 'empty';
    this.errorMessage = null;

    this.input = el('input', {
      type: 'file',
      accept: '.csv,.tsv,text/csv,text/tab-separated-values',
      class: 'visually-hidden',
    });

    this.input.addEventListener('change', () => {
      const file = this.input.files?.[0];
      if (file) this._emitSelect(file);
      this.input.value = '';
    });

    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._render());
    this._render();
  }

  setInspection(inspection) {
    this.inspection = inspection;
    if (!inspection) {
      this.state = 'empty';
      this.errorMessage = null;
    } else if (inspection.warnings?.some((warning) => warning.severity === 'error')) {
      this.state = 'error';
      this.errorMessage = inspection.warnings.find((warning) => warning.severity === 'error')?.title ?? t('file.genericError');
    } else if (inspection.warnings?.length) {
      this.state = 'warning';
    } else {
      this.state = 'ready';
    }
    this._render();
  }

  setLoading() {
    this.state = 'loading';
    this._render();
  }

  setError(message) {
    this.state = 'error';
    this.errorMessage = message;
    this._render();
  }

  _emitSelect(file) {
    window.dispatchEvent(new CustomEvent(this.fileEvent, { detail: { file } }));
  }

  _emitRemove() {
    window.dispatchEvent(new CustomEvent(this.removeEvent));
  }

  _openPicker() {
    this.input.click();
  }

  _render() {
    this.root.dataset.state = this.state;
    this.root.setAttribute('aria-label', t('file.label', { slot: this.slot }));
    this.input.setAttribute('aria-label', t('file.choose', { slot: this.slot }));

    replaceChildren(this.root, [
      this.input,
      this._renderHeader(),
      this._renderBody(),
    ]);
  }

  _renderHeader() {
    return el('header', { class: 'file-panel__header' }, [
      el('div', { class: 'file-panel__label' }, [
        el('span', { class: 'file-panel__slot', text: t('file.label', { slot: this.slot }).toUpperCase() }),
        this.inspection
          ? el('span', {
              class: 'file-panel__name u-truncate',
              text: this.inspection.name,
              title: this.inspection.name,
            })
          : el('span', { class: 'file-panel__name file-panel__name--empty', text: t('file.none') }),
      ]),
      this.inspection
        ? el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--icon',
            'aria-label': t('file.removeSlot', { slot: this.slot }),
            title: t('file.remove'),
            onclick: () => this._emitRemove(),
          }, [icon(Icons.x, { size: 14 })])
        : null,
    ]);
  }

  _renderBody() {
    if (this.state === 'loading') return this._renderLoading();
    if (this.state === 'ready' || this.state === 'warning') return this._renderReady();
    if (this.state === 'error') return this._renderError();
    return this._renderDropzone();
  }

  _renderDropzone() {
    const zone = el('button', {
      type: 'button',
      class: 'file-panel__dropzone',
      'aria-label': t('file.chooseCsv', { slot: this.slot }),
      onclick: () => this._openPicker(),
    }, [
      el('div', { class: 'file-panel__dropzone-icon' }, [icon(Icons.upload, { size: 22 })]),
      el('div', { class: 'file-panel__dropzone-text' }, [
        el('span', { class: 'file-panel__dropzone-primary', text: t('file.drop') }),
        el('span', { class: 'file-panel__dropzone-secondary', text: t('file.staysLocal') }),
      ]),
    ]);

    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      zone.dataset.dragover = 'true';
    });

    zone.addEventListener('dragleave', () => {
      delete zone.dataset.dragover;
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      delete zone.dataset.dragover;
      const file = event.dataTransfer?.files?.[0];
      if (file) this._emitSelect(file);
    });

    return zone;
  }

  _renderLoading() {
    return el('div', { class: 'file-panel__body file-panel__body--loading' }, [
      el('div', { class: 'skeleton skeleton--line skeleton--w60' }),
      el('div', { class: 'skeleton skeleton--line skeleton--w40' }),
      el('div', { class: 'skeleton skeleton--line skeleton--w80' }),
      el('div', { class: 'skeleton skeleton--block' }),
    ]);
  }

  _renderReady() {
    const inspection = this.inspection;
    const children = [];

    children.push(el('dl', { class: 'file-panel__meta' }, [
      this._metaItem(t('file.rows'), formatCount(inspection.rowCount)),
      this._metaItem(t('file.columns'), formatCount(inspection.columns.length)),
      this._metaItem(t('file.delimiter'), delimiterLabel(inspection.delimiter)),
      this._metaItem(t('file.encoding'), orDash(inspection.encoding)),
      this._metaItem(t('file.size'), formatBytes(inspection.sizeBytes)),
    ]));

    if (inspection.warnings?.length) {
      children.push(el('div', { class: 'file-panel__warnings' },
        inspection.warnings.slice(0, 3).map((warning) =>
          el('div', {
            class: 'toast',
            dataset: { severity: warning.severity },
            role: warning.severity === 'error' ? 'alert' : 'status',
          }, [
            icon(Icons.alert, { size: 14 }),
            el('div', {}, [
              el('div', { class: 'u-weight-semi', text: warning.title }),
              warning.message ? el('div', { class: 'u-text-sm u-text-muted', text: warning.message }) : null,
            ]),
          ])
        )
      ));
    }

    if (inspection.previewRows?.length && inspection.columns?.length) {
      children.push(this._renderPreview(inspection));
    }

    return el('div', { class: 'file-panel__body' }, children);
  }

  _metaItem(label, value) {
    return el('div', { class: 'file-panel__meta-item' }, [
      el('dt', { class: 'file-panel__meta-label', text: label }),
      el('dd', { class: 'file-panel__meta-value', text: value }),
    ]);
  }

  _renderPreview(inspection) {
    const columns = inspection.columns.slice(0, 5);

    const thead = el('thead', {}, [
      el('tr', {}, columns.map((column) =>
        el('th', { scope: 'col', text: column.label, title: column.label })
      )),
    ]);

    const tbody = el('tbody', {}, inspection.previewRows.slice(0, 5).map((row) =>
      el('tr', {}, columns.map((column) =>
        el('td', { text: orDash(row[column.id]) })
      ))
    ));

    return el('div', { class: 'file-panel__preview' }, [
      el('div', { class: 'file-panel__preview-label u-text-xs u-text-faint', text: t('file.preview') }),
      el('div', { class: 'file-panel__preview-scroll' }, [
        el('table', { class: 'file-panel__preview-table' }, [thead, tbody]),
      ]),
      inspection.rowCount && inspection.rowCount > inspection.previewRows.length
        ? el('div', {
            class: 'file-panel__preview-foot u-text-xs u-text-faint',
            text: t('file.showingRows', {
              shown: Math.min(inspection.previewRows.length, 5),
              total: formatCount(inspection.rowCount),
            }),
          })
        : null,
    ]);
  }

  _renderError() {
    return el('div', { class: 'file-panel__body' }, [
      el('div', { class: 'toast', dataset: { severity: 'error' }, role: 'alert' }, [
        icon(Icons.alert, { size: 16 }),
        el('div', {}, [
          el('div', { class: 'u-weight-semi', text: t('file.readError') }),
          el('div', { class: 'u-text-sm u-text-muted', text: this.errorMessage ?? t('file.tryDifferent') }),
        ]),
      ]),
      el('button', {
        type: 'button',
        class: 'btn btn--secondary btn--sm u-mt-2',
        onclick: () => this._openPicker(),
      }, [icon(Icons.refresh, { size: 14 }), t('file.chooseAnother')]),
    ]);
  }
}
