export const normalizeHeaderKey = (header) => {
    if (!header) return "";

    return header
        .toString()
        .trim()
        .normalize("NFD") // Decompose chars
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^\w_]/g, "") // Remove non-word chars (except underscore) - e.g. parentheses
        .toLowerCase();
};

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
    normalized = normalized.replace(/[\/-]/g, "_");

    // Remove special characters like (, ), etc.
    // Keep letters, numbers, and underscores.
    normalized = normalized.replace(/[^a-zA-Z0-9_]/g, "");

    // Common replacements for backend compatibility
    normalized = normalized.replace(/e_mail/g, "email");

    // Replace multiple underscores with a single underscore
    normalized = normalized.replace(/_+/g, "_");

    return normalized;
}

export const mapOktatoAdatszolgaltatasData = (data) => {
    if (!data || data.length === 0) return [];

    return data.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
            const newKey = normalizeHeaderKeyStrict(key);
            // Skip empty keys
            if (newKey) {
                newRow[newKey] = row[key];
            }
        });
        return newRow;
    });
};

export const OKTATO_ADATSZOLGALTATAS_REQUIRED_COLUMNS = [
    "Oktato_Oktatasi_azonosito",
    "Intezmeny_OM_azonosito",
    "Intezmeny_nev"
];
