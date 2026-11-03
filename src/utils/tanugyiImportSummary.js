export const getTanugyiRecordsForYear = (records, year) => {
  if (!Array.isArray(records)) return [];
  return records.filter(record => Number(record?.tanev_kezdete) === year);
};
