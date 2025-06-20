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
import { fetchUsersData } from "../utils/userUtils";
import { createUserColumns } from "../components/UserTable";
import { useUserPermissions } from "./useUserPermissions";
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
  const [hiddenColumns, setHiddenColumns] = useState([
    localStorage.getItem("hiddenColumns") || "tableAccess",
    "permissionsDetails",
    "alapadatokId",
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
    const storedHiddenColumns = localStorage.getItem("hiddenColumns");
    if (storedHiddenColumns) {
      setHiddenColumns(storedHiddenColumns.split(","));
    }
  }, []);

  const handleEdit = (user) => {
    if (!userPermissions.canModifyUser()) {
      alert("Nincs jogosultsága felhasználók módosításához!");
      return;
    }
    setSelectedUser(user);
    setOpenModify(true);
  };

  const handleCreate = () => {
    if (userPermissions.getAvailableUserTypes().length === 0) {
      alert("Nincs jogosultsága felhasználók létrehozásához!");
      return;
    }
    setSelectedUser(null);
    setOpenCreate(true);
  };

  const handleDeactivate = (user) => {
    if (!userPermissions.canDeactivateUser()) {
      alert("Nincs jogosultsága felhasználók inaktiválásához!");
      return;
    }
    setSelectedUser(user);
    setOpen(true);
  };

  const handleModify = async (modifiedUser) => {
    try {
      await updateUser(modifiedUser).unwrap();
      console.log(`User modified: ${modifiedUser.name}`);
      refetch();
      setOpenModify(false);
    } catch (error) {
      console.error("Error modifying user:", error);
      alert("Hiba történt a felhasználó módosítása során!");
    }
  };

  const handleCreateUser = async (newUser) => {
    try {
      // Check if user can create this type of user
      const userType = getUserTypeFromPermissions(newUser.permissions);
      if (!userPermissions.canCreateUser(userType)) {
        alert("Nincs jogosultsága ilyen típusú felhasználó létrehozásához!");
        return;
      }

      await addUser(newUser).unwrap();
      console.log(`User created: ${newUser.name}`);
      refetch();
      setOpenCreate(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Hiba történt a felhasználó létrehozása során!");
    }
  };

  const handleDeactivateConfirm = async () => {
    try {
      // Update user to set active: false instead of deleting
      const deactivatedUser = { ...selectedUser, active: false };
      await updateUser(deactivatedUser).unwrap();
      console.log(`User deactivated: ${selectedUser.name}`);
      refetch();
      setOpen(false);
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("Hiba történt a felhasználó inaktiválása során!");
    }
  };

  // Helper function to determine user type from permissions
  const getUserTypeFromPermissions = (permissions) => {
    if (permissions?.isSuperadmin) return "superadmin";
    if (permissions?.isHSZC && permissions?.isAdmin) return "hszc";
    if (permissions?.isAdmin) return "iskolai";
    if (permissions?.isPrivileged) return "privileged";
    return "standard";
  };
  const handleClose = () => {
    setOpen(false);
    setOpenModify(false);
    setOpenCreate(false);
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
    state: {
      globalFilter,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
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
    isLoading,
    userPermissions,
    handleModify,
    handleCreateUser,
    handleCreate,
    handleDeactivateConfirm,
    handleClose,
  };
};
