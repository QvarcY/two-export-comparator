import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { BrowserComparisonService } from '../src/services/browser-comparison-service.js';

const here = dirname(fileURLToPath(import.meta.url));

async function fixture(name) {
  return readFile(resolve(here, 'fixtures', name), 'utf8');
}

function fakeFile(name, text) {
  return {
    name,
    size: Buffer.byteLength(text),
    text: async () => text,
  };
}

test('real browser service inspects files, suggests mappings and compares actual rows', async () => {
  const service = new BrowserComparisonService();
  const textA = await fixture('file-a.csv');
  const textB = await fixture('file-b.csv');

  const fileA = await service.inspectFile(fakeFile('file-a.csv', textA), { slot: 'A' });
  const fileB = await service.inspectFile(fakeFile('file-b.csv', textB), { slot: 'B' });

  assert.equal(fileA.rowCount, 12);
  assert.equal(fileB.rowCount, 12);

  const suggestions = await service.suggestMappings(fileA, fileB);

  assert.equal(suggestions[0].role, 'key');
  assert.equal(suggestions[0].columnA, 'Reference');
  assert.equal(suggestions[0].columnB, 'Payment Ref');
  assert.ok(suggestions.some((item) => (
    item.role === 'comparison' &&
    item.columnA === 'Amount' &&
    item.columnB === 'Total'
  )));
  assert.ok(suggestions.some((item) => (
    item.role === 'comparison' &&
    item.columnA === 'Date' &&
    item.columnB === 'Paid Date'
  )));
  assert.ok(!suggestions.some((item) => (
    item.columnA === 'Description' &&
    item.columnB === 'Customer'
  )));

  const key = suggestions.find((item) => item.role === 'key');
  const comparisons = suggestions
    .filter((item) => item.role === 'comparison')
    .map((item) => ({
      columnA: item.columnA,
      columnB: item.columnB,
      type: fileA.columns.find((column) => column.id === item.columnA)?.inferredType ?? 'text',
      tolerance: { mode: 'absolute', value: 0.01 },
    }));

  const result = await service.compare({
    fileAId: fileA.id,
    fileBId: fileB.id,
    mapping: {
      keys: [{ columnA: key.columnA, columnB: key.columnB, type: 'text' }],
      comparisons,
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

  assert.ok(result.records.some((record) => record.status === 'MISMATCH' && record.keyLabel === 'inv-1002'));
  assert.ok(result.records.some((record) => record.status === 'ONLY_A' && record.keyLabel === 'inv-1003'));
  assert.ok(result.records.some((record) => record.status === 'ONLY_B' && record.keyLabel === 'inv-1004'));
  assert.ok(result.records.some((record) => record.status === 'DUPLICATE' && record.keyLabel === 'inv-1005'));
  assert.ok(result.records.some((record) => record.status === 'AMBIGUOUS' && record.keyLabel === 'inv-1006'));
  assert.ok(result.records.some((record) => record.status === 'MATCHED' && record.keyLabel === 'inv-1007'));

  const inv1010 = result.records.find((record) => record.keyLabel === 'inv-1010');
  assert.equal(inv1010.status, 'MATCHED');

  const inv1011 = result.records.find((record) => record.keyLabel === 'inv-1011');
  assert.equal(inv1011.status, 'MISMATCH');
});

test('does not suggest semantically conflicting text columns even with perfect value overlap', async () => {
  const service = new BrowserComparisonService();

  const fileA = await service.inspectFile(fakeFile(
    'a.csv',
    'Reference,Description\nINV-1,Acme\nINV-2,Beta\n'
  ), { slot: 'A' });

  const fileB = await service.inspectFile(fakeFile(
    'b.csv',
    'Payment Ref,Customer\nINV-1,Acme\nINV-2,Beta\n'
  ), { slot: 'B' });

  const suggestions = await service.suggestMappings(fileA, fileB);

  assert.equal(suggestions[0].role, 'key');
  assert.ok(!suggestions.some((item) => (
    item.columnA === 'Description' &&
    item.columnB === 'Customer'
  )));
});

test('refuses automatic mapping when two identifier keys are equally plausible', async () => {
  const service = new BrowserComparisonService();

  const text = [
    'Primary ID,Secondary ID,Amount',
    'A1,X1,10.00',
    'A2,X2,20.00',
    'A3,X3,30.00',
    '',
  ].join('\n');

  const fileA = await service.inspectFile(fakeFile('a.csv', text), { slot: 'A' });
  const fileB = await service.inspectFile(fakeFile('b.csv', text), { slot: 'B' });

  const suggestions = await service.suggestMappings(fileA, fileB);

  assert.deepEqual(suggestions, []);
});

test('CSV export protects formula-like key cells', async () => {
  const service = new BrowserComparisonService();

  const blob = await service.createExport({
    records: [{
      status: 'ONLY_A',
      keyLabel: '=2+2',
      source: { rowA: 2, rowB: null },
      differences: [],
    }],
  });

  const csv = await blob.text();
  assert.match(csv, /ONLY_A,'=2\+2,2,,/);
});
