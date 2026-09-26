import test from 'node:test';
import assert from 'node:assert/strict';

import { parseFlexibleNumber } from '../src/engine/delimited-parser.js';
import {
  compareValues,
  normalizeDate,
  normalizeKeyForSide,
  normalizeText,
} from '../src/engine/normalization.js';

test('parses simple dot and comma decimal values', () => {
  assert.equal(parseFlexibleNumber('12.50'), 12.5);
  assert.equal(parseFlexibleNumber('12,50'), 12.5);
});

test('normalizes key text consistently across sides', () => {
  const mappings = [{ columnA: 'Reference', columnB: 'Payment Ref' }];
  const config = {
    trimText: true,
    caseInsensitive: true,
    collapseWhitespace: true,
  };

  const keyA = normalizeKeyForSide(
    { Reference: '  INV   1001 ' },
    mappings,
    'A',
    config
  );
  const keyB = normalizeKeyForSide(
    { 'Payment Ref': 'inv 1001' },
    mappings,
    'B',
    config
  );

  assert.equal(keyA, keyB);
  assert.equal(normalizeText(' A   B ', config), 'a b');
});

test('applies percentage tolerance deterministically', () => {
  const inside = compareValues('100', '101', {
    type: 'number',
    tolerance: { mode: 'percentage', value: 1 },
  });

  const outside = compareValues('100', '102', {
    type: 'number',
    tolerance: { mode: 'percentage', value: 1 },
  });

  assert.equal(inside.equal, true);
  assert.equal(outside.equal, false);
});

test('normalizes ISO and unambiguous local dates conservatively', () => {
  assert.equal(normalizeDate('2026-09-26'), '2026-09-26');
  assert.equal(normalizeDate('26/09/2026'), '2026-09-26');
  assert.equal(normalizeDate('09/26/2026'), '2026-09-26');
});

test('does not guess ambiguous local dates in auto mode', () => {
  assert.equal(normalizeDate('02/03/2026'), null);
  assert.equal(normalizeDate('03/02/2026'), null);
});

test('uses explicit date formats only when the expert selected them', () => {
  const dmy = compareValues('02/03/2026', '2026-03-02', {
    type: 'date',
  }, {
    dateFormatA: 'dmy',
    dateFormatB: 'iso',
  });

  const mdy = compareValues('02/03/2026', '2026-02-03', {
    type: 'date',
  }, {
    dateFormatA: 'mdy',
    dateFormatB: 'iso',
  });

  assert.equal(dmy.equal, true);
  assert.equal(mdy.equal, true);
});

test('falls back to exact normalized text when an ambiguous date format is not selected', () => {
  const result = compareValues('02/03/2026', '03/02/2026', {
    type: 'date',
  }, {
    dateFormatA: null,
    dateFormatB: null,
  });

  assert.equal(result.equal, false);
});
