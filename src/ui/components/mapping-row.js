import { el, icon, Icons } from '../renderers/dom.js';
import { t } from '../../i18n/index.js';

export class MappingRow {
  constructor(config) {
    this.config = config;
    this.value = { ...config.value };
    this.root = el('div', {
      class: 'mapping-row',
      dataset: { role: config.role },
    });
    this._render();
  }

  _render() {
    const { role, columnsA, columnsB } = this.config;

    const roleBadge = el('div', { class: 'mapping-row__role' }, [
      el('span', {
        class: 'mapping-row__role-chip mapping-row__role-chip--' + role,
        text: this._roleLabel(role),
      }),
    ]);

    const selectA = this._buildSelect(
      columnsA,
      this.value.columnA,
      t('mapping.fileAColumn'),
      (value) => {
        this.value.columnA = value;
        this.config.onChange({ ...this.value });
      }
    );

    const selectB = this._buildSelect(
      columnsB,
      this.value.columnB,
      t('mapping.fileBColumn'),
      (value) => {
        this.value.columnB = value;
        this.config.onChange({ ...this.value });
      }
    );

    const arrow = el('div', { class: 'mapping-row__arrow', 'aria-hidden': 'true' }, [
      icon(Icons.arrowRight, { size: 14 }),
    ]);

    const extras = [];
    if (role === 'compare' && this.value.type === 'number') {
      extras.push(this._renderTolerance());
    }

    const removeButton = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--icon btn--sm mapping-row__remove',
      'aria-label': t('mapping.remove'),
      title: t('mapping.remove'),
      onclick: () => this.config.onRemove(),
    }, [icon(Icons.x, { size: 12 })]);

    this.root.replaceChildren(
      roleBadge,
      el('div', { class: 'mapping-row__body' }, [
        el('div', { class: 'mapping-row__cell mapping-row__cell--a' }, [selectA]),
        arrow,
        el('div', { class: 'mapping-row__cell mapping-row__cell--b' }, [selectB]),
        ...extras,
        removeButton,
      ])
    );
  }

  _roleLabel(role) {
    if (role === 'key') return t('mapping.role.key');
    if (role === 'compare') return t('mapping.role.compare');
    if (role === 'display') return t('mapping.role.display');
    return t('mapping.role.ignore');
  }

  _buildSelect(columns, value, label, onChange) {
    const select = el('select', {
      class: 'select',
      'aria-label': label,
      onchange: (event) => onChange(event.target.value || null),
    });

    select.appendChild(el('option', { value: '', text: t('mapping.select') }));

    for (const column of columns) {
      const option = el('option', { value: column.id, text: column.label });
      select.appendChild(option);
    }

    select.value = value ?? '';
    return select;
  }

  _renderTolerance() {
    const tolerance = this.value.tolerance ?? { mode: 'absolute', value: 0.01 };

    const modeSelect = el('select', {
      class: 'select select--sm',
      'aria-label': t('mapping.toleranceMode'),
      onchange: (event) => {
        this.value.tolerance = { ...tolerance, mode: event.target.value };
        this.config.onChange({ ...this.value });
      },
    }, [
      this._option('absolute', '±', tolerance.mode === 'absolute'),
      this._option('percentage', '%', tolerance.mode === 'percentage'),
    ]);

    const valueInput = el('input', {
      type: 'number',
      class: 'input input--sm',
      value: String(tolerance.value),
      step: '0.01',
      min: '0',
      'aria-label': t('mapping.toleranceValue'),
      oninput: (event) => {
        this.value.tolerance = { ...tolerance, value: Number(event.target.value) };
        this.config.onChange({ ...this.value });
      },
    });

    return el('div', { class: 'mapping-row__tolerance' }, [modeSelect, valueInput]);
  }

  _option(value, label, selected) {
    const option = el('option', { value, text: label });
    if (selected) option.selected = true;
    return option;
  }
}
