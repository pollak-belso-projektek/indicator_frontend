import { Box, Tooltip } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { flexRender } from "@tanstack/react-table";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export const UserTable = ({ table, density = "normal" }) => {
  // Define row height based on density
  const getDensityStyles = (density) => {
    switch (density) {
      case "compact":
        return {
          headerPy: 1,
          cellPy: 0.75,
          fontSize: "0.8rem",
          headerFontSize: "0.875rem",
        };
      case "comfortable":
        return {
          headerPy: 3,
          cellPy: 2.5,
          fontSize: "0.925rem",
          headerFontSize: "1rem",
        };
      case "normal":
      default:
        return {
          headerPy: 2,
          cellPy: 2,
          fontSize: "0.875rem",
          headerFontSize: "0.95rem",
        };
    }
  };

  const densityStyles = getDensityStyles(density);

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 0,
        margin: "0 auto",
        overflow: "auto",
      }}
    >
      <Table
        stickyHeader
        sx={{
          width: "fit-content",
          minWidth: "100%",
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: densityStyles.headerFontSize,
                    py: densityStyles.headerPy,
                    borderBottom: "2px solid #e0e0e0",
                    width: header.getSize(),
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <Box
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "color 0.2s ease",
                      }}
                      sx={{
                        "&:hover": {
                          color: header.column.getCanSort()
                            ? "#1976d2"
                            : "inherit",
                        },
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <Box
                          sx={{ ml: 1, display: "flex", alignItems: "center" }}
                        >
                          {{
                            asc: (
                              <FiChevronUp
                                size={16}
                                style={{ color: "#1976d2" }}
                              />
                            ),
                            desc: (
                              <FiChevronDown
                                size={16}
                                style={{ color: "#1976d2" }}
                              />
                            ),
                          }[header.column.getIsSorted()] ?? (
                            <Box sx={{ width: 16, height: 16, opacity: 0.3 }}>
                              <FiChevronUp size={16} />
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Column Resizer */}
                  {header.column.getCanResize() && (
                    <Tooltip
                      title={`Húzd az oszlop méretezéséhez: ${header.column.columnDef.header}`}
                    >
                      <Box
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        sx={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: 4,
                          cursor: "col-resize",
                          userSelect: "none",
                          touchAction: "none",
                          backgroundColor: "#e0e0e0",
                          zIndex: 10,
                          "&:hover": {
                            backgroundColor: "#1976d2",
                            width: 6,
                          },
                          "&:active": {
                            backgroundColor: "#1976d2",
                            width: 6,
                          },
                          ...(header.column.getIsResizing() && {
                            backgroundColor: "#1976d2",
                            width: 6,
                          }),
                        }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {console.log("Table rows:", table.getRowModel().rows)}
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                "&:nth-of-type(odd)": {
                  backgroundColor: "#fafafa",
                },
                "&:hover": {
                  backgroundColor: "#f0f8ff",
                  cursor: "default",
                },
                transition: "background-color 0.2s ease",
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  sx={{
                    py: densityStyles.cellPy,
                    px: 2,
                    fontSize: densityStyles.fontSize,
                    borderBottom: "1px solid #e0e0e0",
                    width: cell.column.getSize(),
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                Nincs megjeleníthető adat
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
