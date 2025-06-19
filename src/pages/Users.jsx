import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import Input from '@mui/material/Input';
import { useUserManagement } from '../hooks/useUserManagement';
import { 
    EditUserDialog, 
    DeleteUserDialog, 
    ColumnVisibilitySelector, 
    UserTable, 
    TablePagination 
} from '../components/UserTable';

const Users = () => {
    const {
        data,
        table,
        globalFilter,
        setGlobalFilter,
        openModify,
        setOpenModify,
        open,
        selectedUser,
        setSelectedUser,
        fullScreen,
        hiddenColumns,
        setHiddenColumns,
        handleModify,
        handleDeleteConfirm,
        handleClose,
    } = useUserManagement();

    if (data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Text fontSize="xl">Loading users...</Text>
            </Box>
        );
    }

    return (
        <div>
            <EditUserDialog
                open={openModify}
                onClose={() => setOpenModify(false)}
                user={selectedUser}
                onUserChange={setSelectedUser}
                onSave={handleModify}
                fullScreen={fullScreen}
            />

            <DeleteUserDialog
                open={open}
                onClose={handleClose}
                user={selectedUser}
                onDelete={handleDeleteConfirm}
            />

            <Box>
                <Box>
                    <Input
                        placeholder="Search users..."
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        mb={4}
                    />

                    <ColumnVisibilitySelector
                        table={table}
                        hiddenColumns={hiddenColumns}
                        setHiddenColumns={setHiddenColumns}
                    />
                </Box>

                <UserTable table={table} />
                
                <TablePagination table={table} />
            </Box>        </div>
    );
};

export default Users;