import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { MappingRow } from './mapping-row.js';
import { AppEvents } from '../../app/app-events.js';

/**
 * MappingEditor — key/compare/display mapping UX and validation.
 * Suggests, but never commits mappings without user approval.
 */
export class MappingEditor {
  /**
   * @param {import('../../app/app-store.js').AppStore} store
   * @param {import('../../services/comparison-service.js').ComparisonService} service
   */
  constructor(store, service) {
    this.store = store;
    this.service = service;

    /** @type {import('../../models/contracts.js').MappingConfig} */
    this.mapping = this._emptyMapping();

    this.root = el('section', {
      class: 'mapping-workspace',
      'aria-label': 'Column mapping',
    });

    this._render();
    this.store.addEventListener('change', () => this._onStoreChange());
    this.store.addEventListener('state', () => this._onStoreChange());
  }

  _emptyMapping() {
    return {
      keys: [],
      comparisons: [],
      displayOnly: { fileA: [], fileB: [] },
      normalization: {
        trimText: true,
        caseInsensitive: true,
        collapseWhitespace: true,
        numberLocale: 'auto',
        dateFormatA: null,
        dateFormatB: null,
      },
    };
  }

  async _onStoreChange() {
    if (this.store.fileA && this.store.fileB && !this._suggestionsFetched) {
      this._suggestionsFetched = true;
      try {
        const suggestions = await this.service.suggestMappings(this.store.fileA, this.store.fileB);
        if (suggestions?.length) {
          this.mapping.keys = suggestions
            .filter((_, i) => i === 0)
            .map((s) => ({ columnA: s.columnA, columnB: s.columnB, type: 'text' }));
          this.mapping.comparisons = suggestions
            .slice(1)
            .map((s) => ({
              columnA: s.columnA,
              columnB: s.columnB,
              type: this._guessType(s.columnA, s.columnB),
              tolerance: { mode: 'absolute', value: 0.01 },
            }));
        }
      } catch {
        // Suggestions are optional; never block the UI.
      }
      this._render();
      this._emitUpdate();
    }
    if (!this.store.fileA || !this.store.fileB) {
      this._suggestionsFetched = false;
      this.mapping = this._emptyMapping();
      this._render();
    }
  }

  _guessType(colA, colB) {
    const a = this.store.fileA?.columns.find((c) => c.id === colA)?.inferredType;
    const b = this.store.fileB?.columns.find((c) => c.id === colB)?.inferredType;
    if (a === 'number' || b === 'number') return 'number';
    if (a === 'date' || b === 'date') return 'date';
    return 'text';
  }

  _emitUpdate() {
    this.store.patch({ mapping: this.mapping });
    this._validate();
    window.dispatchEvent(new CustomEvent(AppEvents.MAPPING_UPDATED, { detail: this.mapping }));
  }

  _emitNormalization() {
    this.store.patch({ mapping: this.mapping });
    window.dispatchEvent(new CustomEvent(AppEvents.NORMALIZATION_UPDATED, { detail: this.mapping.normalization }));
  }

  _addRow(role) {
    const item = { columnA: null, columnB: null, type: 'text' };
    if (role === 'key') this.mapping.keys.push(item);
    else if (role === 'compare') this.mapping.comparisons.push({ ...item, tolerance: { mode: 'absolute', value: 0.01 } });
    this._emitUpdate();
    this._render();
  }

  _removeRow(role, index) {
    if (role === 'key') this.mapping.keys.splice(index, 1);
    else this.mapping.comparisons.splice(index, 1);
    this._emitUpdate();
    this._render();
  }

  _validate() {
    const validKeys = this.mapping.keys.filter((k) => k.columnA && k.columnB);
    const valid = validKeys.length > 0 &&
      this.mapping.keys.every((k) => k.columnA && k.columnB);
    this.store.patch({ mappingValid: valid });
    if (valid && this.store.state === 'MAPPING') {
      this.store.setState('READY_TO_COMPARE');
    } else if (!valid && this.store.state === 'READY_TO_COMPARE') {
      this.store.setState('MAPPING');
    }
  }

