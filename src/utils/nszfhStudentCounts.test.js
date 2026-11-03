import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNszfhStudentCounts } from './nszfhStudentCounts.js';

const sector = 'Informatika és távközlés';
const admission = (year, count, name = sector) => ({ tanev_kezdete: year, felvett_letszam: count, szakirany: { nev: name }, szakma: null });
const student = (overrides = {}) => ({
  tanev_kezdete: 2026, felvetel_taneve: '2026/2027', evfolyam: '9.',
  tanulo_jogviszonya: 'Tanulói jogviszony', uj_Szkt_agazat_tipusa: sector,
  ...overrides,
});

test('2026/2027 uses ninth-grade school records when admissions have not been saved', () => {
  const counts = getNszfhStudentCounts([], [student(), student()], 2026, 'Technikum');
  assert.equal(counts[sector], 2);
  assert.equal(counts.Technikum, 2);
  assert.equal(counts.total, 2);
});

test('saved admissions retain precedence over calculated values', () => {
  const counts = getNszfhStudentCounts([admission(2026, 52)], [student()], 2026, 'Technikum');
  assert.equal(counts[sector], 52);
  assert.equal(counts.total, 52);
});

test('historical admissions remain unchanged; other years cannot leak into selection', () => {
  const records = [admission(2024, 47), admission(2025, 55), admission(2026, 52)];
  assert.equal(getNszfhStudentCounts(records, [student()], 2024, 'Technikum')[sector], 47);
  assert.equal(getNszfhStudentCounts(records, [student()], 2025, 'Technikum')[sector], 55);
});

test('only ninth grade students with student status and matching admission/snapshot year are counted', () => {
  const records = [student(), student({ evfolyam: '1/9.' }), student({ evfolyam: 9 }),
    student({ evfolyam: '10.' }), student({ tanulo_jogviszonya: 'Felnőttképzési jogviszony' }),
    student({ felvetel_taneve: '2025/2026' }), student({ tanev_kezdete: 2025 }),
    student({ felvetel_taneve: null }), student({ evfolyam: '19.' })];
  assert.equal(getNszfhStudentCounts([], records, 2026, 'Technikum')[sector], 3);
});

test('source fallback supplements only missing sectors without double counting a saved sector', () => {
  const counts = getNszfhStudentCounts([admission(2026, 52)], [student(), student({ uj_Szkt_agazat_tipusa: 'Gépészet' })], 2026, 'Technikum');
  assert.equal(counts[sector], 52);
  assert.equal(counts['Gépészet'], 1);
  assert.equal(counts.total, 53);
});

test('zero saved count can use source fallback and duplicate admission rows do not sum twice', () => {
  assert.equal(getNszfhStudentCounts([admission(2026, 0)], [student()], 2026, 'Technikum')[sector], 1);
  assert.equal(getNszfhStudentCounts([admission(2026, 52), admission(2026, 52)], [], 2026, 'Technikum')[sector], 52);
});

test('sector suffixes normalize and vocational school totals use the same label as the NSZFH rows', () => {
  const counts = getNszfhStudentCounts([], [student({ uj_Szkt_agazat_tipusa: 'Gépészet - Szakképző iskola' })], 2026, 'Szakképző');
  assert.equal(counts['Gépészet'], 1);
  assert.equal(counts['Szakképző'], 1);
});

test('no matching records yield zero instead of borrowing a previous year', () => {
  assert.deepEqual(getNszfhStudentCounts([admission(2025, 52)], [], 2026, 'Technikum'), { total: 0 });
  assert.deepEqual(getNszfhStudentCounts(undefined, undefined, 2026, 'Technikum'), { total: 0 });
});
