import { Box } from "@chakra-ui/react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { flexRender } from "@tanstack/react-table";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export const UserTable = ({ table }) => (
  <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
    <Table stickyHeader>
      <TableHead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableCell
                key={header.id}
                sx={{
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  py: 2,
                  borderBottom: "2px solid #e0e0e0",
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
                  py: 2,
                  px: 2,
                  fontSize: "0.875rem",
                  borderBottom: "1px solid #e0e0e0",
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