  _render() {
    const columnsA = this.store.fileA?.columns ?? [];
    const columnsB = this.store.fileB?.columns ?? [];

    replaceChildren(this.root, [
      el('header', { class: 'mapping-workspace__header' }, [
        el('div', {}, [
          el('h2', { class: 'mapping-workspace__title', text: 'Match the columns' }),
          el('p', {
            class: 'mapping-workspace__hint',
            text: 'Define which columns identify a record and which values to compare. Suggestions are proposals — review before running.',
          }),
        ]),
      ]),

      this._renderColumnHeaders(),

      el('div', { class: 'mapping-workspace__group' }, [
        el('div', { class: 'mapping-workspace__group-head' }, [
          el('h3', { class: 'mapping-workspace__group-title', text: 'Match keys' }),
          el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: 'Required · identifies records across both files' }),
          el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--sm',
            onclick: () => this._addRow('key'),
          }, ['+ Add key']),
        ]),
        this.mapping.keys.length === 0
          ? el('div', { class: 'mapping-workspace__empty', text: 'No match keys yet. Add at least one.' })
          : el('div', { class: 'mapping-workspace__rows' },
              this.mapping.keys.map((k, i) =>
                new MappingRow({
                  role: 'key',
                  columnsA, columnsB,
                  value: k,
                  onChange: (v) => { this.mapping.keys[i] = v; this._emitUpdate(); },
                  onRemove: () => this._removeRow('key', i),
                }).root
              )
            ),
      ]),

      el('div', { class: 'mapping-workspace__group' }, [
        el('div', { class: 'mapping-workspace__group-head' }, [
          el('h3', { class: 'mapping-workspace__group-title', text: 'Compare fields' }),
          el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: 'Optional · values that must match' }),
          el('button', {
            type: 'button',
            class: 'btn btn--ghost btn--sm',
            onclick: () => this._addRow('compare'),
          }, ['+ Add compare']),
        ]),
        this.mapping.comparisons.length === 0
          ? el('div', { class: 'mapping-workspace__empty', text: 'No compare fields yet.' })
          : el('div', { class: 'mapping-workspace__rows' },
              this.mapping.comparisons.map((c, i) =>
                new MappingRow({
                  role: 'compare',
                  columnsA, columnsB,
                  value: c,
                  onChange: (v) => { this.mapping.comparisons[i] = v; this._emitUpdate(); },
                  onRemove: () => this._removeRow('compare', i),
                }).root
              )
            ),
      ]),

      this._renderNormalization(),
      this._renderActions(),
    ]);
  }

  _renderColumnHeaders() {
    return el('div', { class: 'mapping-workspace__col-heads' }, [
      el('div', { class: 'mapping-workspace__col-head' }, [
        el('span', { class: 'mapping-workspace__col-label', text: 'FILE A' }),
        el('span', { class: 'mapping-workspace__col-name u-truncate', text: this.store.fileA?.name ?? '—' }),
      ]),
      el('div', { class: 'mapping-workspace__col-head mapping-workspace__col-head--spacer', 'aria-hidden': 'true' }),
      el('div', { class: 'mapping-workspace__col-head' }, [
        el('span', { class: 'mapping-workspace__col-label', text: 'FILE B' }),
        el('span', { class: 'mapping-workspace__col-name u-truncate', text: this.store.fileB?.name ?? '—' }),
      ]),
    ]);
  }

  _renderNormalization() {
    const n = this.mapping.normalization;
    const toggle = (label, key) =>
      el('label', { class: 'toggle' }, [
        el('input', {
          type: 'checkbox',
          checked: n[key] ? 'checked' : null,
          onchange: (e) => {
            this.mapping.normalization[key] = e.target.checked;
            this._emitNormalization();
          },
        }),
        el('span', { class: 'toggle__track' }, [el('span', { class: 'toggle__thumb' })]),
        el('span', { class: 'toggle__label', text: label }),
      ]);

    return el('details', { class: 'mapping-workspace__group mapping-workspace__group--collapsible' }, [
      el('summary', { class: 'mapping-workspace__group-head mapping-workspace__summary' }, [
        el('h3', { class: 'mapping-workspace__group-title', text: 'Normalization' }),
        el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: 'How values are treated before matching' }),
      ]),
      el('div', { class: 'mapping-workspace__normalization' }, [
        toggle('Trim whitespace', 'trimText'),
        toggle('Ignore case', 'caseInsensitive'),
        toggle('Collapse internal whitespace', 'collapseWhitespace'),
      ]),
    ]);
  }

  _renderActions() {
    const disabled = !this.store.mappingValid;
    return el('div', { class: 'mapping-workspace__actions' }, [
      el('button', {
        type: 'button',
        class: 'btn btn--ghost',
        onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.RESET_REQUESTED)),
      }, [icon(Icons.refresh, { size: 14 }), 'Start over']),
      el('button', {
        type: 'button',
        class: 'btn btn--primary btn--lg',
        disabled: disabled ? 'true' : null,
        'aria-disabled': disabled ? 'true' : null,
        onclick: () => {
          if (disabled) return;
          window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_REQUESTED, { detail: { mapping: this.mapping } }));
        },
      }, [icon(Icons.zap, { size: 16 }), 'Compare files']),
    ]);
  }
}