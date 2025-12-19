export const normalizeHeaderKey = (header) => {
    if (!header) return "";

    return header
        .toString()
        .trim()
        .normalize("NFD") // Decompose chars
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^\w_]/g, "") // Remove non-word chars (except underscore) - e.g. parentheses
        .toLowerCase(); // Optional: user didn't explicitly ask for lowercase but usually variable names are lowercase. 
    // User said: "valtozok ekezezet nelkul es szokoz helyett alsóvonás". 
    // Example: "Tanuló (Oktatási azonosító)" -> "Tanulo_Oktatasi_azonosito" or "tanulo_oktatasi_azonosito"?
    // Given the previous code often uses camelCase or lowercase, I'll stick to preserving case or lowercasing.
    // But looking at apiSlice, previous keys were snake_case (e.g. mat_orsz_p). 
    // I will interpret "variables" as likely needing to be consistent. 
    // If I look at the example "Intézmény név" -> "Intezmeny_nev".
    // Let's assume preserving case makes it "Intezmeny_nev". 
    // But standard variable naming usually implies snake_case or camelCase. 
    // I'll keep the first letter case but replace spaces with underscores.
    // Actually, "Tanuló (Oktatási azonosító)" -> "Tanulo_Oktatasi_azonosito".
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

    // Replace slashes and hyphens with underscores (e.g., "azonosito/mukodesi" -> "azonosito_mukodesi", "X-Y" -> "X_Y")
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

export const mapTanuloAdatszolgaltatasData = (data) => {
    if (!data || data.length === 0) return [];

    // Get headers from the first row keys
    // Note: custom uploader returns array of objects with keys as headers
    // But we want to re-key them using our normalization logic.

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

export const TANULO_ADATSZOLGALTATAS_REQUIRED_COLUMNS = [
    "Tanulo_Oktatasi_azonosito",
    "Intezmeny_OM_azonosito",
    "Intezmeny_nev"
];
