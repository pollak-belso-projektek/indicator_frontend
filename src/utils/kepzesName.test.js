// Same cases as indicator_backend/tests/kepzesName.test.js: both sides must agree,
// otherwise imported students do not land on the school's configured rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeKepzesName, normalizeAgazatName, agazatNameKey, kepzesNameKey, indexByKepzesName, toConfiguredKepzesName } from './kepzesName.js';

for (const [raw, expected] of [
  ['Cukrász (4 1013 23 01)', 'Cukrász'],
  ['Cukrász - 4 1013 23 01 (2020)', 'Cukrász'],
  ['Turizmus-vendéglátás - 23 (2020)', 'Turizmus-vendéglátás'],
  ['Informatika - 061', 'Informatika'],
  ['Pincér - vendégtéri szakember (4 1013 23 04)', 'Pincér - vendégtéri szakember'],
  ['Pincér - vendégtéri szakember - 4 1013 23 04 (2020)', 'Pincér - vendégtéri szakember'],
  ['Fa- és bútoripar - 08 (2020)', 'Fa- és bútoripar'],
  ['    Burkoló', 'Burkoló'],
  ['Gépjármű  mechatronikus', 'Gépjármű mechatronikus'],
  ['Szakács', 'Szakács'],
  ['CAD-CAM informatikus 2.0', 'CAD-CAM informatikus 2.0'],
  ['Gépész (CNC)', 'Gépész (CNC)'],
  ['Na', null], ['NA', null], ['Nincs meghatározva', null], ['', null], [null, null], [undefined, null],
]) {
  test(`normalize ${JSON.stringify(raw)} -> ${JSON.stringify(expected)}`, () => {
    assert.equal(normalizeKepzesName(raw), expected);
  });
}

test('comparison key ignores case, code and whitespace', () => {
  assert.equal(kepzesNameKey('  CUKRÁSZ (4 1013 23 01)'), kepzesNameKey('Cukrász'));
  assert.notEqual(kepzesNameKey('Pincér'), kepzesNameKey('Pincér - vendégtéri szakember'));
});

test('index prefers the clean record', () => {
  const index = indexByKepzesName([{ id: 'code', nev: 'Cukrász (4 1013 23 01)' }, { id: 'clean', nev: 'Cukrász' }]);
  assert.equal(index.get(kepzesNameKey('Cukrász')).id, 'clean');
});

test('KRÉTA names are mapped to the configured spelling (the table row keys)', () => {
  const configured = ['    Burkoló', 'Cukrász', 'Pincér - vendégtéri szakember'];
  assert.equal(toConfiguredKepzesName('Burkoló (4 0732 06 03)', configured), '    Burkoló');
  assert.equal(toConfiguredKepzesName('Cukrász - 4 1013 23 01 (2020)', configured), 'Cukrász');
  assert.equal(toConfiguredKepzesName('Pincér - vendégtéri szakember (4 1013 23 04)', configured), 'Pincér - vendégtéri szakember');
  assert.equal(toConfiguredKepzesName('Szakács (4 1013 23 05)', configured), 'Szakács', 'unknown names come back clean');
  assert.equal(toConfiguredKepzesName('Na', configured), null);
});

// Sector names never contain " - ", so everything after it is dropped (school type, code).
for (const [raw, expected] of [
  ['Turizmus-vendéglátás - 23 (2020)', 'Turizmus-vendéglátás'],
  ['Gépészet - Szakképző iskola', 'Gépészet'],
  ['Fa- és bútoripar - 08 (2020)', 'Fa- és bútoripar'],
  ['Épületgépészet', 'Épületgépészet'],
  ['Na', null], ['', null], [null, null],
]) {
  test(`sector ${JSON.stringify(raw)} -> ${JSON.stringify(expected)}`, () => {
    assert.equal(normalizeAgazatName(raw), expected);
  });
}
test('profession rule keeps " - " parts that sector rule drops', () => {
  assert.equal(normalizeKepzesName('Pincér - vendégtéri szakember'), 'Pincér - vendégtéri szakember');
  assert.equal(agazatNameKey('GÉPÉSZET - Szakképző iskola'), agazatNameKey('Gépészet - 10 (2020)'));
});
