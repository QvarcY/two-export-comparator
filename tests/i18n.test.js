import test from 'node:test';
import assert from 'node:assert/strict';

import en from '../src/i18n/locales/en.js';
import lv from '../src/i18n/locales/lv.js';

test('English and Latvian locales expose the same translation keys', () => {
  assert.deepEqual(
    Object.keys(lv).sort(),
    Object.keys(en).sort()
  );
});
