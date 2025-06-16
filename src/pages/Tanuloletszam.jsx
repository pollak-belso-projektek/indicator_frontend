import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import {
  useGetTanugyiAdatokQuery,
  useAddTanuloLetszamMutation,
  useGetTanuloLetszamQuery,
  useDeleteTanuloLetszamMutation,
} from "../store/api/apiSlice";
import {
  Spinner,
  Text,
  Button,
  HStack,
  Tooltip,
  Table,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  const {
    data: tanuloLetszamData,
    error: letszamError,
    isLoading: letszamIsLoading,
  } = useGetTanuloLetszamQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
  });

  const [addTanuloLetszam, result] = useAddTanuloLetszamMutation();
  const [deleteTanuloLetszam, resultDelete] = useDeleteTanuloLetszamMutation();

  const { agazatData, years } = getGroupedData();

  const [editableData, setEditableData] = useState(agazatData);
  const [prevData, setPrevData] = useState(agazatData);

  const navigate = useNavigate();

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
                style={{
                  width: "100%",
                  height: "24px",
                  boxSizing: "border-box",
                  padding: "2px 4px",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  margin: 0,
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  fieldSizing: "content",
                }}
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                style={{
                  cursor: "pointer",
                  height: "24px",
                  padding: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  margin: 0,
                }}
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
    // If tanuloLetszamData is available, use it to set initial values
    /**
     * the data rows looks like this:
     *  alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874"
        createAt: "2025-06-16T08:19:49.883Z"
        createBy: null
        id: "74b25058-8d1b-466d-a1e7-af0dff2a9ffc"
        jogv_tipus: 0
        letszam: 400
        szakirany_id: "90690610-0e43-42c6-aa5c-9912f88c6269"
        szakma_id: "25525eda-a163-4c84-82e6-b9000b961313"
        tanev_kezdete: 2024
     */

    if (tanuloLetszamData) {
      const groupedByAgazat = {};
      const years = new Set();

      tanuloLetszamData.forEach((item) => {
        const agazatType = item.szakirany.nev;
        const year = item.tanev_kezdete;
        const jogviszonyType =
          item.jogv_tipus === 0
            ? "Tanulói jogviszony"
            : "Felnőttképzési jogviszony";

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

        groupedByAgazat[agazatType].yearCounts[year][jogviszonyType] =
          item.letszam;
      });

      return {
        agazatData: Object.values(groupedByAgazat),
        years: Array.from(years).sort(),
      };
    } else {
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
          groupedByAgazat[agazatType].yearCounts[year][
            "Tanulói jogviszony"
          ] += 1;
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

    console.log("Change: ", prev, current);

    if (prev === 0) return "-";
    return ((current / prev) * 100).toFixed(2);
  };

  const handleSave = () => {
    editableData.forEach((item) => {
      Object.keys(item.yearCounts).forEach((year) => {
        const tanuloLetszam = item.yearCounts[year];
        Object.keys(tanuloLetszam).forEach((category) => {
          if (tanuloLetszam[category] === 0) return; // Skip if count is zero
          if (category === "Egyéb") return; // Skip "Egyéb" category

          addTanuloLetszam({
            alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
            letszam: tanuloLetszam[category],
            jogv_tipus: category === "Tanulói jogviszony" ? 0 : 1, // Assuming 0 for "Tanulói jogviszony" and 1 for "Felnőttképzési jogviszony"
            szakirany: item.name,
            tanev_kezdete: year,
          });
        });
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

    navigate(0);
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
      <Table.Root
        striped
        variant={"outline"}
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnRelativeDepth = header.depth - header.column.depth;

                if (
                  !header.isPlaceholder &&
                  columnRelativeDepth > 1 &&
                  header.id === header.column.id
                ) {
                  return null;
                }

                let rowSpan = 1;
                if (header.isPlaceholder) {
                  const leafs = header.getLeafHeaders();
                  rowSpan = leafs[leafs.length - 1].depth - header.depth;
                }

                return (
                  <Table.ColumnHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    rowSpan={rowSpan}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}

          {/* Totals Row */}
          <Table.Row>
            <Table.Cell>Összesen</Table.Cell>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((year) => (
                <Table.Cell key={`total-${category}-${year}`}>
                  {computeTotal(year, category)}
                </Table.Cell>
              ))
            )}
          </Table.Row>

          {/* Change Row */}
          <Table.Row>
            <Table.Cell>Adatváltozás</Table.Cell>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((_, idx) => (
                <Table.Cell key={`change-${category}-${idx}`}>
                  {computeChange(idx, category)}
                </Table.Cell>
              ))
            )}
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
}
