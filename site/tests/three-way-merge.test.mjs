import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeThreeWayFields, mergeThreeWayMap } from '../src/lib/learning/threeWayMerge.js';

test('field merge keeps separate local and remote edits', () => {
  const merged = mergeThreeWayFields(
    { html: 'base html', css: 'base css' },
    { html: 'local html', css: 'base css' },
    { html: 'base html', css: 'remote css' },
    ['html', 'css'],
  );
  assert.deepEqual(merged.value, { html: 'local html', css: 'remote css' });
  assert.deepEqual(merged.conflicts, []);
});

test('field merge preserves the stored value and reports a divergent same-field edit', () => {
  const merged = mergeThreeWayFields(
    { html: 'base' }, { html: 'local' }, { html: 'remote' }, ['html'],
  );
  assert.equal(merged.value.html, 'remote');
  assert.equal(merged.baseline.html, 'base');
  assert.deepEqual(merged.conflicts, ['html']);
});

test('PERSIST-04: a stale SQL snapshot keeps this answer and a remote edit to another question', () => {
  const merged = mergeThreeWayMap(
    {
      'B01-Q01': { text: 'SELECT base', notes: '', status: 'draft', checks: [] },
      'B01-Q02': { text: 'SELECT base second', notes: '', status: 'draft', checks: [] },
    },
    {
      'B01-Q01': { text: 'SELECT local answer', notes: '', status: 'draft', checks: [] },
      'B01-Q02': { text: 'SELECT base second', notes: '', status: 'draft', checks: [] },
    },
    {
      'B01-Q01': { text: 'SELECT base', notes: '', status: 'draft', checks: [] },
      'B01-Q02': { text: 'SELECT remote second', notes: '', status: 'draft', checks: [] },
    },
  );
  assert.equal(merged.value['B01-Q01'].text, 'SELECT local answer');
  assert.equal(merged.value['B01-Q02'].text, 'SELECT remote second');
  assert.deepEqual(merged.conflicts, []);
});

test('map merge retains local dirty entry for the UI but leaves it out of the stored result', () => {
  const merged = mergeThreeWayMap(
    { Q01: { text: 'base' } }, { Q01: { text: 'local' } }, { Q01: { text: 'remote' } },
  );
  assert.deepEqual(merged.value, { Q01: { text: 'remote' } });
  assert.deepEqual(merged.baseline, { Q01: { text: 'base' } });
  assert.deepEqual(merged.conflicts, ['Q01']);
});
