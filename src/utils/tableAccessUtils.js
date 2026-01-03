/**
 * Table Access Utilities
 * Helper functions for managing table access permissions and API responses
 */

// Standard access levels for table permissions
export const TABLE_ACCESS_LEVELS = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  UPDATE: 4,
  DELETE: 8,
  FULL: 15, // READ + WRITE + UPDATE + DELETE (1+2+4+8)
};

/**
 * Check if user has specific access level to a table
 * @param {Array} tableAccess - User's table access array
 * @param {string} tableName - Name of the table to check
 * @param {number} requiredLevel - Required access level (default: READ)
 * @returns {boolean} - True if user has required access
 */
/**
 * Helper to get access level from permission object
 * Handles both integer 'access' (JWT) and object 'permissions' (API/Alias) formats
 */
const resolveAccessLevel = (permissionItem) => {
  if (!permissionItem) return 0;

  // If access is already defined as number, use it
  if (typeof permissionItem.access === "number") {
    return permissionItem.access;
  }

  // If permissions object exists, calculate access level
  if (permissionItem.permissions) {
    let level = 0;
    if (permissionItem.permissions.canRead) level |= TABLE_ACCESS_LEVELS.READ;
    if (permissionItem.permissions.canCreate) level |= TABLE_ACCESS_LEVELS.WRITE;
    if (permissionItem.permissions.canUpdate) level |= TABLE_ACCESS_LEVELS.UPDATE;
    if (permissionItem.permissions.canDelete) level |= TABLE_ACCESS_LEVELS.DELETE;
    return level;
  }

  return 0;
};

/**
 * Check if user has specific access level to a table
 * @param {Array} tableAccess - User's table access array
 * @param {string} tableName - Name of the table to check
 * @param {number} requiredLevel - Required access level (default: READ)
 * @returns {boolean} - True if user has required access
 */
export const hasTablePermission = (
  tableAccess,
  tableName,
  requiredLevel = TABLE_ACCESS_LEVELS.READ
) => {
  if (!tableAccess || !Array.isArray(tableAccess)) return false;

  const tablePermission = tableAccess.find((t) => t.tableName === tableName);

  console.log(`Checking permission for table "${tableName}":`, tablePermission);
  if (!tablePermission) return false;

  const accessLevel = resolveAccessLevel(tablePermission);

  // Check if the user's access level includes the required level (bitwise AND)
  return (accessLevel & requiredLevel) === requiredLevel;
};

/**
 * Get all table names that user has access to
 * @param {Array} tableAccess - User's table access array
 * @param {number} minLevel - Minimum access level required (default: READ)
 * @returns {Array} - Array of table names
 */
export const getAccessibleTables = (
  tableAccess,
  minLevel = TABLE_ACCESS_LEVELS.READ
) => {
  if (!tableAccess || !Array.isArray(tableAccess)) return [];

  return tableAccess
    .filter((t) => (resolveAccessLevel(t) & minLevel) === minLevel)
    .map((t) => t.tableName);
};

/**
 * Format table access for display
 * @param {number} accessLevel - Access level number
 * @returns {Array} - Array of permission names in Hungarian
 */
export const formatAccessLevel = (accessLevel) => {
  const permissions = [];

  if (accessLevel & TABLE_ACCESS_LEVELS.READ) permissions.push("Olvasás");
  if (accessLevel & TABLE_ACCESS_LEVELS.WRITE) permissions.push("Hozzáadás");
  if (accessLevel & TABLE_ACCESS_LEVELS.UPDATE) permissions.push("Módosítás");
  if (accessLevel & TABLE_ACCESS_LEVELS.DELETE) permissions.push("Törlés");

  return permissions;
};

/**
 * Calculate access level from selected permissions
 * @param {Array} selectedPermissions - Array of permission keys
 * @returns {number} - Calculated access level
 */
export const calculateAccessLevel = (selectedPermissions) => {
  return selectedPermissions.reduce((total, permission) => {
    return total + (TABLE_ACCESS_LEVELS[permission] || 0);
  }, 0);
};

/**
 * Get permission keys from access level
 * @param {number} accessLevel - Access level number
 * @returns {Array} - Array of permission keys
 */
export const getPermissionKeys = (accessLevel) => {
  const permissions = [];

  if (accessLevel & TABLE_ACCESS_LEVELS.READ) permissions.push("READ");
  if (accessLevel & TABLE_ACCESS_LEVELS.WRITE) permissions.push("WRITE");
  if (accessLevel & TABLE_ACCESS_LEVELS.UPDATE) permissions.push("UPDATE");
  if (accessLevel & TABLE_ACCESS_LEVELS.DELETE) permissions.push("DELETE");

  return permissions;
};

/**
 * Get all available permission options for UI
 * @returns {Array} - Array of permission options with Hungarian labels
 */
export const getPermissionOptions = () => [
  { key: "READ", label: "Olvasás", value: TABLE_ACCESS_LEVELS.READ },
  { key: "WRITE", label: "Hozzáadás", value: TABLE_ACCESS_LEVELS.WRITE },
  { key: "UPDATE", label: "Módosítás", value: TABLE_ACCESS_LEVELS.UPDATE },
  { key: "DELETE", label: "Törlés", value: TABLE_ACCESS_LEVELS.DELETE },
];

