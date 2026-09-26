import { parseFlexibleNumber } from './delimited-parser.js';

export function normalizeText(value, config = {}) {
  let result = String(value ?? '');

  if (config.trimText !== false) result = result.trim();
  if (config.collapseWhitespace !== false) result = result.replace(/\s+/g, ' ');
  if (config.caseInsensitive !== false) result = result.toLocaleLowerCase();

  return result;
}

export function normalizeKey(row, mappings, config = {}) {
  return mappings
    .map((mapping) => {
      const raw = row[mapping.columnA ?? mapping.columnB] ?? '';
      return normalizeText(raw, config);
    })
    .join('\u001F');
}

export function normalizeKeyForSide(row, mappings, side, config = {}) {
  return mappings
    .map((mapping) => {
      const column = side === 'A' ? mapping.columnA : mapping.columnB;
      return normalizeText(row[column] ?? '', config);
    })
    .join('\u001F');
}

export function compareValues(valueA, valueB, mapping, config = {}) {
  if (mapping.type === 'number') {
    const a = parseFlexibleNumber(valueA);
    const b = parseFlexibleNumber(valueB);

    if (a === null || b === null) {
      return {
        equal: normalizeText(valueA, config) === normalizeText(valueB, config),
        delta: null,
      };
    }

    const delta = Math.abs(a - b);
    const tolerance = mapping.tolerance?.value ?? 0;

    if (mapping.tolerance?.mode === 'percentage') {
      const base = Math.max(Math.abs(a), Math.abs(b), Number.EPSILON);
      return {
        equal: (delta / base) * 100 <= tolerance,
        delta,
      };
    }

    return {
      equal: delta <= tolerance,
      delta,
    };
  }

  return {
    equal: normalizeText(valueA, config) === normalizeText(valueB, config),
    delta: null,
  };
}
