import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

export class ComparingView {
  constructor(store) {
    this.store = store;
    this.root = el('section', { class: 'app-main', hidden: '' });
    store.addEventListener('state', () => this._sync());
    store.addEventListener('change', () => this._sync());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._sync());
    this._sync();
  }

  _sync() {
    const active = this.store.state === 'COMPARING';
    this.root.hidden = !active;
    if (active) this._render();
  }

  _render() {
    const progress = this.store.progress;
    const determinate = progress &&
      Number.isFinite(progress.completed) &&
      Number.isFinite(progress.total) &&
      progress.total > 0;

    const percent = determinate
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : null;

    const phases = [
      { id: 'parse-a', label: t('comparing.phase.parse-a') },
      { id: 'parse-b', label: t('comparing.phase.parse-b') },
      { id: 'index', label: t('comparing.phase.index') },
      { id: 'compare', label: t('comparing.phase.compare') },
      { id: 'finalize', label: t('comparing.phase.finalize') },
    ];

    const currentIndex = progress
      ? phases.findIndex((phase) => phase.id === progress.phase)
      : -1;

    const title = currentIndex >= 0
      ? phases[currentIndex].label
      : t('comparing.preparing');

    replaceChildren(this.root, [
      el('div', { class: 'u-container' }, [
        el('section', {
          class: 'comparing',
          'aria-live': 'polite',
          'aria-busy': 'true',
          'aria-atomic': 'true',
        }, [
          el('div', { class: 'comparing__spinner', 'aria-hidden': 'true' }),
          el('h2', { class: 'comparing__title', text: title }),
          el('p', { class: 'comparing__subtitle u-text-muted', text: t('comparing.local') }),
          el('div', {
            class: 'comparing__bar',
            role: 'progressbar',
            'aria-label': t('comparing.progress'),
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            ...(determinate ? { 'aria-valuenow': String(percent) } : {}),
          }, [
            el('div', {
              class: 'comparing__bar-fill',
              style: determinate ? 'width:' + percent + '%' : '',
              dataset: { indeterminate: determinate ? 'false' : 'true' },
            }),
          ]),
          el('ol', { class: 'comparing__phases' }, phases.map((phase, index) =>
            el('li', {
              class: 'comparing__phase',
              dataset: {
                state: index < currentIndex
                  ? 'done'
                  : index === currentIndex
                    ? 'active'
                    : 'pending',
              },
            }, [
              el('span', { class: 'comparing__phase-dot' }, [
                index < currentIndex ? icon(Icons.check, { size: 12 }) : null,
              ]),
              el('span', { class: 'comparing__phase-label', text: phase.label }),
            ])
          )),
        ]),
      ]),
    ]);
  }
}
