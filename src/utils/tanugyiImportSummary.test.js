import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTanugyiRecordsForYear } from './tanugyiImportSummary.js';

test('2026/2027 count excludes past-year records: 358 instead of all 736', () => {
  const current = Array.from({ length: 358 }, (_, id) => ({ id, tanev_kezdete: 2026 }));
  const historical = Array.from({ length: 378 }, (_, id) => ({ id: id + 358, tanev_kezdete: 2025 }));
  const records = [...historical, ...current];
  assert.equal(records.length, 736);
  assert.deepEqual(getTanugyiRecordsForYear(records, 2026), current);
  assert.equal(records.length, 736);
});

test('uses imported school year, not admission year or upload timestamp', () => {
  const current = { tanev_kezdete: '2026', felvetel_taneve: '2024/2025', createdAt: '2026-11-03' };
  const old = { tanev_kezdete: 2025, felvetel_taneve: '2025/2026', createdAt: '2026-11-03' };
  assert.deepEqual(getTanugyiRecordsForYear([current, old], 2026), [current]);
});

test('empty, missing and unrelated-year responses produce no current-year records', () => {
  assert.deepEqual(getTanugyiRecordsForYear(undefined, 2026), []);
  assert.deepEqual(getTanugyiRecordsForYear(null, 2026), []);
  assert.deepEqual(getTanugyiRecordsForYear([null, {}, { tanev_kezdete: 2025 }], 2026), []);
});
