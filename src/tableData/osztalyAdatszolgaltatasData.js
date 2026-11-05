import {
  normalizeClassLabel,
  compareClasses,
  isNappaliClass,
  extractNappaliClasses,
} from "../utils/classUtils";

export const normalizeHeaderKeyStrict = (header) => {
  if (!header) return "";
  let normalized = header
    .toString()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  // Replace spaces with underscores
  normalized = normalized.replace(/\s+/g, "_");

  // Replace slashes and hyphens with underscores
  normalized = normalized.replace(/[/-]/g, "_");

  // Remove special characters like (, ), etc.
  normalized = normalized.replace(/[^a-zA-Z0-9_]/g, "");

  // Common replacements for backend compatibility
  normalized = normalized.replace(/e_mail/g, "email");

  // Replace multiple underscores with a single underscore
  normalized = normalized.replace(/_+/g, "_");

  return normalized;
};

export const mapOsztalyAdatszolgaltatasData = (data) => {
  if (!data || data.length === 0) return [];

  return data.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      const newKey = normalizeHeaderKeyStrict(key);
      if (newKey) {
        newRow[newKey] = row[key];
      }
    });
    return newRow;
  });
};

export const OSZTALY_ADATSZOLGALTATAS_REQUIRED_COLUMNS = [
  "Osztaly_neve",
  "Intezmeny_OM_azonosito",
  "Munkarend",
];

export {
  normalizeClassLabel,
  compareClasses,
  isNappaliClass,
  extractNappaliClasses,
};
