import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectDelimiter,
  parseDelimitedText,
  tableFromText,
} from '../src/engine/delimited-parser.js';

test('detects semicolon delimiter', () => {
  const text = 'a;b;c\n1;2;3\n4;5;6\n';
  assert.equal(detectDelimiter(text), ';');
});

test('parses quoted commas and multiline values', () => {
  const text = 'id,note\n1,"hello, world"\n2,"line one\nline two"\n';
  const rows = parseDelimitedText(text, ',');

  assert.deepEqual(rows[1], ['1', 'hello, world']);
  assert.deepEqual(rows[2], ['2', 'line one\nline two']);
});

test('strips UTF-8 BOM and infers basic types', () => {
  const table = tableFromText('\uFEFFid,date,amount\nA1,2026-09-26,12.50\n');

  assert.equal(table.columns[1].inferredType, 'date');
  assert.equal(table.columns[2].inferredType, 'number');
  assert.equal(table.rows[0].id, 'A1');
});
