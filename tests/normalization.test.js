import test from 'node:test';
import assert from 'node:assert/strict';

import { parseFlexibleNumber } from '../src/engine/delimited-parser.js';
import {
  compareValues,
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
