import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import Button from '@mui/material/Button';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const TablePagination = ({ table }) => (
    <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
        <Text>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </Text>
        <HStack spacing={2}>
            <Button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                startIcon={<FiChevronLeft/>}
            >
                Előző
            </Button>
            <Button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                endIcon={<FiChevronRight/>}
            >
                Következő
            </Button>
        </HStack>
        <Text>
            Rows per page:
            <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                    table.setPageSize(Number(e.target.value));
                }}
            >
                {[5, 10, 20, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        {pageSize}
                    </option>
                ))}
            </select>
        </Text>
    </Box>
);
