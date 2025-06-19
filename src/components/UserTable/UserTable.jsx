import React from 'react';
import { Box } from '@chakra-ui/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { flexRender } from '@tanstack/react-table';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const UserTable = ({ table }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableCell key={header.id}>
                                {header.isPlaceholder ? null : (
                                    <Box
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between' 
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {{
                                            asc: <FiChevronUp />,
                                            desc: <FiChevronDown />
                                        }[header.column.getIsSorted()] ?? null}
                                    </Box>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            <TableBody>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);
