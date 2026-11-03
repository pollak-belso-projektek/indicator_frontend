import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTanugyiFallback } from './tanuloLetszamFallback.js';

const record = (student, adult = 0) => ({ IT: { 2026: { tanuloi_jogviszony: student, felnottkepzesi_jogviszony: adult } } });

test('already saved values matching source are not unsaved changes', () => {
  const saved = record(52, 3);
  const result = applyTanugyiFallback(saved, record(52, 3));
  assert.equal(result.isModified, false);
  assert.deepEqual(result.tableData, saved);
});

test('positive saved values take precedence even if source differs', () => {
  const result = applyTanugyiFallback(record(10, 2), record(52, 3));
  assert.equal(result.isModified, false);
  assert.deepEqual(result.tableData, record(10, 2));
});

test('filling a zero marks a real unsaved change and leaves saved snapshot intact', () => {
  const saved = record(0, 2);
  const result = applyTanugyiFallback(saved, record(52, 3));
  assert.equal(result.isModified, true);
  assert.deepEqual(result.tableData, record(52, 2));
  assert.deepEqual(saved, record(0, 2));
});

test('source zero does not modify saved zero', () => {
  assert.equal(applyTanugyiFallback(record(0), record(0)).isModified, false);
});

test('new program/year counts are added and marked unsaved', () => {
  const result = applyTanugyiFallback({}, record(52));
  assert.equal(result.isModified, true);
  assert.deepEqual(result.tableData, record(52));
});

test('save then reload clears warning while later new source values remain detectable', () => {
  const first = applyTanugyiFallback(record(0), record(52));
  const reloaded = applyTanugyiFallback(first.tableData, record(52));
  assert.equal(first.isModified, true);
  assert.equal(reloaded.isModified, false);
  assert.equal(applyTanugyiFallback(reloaded.tableData, record(52, 3)).isModified, true);
});
