// Fájl validációs utility függvények

/**
 * Tanügyi adatok jellemző oszlopai
 */
const TANUGYI_REQUIRED_COLUMNS = [
  "oktatasiAzonositoja",
  "oktatási azonosítója",
  "osztaly",
  "osztály",
  "bejaro",
  "bejáró",
  "tankotelezettsegetTeljesito",
  "tankötelezettséget teljesítő",
];

/**
 * Alkalmazotti adatok jellemző oszlopai
 */
const ALKALMAZOTT_REQUIRED_COLUMNS = [
  "munkakor",
  "munkakör",
  "pedagogusFokozat",
  "pedagógus fokozat",
  "foglalkoztatasiJogviszony",
  "foglalkoztatási jogviszony",
  "pedagogusOkatatasiAzonosito",
  "pedagógus oktatási azonosító",
];

/**
 * Közös mezők mindkét fájltípusban
 */
const COMMON_COLUMNS = [
  "vezeteknev",
  "vezetéknév",
  "utonev",
  "utónév",
  "elotag",
  "előtag",
];

/**
 * Normalizálja az oszlopnevet (kisbetűsít, ékezeteket eltávolítja, szóközöket)
 */
function normalizeColumnName(columnName) {
  if (!columnName) return "";

  return columnName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ö/g, "o")
    .replace(/ő/g, "o")
    .replace(/ú/g, "u")
    .replace(/ü/g, "u")
    .replace(/ű/g, "u");
}

/**
 * Ellenőrzi, hogy a megadott oszlopok között van-e legalább egy a keresett oszlopok közül
 */
function hasAnyColumn(availableColumns, requiredColumns) {
  const normalizedAvailable = availableColumns.map(normalizeColumnName);
  const normalizedRequired = requiredColumns.map(normalizeColumnName);

  return normalizedRequired.some((required) =>
    normalizedAvailable.includes(required)
  );
}

/**
 * Megszámolja, hány jellemző oszlop található a fájlban
 */
function countMatchingColumns(availableColumns, requiredColumns) {
  const normalizedAvailable = availableColumns.map(normalizeColumnName);
  const normalizedRequired = requiredColumns.map(normalizeColumnName);

  return normalizedRequired.filter((required) =>
    normalizedAvailable.includes(required)
  ).length;
}

/**
 * Validálja, hogy a fájl tanügyi adatok-e
 */
export function validateTanugyiFile(headers) {
  if (!headers || !Array.isArray(headers)) {
    return {
      isValid: false,
      error: "Nem sikerült beolvasni a fájl fejléceit",
    };
  }

  const tanugyiMatches = countMatchingColumns(
    headers,
    TANUGYI_REQUIRED_COLUMNS
  );
  const alkalmazottMatches = countMatchingColumns(
    headers,
    ALKALMAZOTT_REQUIRED_COLUMNS
  );

  // Ha alkalmazotti oszlopok dominálnak
  if (alkalmazottMatches > tanugyiMatches && alkalmazottMatches >= 2) {
    return {
      isValid: false,
      error:
        "Ez egy alkalmazotti adatokat tartalmazó fájl! Kérjük, a tanügyi adatok feltöltéséhez használja a megfelelő tanügyi fájlt.",
      fileType: "alkalmazott",
      details: `Alkalmazotti oszlopok találva: ${alkalmazottMatches}, Tanügyi oszlopok: ${tanugyiMatches}`,
    };
  }

  // Ha nincs elegendő tanügyi oszlop
  if (tanugyiMatches < 1) {
    return {
      isValid: false,
      error:
        "A fájl nem tartalmazza a szükséges tanügyi adatok oszlopait. Ellenőrizze, hogy a fájl tartalmazza-e az alábbi oszlopok közül legalább egyet: Oktatási azonosítója, Osztály, Bejáró, Tankötelezettséget teljesítő",
      fileType: "unknown",
      details: `Nem található elegendő tanügyi oszlop a fájlban`,
    };
  }

  return {
    isValid: true,
    fileType: "tanugyi",
    matchedColumns: tanugyiMatches,
  };
}

/**
 * Validálja, hogy a fájl alkalmazotti adatok-e
 */
export function validateAlkalmazottFile(headers) {
  if (!headers || !Array.isArray(headers)) {
    return {
      isValid: false,
      error: "Nem sikerült beolvasni a fájl fejléceit",
    };
  }

  const tanugyiMatches = countMatchingColumns(
    headers,
    TANUGYI_REQUIRED_COLUMNS
  );
  const alkalmazottMatches = countMatchingColumns(
    headers,
    ALKALMAZOTT_REQUIRED_COLUMNS
  );

  // Ha tanügyi oszlopok dominálnak
  if (tanugyiMatches > alkalmazottMatches && tanugyiMatches >= 2) {
    return {
      isValid: false,
      error:
        "Ez egy tanügyi adatokat tartalmazó fájl! Kérjük, az alkalmazotti adatok feltöltéséhez használja a megfelelő alkalmazotti fájlt.",
      fileType: "tanugyi",
      details: `Tanügyi oszlopok találva: ${tanugyiMatches}, Alkalmazotti oszlopok: ${alkalmazottMatches}`,
    };
  }

  // Ha nincs elegendő alkalmazotti oszlop
  if (alkalmazottMatches < 1) {
    return {
      isValid: false,
      error:
        "A fájl nem tartalmazza a szükséges alkalmazotti adatok oszlopait. Ellenőrizze, hogy a fájl tartalmazza-e az alábbi oszlopok közül legalább egyet: Munkakör, Pedagógus fokozat, Foglalkoztatási jogviszony, Pedagógus oktatási azonosító",
      fileType: "unknown",
      details: `Nem található elegendő alkalmazotti oszlop a fájlban`,
    };
  }

  return {
    isValid: true,
    fileType: "alkalmazott",
    matchedColumns: alkalmazottMatches,
  };
}

