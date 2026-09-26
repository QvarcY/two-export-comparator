import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';

export class ComparingView {
  constructor(store) {
    this.store = store;
    this.root = el('section', { class: 'app-main', hidden: '' });
    store.addEventListener('state', () => this._sync());
    store.addEventListener('change', () => this._sync());
    this._sync();
  }

  _sync() {
    const active = this.store.state === 'COMPARING';
    this.root.hidden = !active;
    if (!active) return;
    this._render();
  }

  _render() {
    const p = this.store.progress;
    const determinate = p && Number.isFinite(p.completed) && Number.isFinite(p.total) && p.total > 0;
    const pct = determinate ? Math.min(100, Math.round((p.completed / p.total) * 100)) : null;

    const phases = [
      { id: 'parse-a', label: 'Parse File A' },
      { id: 'parse-b', label: 'Parse File B' },
      { id: 'index', label: 'Index records' },
      { id: 'compare', label: 'Compare' },
      { id: 'finalize', label: 'Finalize' },
    ];
    const currentIdx = p ? phases.findIndex((x) => x.id === p.phase) : -1;

    replaceChildren(this.root, [
      el('div', { class: 'u-container' }, [
        el('section', { class: 'comparing' }, [
          el('div', { class: 'comparing__spinner', 'aria-hidden': 'true' }),
          el('h2', { class: 'comparing__title', text: p?.message ?? 'Preparing…' }),
          el('p', { class: 'comparing__subtitle u-text-muted', text: 'Working locally. Nothing leaves this browser.' }),
          el('div', {
            class: 'comparing__bar',
            role: 'progressbar',
            'aria-label': 'Comparison progress',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            ...(determinate ? { 'aria-valuenow': String(pct) } : {}),
          }, [
            el('div', {
              class: 'comparing__bar-fill',
              style: determinate ? 'width:' + pct + '%' : '',
              dataset: { indeterminate: determinate ? 'false' : 'true' },
            }),
          ]),
          el('ol', { class: 'comparing__phases' }, phases.map((ph, i) =>
            el('li', {
              class: 'comparing__phase',
              dataset: {
                state: i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending',
              },
            }, [
              el('span', { class: 'comparing__phase-dot' }, [
                i < currentIdx ? icon(Icons.check, { size: 12 }) : null,
              ]),
              el('span', { class: 'comparing__phase-label', text: ph.label }),
            ])
          )),
        ]),
      ]),
    ]);
  }
}
