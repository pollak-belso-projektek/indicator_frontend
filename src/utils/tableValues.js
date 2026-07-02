const tableKeyValues = {
  // Core tables
  tanulo_letszam: "Tanuló létszám",
  alapadatok: "Alapadatok",
  kompetencia: "Országos kompetenciamérés",
  felvettek_szama: "Felvettek száma",
  tanugyi_adatok: "Tanügyi adatok",
  felnottkepzes: "Felnőttképzés",

  // Competition and achievements
  versenyek: "Versenyek",
  vizsgaeredmenyek: "Vizsgaeredmények",
  szakmai_vizsga_eredmenyek: "Szakmai vizsga",
  intezmenyi_neveltsegi_mutatok: "Intézményi neveltség",
  intezmenyi_elismeresek: "Intézményi elismerések",
  tanulmanyi_eredmeny: "Tanulmányi eredmény",

  // Assessment and satisfaction
  nszfh: "NSZFH mérések",
  elegedettseg_meres: "Elégedettség mérés",
  elegedettseg: "Elégedettség",

  // Student categories
  sajatos_nevelesu_tanulok: "Sajátos nevelésű tanulók",
  hh_es_hhh: "HH és HHH tanulók",
  lemorzsolodas: "Lemorzsolódás",

  // Career and employment
  elhelyezkedes: "Elhelyezkedés",
  alkalmazottak_munkaugy: "Alkalmazottak munkaügy",

  // Special programs
  muhelyiskola: "Műhelyiskola",
  dobbanto: "Dobbantó",

  // Staff and activities
  egy_oktatora_juto_tanulo: "Egy oktatóra jutó tanuló",
  egy_oktatora_juto_ossz_diak: "Egy oktatóra jutó össz diák",
  "oktato-egyeb-tev": "Oktatók egyéb tevékenységei",
  szakmai_rendezvenyek: "Rendezvények",

  // System and others
  hianyzas: "Hiányzás",
  szakmai_tovabbkepzesek: "Szakmai továbbképzések",
  palyazatok: "Pályázatok",
  projektek: "Projektek",
  szervezetfejlesztes: "Szervezetfejlesztés",
  dualis_kepzohelyek: "Duális képzőhelyek száma",
  innovacios_tevekenysegek: "Innovációs tevékenységek",
  szakkepzes_zolditese: "Szakképzés zöldítése",
  palyaorientacio: "Pályaorientáció",
  digitalis_kompetencia: "Digitális kompetencia",
  egyuttmukudesek_szama: "Együttműködések száma",
  nyelvvizsgak_szama: "Nyelvvizsgák száma",

  user: "Felhasználók",
  log: "Rendszer naplók",
  auth: "Authentikáció",
  szmsz: "SZMSZ",
};

export const getTableName = (tableKey) => {
  return tableKeyValues[tableKey] || "Ismeretlen tábla";
};

export const getTableDisplayName = (option) => {
  if (!option) return "";
  const name = tableKeyValues[option.name];
  if (name) return name;
  return option.alias || option.name || "";
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
  "/felnottkepzes": "felnottkepzes",

  "/nszfh-meresek": "nszfh",
  "/elhelyezkedesi-mutato": "elhelyezkedes",
  "/vegzettek-elegedettsege": "elegedettseg",
  "/vizsgaeredmenyek": "vizsgaeredmenyek",
  "/szakmai-vizsga": "szakmai_vizsga_eredmenyek",
  "/intezmenyi-elismeresek": "intezmenyi_elismeresek",
  "/szakmai-bemutatok-konferenciak": "szakmai_rendezvenyek",
  "/lemorzsolodas": "lemorzsolodas",
  "/elegedettseg-meres-eredmenyei": "elegedettseg_meres",
  "/muhelyiskolai-reszszakmat": "muhelyiskola",
  "/dobbanto-program-aranya": "dobbanto",
  "/sajatos-nevelesi-igenyu-tanulok-aranya": "sajatos_nevelesu_tanulok",
  "/hatranyos-helyezu-tanulok-aranya": "hh_es_hhh",
  "/intezmenyi-nevelesi-mutatok": "intezmenyi_neveltsegi_mutatok",
  "/szakkepzesi-munkaszerződes-arany": "szmsz",
  "/hianyzas": "hianyzas",
  "/szakmai-tovabbkepzesek": "szakmai_tovabbkepzesek",
  "/tanulmani-eredmeny": "tanulmanyi_eredmeny",
  "/oktato-egyeb-tev": "oktato-egyeb-tev",
  "/oktato_per_diak": "egy_oktatora_juto_tanulo",
  "/egy-oktatora-juto-ossz-diak": "egy_oktatora_juto_ossz_diak",
  "/palyazatok": "palyazatok",
  "/projektek": "projektek",
  "/szervezetfejlesztes": "szervezetfejlesztes",
  "/dualis-kepzohelyek-szama": "dualis_kepzohelyek",
  "/innovacios-tevekenysegek": "innovacios_tevekenysegek",
  "/szakkepzes-zolditese": "szakkepzes_zolditese",
  "/palyaorientacio": "palyaorientacio",
  "/digitalis-kompetencia": "digitalis_kompetencia",
  "/egyuttmukudesek-szama": "egyuttmukudesek_szama",
  "/nyelvvizsgak-szama": "nyelvvizsgak_szama",
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
  const allRoutes = Object.keys(routeToTableMapping);
  const publicRoutes = ["/dashboard", "/adat-import", "/table-management", "/profile"];

  // Superadmin gets all routes
  if (isSuperadmin) {
    return [...new Set([...publicRoutes, ...allRoutes, "/users", "/logs"])];
  }

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

  return [...new Set([...publicRoutes, ...accessibleRoutes])];
};
