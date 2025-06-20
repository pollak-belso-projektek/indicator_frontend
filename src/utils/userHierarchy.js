// User hierarchy utility functions
export const USER_HIERARCHY = {
  ISKOLAI_GENERAL: 1,
  ISKOLAI_PRIVILEGED: 2,
  ISKOLAI_ADMIN: 4,
  HSZC_GENERAL: 9,
  HSZC_PRIVILEGED: 10,
  HSZC_ADMIN: 15,
  SUPERADMIN: 31,
};

export const USER_TYPE_HIERARCHY_MAP = {
  iskolai_general: USER_HIERARCHY.ISKOLAI_GENERAL,
  iskolai_privileged: USER_HIERARCHY.ISKOLAI_PRIVILEGED,
  iskolai_admin: USER_HIERARCHY.ISKOLAI_ADMIN,
  hszc_general: USER_HIERARCHY.HSZC_GENERAL,
  hszc_privileged: USER_HIERARCHY.HSZC_PRIVILEGED,
  hszc_admin: USER_HIERARCHY.HSZC_ADMIN,
  superadmin: USER_HIERARCHY.SUPERADMIN,
};

export const HIERARCHY_USER_TYPE_MAP = {
  [USER_HIERARCHY.ISKOLAI_GENERAL]: "iskolai_general",
  [USER_HIERARCHY.ISKOLAI_PRIVILEGED]: "iskolai_privileged",
  [USER_HIERARCHY.ISKOLAI_ADMIN]: "iskolai_admin",
  [USER_HIERARCHY.HSZC_GENERAL]: "hszc_general",
  [USER_HIERARCHY.HSZC_PRIVILEGED]: "hszc_privileged",
  [USER_HIERARCHY.HSZC_ADMIN]: "hszc_admin",
  [USER_HIERARCHY.SUPERADMIN]: "superadmin",
};

export const USER_TYPE_LABELS = {
  iskolai_general: "Iskolai Általános",
  iskolai_privileged: "Iskolai Privilegizált",
  iskolai_admin: "Iskolai Admin",
  hszc_general: "HSZC Általános",
  hszc_privileged: "HSZC Privilegizált",
  hszc_admin: "HSZC Admin",
  superadmin: "Superadmin",
};

/**
 * Get hierarchy level from user type
 * @param {string} userType - The user type (e.g., "hszc_admin")
 * @returns {number} - The hierarchy level (1, 2, 4, 9, 10, 15, 31)
 */
export const getHierarchyLevel = (userType) => {
  return USER_TYPE_HIERARCHY_MAP[userType] || USER_HIERARCHY.ISKOLAI_GENERAL;
};

/**
 * Get user type from hierarchy level
 * @param {number} level - The hierarchy level (1, 2, 4, 9, 10, 15, 31)
 * @returns {string} - The user type
 */
export const getUserTypeFromLevel = (level) => {
  return HIERARCHY_USER_TYPE_MAP[level] || "iskolai_general";
};

/**
 * Get user type label in Hungarian
 * @param {string} userType - The user type
 * @returns {string} - The Hungarian label
 */
export const getUserTypeLabel = (userType) => {
  return USER_TYPE_LABELS[userType] || userType;
};

/**
 * Check if user has at least the required hierarchy level
 * @param {number} userLevel - Current user's hierarchy level
 * @param {number} requiredLevel - Required hierarchy level
 * @returns {boolean} - True if user has sufficient permissions
 */
export const hasRequiredLevel = (userLevel, requiredLevel) => {
  return userLevel >= requiredLevel;
};

/**
 * Get permissions object from hierarchy level (for backward compatibility)
 * @param {number} level - The hierarchy level
 * @returns {object} - Permissions object
 */
export const getPermissionsFromLevel = (level) => {
  const userType = getUserTypeFromLevel(level);

  const permissions = {
    isSuperadmin: false,
    isHSZC: false,
    isAdmin: false,
    isPrivileged: false,
    isStandard: false,
  };

  switch (userType) {
    case "superadmin":
      permissions.isSuperadmin = true;
      permissions.isAdmin = true;
      permissions.isHSZC = true;
      permissions.isPrivileged = true;
      permissions.isStandard = true;
      break;
    case "hszc_admin":
      permissions.isHSZC = true;
      permissions.isAdmin = true;
      permissions.isPrivileged = true;
      permissions.isStandard = true;
      break;
    case "hszc_privileged":
      permissions.isHSZC = true;
      permissions.isPrivileged = true;
      permissions.isStandard = true;
      break;
    case "hszc_general":
      permissions.isHSZC = true;
      permissions.isStandard = true;
      break;
    case "iskolai_admin":
      permissions.isAdmin = true;
      permissions.isPrivileged = true;
      permissions.isStandard = true;
      break;
    case "iskolai_privileged":
      permissions.isPrivileged = true;
      permissions.isStandard = true;
      break;
    case "iskolai_general":
    default:
      permissions.isStandard = true;
      break;
  }

  return permissions;
};
