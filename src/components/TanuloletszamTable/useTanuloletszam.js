import { useState, useEffect } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { processGroupedData } from "./dataUtils";
import { createTanuloletszamColumns } from "./tableColumns.jsx";

export const useTanuloletszam = (
  tanugyiData,
  tanuloLetszamData,
  addTanuloLetszam,
  deleteTanuloLetszam
) => {
  const getGroupedData = () => {
    return processGroupedData(tanugyiData, tanuloLetszamData);
  };

  const { agazatData, years } = getGroupedData();
  const [editableData, setEditableData] = useState(agazatData);
  const [prevData, setPrevData] = useState(agazatData);

  useEffect(() => {
    if (tanugyiData) {
      const { agazatData } = getGroupedData();
      setEditableData(agazatData);
      setPrevData(agazatData);
    }
  }, [tanugyiData]);

  const columns = createTanuloletszamColumns(years, editableData, setEditableData);

  const table = useReactTable({
    data: editableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSave = () => {
    editableData.forEach((item) => {
      Object.keys(item.yearCounts).forEach((year) => {
        ["Tanulói jogviszony", "Felnőttképzési jogviszony", "Egyéb"].forEach(
          (category) => {
            const count = item.yearCounts[year][category];
            addTanuloLetszam({
              alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
              letszam: count,
              jogv_tipus: category === "Tanulói jogviszony" ? 0 : 1,
              szakirany: item.name,
              tanev_kezdete: year,
            });
          }
        );
      });
    });
  };

  const handleBack = () => {
    setEditableData(prevData);
  };

  const handleReset = () => {
    editableData.forEach((item) => {
      Object.keys(item.yearCounts).forEach((year) => {
        deleteTanuloLetszam({
          alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
          year: year,
        });
      });
    });
  };

  return {
    editableData,
    years,
    table,
    handleSave,
    handleBack,
    handleReset,
  };
};