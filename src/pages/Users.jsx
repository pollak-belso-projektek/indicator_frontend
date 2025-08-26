import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useState } from "react";
import NotificationSnackbar from "../components/shared/NotificationSnackbar";
import { useUserManagement } from "../hooks/useUserManagement";
import {
  EditUserDialog,
  DeleteUserDialog,
  ColumnVisibilitySelector,
  TableDensitySelector,
  TableResizeControls,
  UserTable,
  TablePagination,
} from "../components/UserTable";
import CreateUserDialog from "../components/CreateUserDialog";
import { Flex } from "@chakra-ui/react";

const Users = () => {
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

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
    density,
    setDensity,
    width,
    setWidth,
    isLoading,
    userPermissions,
    handleModify,
    handleCreateUser,
    handleCreate,
    handleDeactivateConfirm,
    handleClose,
    handleResetColumnSizing,
  } = useUserManagement();

  // Wrapped handlers with notification
  const handleCreateWithNotification = () => {
    const result = handleCreate();
    if (result.error) {
      showNotification(result.error, "error");
    }
  };

  const handleCreateUserWithNotification = async (newUser) => {
    const result = await handleCreateUser(newUser);
    if (result.error) {
      showNotification(result.error, "error");
    } else if (result.success) {
      showNotification(result.message || "Felhasználó sikeresen létrehozva!");
    }
  };

  const handleModifyWithNotification = async (modifiedUser) => {
    const result = await handleModify(modifiedUser);
    if (result.error) {
      showNotification(result.error, "error");
    } else if (result.success) {
      showNotification(result.message || "Felhasználó sikeresen módosítva!");
    }
  };

  const handleDeactivateConfirmWithNotification = async () => {
    const result = await handleDeactivateConfirm();
    if (result.error) {
      showNotification(result.error, "error");
    } else if (result.success) {
      showNotification(result.message || "Felhasználó sikeresen inaktiválva!");
    }
  };

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
        onSave={handleCreateUserWithNotification}
        userPermissions={userPermissions}
      />

      <EditUserDialog
        open={openModify}
        onClose={() => setOpenModify(false)}
        user={selectedUser}
        onUserChange={setSelectedUser}
        onSave={handleModifyWithNotification}
        fullScreen={fullScreen}
        userPermissions={userPermissions}
      />

      <DeleteUserDialog
        open={open}
        onClose={handleClose}
        user={selectedUser}
        onDelete={handleDeactivateConfirmWithNotification}
        isDeactivation={true}
      />

      {/* Main Content Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header with Search and Actions */}

          <Flex sx={{ width: "100%" }} justify="space-evenly">
            {/* Left Side: Column Visibility, Density, Width */}
            <Box
              sx={{
                display: "flex",
                flexWrap: { xs: "wrap", md: "nowrap" },
                alignItems: "center",
                gap: 2,
                flexGrow: 1,
                mb: { xs: 1, md: 0 },
              }}
            >
              {" "}
              <ColumnVisibilitySelector
                table={table}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
              />
              <TableDensitySelector
                density={density}
                onDensityChange={setDensity}
              />
              <TableResizeControls
                table={table}
                onResetColumnSizing={handleResetColumnSizing}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
            >
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
              {userPermissions.getAvailableUserTypes().length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateWithNotification}
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
          </Flex>

          {/* Table Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <UserTable table={table} density={density} />
          </Card>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <TablePagination table={table} />
          </Box>
        </CardContent>
      </Card>
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default Users;
