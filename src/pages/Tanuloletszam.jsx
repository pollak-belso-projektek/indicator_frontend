import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { useGetTanugyiAdatokQuery } from "../store/api/apiSlice";
import { Spinner, Text, Button, HStack, Tooltip } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

const columnHelper = createColumnHelper();

export default function TanuloLatszam() {
  const {
    data: tanugyiData,
    error,
    isLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

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

  const columns = [
    columnHelper.accessor("name", {
      header: "Ágazat típusa",
      cell: (info) => info.getValue(),
    }),

    // Grouped columns
    ...["Tanulói jogviszony", "Felnőttképzési jogviszony", "Összesen"].map(
      (category) => ({
        header: category,
        columns: years?.map((year) => ({
          id: `${category}-${year}`,
          header: `${year}/${year + 1}`,
          cell: ({ row, column }) => {
            const [isEditing, setIsEditing] = React.useState(false);
            const [inputValue, setInputValue] = React.useState(() => {
              const yearKey = column.id.split("-")[1];
              const categoryKey = column.id.split("-")[0];
              const data = row.original.yearCounts[yearKey] || {};
              return data[categoryKey] ?? 0;
            });

            const yearKey = column.id.split("-")[1];
            const categoryKey = column.id.split("-")[0];

            if (categoryKey === "Összesen") {
              const data = row.original.yearCounts[yearKey] || {};
              return (
                (data["Tanulói jogviszony"] || 0) +
                (data["Felnőttképzési jogviszony"] || 0) +
                (data["Egyéb"] || 0)
              );
            }

            const handleCommit = () => {
              setEditableData((prev) => {
                const newRow = { ...prev[row.index] };
                const newYearCounts = { ...newRow.yearCounts };
                newYearCounts[yearKey] = {
                  ...newYearCounts[yearKey],
                  [categoryKey]: Number(inputValue),
                };
                const updatedRow = {
                  ...newRow,
                  yearCounts: newYearCounts,
                };
                const updatedData = [...prev];
                updatedData[row.index] = updatedRow;
                return updatedData;
              });
              setIsEditing(false);
            };

            return isEditing ? (
              <div
                style={{ cursor: "pointer", minHeight: "24px" }}
              >
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleCommit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCommit();
                    } else if (e.key === "Escape") {
                      setIsEditing(false);
                    }
                  }}
                  style={{width: "100%",  boxSizing: "border-box" }}
                />
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                style={{ cursor: "pointer", minHeight: "24px" }}
              >
                {inputValue}
              </div>
            );
          },
        })),
      })
    ),
  ];

  const table = useReactTable({
    data: editableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function getGroupedData() {
    if (!tanugyiData || !Array.isArray(tanugyiData)) {
      return { agazatData: [], years: [] };
    }

    const groupedByAgazat = {};
    const years = new Set();

    tanugyiData.forEach((item) => {
      const agazatType = item.uj_Szkt_agazat_tipusa || "Nincs megadva";
      const year = item.tanev_kezdete ? item.tanev_kezdete : "Nincs év";
      const jogviszonyType = item.tanulo_jogviszonya || "Nincs megadva";

      years.add(year);

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
        groupedByAgazat[agazatType].yearCounts[year][
          "Felnőttképzési jogviszony"
        ] += 1;
      } else {
        groupedByAgazat[agazatType].yearCounts[year]["Egyéb"] += 1;
      }
    });

    return {
      agazatData: Object.values(groupedByAgazat),
      years: Array.from(years).sort(),
    };
  }

  const computeTotal = (year, category) => {
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

  const computeChange = (yearIndex, category) => {
    if (yearIndex === 0) return "-";
    const year = years[yearIndex];
    const prevYear = years[yearIndex - 1];
    const current = computeTotal(year, category);
    const prev = computeTotal(prevYear, category);
    if (prev === 0) return "-";
    return ((current / prev) * 100).toFixed(2);
  };

  const handleSave = () => {
    console.log("Mentett adatok:", editableData);
  };

  const handleBack = () => {
    setEditableData(prevData);
  };

  const handleReset = () => {
    setEditableData(agazatData);
  };

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Spinner size="xl" />
    </div>
  ) : error ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <h1 style={{ color: "red" }}>Hiba történt az adatok betöltésekor!</h1>
    </div>
  ) : (
    <>
      <Text fontSize="2xl" mb={4}>
        Tanulói létszám adatok
      </Text>
      <Text mb={4}>
        Ideiglenes adatok, az excel táblázatból származnak. <br />
        Szükség esetén módosíthatóak a cellákba kattintva. <br />A módosítások
        mentéséhez kérjük, használja a "Mentés" gombot, mellyel a módosításokat
        elmentheti és véglegesítheti.
      </Text>

      <HStack>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button onClick={handleReset} mb={4} backgroundColor={"red.600"}>
              Teljes visszaállítás
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Az adatok visszaállítása a számított értékekre
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button onClick={handleBack} mb={4} backgroundColor={"red.700"}>
              Módosítások visszavonása
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Az adatok visszaállítása az előző verzióra
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button onClick={handleSave} backgroundColor={"green.700"} mb={4}>
              Mentés
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Az adatok mentése</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </HStack>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ border: "1px solid #ccc", padding: "6px" }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ border: "1px solid #ccc", padding: "6px", width: "50px" }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}

          {/* Totals Row */}
          <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
            <td>Összesen</td>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((year) => (
                <td key={`total-${category}-${year}`}>
                  {computeTotal(year, category)}
                </td>
              ))
            )}
          </tr>

          {/* Change Row */}
          <tr style={{ background: "#fafafa" }}>
            <td>Adatváltozás</td>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((_, idx) => (
                <td key={`change-${category}-${idx}`}>
                  {computeChange(idx, category)}
                </td>
              ))
            )}
          </tr>
        </tbody>
      </table>
    </>
  );
}
