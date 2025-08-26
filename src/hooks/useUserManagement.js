import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createUserColumns } from "../components/UserTable";
import { useUserPermissions } from "./useUserPermissions";
import { getUserTypeFromLevel } from "../utils/userHierarchy";
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
} from "../store/api/apiSlice";

export const useUserManagement = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [openModify, setOpenModify] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [density, setDensity] = useState(
    localStorage.getItem("tableDensity") || "normal"
  );
  const [width, setWidth] = useState(
    localStorage.getItem("tableWidth") || "normal"
  );
  const [hiddenColumns, setHiddenColumns] = useState([
    localStorage.getItem("hiddenColumns") || "tableAccess",
    "permissionsDetails",
  ]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Get user permissions
  const userPermissions = useUserPermissions();

  // API hooks
  const { data: usersData = [], isLoading, refetch } = useGetUsersQuery();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  useEffect(() => {
    localStorage.setItem("hiddenColumns", hiddenColumns.join(","));
  }, [hiddenColumns]);

  useEffect(() => {
    localStorage.setItem("tableDensity", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("tableWidth", width);
  }, [width]);

  useEffect(() => {
    localStorage.setItem("columnSizing", JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    const storedHiddenColumns = localStorage.getItem("hiddenColumns");
    if (storedHiddenColumns) {
      setHiddenColumns(storedHiddenColumns.split(","));
    }

    const storedDensity = localStorage.getItem("tableDensity");
    if (storedDensity) {
      setDensity(storedDensity);
    }

    const storedWidth = localStorage.getItem("tableWidth");
    if (storedWidth) {
      setWidth(storedWidth);
    }

    const storedColumnSizing = localStorage.getItem("columnSizing");
    if (storedColumnSizing) {
      try {
        setColumnSizing(JSON.parse(storedColumnSizing));
      } catch (error) {
        console.warn("Failed to parse stored column sizing:", error);
      }
    }
  }, []);

  const handleEdit = (user) => {
    if (!userPermissions.canModifyUser()) {
      return { error: "Nincs jogosultsága felhasználók módosításához!" };
    }
    setSelectedUser(user);
    setOpenModify(true);
    return { success: true };
  };

  const handleCreate = () => {
    if (userPermissions.getAvailableUserTypes().length === 0) {
      return { error: "Nincs jogosultsága felhasználók létrehozásához!" };
    }
    setSelectedUser(null);
    setOpenCreate(true);
    return { success: true };
  };

  const handleDeactivate = (user) => {
    if (!userPermissions.canDeactivateUser()) {
      return { error: "Nincs jogosultsága felhasználók inaktiválásához!" };
    }
    setSelectedUser(user);
    setOpen(true);
    return { success: true };
  };
  const handleModify = async (modifiedUser) => {
    try {
      // Check if user can modify this type of user
      const userType = getUserTypeFromLevel(modifiedUser.permissions);
      if (!userPermissions.canCreateUser(userType)) {
        return {
          error: "Nincs jogosultsága ilyen típusú felhasználó módosításához!",
        };
      }

      // Ensure ID is properly attached for the PUT request
      const { id, ...userData } = modifiedUser;
      if (!id) {
        return { error: "Felhasználó azonosító hiányzik!" };
      }

      await updateUser({ id, ...userData }).unwrap();
      console.log(`User modified: ${modifiedUser.name}`);
      refetch();
      setOpenModify(false);
      return { success: true, message: "Felhasználó sikeresen módosítva!" };
    } catch (error) {
      console.error("Error modifying user:", error);
      return { error: "Hiba történt a felhasználó módosítása során!" };
    }
  };
  const handleCreateUser = async (newUser) => {
    try {
      // Check if user can create this type of user
      const userType = getUserTypeFromLevel(newUser.permissions);
      if (!userPermissions.canCreateUser(userType)) {
        return {
          error: "Nincs jogosultsága ilyen típusú felhasználó létrehozásához!",
        };
      }

      await addUser(newUser).unwrap();
      console.log(`User created: ${newUser.name}`);
      refetch();
      setOpenCreate(false);
      return { success: true, message: "Felhasználó sikeresen létrehozva!" };
    } catch (error) {
      console.error("Error creating user:", error);
      return { error: "Hiba történt a felhasználó létrehozása során!" };
    }
  };
  const handleDeactivateConfirm = async () => {
    try {
      // Update user to set active: false instead of deleting
      const deactivatedUser = { ...selectedUser, active: false };
      const { id, ...userData } = deactivatedUser;

      if (!id) {
        return { error: "Felhasználó azonosító hiányzik!" };
      }

      await updateUser({ id, ...userData }).unwrap();
      console.log(`User deactivated: ${selectedUser.name}`);
      refetch();
      setOpen(false);
      return { success: true, message: "Felhasználó sikeresen inaktiválva!" };
    } catch (error) {
      console.error("Error deactivating user:", error);
      return { error: "Hiba történt a felhasználó inaktiválása során!" };
    }
  };
  // Helper function to determine user type from permissions level
  const getUserTypeFromPermissions = (permissionsLevel) => {
    return getUserTypeFromLevel(permissionsLevel);
  };
  const handleClose = () => {
    setOpen(false);
    setOpenModify(false);
    setOpenCreate(false);
  };

  const handleResetColumnSizing = () => {
    setColumnSizing({});
    localStorage.removeItem("columnSizing");
  };

  const columns = useMemo(
    () => createUserColumns(handleEdit, handleDeactivate, userPermissions),
    [userPermissions]
  );

  const table = useReactTable({
    data: usersData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      globalFilter,
      columnVisibility,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return {
    data: usersData,
    table,
    globalFilter,
    setGlobalFilter,
    openModify,
    setOpenModify,
    openCreate,
    setOpenCreate,
    open,
    setOpen,
    selectedUser,
    setSelectedUser,
    fullScreen,
    hiddenColumns,
    setHiddenColumns,
    density,
    setDensity,
    width,
    setWidth,
    columnSizing,
    setColumnSizing,
    isLoading,
    userPermissions,
    handleModify,
    handleCreateUser,
    handleCreate,
    handleDeactivateConfirm,
    handleClose,
    handleResetColumnSizing,
  };
};