/**
 * Általános fájl validáció
 */
// ... existing exports ...

/**
 * Tanuló adatszolgáltatás jellemző oszlopai
 */
const TANULO_ADATSZOLGALTATAS_REQUIRED_COLUMNS = [
  "tanulo (oktatasi azonosito)",
  "tanuló (oktatási azonosító)",
  "intezmeny om azonosito",
  "intézmény om azonosító",
  "feladatellatasi hely azonosito/mukodesi hely hosszu azonosito",
  "feladatellátási hely azonosító/működési hely hosszú azonosító",
  "programkovetelmenyes szakmai kepzes",
  "programkövetelményes szakmai képzés",
];

/**
 * Oktató adatszolgáltatás jellemző oszlopai
 */
const OKTATO_ADATSZOLGALTATAS_REQUIRED_COLUMNS = [
  "oktato (oktatasi azonosito)",
  "oktató (oktatási azonosító)",
  "oktato oktatott targykategoria - 3 szerint",
  "oktató oktatott tárgykategória - 3 szerint",
  "oktato tantervi jellemzo szerint",
  "oktató tantervi jellemző szerint",
];

export function validateTanuloAdatszolgaltatasFile(headers) {
  if (!headers || !Array.isArray(headers)) {
    return {
      isValid: false,
      error: "Nem sikerült beolvasni a fájl fejléceit",
    };
  }

  const matches = countMatchingColumns(
    headers,
    TANULO_ADATSZOLGALTATAS_REQUIRED_COLUMNS
  );

  if (matches < 1) {
    return {
      isValid: false,
      error:
        "A fájl nem tartalmazza a szükséges tanuló adatszolgáltatás oszlopait. Keresett oszlopok pl.: Tanuló (Oktatási azonosító), Intézmény OM azonosító...",
      fileType: "unknown",
      details: `Nem található elegendő oszlop a fájlban`,
    };
  }

  return {
    isValid: true,
    fileType: "tanulo_adatszolgaltatas",
    matchedColumns: matches,
  };
}

export function validateOktatoAdatszolgaltatasFile(headers) {
  if (!headers || !Array.isArray(headers)) {
    return {
      isValid: false,
      error: "Nem sikerült beolvasni a fájl fejléceit",
    };
  }

  const matches = countMatchingColumns(
    headers,
    OKTATO_ADATSZOLGALTATAS_REQUIRED_COLUMNS
  );

  // Allow if at least 1 match, similar to others, or maybe stricter if needed.
  if (matches < 1) {
    return {
      isValid: false,
      error:
        "A fájl nem tartalmazza a szükséges oktató adatszolgáltatás oszlopait. Keresett oszlopok pl.: Oktató (Oktatási azonosító), Oktató oktatott tárgykategória...",
      fileType: "unknown",
      details: `Nem található elegendő oszlop a fájlban`,
    };
  }

  return {
    isValid: true,
    fileType: "oktato_adatszolgaltatas",
    matchedColumns: matches,
  };
}

export function validateFileHeaders(headers, expectedType = "auto") {
  if (expectedType === "tanugyi") {
    return validateTanugyiFile(headers);
  } else if (expectedType === "alkalmazott") {
    return validateAlkalmazottFile(headers);
  } else if (expectedType === "tanulo_adatszolgaltatas") {
    return validateTanuloAdatszolgaltatasFile(headers);
  } else if (expectedType === "oktato_adatszolgaltatas") {
    return validateOktatoAdatszolgaltatasFile(headers);
  }

  // Auto-detect
  const tanugyiMatches = countMatchingColumns(headers, TANUGYI_REQUIRED_COLUMNS);
  const alkalmazottMatches = countMatchingColumns(headers, ALKALMAZOTT_REQUIRED_COLUMNS);
  const tanuloAdatszolgaltatasMatches = countMatchingColumns(headers, TANULO_ADATSZOLGALTATAS_REQUIRED_COLUMNS);
  const oktatoAdatszolgaltatasMatches = countMatchingColumns(headers, OKTATO_ADATSZOLGALTATAS_REQUIRED_COLUMNS);

  if (tanuloAdatszolgaltatasMatches >= 2 && tanuloAdatszolgaltatasMatches > tanugyiMatches) {
    return validateTanuloAdatszolgaltatasFile(headers);
  } else if (oktatoAdatszolgaltatasMatches >= 1 && oktatoAdatszolgaltatasMatches > tanugyiMatches) {
    return validateOktatoAdatszolgaltatasFile(headers);
  } else if (tanugyiMatches >= alkalmazottMatches) {
    return validateTanugyiFile(headers);
  } else {
    return validateAlkalmazottFile(headers);
  }
}
