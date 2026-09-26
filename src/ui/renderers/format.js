/**
 * @file Formatting utilities for displaying metadata.
 */

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * @param {number | null | undefined} n
 * @returns {string}
 */
export function formatCount(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

/**
 * @param {string | null | undefined} s
 * @returns {string}
 */
export function orDash(s) {
  return s === null || s === undefined || s === '' ? '—' : String(s);
}

/**
 * Human-readable delimiter label.
 * @param {string | null | undefined} d
 * @returns {string}
 */
export function delimiterLabel(d) {
  if (!d) return '—';
  if (d === ',') return 'comma';
  if (d === '\t') return 'tab';
  if (d === ';') return 'semicolon';
  if (d === '|') return 'pipe';
  return `"${d}"`;
}