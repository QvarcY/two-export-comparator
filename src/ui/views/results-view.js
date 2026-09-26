import { el, replaceChildren, icon, Icons } from '../renderers/dom.js';
import { VisualDiff } from '../components/visual-diff.js';
import { AppEvents } from '../../app/app-events.js';
import { LOCALE_CHANGE_EVENT, t } from '../../i18n/index.js';

const ATTENTION_STATUSES = new Set([
  'MISMATCH',
  'ONLY_A',
  'ONLY_B',
  'DUPLICATE',
  'AMBIGUOUS',
]);

export class ResultsView {
  constructor(store) {
    this.store = store;
    this.root = el('section', { class: 'app-main', hidden: '' });

    store.addEventListener('state', () => this._sync());
    store.addEventListener('change', () => this._sync());
    window.addEventListener(LOCALE_CHANGE_EVENT, () => this._sync());

    this._sync();
  }

  _sync() {
    const active = this.store.state === 'RESULTS' && this.store.result;
    this.root.hidden = !active;

    if (!active) {
      replaceChildren(this.root, []);
      return;
    }

    this._render();
  }

  _render() {
    const records = this.store.result.records ?? [];
    const attentionCount = records.filter((record) =>
      ATTENTION_STATUSES.has(record.status)
    ).length;

    const title = attentionCount > 0
      ? t('visual.differencesFound')
      : t('visual.filesMatch');

    const subtitle = attentionCount > 0
      ? t('visual.diffSubtitle', { count: attentionCount })
      : t('visual.matchSubtitle');

    const visualDiff = new VisualDiff(this.store);

    replaceChildren(this.root, [
      el('div', { class: 'u-container visual-results' }, [
        el('header', { class: 'visual-results__header' }, [
          el('div', { class: 'visual-results__heading' }, [
            el('span', {
              class: 'visual-results__auto',
              text: t('visual.autoCompared'),
            }),
            el('h2', {
              class: 'visual-results__title',
              text: title,
            }),
            el('p', {
              class: 'visual-results__subtitle',
              text: subtitle,
            }),
          ]),
          el('div', { class: 'visual-results__actions' }, [
            el('button', {
              type: 'button',
              class: 'btn btn--ghost',
              onclick: () => window.dispatchEvent(
                new CustomEvent(AppEvents.EXPERT_MAPPING_REQUESTED)
              ),
            }, [t('visual.expert')]),
            el('button', {
              type: 'button',
              class: 'btn btn--ghost',
              onclick: () => window.dispatchEvent(
                new CustomEvent(AppEvents.RESET_REQUESTED)
              ),
            }, [icon(Icons.refresh, { size: 14 }), t('results.startOver')]),
            el('button', {
              type: 'button',
              class: 'btn btn--primary',
              onclick: () => window.dispatchEvent(
                new CustomEvent(AppEvents.EXPORT_REQUESTED, {
                  detail: { format: 'csv' },
                })
              ),
            }, [icon(Icons.table, { size: 14 }), t('results.exportCsv')]),
          ]),
        ]),
        visualDiff.root,
      ]),
    ]);
  }
}
