import { useState, useEffect } from "react";
import { 
  getKompetenciaYears, 
  initializeKompetenciaData, 
  populateDataFromAPI 
} from "./kompetenciaUtils";

export const useKompetenciaData = (kompetenciaData, addKompetencia) => {
  const years = getKompetenciaYears();
  const [data, setData] = useState({});

  useEffect(() => {
    let initialData = initializeKompetenciaData(years);
    initialData = populateDataFromAPI(initialData, kompetenciaData);
    setData(initialData);
  }, [kompetenciaData]);

  const updateValue = (year, subject, type, category, newValue) => {
    setData((prevData) => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [subject]: {
          ...prevData[year][subject],
          [type]: {
            ...prevData[year][subject][type],
            [category]: newValue,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    Object.keys(data).forEach((year) => {
      ["matematika", "szovegertes"].forEach((subject) => {
        ["technikum", "szakkepzo"].forEach((type) => {
          addKompetencia({
            alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
            tantargy: subject,
            kepzesi_forma: type,
            tanev: year,
            orszagos_atlag: data[year][subject][type].orszagos,
            intezmenyi_atlag: data[year][subject][type].intezmenyi,
          });
        });
      });
    });
  };

  return {
    data,
    years,
    updateValue,
    handleSave,
  };
};