/**
 * Normalizes sector (ágazat) and profession (szakma) names coming from the KRÉTA
 * "Tanulók tanügyi adatai" export, so they match the names configured for a school.
 *
 * KRÉTA has used several formats for the same value:
 *   old: "Cukrász - 4 1013 23 01 (2020)"     "Turizmus-vendéglátás - 23 (2020)"
 *   new: "Cukrász (4 1013 23 01)"           "Gépészet - Szakképző iskola"
 * Profession names may contain " - " themselves ("Pincér - vendégtéri szakember"),
 * so for professions only the code is removed. Sector (ágazat) names never contain
 * " - ", so for them everything after it is dropped.
 *
 * Keep in sync with indicator_backend/utils/kepzesName.js (same rules, same tests).
 */
export const NINCS_MEGHATAROZVA = "Nincs meghatározva";

const OLD_CODE_SUFFIX = /\s+-\s+\d[\d\s]*(\(\d{4}\))?\s*$/; // " - 4 1013 23 01 (2020)", " - 23 (2020)", " - 061"
const NEW_CODE_SUFFIX = /\s*\(\s*\d[\d\s]*\)\s*$/; //     " (4 1013 23 01)"
const EMPTY = /^(na|n\/a|-|nincs meghatározva)$/i;

/** Clean profession (szakma) name, or null when the value means "not specified". */
export function normalizeKepzesName(value) {
  if (value === null || value === undefined) return null;
  const name = String(value).trim().replace(OLD_CODE_SUFFIX, "").replace(NEW_CODE_SUFFIX, "").replace(/\s+/g, " ").trim();
  return !name || EMPTY.test(name) ? null : name;
}

export const normalizeSzakmaName = normalizeKepzesName;

/** Clean sector (ágazat) name, or null when the value means "not specified". */
export function normalizeAgazatName(value) {
  const name = normalizeKepzesName(value)?.split(" - ")[0].trim();
  return name && !EMPTY.test(name) ? name : null;
}

/** Comparison key for professions: normalized, case-insensitive. */
export function kepzesNameKey(value) {
  return normalizeKepzesName(value)?.toLocaleLowerCase("hu") ?? null;
}

/** Comparison key for sectors. */
export function agazatNameKey(value) {
  return normalizeAgazatName(value)?.toLocaleLowerCase("hu") ?? null;
}

/**
 * Index records ({ nev }) by comparison key. When several records share a key
 * (e.g. "Cukrász" and an older auto-created "Cukrász (4 1013 23 01)"), the one whose
 * stored name is already clean wins, so data links to the canonical record.
 */
export function indexByKepzesName(records, keyOf = kepzesNameKey) {
  const index = new Map();
  for (const record of records) {
    const key = keyOf(record?.nev);
    if (!key) continue;
    const current = index.get(key);
    const isClean = normalizeKepzesName(record.nev) === record.nev;
    if (!current || (isClean && normalizeKepzesName(current.nev) !== current.nev)) index.set(key, record);
  }
  return index;
}

/**
 * Maps a raw KRÉTA name to the spelling used by the school's configured rows
 * (`configuredNames`), so counts land on the rows the table shows. Returns null for
 * "not specified"; unknown names come back normalized.
 */
export function toConfiguredKepzesName(value, configuredNames = []) {
  const name = normalizeKepzesName(value);
  if (!name) return null;
  const key = kepzesNameKey(name);
  return configuredNames.find((configured) => kepzesNameKey(configured) === key) ?? name;
}

/** Same as toConfiguredKepzesName, for sector (ágazat) names. */
export function toConfiguredAgazatName(value, configuredNames = []) {
  const name = normalizeAgazatName(value);
  if (!name) return null;
  const key = agazatNameKey(name);
  return configuredNames.find((configured) => agazatNameKey(configured) === key) ?? name;
}
