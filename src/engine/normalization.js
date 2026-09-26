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

export function normalizeDate(value, format = 'auto') {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const selected = format || 'auto';

  if (selected === 'iso') {
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
    return iso && validDateParts(Number(iso[1]), Number(iso[2]), Number(iso[3]))
      ? iso[1] + '-' + iso[2] + '-' + iso[3]
      : null;
  }

  if (selected === 'dmy' || selected === 'mdy') {
    return normalizeSeparatedDate(raw, selected);
  }

  const exactIso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (exactIso && validDateParts(
    Number(exactIso[1]),
    Number(exactIso[2]),
    Number(exactIso[3])
  )) {
    return exactIso[1] + '-' + exactIso[2] + '-' + exactIso[3];
  }

  const parts = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!parts) return null;

  const first = Number(parts[1]);
  const second = Number(parts[2]);
  const year = Number(parts[3]);

  if (first > 12 && second <= 12) {
    return formatDateParts(year, second, first);
  }

  if (second > 12 && first <= 12) {
    return formatDateParts(year, first, second);
  }

  if (first === second) {
    return formatDateParts(year, second, first);
  }

  return null;
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

  if (mapping.type === 'date') {
    const a = normalizeDate(valueA, config.dateFormatA || 'auto');
    const b = normalizeDate(valueB, config.dateFormatB || 'auto');

    if (a !== null && b !== null) {
      return {
        equal: a === b,
        delta: null,
      };
    }
  }

  return {
    equal: normalizeText(valueA, config) === normalizeText(valueB, config),
    delta: null,
  };
}

function normalizeSeparatedDate(raw, format) {
  const parts = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!parts) return null;

  const first = Number(parts[1]);
  const second = Number(parts[2]);
  const year = Number(parts[3]);
  const month = format === 'dmy' ? second : first;
  const day = format === 'dmy' ? first : second;

  return formatDateParts(year, month, day);
}

function formatDateParts(year, month, day) {
  if (!validDateParts(year, month, day)) return null;

  return String(year).padStart(4, '0') + '-' +
    String(month).padStart(2, '0') + '-' +
    String(day).padStart(2, '0');
}

function validDateParts(year, month, day) {
  if (!Number.isInteger(year) || year < 1) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}
