import React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

export const ColumnVisibilitySelector = ({
  table,
  setHiddenColumns,
}) => (
  <FormControl size="small" sx={{ minWidth: 140 }}>
    <InputLabel id="column-visibility-label">Oszlopok</InputLabel>
    <Select
      labelId="column-visibility-label"
      id="column-visibility-select"
      multiple
      value={table
        .getAllColumns()
        .filter((column) => column.getIsVisible())
        .map((column) => column.id)}
      onChange={(event) => {
        if (event.target.value.length === 0) {
          return;
        }

        const value = event.target.value;
        setHiddenColumns(value);
        table.setColumnVisibility((old) => ({
          ...old,
          ...table.getAllColumns().reduce((acc, column) => {
            acc[column.id] = value.includes(column.id);
            return acc;
          }, {}),
        }));
      }}
      input={<OutlinedInput label="Oszlopok" />}
      renderValue={(selected) => {
        if (!selected?.length) {
          return "Nincs";
        }
        return `Oszlopok (${selected.length})`;
      }}
      sx={{
        height: 40,
        backgroundColor: "#f8f9fa",
      }}
    >
      {table.getAllColumns().map((column) => (
        <MenuItem key={column.id} value={column.id} sx={{ py: 0.5 }}>
          <Checkbox size="small" checked={column.getIsVisible()} />
          <ListItemText primary={column.columnDef.header} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
