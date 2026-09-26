import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { BrowserComparisonService } from '../src/services/browser-comparison-service.js';

function fakeFile(name, text) {
  return {
    name,
    size: Buffer.byteLength(text),
    text: async () => text,
  };
}

function makeCsv(count) {
  const rows = ['Reference,Date,Amount'];

  for (let i = 0; i < count; i += 1) {
    rows.push('INV-' + String(i).padStart(6, '0') + ',2026-09-26,' + (100 + (i % 50)) + '.00');
  }

  return rows.join('\n') + '\n';
}

test('10k-row local comparison stays within a broad non-quadratic performance guard', async (t) => {
  const count = 10_000;
  const service = new BrowserComparisonService();
  const text = makeCsv(count);

  const started = performance.now();

  const fileA = await service.inspectFile(fakeFile('a.csv', text), { slot: 'A' });
  const fileB = await service.inspectFile(fakeFile('b.csv', text), { slot: 'B' });

  const result = await service.compare({
    fileAId: fileA.id,
    fileBId: fileB.id,
    mapping: {
      keys: [{ columnA: 'Reference', columnB: 'Reference', type: 'text' }],
      comparisons: [
        { columnA: 'Date', columnB: 'Date', type: 'date' },
        {
          columnA: 'Amount',
          columnB: 'Amount',
          type: 'number',
          tolerance: { mode: 'absolute', value: 0.01 },
        },
      ],
      displayOnly: { fileA: [], fileB: [] },
      normalization: {
        trimText: true,
        caseInsensitive: true,
        collapseWhitespace: true,
        numberLocale: 'auto',
        dateFormatA: null,
        dateFormatB: null,
      },
    },
  });

  const elapsed = performance.now() - started;
  t.diagnostic('10k-row parse + compare: ' + elapsed.toFixed(1) + ' ms');

  assert.equal(result.summary.matched, count);
  assert.equal(result.summary.mismatched, 0);
  assert.ok(
    elapsed < 5000,
    '10k-row parse + compare exceeded the 5 second regression guard'
  );
});
