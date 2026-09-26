const CANDIDATE_DELIMITERS = [',', ';', '\t'];

export function detectDelimiter(text) {
  const sample = String(text ?? '').slice(0, 65536);
  let best = { delimiter: ',', score: -Infinity };

  for (const delimiter of CANDIDATE_DELIMITERS) {
    const rows = parseDelimitedText(sample, delimiter, { tolerateUnclosedQuote: true })
      .filter((row) => row.some((cell) => String(cell).trim() !== ''))
      .slice(0, 20);

    if (rows.length < 2) continue;

    const widths = rows.map((row) => row.length);
    const modeWidth = mode(widths);
    const consistent = widths.filter((width) => width === modeWidth).length;
    const score = modeWidth > 1
      ? consistent * 10 + modeWidth - Math.max(...widths) + Math.min(...widths)
      : -100;

    if (score > best.score) best = { delimiter, score };
  }

  return best.delimiter;
}

export function parseDelimitedText(text, delimiter, options = {}) {
  const input = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      quoted = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (quoted && !options.tolerateUnclosedQuote) {
    throw new Error('CSV_PARSE_UNCLOSED_QUOTE');
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  while (
    rows.length &&
    rows[rows.length - 1].every((cell) => String(cell).trim() === '')
  ) {
    rows.pop();
  }

  return rows;
}

export function tableFromText(text) {
  const clean = String(text ?? '').replace(/^\uFEFF/, '');

  if (clean.includes('\uFFFD')) {
    throw new Error('UNSUPPORTED_ENCODING');
  }

  const delimiter = detectDelimiter(clean);
  const matrix = parseDelimitedText(clean, delimiter);

  if (matrix.length === 0) {
    throw new Error('EMPTY_FILE');
  }

  const maxWidth = Math.max(...matrix.map((row) => row.length));
  const rawHeader = [...matrix[0]];

  while (rawHeader.length < maxWidth) rawHeader.push('');

  const columns = dedupeHeaders(rawHeader);
  const rows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => {
      const record = {};
      for (let i = 0; i < columns.length; i += 1) {
        record[columns[i].id] = String(row[i] ?? '');
      }
      return record;
    });

  const typedColumns = columns.map((column) => ({
    ...column,
    inferredType: inferType(rows.map((row) => row[column.id])),
  }));

  return {
    delimiter,
    columns: typedColumns,
    rows,
  };
}

function dedupeHeaders(rawHeaders) {
  const used = new Map();

  return rawHeaders.map((raw, index) => {
    const base = String(raw ?? '').trim() || 'Column ' + (index + 1);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);

    const id = count === 1 ? base : base + ' (' + count + ')';
    return {
      id,
      label: id,
      inferredType: 'unknown',
    };
  });
}

function inferType(values) {
  const sample = values
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .slice(0, 200);

  if (sample.length === 0) return 'unknown';

  const numberHits = sample.filter((value) => parseFlexibleNumber(value) !== null).length;
  if (numberHits / sample.length >= 0.9) return 'number';

  const dateHits = sample.filter((value) => isDateLike(value)).length;
  if (dateHits / sample.length >= 0.9) return 'date';

  return 'text';
}

export function parseFlexibleNumber(value) {
  const raw = String(value ?? '').trim().replace(/\s+/g, '');
  if (!raw) return null;

  const normalized = raw.includes(',') && !raw.includes('.')
    ? raw.replace(',', '.')
    : raw.replace(/,/g, '');

  if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(normalized)) return null;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function isDateLike(value) {
  const raw = String(value ?? '').trim();
  return (
    /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(raw) ||
    /^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/.test(raw)
  );
}

function mode(values) {
  const counts = new Map();
  let bestValue = values[0];
  let bestCount = 0;

  for (const value of values) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);

    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
    }
  }

  return bestValue;
}
