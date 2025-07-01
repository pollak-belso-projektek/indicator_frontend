import React from "react";
import { 
  Table, 
  Button, 
  HStack, 
  Tooltip 
} from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";
import { computeTotal, computeChange } from "./dataUtils";

const TanuloletszamTable = ({ 
  table, 
  editableData, 
  years, 
  onSave, 
  onReset, 
  onBack 
}) => {
  return (
    <>
      <HStack>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button
              onClick={onReset}
              mb={4}
              backgroundColor={"red.600"}
            >
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
            <Button
              onClick={onBack}
              mb={4}
              backgroundColor={"red.700"}
            >
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
            <Button
              onClick={onSave}
              backgroundColor={"green.700"}
              mb={4}
            >
              Mentés
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Az adatok mentése</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </HStack>
      
      <Table.Root size="md" showColumnBorder variant="outline" striped>
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
                    fontSize="md"
                    fontWeight="bold"
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
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}

          {/* Totals Row */}
          <Table.Row>
            <Table.Cell fontWeight={"bold"}>Összesen</Table.Cell>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((year) => (
                <Table.Cell
                  key={`total-${category}-${year}`}
                  fontWeight={"bold"}
                >
                  {computeTotal(editableData, year, category)}
                </Table.Cell>
              ))
            )}
          </Table.Row>

          {/* Change Row */}
          <Table.Row>
            <Table.Cell fontWeight={"bold"}>Adatváltozás</Table.Cell>
            {[
              "Tanulói jogviszony",
              "Felnőttképzési jogviszony",
              "Összesen",
            ].flatMap((category) =>
              years?.map((_, idx) => (
                <Table.Cell
                  key={`change-${category}-${idx}`}
                  fontWeight={"bold"}
                >
                  {computeChange(editableData, years, idx, category)}
                </Table.Cell>
              ))
            )}
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default TanuloletszamTable;