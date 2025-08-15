import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
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
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Felhasználók betöltése...
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Felhasználó kezelés
      </Typography>

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

      {/* Main Content Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header with Search and Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ flex: 1, maxWidth: { xs: "100%", md: "70%" } }}
            >
              <ColumnVisibilitySelector
                table={table}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
              />
              <TextField
                variant="outlined"
                size="medium"
                placeholder="Keresés a lekérdezett adatok között"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", sm: "300px" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8f9fa",
                  },
                }}
              />
            </Stack>

            {userPermissions.getAvailableUserTypes().length > 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  minWidth: "160px",
                  height: "56px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Új felhasználó
              </Button>
            )}
          </Box>

          {/* Table Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <UserTable table={table} />
          </Card>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <TablePagination table={table} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Users;
