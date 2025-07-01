// Utility functions for Kompetencia data management

export const getKompetenciaYears = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const currentYear = month >= 9 ? year : year - 1;

  return [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
  ];
};

export const initializeKompetenciaData = (years) => {
  const initialData = {};
  years.forEach((year) => {
    initialData[year] = {
      matematika: {
        technikum: { orszagos: 0, intezmenyi: 0 },
        szakkepzo: { orszagos: 0, intezmenyi: 0 },
      },
      szovegertes: {
        technikum: { orszagos: 0, intezmenyi: 0 },
        szakkepzo: { orszagos: 0, intezmenyi: 0 },
      },
    };
  });
  return initialData;
};

export const populateDataFromAPI = (initialData, kompetenciaData) => {
  if (kompetenciaData && Array.isArray(kompetenciaData)) {
    kompetenciaData.forEach((item) => {
      const year = item.tanev;
      if (initialData[year]) {
        if (item.tantargy === "matematika") {
          if (item.kepzesi_forma === "technikum") {
            initialData[year].matematika.technikum.orszagos = item.orszagos_atlag;
            initialData[year].matematika.technikum.intezmenyi = item.intezmenyi_atlag;
          } else if (item.kepzesi_forma === "szakkepzo") {
            initialData[year].matematika.szakkepzo.orszagos = item.orszagos_atlag;
            initialData[year].matematika.szakkepzo.intezmenyi = item.intezmenyi_atlag;
          }
        } else if (item.tantargy === "szovegertes") {
          if (item.kepzesi_forma === "technikum") {
            initialData[year].szovegertes.technikum.orszagos = item.orszagos_atlag;
            initialData[year].szovegertes.technikum.intezmenyi = item.intezmenyi_atlag;
          } else if (item.kepzesi_forma === "szakkepzo") {
            initialData[year].szovegertes.szakkepzo.orszagos = item.orszagos_atlag;
            initialData[year].szovegertes.szakkepzo.intezmenyi = item.intezmenyi_atlag;
          }
        }
      }
    });
  }
  return initialData;
};