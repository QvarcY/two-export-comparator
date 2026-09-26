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

test('detects and parses TSV input', () => {
  const table = tableFromText('id\tamount\nA1\t12.50\nA2\t13.00\n');

  assert.equal(table.delimiter, '\t');
  assert.equal(table.rows[1].amount, '13.00');
});

test('parses quoted commas, escaped quotes and multiline values', () => {
  const text = 'id,note\n1,"hello, world"\n2,"say ""hello"""\n3,"line one\nline two"\n';
  const rows = parseDelimitedText(text, ',');

  assert.deepEqual(rows[1], ['1', 'hello, world']);
  assert.deepEqual(rows[2], ['2', 'say "hello"']);
  assert.deepEqual(rows[3], ['3', 'line one\nline two']);
});

test('strips UTF-8 BOM and infers basic types', () => {
  const table = tableFromText('\uFEFFid,date,amount\nA1,2026-09-26,12.50\n');

  assert.equal(table.columns[1].inferredType, 'date');
  assert.equal(table.columns[2].inferredType, 'number');
  assert.equal(table.rows[0].id, 'A1');
});

test('rejects malformed unclosed quoted fields', () => {
  assert.throws(
    () => tableFromText('id,note\n1,"unfinished\n'),
    /CSV_PARSE_UNCLOSED_QUOTE/
  );
});

test('rejects replacement characters instead of accepting corrupted UTF-8', () => {
  assert.throws(
    () => tableFromText('id,name\n1,broken\uFFFDvalue\n'),
    /UNSUPPORTED_ENCODING/
  );
});

test('deduplicates repeated headers deterministically', () => {
  const table = tableFromText('Name,Name\nAlpha,Beta\n');

  assert.deepEqual(
    table.columns.map((column) => column.id),
    ['Name', 'Name (2)']
  );
  assert.equal(table.rows[0]['Name (2)'], 'Beta');
});

test('rejects empty files', () => {
  assert.throws(() => tableFromText(''), /EMPTY_FILE/);
});
