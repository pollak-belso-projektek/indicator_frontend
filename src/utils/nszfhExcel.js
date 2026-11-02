const normalize = value => String(value ?? '').trim().toLowerCase();

export const mergeNszfhImports = (previous, imported) => {
  const next = { ...previous };
  for (const [year, data] of Object.entries(imported)) {
    next[year] = { ...next[year] };
    for (const [row, fields] of Object.entries(data)) {
      next[year][row] = { ...next[year][row], ...fields };
    }
  }
  return next;
};

const parseHeader = value => {
  const match = String(value ?? '').trim().match(/^([BK])\s*(\d{2}|\d{4})\s*(Matematika|Anyanyelv)$/i);
  if (!match) return null;
  const measurement = match[1].toUpperCase() === 'B' ? 'bemeneti' : 'kimeneti';
  const year = Number(match[2]) + (match[2].length === 2 ? 2000 : 0);
  return {
    year: year - (measurement === 'kimeneti' ? 1 : 0),
    key: `${normalize(match[3]) === 'matematika' ? 'mat' : 'szoveg'}_${measurement}`,
  };
};

// Read cell arrays so title rows and duplicate/nonmeasurement headers cannot
// shift or hide the actual first row of measurement column names.
export const parseNszfhExcelRows = (rows, layout) => {
  const headerIndex = rows.findIndex(row => row.some(value => parseHeader(value)));
  if (headerIndex === -1) throw new Error('Nem található megfelelő oszlop! B24Matematika vagy K25Anyanyelv formátumú fejléc szükséges.');
  const headers = rows[headerIndex];
  const columns = headers.flatMap((value, index) => {
    const measurement = parseHeader(value);
    return measurement ? [{ ...measurement, index }] : [];
  });
  const sectorColumn = headers.findIndex(value => normalize(value).includes('ágazat'));
  const trainingColumn = headers.findIndex(value => normalize(value).includes('képzés'));
  const result = {};

  for (const values of rows.slice(headerIndex + 1)) {
    const training = normalize(values[trainingColumn]);
    const type = training.includes('szakképző') || training.includes('szakkepzo') ? 'Szakképző' : 'Technikum';
    const sector = normalize(values[sectorColumn]);
    const target = layout.find(row => {
      const label = normalize(row.label);
      return !row.isParent && row.kepzes_forma === type && sector && label &&
        (sector.includes(label) || label.includes(sector));
    }) || layout.find(row => !row.isParent && row.kepzes_forma === type && row.szakma_id === null);
    if (!target) continue;

    for (const column of columns) {
      const raw = values[column.index];
      if (raw === null || raw === undefined || String(raw).trim() === '') continue;
      const text = String(raw).trim().replace(',', '.');
      let percentage = Number(text.replace(/%$/, '').trim());
      if (!Number.isFinite(percentage)) continue;
      if (!text.endsWith('%') && percentage > 0 && percentage <= 1) percentage *= 100;
      if (percentage < 0 || percentage > 100) continue;
      const band = percentage < 25 ? 1 : percentage < 40 ? 2 : percentage < 60 ? 3 : percentage < 80 ? 4 : 5;
      const yearData = result[column.year] ??= {};
      const rowData = yearData[target.key] ??= {};
      for (let category = 1; category <= 5; category++) {
        const field = `kat_${category}_${column.key}`;
        rowData[field] = (rowData[field] || 0) + (category === band ? 1 : 0);
      }
    }
  }
  if (Object.keys(result).length === 0) throw new Error('Nem található importálható adat a kiválasztott iskola ágazataihoz.');
  return result;
};
