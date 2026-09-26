import { el, icon, Icons } from '../renderers/dom.js';

/**
 * MappingRow — one row in the mapping workspace.
 * Visual: source column → target column, with role selector.
 * Drag & drop is a convenience; the select is the accessible path.
 */
export class MappingRow {
  /**
   * @param {{
   *   role: 'key' | 'compare' | 'display' | 'ignore',
   *   columnsA: import('../../models/contracts.js').ColumnInfo[],
   *   columnsB: import('../../models/contracts.js').ColumnInfo[],
   *   value: { columnA: string | null, columnB: string | null, type?: string, tolerance?: { mode: string, value: number } },
   *   onChange: (value: object) => void,
   *   onRemove: () => void,
   * }} config
   */
  constructor(config) {
    this.config = config;
    this.value = { ...config.value };
    this.root = el('div', {
      class: 'mapping-row',
      dataset: { role: config.role },
    });
    this._render();
  }

  update(value) {
    this.value = { ...this.value, ...value };
    this._render();
  }

  _render() {
    const { role, columnsA, columnsB } = this.config;

    const roleBadge = el('div', { class: 'mapping-row__role' }, [
      el('span', {
        class: `mapping-row__role-chip mapping-row__role-chip--${role}`,
        text: this._roleLabel(role),
      }),
    ]);

    const selectA = this._buildSelect(columnsA, this.value.columnA, 'File A column', (v) => {
      this.value.columnA = v;
      this.config.onChange({ ...this.value });
    });

    const selectB = this._buildSelect(columnsB, this.value.columnB, 'File B column', (v) => {
      this.value.columnB = v;
      this.config.onChange({ ...this.value });
    });

    const arrow = el('div', { class: 'mapping-row__arrow', 'aria-hidden': 'true' }, [
      icon(Icons.arrowRight, { size: 14 }),
    ]);

    const extras = [];
    if (role === 'compare' && this.value.type === 'number') {
      extras.push(this._renderTolerance());
    }

    const removeBtn = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--icon btn--sm mapping-row__remove',
      'aria-label': 'Remove mapping',
      title: 'Remove',
      onclick: () => this.config.onRemove(),
    }, [icon(Icons.x, { size: 12 })]);

    const body = el('div', { class: 'mapping-row__body' }, [
      el('div', { class: 'mapping-row__cell mapping-row__cell--a' }, [selectA]),
      arrow,
      el('div', { class: 'mapping-row__cell mapping-row__cell--b' }, [selectB]),
      ...extras,
      removeBtn,
    ]);

    this.root.replaceChildren(roleBadge, body);
  }

  _roleLabel(role) {
    if (role === 'key') return 'MATCH KEY';
    if (role === 'compare') return 'COMPARE';
    if (role === 'display') return 'DISPLAY';
    return 'IGNORE';
  }

  _buildSelect(columns, value, label, onChange) {
    const select = el('select', {
      class: 'select',
      'aria-label': label,
      onchange: (e) => onChange(e.target.value || null),
    });
    select.appendChild(el('option', { value: '', text: '— select —' }));
    for (const col of columns) {
      const opt = el('option', { value: col.id, text: col.label });
      if (col.id === value) opt.selected = true;
      select.appendChild(opt);
    }
    return select;
  }

  _renderTolerance() {
    const tol = this.value.tolerance ?? { mode: 'absolute', value: 0.01 };
    const modeSelect = el('select', {
      class: 'select select--sm',
      'aria-label': 'Tolerance mode',
      onchange: (e) => {
        this.value.tolerance = { ...tol, mode: e.target.value };
        this.config.onChange({ ...this.value });
      },
    }, [
      this._opt('absolute', '±', tol.mode === 'absolute'),
      this._opt('percentage', '%', tol.mode === 'percentage'),
    ]);
    const valueInput = el('input', {
      type: 'number',
      class: 'input input--sm',
      value: String(tol.value),
      step: '0.01',
      min: '0',
      'aria-label': 'Tolerance value',
      oninput: (e) => {
        this.value.tolerance = { ...tol, value: Number(e.target.value) };
        this.config.onChange({ ...this.value });
      },
    });
    return el('div', { class: 'mapping-row__tolerance' }, [modeSelect, valueInput]);
  }

  _opt(value, label, selected) {
    const o = el('option', { value, text: label });
    if (selected) o.selected = true;
    return o;
  }
}