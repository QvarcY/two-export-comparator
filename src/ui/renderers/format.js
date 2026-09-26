import { getLocale, t } from '../../i18n/index.js';

/**
 * @file Formatting utilities for displaying metadata.
 */

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export function formatCount(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(getLocale()).format(n);
}

export function orDash(s) {
  return s === null || s === undefined || s === '' ? '—' : String(s);
}

export function delimiterLabel(d) {
  if (!d) return '—';
  if (d === ',') return t('delimiter.comma');
  if (d === '\t') return t('delimiter.tab');
  if (d === ';') return t('delimiter.semicolon');
  if (d === '|') return t('delimiter.pipe');
  return '"' + d + '"';
}
