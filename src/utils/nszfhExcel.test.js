import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNszfhExcelRows, mergeNszfhImports } from './nszfhExcel.js';

const layout = [{ key: 'parent', isParent: true }, {
  key: 'it', isParent: false, kepzes_forma: 'Technikum', label: 'Informatika és távközlés', szakma_id: 'it',
}];
const headers = ['Képzés típusa', 'Ágazat', 'K25Matematika', 'K25Anyanyelv', 'B24Matematika', 'B24Anyanyelv'];
const row = ['technikum', 'Informatika és távközlés', 0.75, 0.9, 0.2, 0.4];

for (const heading of [[], [['', '', 'KIMENETI eredmények', '', 'BEMENETI eredmények']]]) {
  test(`recognizes first data header with ${heading.length} preceding title rows`, () => {
    const result = parseNszfhExcelRows([...heading, headers, row], layout);
    assert.deepEqual(Object.keys(result), ['2024']);
    const data = result[2024].it;
    assert.equal(data.kat_4_mat_kimeneti, 1);
    assert.equal(data.kat_5_szoveg_kimeneti, 1);
    assert.equal(data.kat_1_mat_bemeneti, 1);
    assert.equal(data.kat_3_szoveg_bemeneti, 1);
    assert.equal(Object.keys(data).length, 20);
  });
}

test('input and output measurements use their own academic year', () => {
  const result = parseNszfhExcelRows([
    ['Képzés típusa', 'Ágazat', 'B2024Matematika', 'K2025Anyanyelv', 'K24Matematika'],
    ['technikum', 'Informatika és távközlés', 0.25, 0.6, 0.8],
  ], layout);
  assert.deepEqual(Object.keys(result), ['2023', '2024']);
  assert.equal(result[2023].it.kat_5_mat_kimeneti, 1);
  assert.equal(result[2024].it.kat_2_mat_bemeneti, 1);
  assert.equal(result[2024].it.kat_4_szoveg_kimeneti, 1);
  assert.equal(result[2024].it.kat_5_mat_kimeneti, undefined);
});

test('band boundaries, fractions, decimal commas, missing values and other sectors', () => {
  const values = [0, 0.25, 40, 60, 80, 1, '24,5%', '', null, 'nincs'];
  const result = parseNszfhExcelRows([
    headers,
    ...values.map(value => ['technikum', 'Informatika és távközlés', value]),
    ['technikum', 'Másik ágazat', 90],
  ], layout);
  assert.deepEqual(result[2024].it, {
    kat_1_mat_kimeneti: 2, kat_2_mat_kimeneti: 1, kat_3_mat_kimeneti: 1,
    kat_4_mat_kimeneti: 1, kat_5_mat_kimeneti: 2,
  });
});

test('missing headers and unmatchable data report errors instead of empty success', () => {
  assert.throws(() => parseNszfhExcelRows([['Egyéb oszlop'], [1]], layout), /oszlop/);
  assert.throws(() => parseNszfhExcelRows([headers, row], []), /adat/);
});

test('input-only file remains supported and contains no output fields', () => {
  const result = parseNszfhExcelRows([
    ['Képzés típusa', 'Ágazat', 'B24Matematika', 'B24Anyanyelv'],
    ['technikum', 'Informatika és távközlés', 0.5, 0.8],
  ], layout);
  assert.deepEqual(Object.keys(result), ['2024']);
  assert.equal(result[2024].it.kat_3_mat_bemeneti, 1);
  assert.equal(result[2024].it.kat_5_szoveg_bemeneti, 1);
  assert.ok(Object.keys(result[2024].it).every(key => key.endsWith('_bemeneti')));
});

test('separate input and output uploads preserve each other in either order', () => {
  const input = parseNszfhExcelRows([
    ['Képzés típusa', 'Ágazat', 'B24Matematika'], row.slice(0, 2).concat(0.5),
  ], layout);
  const output = parseNszfhExcelRows([
    ['Képzés típusa', 'Ágazat', 'K25Matematika'], row.slice(0, 2).concat(0.8),
  ], layout);
  assert.deepEqual(mergeNszfhImports(input, output), mergeNszfhImports(output, input));
  assert.equal(mergeNszfhImports(input, output)[2024].it.kat_3_mat_bemeneti, 1);
  assert.equal(mergeNszfhImports(output, input)[2024].it.kat_5_mat_kimeneti, 1);
  assert.equal(input[2024].it.kat_5_mat_kimeneti, undefined);
});
