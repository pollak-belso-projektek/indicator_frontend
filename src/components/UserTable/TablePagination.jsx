import { Box, Stack, Typography, Button, Select, MenuItem } from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const TablePagination = ({ table }) => (
  <Box
    sx={{
      mt: 4,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      flexWrap: "wrap",
      gap: 2
    }}
  >
    <Typography variant="body2" color="text.secondary" fontWeight="500">
      Oldal {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
    </Typography>
    
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        startIcon={<FiChevronLeft />}
        sx={{ borderRadius: 2 }}
      >
        Előző
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        endIcon={<FiChevronRight />}
        sx={{ borderRadius: 2 }}
      >
        Következő
      </Button>
    </Stack>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Sorok száma:
      </Typography>
      <Select
        size="small"
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value));
        }}
        sx={{ borderRadius: 2, minWidth: 80, height: 32 }}
      >
        {[5, 10, 20, 50].map((pageSize) => (
          <MenuItem key={pageSize} value={pageSize}>
            {pageSize}
          </MenuItem>
        ))}
      </Select>
    </Box>
  </Box>
);
