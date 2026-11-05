/**
 * Utility functions for school class handling and sorting
 */

export const normalizeClassLabel = (label) =>
  String(label || "")
    .replace(/\s+/g, " ")
    .trim();

export const parseClassLabel = (label) => {
  const normalized = normalizeClassLabel(label);

  const regularMatch = normalized.match(/^(\d+)\.\s*(.+)$/);
  if (regularMatch) {
    return {
      kind: "regular",
      year: Number(regularMatch[1]),
      section: regularMatch[2],
    };
  }

  const fractionMatch = normalized.match(/^(\d+)\/(\d+)\.\s*(.+)$/);
  if (fractionMatch) {
    return {
      kind: "fraction",
      year: Number(fractionMatch[2]),
      stage: Number(fractionMatch[1]),
      section: fractionMatch[3],
    };
  }

  return { kind: "other", raw: normalized };
};

export const compareClasses = (a, b) => {
  const parsedA = parseClassLabel(a);
  const parsedB = parseClassLabel(b);

  const kindOrder = { regular: 0, fraction: 1, other: 2 };
  if (kindOrder[parsedA.kind] !== kindOrder[parsedB.kind]) {
    return kindOrder[parsedA.kind] - kindOrder[parsedB.kind];
  }

  if (parsedA.kind === "regular") {
    if (parsedA.year !== parsedB.year) {
      return parsedA.year - parsedB.year;
    }
    return parsedA.section.localeCompare(parsedB.section, "hu", {
      numeric: true,
      sensitivity: "base",
    });
  }

  if (parsedA.kind === "fraction") {
    if (parsedA.year !== parsedB.year) {
      return parsedA.year - parsedB.year;
    }
    if (parsedA.stage !== parsedB.stage) {
      return parsedA.stage - parsedB.stage;
    }
    return parsedA.section.localeCompare(parsedB.section, "hu", {
      numeric: true,
      sensitivity: "base",
    });
  }

  return parsedA.raw.localeCompare(parsedB.raw, "hu", {
    numeric: true,
    sensitivity: "base",
  });
};

/**
 * Checks whether a record belongs to daytime education ("nappali")
 */
export const isNappaliClass = (record) => {
  if (!record) return false;
  const munkarend =
    record.Munkarend ||
    record.munkarend ||
    record.MUNKAREND ||
    record["Munkarend"] ||
    "";
  return String(munkarend).toLowerCase().includes("nappali");
};

/**
 * Extracts class name from record under various possible keys
 */
export const getRecordClassName = (record) => {
  if (!record) return "";
  if (typeof record === "string") return normalizeClassLabel(record);
  return normalizeClassLabel(
    record.Osztaly_neve ||
      record.osztaly_neve ||
      record.osztaly ||
      record.osztaly_jele ||
      record["Osztály neve"] ||
      record["osztaly"] ||
      record.name ||
      ""
  );
};

/**
 * Extracts unique, sorted nappali class names from class data records
 */
export const extractNappaliClasses = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  const classSet = new Set();
  records.forEach((record) => {
    if (isNappaliClass(record)) {
      const className = getRecordClassName(record);
      if (className) {
        classSet.add(className);
      }
    }
  });

  return Array.from(classSet).sort(compareClasses);
};

// Storage keys
const STORAGE_PREFIX = "indicator_osztaly_data_";
const LATEST_KEY = "indicator_osztaly_data_latest";

/**
 * Saves uploaded Osztály data locally for offline / fast global access
 */
export const saveOsztalyDataLocally = (schoolId, year, records) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const payload = JSON.stringify({
      schoolId: schoolId || "global",
      year: year || null,
      timestamp: new Date().toISOString(),
      records: records || [],
    });
    if (schoolId) {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${schoolId}_${year || "all"}`,
        payload
      );
    }
    window.localStorage.setItem(LATEST_KEY, payload);
  } catch (err) {
    console.warn("Could not save osztaly data to localStorage", err);
  }
};

/**
 * Retrieves cached Osztály data from localStorage
 */
export const getOsztalyDataLocally = (schoolId, year) => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    if (schoolId) {
      const specific = window.localStorage.getItem(
        `${STORAGE_PREFIX}${schoolId}_${year || "all"}`
      );
      if (specific) {
        const parsed = JSON.parse(specific);
        if (Array.isArray(parsed?.records) && parsed.records.length > 0) {
          return parsed.records;
        }
      }
    }
    const latest = window.localStorage.getItem(LATEST_KEY);
    if (latest) {
      const parsed = JSON.parse(latest);
      if (Array.isArray(parsed?.records) && parsed.records.length > 0) {
        return parsed.records;
      }
    }
  } catch (err) {
    console.warn("Could not read osztaly data from localStorage", err);
  }
  return null;
};
