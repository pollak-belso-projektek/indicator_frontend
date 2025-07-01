import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const createTanuloletszamColumns = (years, editableData, setEditableData) => {
  return [
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
            const EditableCell = () => {
              const [isEditing, setIsEditing] = useState(false);
              const [inputValue, setInputValue] = useState(() => {
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
                setIsEditing(false);

                setEditableData((prevData) =>
                  prevData.map((item) => {
                    if (item.name === row.original.name) {
                      return {
                        ...item,
                        yearCounts: {
                          ...item.yearCounts,
                          [yearKey]: {
                            ...item.yearCounts[yearKey],
                            [categoryKey]: parseInt(inputValue) || 0,
                          },
                        },
                      };
                    }
                    return item;
                  })
                );
              };

              return isEditing ? (
                <input
                  autoFocus
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleCommit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCommit();
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
            };

            return <EditableCell />;
          },
        })),
      })
    ),
  ];
};