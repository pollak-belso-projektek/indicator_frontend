const tableKeyValues = {
  tanulo_letszam: "Tanuló létszám",
  alapadatok: "Alapadatok",
  kompetencia: "Kompetencia",
  felvettek_szama: "Felvettek száma",
  tanugyi_adatok: "Tanügyi adatok",
  versenyek: "Versenyek",
  users: "Felhasználók",
  nszfh_meresek: "NSZFH mérések",
  szakmai_eredmenyek: "Szakmai eredmények",
  elhelyezkedesi_mutato: "Elhelyezkedési mutató",
  vegzettek_elegedettsege: "Végzettek elégedettsége",
  vizsgaeredmenyek: "Vizsgaeredmények",
  intezmenyi_elismeresek: "Intézményi elismerések",
  szakmai_bemutatok_konferenciak: "Szakmai bemutatók, konferenciák",
  elegedettseg_meres_eredmenyei: "Elégedettség mérés eredményei",
  muhelyiskolai_reszszakmat: "Műhelyiskolai részszakmat",
  dobbanto_program_aranya: "Dobbantó program aránya",
  sajatos_nevelesi_igenyu_tanulok_aranya: "SNI tanulók aránya",
  hatranyos_helyetu_tanulok_aranya: "HH tanulók aránya",
  intezmenyi_nevelesi_mutatok: "Intézményi nevelési mutatók",
  szakkepzesi_munkaszerződes_arany: "Szakképzési munkaszerződés aránya",
  logs: "Rendszer naplók",
};

export const getTableName = (tableKey) => {
  return tableKeyValues[tableKey] || "Ismeretlen tábla";
};

export const getAccessableTables = (tableAccess) => {
  if (!tableAccess || !Array.isArray(tableAccess)) {
    return [];
  }

  return tableAccess.map((access) => ({
    tableName: access.tableName,
    displayName: getTableName(access.tableName),
    access: access.access,
    permissionsDetails: access.permissionsDetails || {},
  }));
};

// Mapping from route paths to table names
const routeToTableMapping = {
  "/alapadatok": "alapadatok",
  "/tanulo_letszam": "tanulo_letszam",
  "/kompetencia": "kompetencia",
  "/versenyek": "versenyek",
  "/tanugyi_adatok": "tanugyi_adatok",
  "/felvettek_szama": "felvettek_szama",
  "/users": "users",
  "/nszfh-meresek": "nszfh_meresek",
  "/szakmai-eredmenyek": "szakmai_eredmenyek",
  "/elhelyezkedesi-mutato": "elhelyezkedesi_mutato",
  "/dobbanto-program-aranya": "dobbanto_program_aranya",
  "/sajatos-nevelesi-igenyu-tanulok-aranya":
    "sajatos_nevelesi_igenyu_tanulok_aranya",
  "/hatranyos-helyezu-tanulok-aranya": "hatranyos_helyetu_tanulok_aranya",
  "/intezmenyi-nevelesi-mutatok": "intezmenyi_nevelesi_mutatok",
  "/szakkepzesi-munkaszerződes-arany": "szakkepzesi_munkaszerződes_arany",
  "/logs": "logs",
};

export const getTableNameFromRoute = (route) => {
  return routeToTableMapping[route] || null;
};

export const hasTableAccess = (tableAccess, tableName) => {
  if (!tableAccess || !Array.isArray(tableAccess) || !tableName) {
    return false;
  }

  return tableAccess.some((access) => access.tableName === tableName);
};

/**
 * Check if a user has access to a specific route based on table permissions
 * @param {Array} tableAccess - User's table access array from JWT
 * @param {string} route - The route path to check
 * @param {boolean} isSuperadmin - Whether user is superadmin (bypasses all checks)
 * @returns {boolean} - Whether user has access to the route
 */
export const hasRouteAccess = (tableAccess, route, isSuperadmin = false) => {
  // Superadmin bypasses all permission checks
  if (isSuperadmin) {
    return true;
  }

  // Routes that don't require table access
  const publicRoutes = ["/dashboard", "/adat-import"];

  if (publicRoutes.includes(route)) {
    return true;
  }

  const tableName = getTableNameFromRoute(route);
  return tableName ? hasTableAccess(tableAccess, tableName) : false;
};

/**
 * Get all accessible routes for a user based on their table permissions
 * @param {Array} tableAccess - User's table access array from JWT
 * @param {boolean} isSuperadmin - Whether user is superadmin (gets all routes)
 * @param {Object} userPermissions - User's permissions object
 * @returns {Array} - Array of accessible route paths
 */
export const getAccessibleRoutes = (
  tableAccess,
  isSuperadmin = false,
  userPermissions = {}
) => {
  // Superadmin gets all routes
  if (isSuperadmin) {
    return [
      "/dashboard",
      "/adat-import",
      "/alapadatok",
      "/tanulo_letszam",
      "/kompetencia",
      "/versenyek",
      "/tanugyi_adatok",
      "/felvettek_szama",
      "/users",
      "/logs",
    ];
  }

  const allRoutes = Object.keys(routeToTableMapping);
  const publicRoutes = ["/dashboard", "/adat-import"];

  const accessibleRoutes = allRoutes.filter((route) => {
    const tableName = getTableNameFromRoute(route);

    // Special case for logs - only admins can access
    if (tableName === "logs") {
      return userPermissions?.isAdmin || userPermissions?.isSuperadmin;
    }

    return tableName ? hasTableAccess(tableAccess, tableName) : false;
  });

  return [...publicRoutes, ...accessibleRoutes];
};
