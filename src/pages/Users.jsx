import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { Add as AddIcon } from "@mui/icons-material";
import Input from "@mui/material/Input";
import { useUserManagement } from "../hooks/useUserManagement";
import {
  EditUserDialog,
  DeleteUserDialog,
  ColumnVisibilitySelector,
  UserTable,
  TablePagination,
} from "../components/UserTable";
import CreateUserDialog from "../components/CreateUserDialog";

const Users = () => {
  const {
    data,
    table,
    globalFilter,
    setGlobalFilter,
    openModify,
    setOpenModify,
    openCreate,
    setOpenCreate,
    open,
    selectedUser,
    setSelectedUser,
    fullScreen,
    hiddenColumns,
    setHiddenColumns,
    isLoading,
    userPermissions,
    handleModify,
    handleCreateUser,
    handleCreate,
    handleDeactivateConfirm,
    handleClose,
  } = useUserManagement();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Text fontSize="xl">Felhasználók betöltése...</Text>
      </Box>
    );
  }
  return (
    <div>
      <CreateUserDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={handleCreateUser}
        userPermissions={userPermissions}
      />

      <EditUserDialog
        open={openModify}
        onClose={() => setOpenModify(false)}
        user={selectedUser}
        onUserChange={setSelectedUser}
        onSave={handleModify}
        fullScreen={fullScreen}
        userPermissions={userPermissions}
      />

      <DeleteUserDialog
        open={open}
        onClose={handleClose}
        user={selectedUser}
        onDelete={handleDeactivateConfirm}
        isDeactivation={true}
      />

      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Text fontSize="2xl" fontWeight="bold">
            Felhasználókezelés
          </Text>

          {userPermissions.getAvailableUserTypes().length > 0 && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleCreate}
            >
              Új felhasználó
            </Button>
          )}
        </Box>

        <Box>
          <Input
            placeholder="Felhasználók keresése..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
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
      </Box>
    </div>
  );
};

export default Users;
