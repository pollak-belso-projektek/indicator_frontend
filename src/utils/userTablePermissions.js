import { calculateAccessLevel, getAvailableTables, getPermissionKeys } from './tableAccessUtils.js';

const EDIT_PERMISSIONS = ['WRITE', 'UPDATE', 'DELETE'];

export const USER_TABLE_PERMISSION_OPTIONS = [
  { key: 'READ', label: 'Olvasás' },
  { key: 'EDIT', label: 'Szerkesztés' },
];

export const getPermissionSelection = (permissions, key) => {
  const keys = key === 'EDIT' ? EDIT_PERMISSIONS : ['READ'];
  const checked = keys.every(permission => permissions.includes(permission));
  return {
    checked,
    indeterminate: !checked && keys.some(permission => permissions.includes(permission)),
  };
};

export const toggleUserTablePermission = (permissions, key, checked) => {
  if (key === 'READ') {
    return checked ? [...new Set(['READ', ...permissions])] : [];
  }
  return checked
    ? ['READ', ...EDIT_PERMISSIONS]
    : permissions.filter(permission => !EDIT_PERMISSIONS.includes(permission));
};

export const formatUserTablePermissions = (access) => {
  const permissions = getPermissionKeys(access);
  const labels = permissions.includes('READ') ? ['Olvasás'] : [];
  const edit = getPermissionSelection(permissions, 'EDIT');
  if (edit.checked) labels.push('Szerkesztés');
  else if (edit.indeterminate) labels.push('Szerkesztés (részleges)');
  return labels;
};

export const getDefaultUserTableAccess = (tableList, userType) => {
  const selectedTables = getAvailableTables(tableList);
  const permissions = userType.endsWith('_admin') || userType.endsWith('_privileged') || userType === 'superadmin'
    ? ['READ', ...EDIT_PERMISSIONS]
    : ['READ'];
  return {
    selectedTables,
    tablePermissions: Object.fromEntries(selectedTables.map(table => [table.id, [...permissions]])),
    tableAccess: selectedTables.map(table => ({ tableName: table.name, access: calculateAccessLevel(permissions) })),
  };
};
