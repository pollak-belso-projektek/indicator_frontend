// Data processing utilities for Tanuloletszam page
export const processGroupedData = (tanugyiData, tanuloLetszamData) => {
  const currentYear = new Date().getFullYear();
  const last4Years = [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
  ];

  if (tanuloLetszamData && Array.isArray(tanuloLetszamData)) {
    const groupedByAgazat = {};

    tanuloLetszamData.forEach((item) => {
      const agazatType = item.szakirany || "Nincs megadva";
      const year = item.tanev_kezdete ? item.tanev_kezdete : "Nincs év";
      
      let jogviszonyType;
      if (item.jogv_tipus === 0) {
        jogviszonyType = "Tanulói jogviszony";
      } else if (item.jogv_tipus === 1) {
        jogviszonyType = "Felnőttképzési jogviszony";
      } else {
        jogviszonyType = "Egyéb";
      }

      if (!groupedByAgazat[agazatType]) {
        groupedByAgazat[agazatType] = {
          name: agazatType,
          yearCounts: {},
        };
      }

      if (!groupedByAgazat[agazatType].yearCounts[year]) {
        groupedByAgazat[agazatType].yearCounts[year] = {
          "Tanulói jogviszony": 0,
          "Felnőttképzési jogviszony": 0,
          Egyéb: 0,
        };
      }

      groupedByAgazat[agazatType].yearCounts[year][jogviszonyType] = item.letszam;
    });

    // Ensure all agazat types have entries for all 4 years
    Object.values(groupedByAgazat).forEach((agazat) => {
      last4Years.forEach((year) => {
        if (!agazat.yearCounts[year]) {
          agazat.yearCounts[year] = {
            "Tanulói jogviszony": 0,
            "Felnőttképzési jogviszony": 0,
            Egyéb: 0,
          };
        }
      });
    });

    return {
      agazatData: Object.values(groupedByAgazat),
      years: last4Years,
    };
  } else {
    if (!tanugyiData || !Array.isArray(tanugyiData)) {
      return { agazatData: [], years: last4Years };
    }

    const groupedByAgazat = {};

    tanugyiData.forEach((item) => {
      const agazatType = item.uj_Szkt_agazat_tipusa || "Nincs megadva";
      const year = item.tanev_kezdete ? item.tanev_kezdete : "Nincs év";
      const jogviszonyType = item.tanulo_jogviszonya || "Nincs megadva";

      if (!groupedByAgazat[agazatType]) {
        groupedByAgazat[agazatType] = {
          name: agazatType,
          yearCounts: {},
        };
      }

      if (!groupedByAgazat[agazatType].yearCounts[year]) {
        groupedByAgazat[agazatType].yearCounts[year] = {
          "Tanulói jogviszony": 0,
          "Felnőttképzési jogviszony": 0,
          Egyéb: 0,
        };
      }

      if (jogviszonyType === "Tanulói jogviszony") {
        groupedByAgazat[agazatType].yearCounts[year]["Tanulói jogviszony"] += 1;
      } else if (jogviszonyType === "Felnőttképzési jogviszony") {
        groupedByAgazat[agazatType].yearCounts[year]["Felnőttképzési jogviszony"] += 1;
      } else {
        groupedByAgazat[agazatType].yearCounts[year]["Egyéb"] += 1;
      }
    });

    // Ensure all agazat types have entries for all 4 years
    Object.values(groupedByAgazat).forEach((agazat) => {
      last4Years.forEach((year) => {
        if (!agazat.yearCounts[year]) {
          agazat.yearCounts[year] = {
            "Tanulói jogviszony": 0,
            "Felnőttképzési jogviszony": 0,
            Egyéb: 0,
          };
        }
      });
    });

    return {
      agazatData: Object.values(groupedByAgazat),
      years: last4Years,
    };
  }
};

// Computation utilities
export const computeTotal = (editableData, year, category) => {
  return editableData.reduce((sum, item) => {
    if (category === "Összesen") {
      const data = item.yearCounts[year] || {};
      return (
        sum +
        (data["Tanulói jogviszony"] || 0) +
        (data["Felnőttképzési jogviszony"] || 0) +
        (data["Egyéb"] || 0)
      );
    }
    return sum + (item.yearCounts[year]?.[category] || 0);
  }, 0);
};

export const computeChange = (editableData, years, yearIndex, category) => {
  if (yearIndex === 0) return "-";
  const year = years[yearIndex];
  const prevYear = years[yearIndex - 1];
  const current = computeTotal(editableData, year, category);
  const prev = computeTotal(editableData, prevYear, category);
  const change = current - prev;
  return change >= 0 ? `+${change}` : `${change}`;
};