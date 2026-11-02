import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultUserTableAccess,
  getPermissionSelection,
  toggleUserTablePermission,
  formatUserTablePermissions,
} from './userTablePermissions.js';
import { calculateAccessLevel } from './tableAccessUtils.js';

const tables = [
  { id: 'first', name: 'tanulo_letszam', isAvailable: true },
  { id: 'second', name: 'alapadatok', isAvailable: true },
  { id: 'disabled', name: 'disabled', isAvailable: false },
];

for (const type of ['iskolai_general', 'hszc_general', 'iskolai_privileged', 'hszc_privileged', 'iskolai_admin', 'hszc_admin', 'superadmin']) {
  test(`${type} defaults apply to every available table and serialize to API access levels`, () => {
    const defaults = getDefaultUserTableAccess(tables, type);
    assert.deepEqual(defaults.selectedTables, tables.slice(0, 2));
    assert.deepEqual(defaults.tableAccess, tables.slice(0, 2).map(table => ({
      tableName: table.name, access: type.endsWith('_general') ? 1 : 15,
    })));
    for (const table of defaults.selectedTables) {
      assert.equal(calculateAccessLevel(defaults.tablePermissions[table.id]), defaults.tableAccess.find(item => item.tableName === table.name).access);
    }
  });
}

test('changing from admin to general removes editing rights in the defaults', () => {
  const admin = getDefaultUserTableAccess(tables, 'iskolai_admin');
  const general = getDefaultUserTableAccess(tables, 'iskolai_general');
  assert.equal(admin.tableAccess[0].access, 15);
  assert.equal(general.tableAccess[0].access, 1);
  assert.deepEqual(getDefaultUserTableAccess([], 'iskolai_admin').tableAccess, []);
});

test('editing grants read/create/update/delete together without duplicates', () => {
  const original = ['READ', 'UPDATE'];
  const result = toggleUserTablePermission(original, 'EDIT', true);
  assert.equal(calculateAccessLevel(result), 15);
  assert.deepEqual(toggleUserTablePermission(result, 'EDIT', true), result);
  assert.deepEqual(original, ['READ', 'UPDATE']);
  assert.deepEqual(toggleUserTablePermission(result, 'EDIT', false), ['READ']);
});

test('read toggle handles no access and prevents editing without read', () => {
  assert.deepEqual(toggleUserTablePermission([], 'READ', true), ['READ']);
  assert.deepEqual(toggleUserTablePermission(['READ', 'WRITE', 'UPDATE', 'DELETE'], 'READ', false), []);
});

test('existing partial permissions remain distinguishable without upgrading them', () => {
  assert.deepEqual(getPermissionSelection(['READ', 'UPDATE'], 'EDIT'), { checked: false, indeterminate: true });
  assert.deepEqual(getPermissionSelection(['READ'], 'EDIT'), { checked: false, indeterminate: false });
  assert.deepEqual(getPermissionSelection(['READ', 'WRITE', 'UPDATE', 'DELETE'], 'EDIT'), { checked: true, indeterminate: false });
});

test('UI summaries expose only reading and editing', () => {
  assert.deepEqual(formatUserTablePermissions(15), ['Olvasás', 'Szerkesztés']);
  assert.deepEqual(formatUserTablePermissions(1), ['Olvasás']);
  assert.deepEqual(formatUserTablePermissions(5), ['Olvasás', 'Szerkesztés (részleges)']);
  assert.deepEqual(formatUserTablePermissions(0), []);
});
