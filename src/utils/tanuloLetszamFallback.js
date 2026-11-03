// Fill missing/zero counts from the source, recording only actual changes.
export const applyTanugyiFallback = (savedData, calculatedData) => {
  const tableData = structuredClone(savedData);
  let isModified = false;
  for (const [program, years] of Object.entries(calculatedData)) {
    for (const [year, counts] of Object.entries(years)) {
      for (const field of ['tanuloi_jogviszony', 'felnottkepzesi_jogviszony']) {
        const existing = tableData[program]?.[year]?.[field] ?? 0;
        if (Number(existing) !== 0 || !(counts[field] > 0)) continue;
        tableData[program] ??= {};
        tableData[program][year] ??= { tanuloi_jogviszony: 0, felnottkepzesi_jogviszony: 0 };
        tableData[program][year][field] = counts[field];
        isModified = true;
      }
    }
  }
  return { tableData, isModified };
};
