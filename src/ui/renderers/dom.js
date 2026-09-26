/**
 * @file Safe DOM helpers. All imported cell values MUST go through here.
 * Rule: never assign untrusted content to innerHTML.
 */

/**
 * Create an element with attributes and children.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {Array<Node | string | null | undefined | false>} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.className = String(value);
    } else if (key === 'text') {
      // SAFE: only textContent, never innerHTML
      node.textContent = String(value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dk, dv] of Object.entries(value)) {
        if (dv !== null && dv !== undefined) node.dataset[dk] = String(dv);
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') {
      // Explicitly forbidden — throw early to catch mistakes in dev
      throw new Error('el(): use "text", not "html". Untrusted content must never be HTML.');
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      node.appendChild(child);
    }
  }

  return node;
}

/**
 * Replace all children of a container safely.
 * @param {HTMLElement} container
 * @param {Array<Node | string | null | undefined | false>} children
 */
export function replaceChildren(container, children) {
  container.replaceChildren();
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      container.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      container.appendChild(child);
    }
  }
}

/**
 * Inline SVG icon factory. No external network dependency.
 * @param {string} pathData
 * @param {{ size?: number, className?: string }} [options]
 * @returns {SVGElement}
 */
export function icon(pathData, { size = 16, className = '' } = {}) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);

  return svg;
}

/** @type {Record<string, string>} */
export const Icons = Object.freeze({
  upload: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  file: 'M14 3v5h5M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M4 12l5 5L20 6',
  alert: 'M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9a1.5 1.5 0 001.3 2.24h16.06a1.5 1.5 0 001.3-2.24l-8.02-13.9a1.5 1.5 0 00-2.6 0z',
  shield: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z',
  arrowRight: 'M5 12h14m0 0l-6-6m6 6l-6 6',
  refresh: 'M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-4m2 8a8 8 0 01-14 4',
  table: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  zap: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
});