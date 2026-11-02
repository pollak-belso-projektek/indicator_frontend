import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Stack,
  Container,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
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
  Disable2FADialog,
} from "../components/UserTable";
import CreateUserDialog from "../components/CreateUserDialog";

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
    table,
    globalFilter,
    setGlobalFilter,
    openModify,
    setOpenModify,
    openCreate,
    setOpenCreate,
    open,
    selectedUser,
    fullScreen,
    hiddenColumns,
    setHiddenColumns,
    density,
    setDensity,
    isLoading,
    userPermissions,
    handleModify,
    handleCreateUser,
    handleCreate,
    handleDeactivateConfirm,
    handleClose,
    handleResetColumnSizing,
    openDisable2FA,
    setOpenDisable2FA,
    selectedUserFor2FA,
    handleDisable2FAConfirm,
    isDisabling2FA,
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
    return result;
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

  const handleDisable2FAConfirmWithNotification = async () => {
    const result = await handleDisable2FAConfirm();
    if (result.error) {
      showNotification(result.error, "error");
    } else if (result.success) {
      showNotification(result.message || "2FA sikeresen kikapcsolva!");
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
    <Box sx={{ pb: 3 }}>
      {/* Sleek, Modern Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          py: { xs: 2.5, md: 3 },
          px: { xs: 2.5, md: 3 },
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.15)",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "relative",
            zIndex: 1,
            color: "white",
          }}
        >
          <Box
            sx={{
              p: 1.25,
              bgcolor: "rgba(255,255,255,0.18)",
              borderRadius: 2,
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ letterSpacing: "-0.01em" }}>
              Felhasználók Kezelése
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.25 }}>
              Kezeld a rendszerhez tartozó felhasználói fiókokat és jogosultságokat
            </Typography>
          </Box>
        </Box>
      </Box>

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

      <Disable2FADialog
        open={openDisable2FA}
        onClose={() => setOpenDisable2FA(false)}
        user={selectedUserFor2FA}
        onDisable2FA={handleDisable2FAConfirmWithNotification}
        isLoading={isDisabling2FA}
      />

      {/* Main Content Card */}
      <Card
        sx={{
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            "&:last-child": { pb: { xs: 2, sm: 2.5, md: 3 } },
          }}
        >
          {/* Header with Search and Actions */}
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            sx={{ mb: 2.5 }}
          >
            {/* Left Side: Column Visibility, Density, Width Reset */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
              }}
            >
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

            {/* Right Side: Search & Create Button */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                alignItems: "center",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Keresés a felhasználók között..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: "100%", sm: "280px" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8f9fa",
                    height: 40,
                  },
                }}
              />
              {userPermissions.getAvailableUserTypes().length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateWithNotification}
                  sx={{
                    height: 40,
                    fontWeight: 600,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    px: 2.5,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "0 2px 8px rgba(25,118,210,0.3)" },
                  }}
                >
                  Új felhasználó
                </Button>
              )}
            </Box>
          </Stack>

          {/* Table Container */}
          <UserTable table={table} density={density} />

          {/* Pagination */}
          <TablePagination table={table} />
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
