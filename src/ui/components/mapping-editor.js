import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { MappingRow } from './mapping-row.js';
import { AppEvents } from '../../app/app-events.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export class MappingEditor {
  constructor(store, service) {
    this.store = store;
    this.service = service;
    this.mapping = this._emptyMapping();

    this.root = el('section', {
      class: 'mapping-workspace',
      'aria-label': t('mapping.aria'),
    });

    this._render();
    this.store.addEventListener('change', () => this._onStoreChange());
    this.store.addEventListener('state', () => this._onStoreChange());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._render());
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
          const keySuggestion = suggestions.find((suggestion) => suggestion.role === 'key')
            ?? suggestions[0];

          this.mapping.keys = keySuggestion
            ? [{
                columnA: keySuggestion.columnA,
                columnB: keySuggestion.columnB,
                type: 'text',
              }]
            : [];

          this.mapping.comparisons = suggestions
            .filter((suggestion) => (
              suggestion !== keySuggestion && suggestion.role !== 'key'
            ))
            .map((suggestion) => ({
              columnA: suggestion.columnA,
              columnB: suggestion.columnB,
              type: this._guessType(suggestion.columnA, suggestion.columnB),
              tolerance: { mode: 'absolute', value: 0.01 },
            }));
        }
      } catch {
        // Suggestions are optional.
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

  _guessType(columnA, columnB) {
    const typeA = this.store.fileA?.columns.find((column) => column.id === columnA)?.inferredType;
    const typeB = this.store.fileB?.columns.find((column) => column.id === columnB)?.inferredType;
    if (typeA === 'number' || typeB === 'number') return 'number';
    if (typeA === 'date' || typeB === 'date') return 'date';
    return 'text';
  }

  _emitUpdate() {
    this.store.patch({ mapping: this.mapping });
    this._validate();
    window.dispatchEvent(new CustomEvent(AppEvents.MAPPING_UPDATED, { detail: this.mapping }));
  }

  _emitNormalization() {
    this.store.patch({ mapping: this.mapping });
    window.dispatchEvent(new CustomEvent(AppEvents.NORMALIZATION_UPDATED, {
      detail: this.mapping.normalization,
    }));
  }

  _addRow(role) {
    const item = { columnA: null, columnB: null, type: 'text' };
    if (role === 'key') this.mapping.keys.push(item);
    if (role === 'compare') {
      this.mapping.comparisons.push({
        ...item,
        tolerance: { mode: 'absolute', value: 0.01 },
      });
    }
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
    const validKeys = this.mapping.keys.filter((key) => key.columnA && key.columnB);
    const valid = validKeys.length > 0 &&
      this.mapping.keys.every((key) => key.columnA && key.columnB);

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
    this.root.setAttribute('aria-label', t('mapping.aria'));

    replaceChildren(this.root, [
      el('header', { class: 'mapping-workspace__header' }, [
        el('div', {}, [
          el('h2', { class: 'mapping-workspace__title', text: t('mapping.title') }),
          el('p', { class: 'mapping-workspace__hint', text: t('mapping.hint') }),
        ]),
      ]),
      this._renderColumnHeaders(),
      this._renderKeys(columnsA, columnsB),
      this._renderComparisons(columnsA, columnsB),
      this._renderNormalization(),
      this._renderActions(),
    ]);
  }

  _renderColumnHeaders() {
    return el('div', { class: 'mapping-workspace__col-heads' }, [
      el('div', { class: 'mapping-workspace__col-head' }, [
        el('span', { class: 'mapping-workspace__col-label', text: t('file.label', { slot: 'A' }).toUpperCase() }),
        el('span', { class: 'mapping-workspace__col-name u-truncate', text: this.store.fileA?.name ?? '—' }),
      ]),
      el('div', { class: 'mapping-workspace__col-head mapping-workspace__col-head--spacer', 'aria-hidden': 'true' }),
      el('div', { class: 'mapping-workspace__col-head' }, [
        el('span', { class: 'mapping-workspace__col-label', text: t('file.label', { slot: 'B' }).toUpperCase() }),
        el('span', { class: 'mapping-workspace__col-name u-truncate', text: this.store.fileB?.name ?? '—' }),
      ]),
    ]);
  }

  _renderKeys(columnsA, columnsB) {
    return el('div', { class: 'mapping-workspace__group' }, [
      el('div', { class: 'mapping-workspace__group-head' }, [
        el('h3', { class: 'mapping-workspace__group-title', text: t('mapping.matchKeys') }),
        el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: t('mapping.matchKeysHint') }),
        el('button', {
          type: 'button',
          class: 'btn btn--ghost btn--sm',
          onclick: () => this._addRow('key'),
        }, [t('mapping.addKey')]),
      ]),
      this.mapping.keys.length === 0
        ? el('div', { class: 'mapping-workspace__empty', text: t('mapping.noKeys') })
        : el('div', { class: 'mapping-workspace__rows' },
            this.mapping.keys.map((key, index) =>
              new MappingRow({
                role: 'key',
                columnsA,
                columnsB,
                value: key,
                onChange: (value) => {
                  this.mapping.keys[index] = value;
                  this._emitUpdate();
                },
                onRemove: () => this._removeRow('key', index),
              }).root
            )
          ),
    ]);
  }

  _renderComparisons(columnsA, columnsB) {
    return el('div', { class: 'mapping-workspace__group' }, [
      el('div', { class: 'mapping-workspace__group-head' }, [
        el('h3', { class: 'mapping-workspace__group-title', text: t('mapping.compareFields') }),
        el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: t('mapping.compareHint') }),
        el('button', {
          type: 'button',
          class: 'btn btn--ghost btn--sm',
          onclick: () => this._addRow('compare'),
        }, [t('mapping.addCompare')]),
      ]),
      this.mapping.comparisons.length === 0
        ? el('div', { class: 'mapping-workspace__empty', text: t('mapping.noCompare') })
        : el('div', { class: 'mapping-workspace__rows' },
            this.mapping.comparisons.map((comparison, index) =>
              new MappingRow({
                role: 'compare',
                columnsA,
                columnsB,
                value: comparison,
                onChange: (value) => {
                  this.mapping.comparisons[index] = value;
                  this._emitUpdate();
                },
                onRemove: () => this._removeRow('compare', index),
              }).root
            )
          ),
    ]);
  }

  _renderNormalization() {
    const normalization = this.mapping.normalization;

    const toggle = (label, key) =>
      el('label', { class: 'toggle' }, [
        el('input', {
          type: 'checkbox',
          checked: normalization[key] ? 'checked' : null,
          onchange: (event) => {
            this.mapping.normalization[key] = event.target.checked;
            this._emitNormalization();
          },
        }),
        el('span', { class: 'toggle__track' }, [el('span', { class: 'toggle__thumb' })]),
        el('span', { class: 'toggle__label', text: label }),
      ]);

    return el('details', { class: 'mapping-workspace__group mapping-workspace__group--collapsible' }, [
      el('summary', { class: 'mapping-workspace__group-head mapping-workspace__summary' }, [
        el('h3', { class: 'mapping-workspace__group-title', text: t('mapping.normalization') }),
        el('span', { class: 'mapping-workspace__group-hint u-text-xs u-text-muted', text: t('mapping.normalizationHint') }),
      ]),
      el('div', { class: 'mapping-workspace__normalization' }, [
        toggle(t('mapping.trim'), 'trimText'),
        toggle(t('mapping.ignoreCase'), 'caseInsensitive'),
        toggle(t('mapping.collapseWhitespace'), 'collapseWhitespace'),
        this._renderDateFormat('A', 'dateFormatA'),
        this._renderDateFormat('B', 'dateFormatB'),
      ]),
    ]);
  }

  _renderDateFormat(slot, key) {
    const normalization = this.mapping.normalization;
    const select = el('select', {
      class: 'select select--sm',
      'aria-label': t('mapping.dateFormatFile', { slot }),
      onchange: (event) => {
        normalization[key] = event.target.value || null;
        this._emitNormalization();
      },
    }, [
      this._dateOption('', t('mapping.dateFormat.auto'), !normalization[key]),
      this._dateOption('iso', 'YYYY-MM-DD', normalization[key] === 'iso'),
      this._dateOption('dmy', 'DD/MM/YYYY', normalization[key] === 'dmy'),
      this._dateOption('mdy', 'MM/DD/YYYY', normalization[key] === 'mdy'),
    ]);

    return el('label', { class: 'mapping-workspace__date-format' }, [
      el('span', {
        class: 'mapping-workspace__date-format-label',
        text: t('mapping.dateFormatFile', { slot }),
      }),
      select,
    ]);
  }

  _dateOption(value, label, selected) {
    const option = el('option', { value, text: label });
    if (selected) option.selected = true;
    return option;
  }

  _renderActions() {
    const disabled = !this.store.mappingValid;

    return el('div', { class: 'mapping-workspace__actions' }, [
      el('button', {
        type: 'button',
        class: 'btn btn--ghost',
        onclick: () => window.dispatchEvent(new CustomEvent(AppEvents.RESET_REQUESTED)),
      }, [icon(Icons.refresh, { size: 14 }), t('mapping.startOver')]),
      el('button', {
        type: 'button',
        class: 'btn btn--primary btn--lg',
        disabled: disabled ? 'true' : null,
        'aria-disabled': disabled ? 'true' : null,
        onclick: () => {
          if (disabled) return;
          window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_REQUESTED, {
            detail: { mapping: this.mapping },
          }));
        },
      }, [icon(Icons.zap, { size: 16 }), t('mapping.compareFiles')]),
    ]);
  }
}
