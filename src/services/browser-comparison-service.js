import { ComparisonService } from './comparison-service.js';
import { tableFromText } from '../engine/delimited-parser.js';
import { compareValues, normalizeKeyForSide } from '../engine/normalization.js';
import { suggestColumnMappings } from '../engine/mapping-suggester.js';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const PREVIEW_ROWS = 5;

export class BrowserComparisonService extends ComparisonService {
  constructor() {
    super();
    this._files = new Map();
  }

  async inspectFile(file, options = {}) {
    if (!file || typeof file.text !== 'function') {
      throw new Error('INVALID_FILE');
    }

    if (file.size > MAX_FILE_BYTES) {
      throw new Error('FILE_TOO_LARGE');
    }

    const text = await file.text();
    const parsed = tableFromText(text);

    const slot = options.slot === 'A' || options.slot === 'B'
      ? options.slot
      : (this._files.has('file-a') ? 'B' : 'A');

    const id = 'file-' + slot.toLowerCase();

    const inspection = {
      id,
      name: file.name || id + '.csv',
      sizeBytes: file.size ?? text.length,
      rowCount: parsed.rows.length,
      delimiter: parsed.delimiter,
      encoding: 'UTF-8',
      columns: parsed.columns,
      previewRows: parsed.rows.slice(0, PREVIEW_ROWS),
      warnings: [],
    };

    this._files.set(id, {
      file,
      inspection,
      parsed,
    });

    return inspection;
  }

  async suggestMappings(fileA, fileB) {
    const dataA = this._files.get(fileA.id);
    const dataB = this._files.get(fileB.id);

    if (!dataA || !dataB) return [];

    return suggestColumnMappings(
      fileA,
      fileB,
      dataA.parsed,
      dataB.parsed
    );
  }

  async compare(request, { onProgress } = {}) {
    const dataA = this._files.get(request.fileAId);
    const dataB = this._files.get(request.fileBId);

    if (!dataA || !dataB) {
      throw new Error('FILES_NOT_AVAILABLE');
    }

    const mapping = request.mapping;
    if (!mapping?.keys?.length) {
      throw new Error('MISSING_KEY_MAPPING');
    }

    onProgress?.({
      phase: 'index',
      message: 'Indexing records…',
      completed: 20,
      total: 100,
    });

    const indexA = buildIndex(dataA.parsed.rows, mapping.keys, 'A', mapping.normalization);
    const indexB = buildIndex(dataB.parsed.rows, mapping.keys, 'B', mapping.normalization);

    onProgress?.({
      phase: 'compare',
      message: 'Comparing records…',
      completed: 55,
      total: 100,
    });

    const records = [];
    const seenKeys = new Set();

    for (const [key, rowsA] of indexA.entries()) {
      seenKeys.add(key);
      const rowsB = indexB.get(key) ?? [];

      if (rowsB.length === 0) {
        for (const itemA of rowsA) {
          records.push(makeSingleSideRecord(
            'ONLY_A',
            key,
            itemA,
            null,
            dataA,
            dataB
          ));
        }
        continue;
      }

      if (rowsA.length > 1 || rowsB.length > 1) {
        records.push(makeDuplicateRecord(
          rowsA.length > 1 && rowsB.length > 1 ? 'AMBIGUOUS' : 'DUPLICATE',
          key,
          rowsA,
          rowsB,
          dataA,
          dataB
        ));
        continue;
      }

      records.push(comparePair(
        key,
        rowsA[0],
        rowsB[0],
        mapping,
        dataA,
        dataB
      ));
    }

    for (const [key, rowsB] of indexB.entries()) {
      if (seenKeys.has(key)) continue;

      for (const itemB of rowsB) {
        records.push(makeSingleSideRecord(
          'ONLY_B',
          key,
          null,
          itemB,
          dataA,
          dataB
        ));
      }
    }

    onProgress?.({
      phase: 'finalize',
      message: 'Finalizing…',
      completed: 100,
      total: 100,
    });

    const summary = {
      totalA: dataA.parsed.rows.length,
      totalB: dataB.parsed.rows.length,
      matched: countStatus(records, 'MATCHED'),
      onlyA: countStatus(records, 'ONLY_A'),
      onlyB: countStatus(records, 'ONLY_B'),
      mismatched: countStatus(records, 'MISMATCH'),
      duplicates: countStatus(records, 'DUPLICATE'),
      ambiguous: countStatus(records, 'AMBIGUOUS'),
    };

    return {
      runId: 'cmp-' + Date.now(),
      createdAt: new Date().toISOString(),
      summary,
      records,
      warnings: [],
    };
  }

