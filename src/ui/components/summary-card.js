import { el } from '../renderers/dom.js';
import { formatCount } from '../renderers/format.js';

/**
 * SummaryCard — one status card. Acts as a filter toggle.
 */
export class SummaryCard {
  /**
   * @param {{
   *   status: import('../../models/contracts.js').ResultStatus | 'ALL',
   *   label: string,
   *   count: number,
   *   active: boolean,
   *   onClick: () => void,
   * }} config
   */
  constructor(config) {
    this.config = config;
    this.root = el('button', {
      type: 'button',
      class: 'summary-card',
      dataset: { status: config.status, active: config.active ? 'true' : 'false' },
      'aria-pressed': config.active ? 'true' : 'false',
      onclick: () => config.onClick(),
    }, [
      el('span', { class: 'summary-card__count', text: formatCount(config.count) }),
      el('span', { class: 'summary-card__label', text: config.label }),
      el('span', { class: 'summary-card__bar', 'aria-hidden': 'true' }),
    ]);
  }
}