/**
 * Parse API error responses to user-friendly messages
 * @param {Object|string} error - Error object from API
 * @returns {string} - User-friendly error message
 */
export const parseApiError = (error) => {
  // Handle string errors
  if (typeof error === "string") {
    if (error.includes("Network Error") || error.includes("network")) {
      return "Hálózati hiba történt. Kérjük, ellenőrizd az internetkapcsolatodat.";
    }
    if (error.includes("Timeout") || error.includes("timeout")) {
      return "A kérés időtúllépés miatt sikertelen. Kérjük, próbáld újra.";
    }
    if (error.includes("session") || error.includes("expired")) {
      return "A munkamenet lejárt. Kérjük, jelentkezz be újra.";
    }
    if (error.includes("Unauthorized") || error.includes("401")) {
      return "Nincs jogosultság a művelet végrehajtásához.";
    }
    if (error.includes("Forbidden") || error.includes("403")) {
      return "Hozzáférés megtagadva.";
    }
    if (error.includes("Not Found") || error.includes("404")) {
      return "A keresett erőforrás nem található.";
    }
    if (error.includes("500") || error.includes("Internal Server Error")) {
      return "Szerver hiba történt. Kérjük, próbáld újra később.";
    }
    //rate limit
    if (error.includes("429") || error.includes("rate limit")) {
      return "Túl sok kérés érkezett rövid időn belül. Kérjük, próbáld újra később.";
    }
    return error;
  }

  // Handle object errors
  if (error && typeof error === "object") {
    // RTK Query error structure
    if (error.status && error.data) {
      switch (error.status) {
        case 401:
          return "Nincs jogosultság a művelet végrehajtásához. Kérjük, jelentkezz be újra.";
        case 403:
          return "Hozzáférés megtagadva. Nincs megfelelő jogosultságod.";
        case 404:
          return "A keresett erőforrás nem található.";
        case 422:
          return "Hibás adatok. Kérjük, ellenőrizd a bevitt információkat.";
        case 500:
          return "Szerver hiba történt. Kérjük, próbáld újra később.";
        default:
          return (
            error.data?.message ||
            error.data?.error ||
            "Ismeretlen hiba történt."
          );
      }
    }

    // Direct error object with message
    if (error.message) {
      return parseApiError(error.message);
    }

    // Error object with error property
    if (error.error) {
      return parseApiError(error.error);
    }
  }

  return "Ismeretlen hiba történt.";
};

/**
 * Validate table list response from API
 * @param {Array} tableList - Table list from API
 * @returns {boolean} - True if valid table list
 */
export const isValidTableList = (tableList) => {
  if (!Array.isArray(tableList)) return false;

  return tableList.every(
    (table) =>
      table &&
      typeof table.id === "string" &&
      typeof table.name === "string" &&
      typeof table.isAvailable === "boolean"
  );
};

/**
 * Filter available tables from table list
 * @param {Array} tableList - Table list from API
 * @returns {Array} - Array of available tables
 */
export const getAvailableTables = (tableList) => {
  if (!isValidTableList(tableList)) return [];

  return tableList.filter((table) => table.isAvailable);
};

/**
 * Check if a table is locked
 * @param {Array} tableList - Table list from API
 * @param {string} tableName - Name of the table to check
 * @returns {boolean} - True if table is locked
 */
export const isTableLocked = (tableList, tableName) => {
  if (!Array.isArray(tableList)) return false;

  const table = tableList.find((t) => t.name === tableName);
  return table?.isLocked || false;
};

/**
 * Check if user can modify a table (not locked and has write permissions)
 * @param {Array} tableList - Table list from API
 * @param {Array} tableAccess - User's table access array
 * @param {string} tableName - Name of the table to check
 * @param {boolean} isSuperadmin - Whether user is superadmin
 * @returns {Object} - { canModify: boolean, reason: string }
 */
export const canModifyTable = (
  tableList,
  tableAccess,
  tableName,
  isSuperadmin = false
) => {
  // Superadmins can always modify (they can also unlock)
  // This is intentional - superadmins need to be able to unlock tables and fix issues
  if (isSuperadmin) {
    return { canModify: true, reason: "" };
  }

  // Check if table is locked
  if (isTableLocked(tableList, tableName)) {
    return {
      canModify: false,
      reason:
        "Ez a tábla jelenleg le van zárva. Kérjük, vedd fel a kapcsolatot a HSZC adminisztrátorral.",
    };
  }

  // Check if user has ANY modification permission (WRITE, UPDATE, or DELETE)
  const tablePermission = tableAccess.find((t) => t.tableName === tableName);
  if (!tablePermission) {
    return {
      canModify: false,
      reason: "Nincs jogosultságod ennek a táblának a módosítására.",
    };
  }

  const access = resolveAccessLevel(tablePermission);
  const hasPermission =
    (access & TABLE_ACCESS_LEVELS.WRITE) ||
    (access & TABLE_ACCESS_LEVELS.UPDATE) ||
    (access & TABLE_ACCESS_LEVELS.DELETE);

  console.log(
    `canModifyTable check for table "${tableName}": access=${access}, hasPermission=${!!hasPermission}`
  );

  if (!hasPermission) {
    return {
      canModify: false,
      reason: "Nincs jogosultságod ennek a táblának a módosítására.",
    };
  }

  return { canModify: true, reason: "" };
};
