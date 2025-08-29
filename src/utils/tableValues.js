const tableKeyValues = {
  // Core tables
  tanulo_letszam: "Tanuló létszám",
  alapadatok: "Alapadatok",
  kompetencia: "Kompetencia",
  felvettek_szama: "Felvettek száma",
  tanugyi_adatok: "Tanügyi adatok",
  
  // Competition and achievements
  versenyek: "Versenyek",
  vizsgaeredmenyek: "Vizsgaeredmények",
  szakmai_vizsga_eredmenyek: "Szakmai vizsga eredmények",
  intezmenyi_neveltseg: "Intézményi neveltség",
  
  // Assessment and satisfaction
  nszfh: "NSZFH",
  elegedettseg_meres: "Elégedettség mérés",
  elegedettseg: "Elégedettség",
  
  // Student categories
  sajatos_nevelesu_tanulok: "Sajátos nevelésű tanulók",
  hh_es_hhh_nevelesu_tanulok: "HH és HHH nevelésű tanulók",
  
  // Career and employment
  elhelyezkedes: "Elhelyezkedés",
  alkalmazottak_munkaugy: "Alkalmazottak munkaügy",
  
  // Special programs
  muhelyiskola: "Műhelyiskola",
  dobbanto: "Dobbantó",
  
  // Staff and activities
  egy_oktatora_juto_tanulo: "Egy oktatóra jutó tanuló",
  oktato_egyeb_tev: "Oktató egyéb tevékenység",
  
  // System
  user: "Felhasználók",
  log: "Rendszer naplók",
  auth: "Authentikáció",
  szmsz: "SZMSZ",
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
  "/users": "user",
  "/nszfh-meresek": "nszfh",
  "/szakmai-eredmenyek": "versenyek",
  "/elhelyezkedesi-mutato": "elhelyezkedes",
  "/vegzettek-elegedettsege": "elegedettseg",
  "/vizsgaeredmenyek": "vizsgaeredmenyek",
  "/intezmenyi-elismeresek": "intezmenyi_neveltseg",
  "/szakmai-bemutatok-konferenciak": "oktato_egyeb_tev",
  "/elegedettseg-meres-eredmenyei": "elegedettseg_meres",
  "/muhelyiskolai-reszszakmat": "muhelyiskola",
  "/dobbanto-program-aranya": "dobbanto",
  "/sajatos-nevelesi-igenyu-tanulok-aranya": "sajatos_nevelesu_tanulok",
  "/hatranyos-helyezu-tanulok-aranya": "hh_es_hhh_nevelesu_tanulok",
  "/intezmenyi-nevelesi-mutatok": "intezmenyi_neveltseg",
  "/szakkepzesi-munkaszerződes-arany": "szakmai_vizsga_eredmenyek",
  "/oktatok-egyeb-tev": "oktato_egyeb_tev",
  "/oktato_per_diak": "egy_oktatora_juto_tanulo",
  "/logs": "log",
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
  const publicRoutes = ["/dashboard", "/adat-import", "/table-management"];

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
      "/table-management",
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
  const publicRoutes = ["/dashboard", "/adat-import", "/table-management"];

  const accessibleRoutes = allRoutes.filter((route) => {
    const tableName = getTableNameFromRoute(route);

    // Special case for logs - only superadmins can access
    if (tableName === "log") {
      return userPermissions?.isSuperadmin;
    }

    // Special case for users - only superadmins can access
    if (tableName === "user") {
      return userPermissions?.isSuperadmin;
    }

    return tableName ? hasTableAccess(tableAccess, tableName) : false;
  });

  return [...publicRoutes, ...accessibleRoutes];
};
