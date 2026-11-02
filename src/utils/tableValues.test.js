import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTableDisplayName } from './tableValues.js';

test('access badge gets a readable name when nested table alias is missing', () => {
  assert.equal(getTableDisplayName({ table: { name: 'user', alias: null }, tableName: 'user' }), 'Felhasználók');
});

test('access badge supports flat API data without table metadata', () => {
  assert.equal(getTableDisplayName({ tableName: 'tanulo_letszam' }), 'Tanuló létszám');
});

test('custom tables retain their alias or technical name', () => {
  assert.equal(getTableDisplayName({ table: { name: 'custom_table', alias: 'Egyedi tábla' } }), 'Egyedi tábla');
  assert.equal(getTableDisplayName({ table: { name: 'custom_table', alias: '' } }), 'custom_table');
  assert.equal(getTableDisplayName({ tableName: 'custom_table', table: null }), 'custom_table');
});

test('whitespace aliases and incomplete metadata never produce an empty badge', () => {
  assert.equal(getTableDisplayName({ table: { name: 'custom_table', alias: '  ' } }), 'custom_table');
  assert.equal(getTableDisplayName({ table: { alias: '' } }), 'Ismeretlen tábla');
  assert.equal(getTableDisplayName({ tableName: 'user', table: {} }), 'Felhasználók');
});

test('configured aliases override built-in names for selections and badges', () => {
  assert.equal(getTableDisplayName({ name: 'user', alias: 'Users' }), 'Users');
  assert.equal(getTableDisplayName({ tableName: 'user', table: { name: 'user', alias: '  Egyedi név  ' } }), 'Egyedi név');
  assert.equal(getTableDisplayName({ name: 'custom_table', alias: 'Egyedi tábla' }), 'Egyedi tábla');
  assert.equal(getTableDisplayName(null), '');
});
