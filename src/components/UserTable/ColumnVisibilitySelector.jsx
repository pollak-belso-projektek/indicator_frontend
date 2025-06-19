import React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

export const ColumnVisibilitySelector = ({ 
    table, 
    hiddenColumns, 
    setHiddenColumns 
}) => (
    <div className="inline-block border border-black shadow rounded">
        <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="column-visibility-label">Columns</InputLabel>
            <Select
                labelId="column-visibility-label"
                id="column-visibility-select"
                multiple
                value={table.getAllColumns().filter(column => column.getIsVisible()).map(column => column.id)}
                onChange={(event) => {
                    const value = event.target.value;
                    setHiddenColumns(value);
                    table.setColumnVisibility(old => ({
                        ...old,
                        ...table.getAllColumns().reduce((acc, column) => {
                            acc[column.id] = value.includes(column.id);
                            return acc;
                        }, {})
                    }));
                }}
                input={<OutlinedInput label="Columns" />}
                renderValue={(selected) => selected.join(', ')}
            >
                {table.getAllColumns().map(column => (
                    <MenuItem key={column.id} value={column.id}>
                        <Checkbox checked={column.getIsVisible()} />
                        <ListItemText primary={column.id} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </div>
);
