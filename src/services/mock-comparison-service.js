import { ComparisonService } from './comparison-service.js';

/**
 * Deterministic mock service for design/demo purposes.
 * Does NOT pretend to be production comparison logic.
 * @extends ComparisonService
 */
export class MockComparisonService extends ComparisonService {
  constructor() {
    super();
    this._files = new Map();
  }

  /**
   * @param {File} file
   * @param {object} [options]
   * @returns {Promise<import('../models/contracts.js').FileInspection>}
   */
  async inspectFile(file, options = {}) {
    await this._delay(420);

    const slot = options.slot === 'A' || options.slot === 'B' ? options.slot : null;
    const id = slot ? 'file-' + slot.toLowerCase() : (this._files.has('file-a') ? 'file-b' : 'file-a');
    const isA = id === 'file-a';

    /** @type {import('../models/contracts.js').FileInspection} */
    const inspection = {
      id,
      name: file.name,
      sizeBytes: file.size,
      rowCount: isA ? 1204 : 1197,
      delimiter: ',',
      encoding: 'UTF-8',
      columns: isA
        ? [
            { id: 'Reference', label: 'Reference', inferredType: 'text' },
            { id: 'Date', label: 'Date', inferredType: 'date' },
            { id: 'Amount', label: 'Amount', inferredType: 'number' },
            { id: 'Description', label: 'Description', inferredType: 'text' },
          ]
        : [
            { id: 'Payment Ref', label: 'Payment Ref', inferredType: 'text' },
            { id: 'Paid Date', label: 'Paid Date', inferredType: 'date' },
            { id: 'Total', label: 'Total', inferredType: 'number' },
            { id: 'Customer', label: 'Customer', inferredType: 'text' },
          ],
      previewRows: isA
        ? [
            { Reference: 'INV-1001', Date: '2026-09-15', Amount: '125.00', Description: 'Consulting' },
            { Reference: 'INV-1002', Date: '2026-09-18', Amount: '125.00', Description: 'Design' },
            { Reference: 'INV-1003', Date: '2026-09-20', Amount: '89.50', Description: 'Hosting' },
          ]
        : [
            { 'Payment Ref': 'INV-1001', 'Paid Date': '2026-09-15', Total: '125.00', Customer: 'Acme' },
            { 'Payment Ref': 'INV-1002', 'Paid Date': '2026-09-18', Total: '152.00', Customer: 'Acme' },
            { 'Payment Ref': 'INV-1004', 'Paid Date': '2026-09-22', Total: '45.00', Customer: 'Beta' },
          ],
      warnings: [],
    };

    this._files.set(id, { file, inspection });
    return inspection;
  }

  /**
   * @param {import('../models/contracts.js').FileInspection} fileA
   * @param {import('../models/contracts.js').FileInspection} fileB
   */
  async suggestMappings(fileA, fileB) {
    await this._delay(220);

    const suggestions = [];
    const pairs = [
      ['Reference', 'Payment Ref'],
      ['Amount', 'Total'],
      ['Date', 'Paid Date'],
    ];

    for (const [a, b] of pairs) {
      if (
        fileA.columns.some((c) => c.id === a) &&
        fileB.columns.some((c) => c.id === b)
      ) {
        suggestions.push({
          role: suggestions.length === 0 ? 'key' : 'comparison',
          columnA: a,
          columnB: b,
          confidence: 0.91,
        });
      }
    }
    return suggestions;
  }

  /**
   * @param {import('../models/contracts.js').ComparisonRequest} request
   * @param {{ onProgress?: (e: import('../models/contracts.js').ProgressEvent) => void }} [callbacks]
   */
  async compare(_request, { onProgress } = {}) {
    const phases = [
      { phase: 'parse-a', message: 'Parsing File A…', completed: 0, total: 100 },
      { phase: 'parse-b', message: 'Parsing File B…', completed: 40, total: 100 },
      { phase: 'index', message: 'Indexing records…', completed: 70, total: 100 },
      { phase: 'compare', message: 'Comparing records…', completed: 90, total: 100 },
      { phase: 'finalize', message: 'Finalizing…', completed: 100, total: 100 },
    ];

    for (const p of phases) {
      onProgress?.(p);
      await this._delay(360);
    }

    /** @type {import('../models/contracts.js').ComparisonResult} */
    return {
      runId: 'cmp-mock-001',
      createdAt: new Date().toISOString(),
      summary: {
        totalA: 1204,
        totalB: 1197,
        matched: 1176,
        onlyA: 12,
        onlyB: 7,
        mismatched: 4,
        duplicates: 2,
        ambiguous: 3,
      },
      records: this._sampleRecords(),
      warnings: [],
    };
  }

  async createExport(_result, _options = {}) {
    const csv = [
      'status,key,rowA,rowB,note',
      'MISMATCH,INV-1002,482,391,amount differs',
      'ONLY_A,INV-1003,483,,missing in B',
      'ONLY_B,INV-1004,,392,missing in A',
    ].join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  reset() {
    this._files.clear();
  }

  /** @private */
  _sampleRecords() {
    return [
      {
        id: 'result-1',
        status: 'MISMATCH',
        keyLabel: 'INV-1002',
        source: { rowA: 482, rowB: 391 },
        displayA: { Date: '2026-09-18', Amount: '125.00' },
        displayB: { 'Paid Date': '2026-09-18', Total: '152.00' },
        differences: [
          { field: 'amount', fieldA: 'Amount', fieldB: 'Total', valueA: 125.0, valueB: 152.0, delta: 27.0 },
        ],
      },
      {
        id: 'result-2',
        status: 'ONLY_A',
        keyLabel: 'INV-1003',
        source: { rowA: 483, rowB: null },
        displayA: { Date: '2026-09-20', Amount: '89.50' },
      },
      {
        id: 'result-3',
        status: 'ONLY_B',
        keyLabel: 'INV-1004',
        source: { rowA: null, rowB: 392 },
        displayB: { 'Paid Date': '2026-09-22', Total: '45.00' },
      },
      {
        id: 'result-4',
        status: 'MATCHED',
        keyLabel: 'INV-1001',
        source: { rowA: 481, rowB: 390 },
        displayA: { Date: '2026-09-15', Amount: '125.00' },
        displayB: { 'Paid Date': '2026-09-15', Total: '125.00' },
        differences: [],
      },
      {
        id: 'result-5',
        status: 'DUPLICATE',
        keyLabel: 'INV-1005',
        source: { rowA: 484, rowB: 393 },
        displayA: { Date: '2026-09-21', Amount: '50.00' },
        displayB: { 'Paid Date': '2026-09-21', Total: '50.00' },
      },
      {
        id: 'result-6',
        status: 'AMBIGUOUS',
        keyLabel: 'INV-1006',
        source: { rowA: 485, rowB: 394 },
        displayA: { Date: '2026-09-22', Amount: '75.00' },
        displayB: { 'Paid Date': '2026-09-22', Total: '75.00' },
      },
    ];
  }

  /** @private */
  _delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}