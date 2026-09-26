import { el } from '../renderers/dom.js';

export function SkipLink() {
  return el('a', {
    href: '#main',
    class: 'skip-link',
    text: 'Skip to content',
  });
}