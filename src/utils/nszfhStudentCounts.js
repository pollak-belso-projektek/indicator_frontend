const sectorName = name => String(name || 'Nincs meghatározva').split(' - ')[0].trim();
const trainingType = (name, fallback) => {
  const text = name.toLowerCase();
  if (text.includes('technikum')) return 'Technikum';
  if (text.includes('szakképző') || text.includes('szakkepzo') || text.includes('szki')) return 'Szakképző';
  return fallback;
};

export const getNszfhStudentCounts = (admissions = [], students = [], year, schoolType) => {
  const sectors = new Map();
  const uniqueAdmissions = new Map();
  for (const record of admissions) {
    if (Number(record.tanev_kezdete) !== year) continue;
    uniqueAdmissions.set(JSON.stringify([record.szakirany?.nev, record.szakma?.nev]), record);
  }
  for (const record of uniqueAdmissions.values()) {
    const count = Number.parseInt(record.felvett_letszam, 10) || 0;
    if (count <= 0) continue;
    const name = sectorName(record.szakirany?.nev);
    const type = trainingType(`${record.szakirany?.nev || ''} ${record.szakma?.nev || ''}`, schoolType);
    const previous = sectors.get(name);
    sectors.set(name, { count: (previous?.count || 0) + count, type });
  }

  const calculated = new Map();
  for (const student of students) {
    if (Number.parseInt(student.felvetel_taneve, 10) !== year) continue;
    if (student.tanev_kezdete != null && Number(student.tanev_kezdete) !== year) continue;
    if (student.tanulo_jogviszonya !== 'Tanulói jogviszony') continue;
    const grade = String(student.evfolyam || '').trim();
    if (!/^9(?:[.\s/]|$)/.test(grade) && !grade.includes('1/')) continue;
    const rawSector = student.uj_Szkt_agazat_tipusa;
    const name = sectorName(rawSector);
    const previous = calculated.get(name);
    calculated.set(name, {
      count: (previous?.count || 0) + 1,
      type: trainingType(rawSector || '', schoolType),
    });
  }
  // A persisted sector total is authoritative, even if the source differs.
  // Do not add source counts to that total and count the same students twice.
  for (const [name, data] of calculated) {
    if (!sectors.has(name)) sectors.set(name, data);
  }

  const counts = { total: 0 };
  for (const [name, { count, type }] of sectors) {
    counts[name] = count;
    counts.total += count;
    if (type) counts[type] = (counts[type] || 0) + count;
  }
  return counts;
};