  async createExport(result, options = {}) {
    const allowed = options.includeStatuses?.length
      ? new Set(options.includeStatuses)
      : null;

    const rows = [
      ['status', 'key', 'rowA', 'rowB', 'differences'],
    ];

    for (const record of result.records) {
      if (allowed && !allowed.has(record.status)) continue;

      rows.push([
        record.status,
        record.keyLabel,
        record.source?.rowA ?? '',
        record.source?.rowB ?? '',
        (record.differences ?? [])
          .map((difference) => {
            return difference.fieldA + ' ↔ ' + difference.fieldB +
              ': ' + String(difference.valueA ?? '') +
              ' → ' + String(difference.valueB ?? '');
          })
          .join(' | '),
      ]);
    }

    const csv = rows
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  reset() {
    this._files.clear();
  }
}

function buildIndex(rows, keys, side, normalization) {
  const index = new Map();

  rows.forEach((row, indexNumber) => {
    const key = normalizeKeyForSide(row, keys, side, normalization);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push({
      row,
      rowNumber: indexNumber + 2,
    });
  });

  return index;
}

function comparePair(key, itemA, itemB, mapping, dataA, dataB) {
  const differences = [];

  for (const comparison of mapping.comparisons ?? []) {
    const valueA = itemA.row[comparison.columnA] ?? '';
    const valueB = itemB.row[comparison.columnB] ?? '';
    const result = compareValues(
      valueA,
      valueB,
      comparison,
      mapping.normalization
    );

    if (!result.equal) {
      differences.push({
        field: comparison.columnA,
        fieldA: comparison.columnA,
        fieldB: comparison.columnB,
        valueA,
        valueB,
        ...(result.delta !== null ? { delta: result.delta } : {}),
      });
    }
  }

  return {
    id: nextResultId(),
    status: differences.length ? 'MISMATCH' : 'MATCHED',
    keyLabel: readableKey(key),
    source: {
      rowA: itemA.rowNumber,
      rowB: itemB.rowNumber,
    },
    displayA: displayRow(itemA.row, dataA.inspection.columns),
    displayB: displayRow(itemB.row, dataB.inspection.columns),
    differences,
  };
}

function makeSingleSideRecord(status, key, itemA, itemB, dataA, dataB) {
  return {
    id: nextResultId(),
    status,
    keyLabel: readableKey(key),
    source: {
      rowA: itemA?.rowNumber ?? null,
      rowB: itemB?.rowNumber ?? null,
    },
    ...(itemA
      ? { displayA: displayRow(itemA.row, dataA.inspection.columns) }
      : {}),
    ...(itemB
      ? { displayB: displayRow(itemB.row, dataB.inspection.columns) }
      : {}),
  };
}

function makeDuplicateRecord(status, key, rowsA, rowsB, dataA, dataB) {
  return {
    id: nextResultId(),
    status,
    keyLabel: readableKey(key),
    source: {
      rowA: rowsA[0]?.rowNumber ?? null,
      rowB: rowsB[0]?.rowNumber ?? null,
    },
    ...(rowsA[0]
      ? { displayA: displayRow(rowsA[0].row, dataA.inspection.columns) }
      : {}),
    ...(rowsB[0]
      ? { displayB: displayRow(rowsB[0].row, dataB.inspection.columns) }
      : {}),
  };
}

function displayRow(row, columns) {
  const result = {};
  for (const column of columns) result[column.label] = row[column.id] ?? '';
  return result;
}

function countStatus(records, status) {
  return records.filter((record) => record.status === status).length;
}

function readableKey(key) {
  return String(key ?? '').split('\u001F').join(' · ');
}

let resultCounter = 0;
function nextResultId() {
  resultCounter += 1;
  return 'result-' + resultCounter;
}

function csvCell(value) {
  let text = String(value ?? '');

  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  if (/[",\r\n]/.test(text)) {
    text = '"' + text.replace(/"/g, '""') + '"';
  }

  return text;
}
