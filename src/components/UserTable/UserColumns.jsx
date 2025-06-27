import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { HStack, Badge, Button, VStack, Text } from "@chakra-ui/react";
import { FiEdit2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { TbHandStop } from "react-icons/tb";
import { formatAccessLevel } from "../../utils/tableAccessUtils";
import { Tooltip } from "@mui/material";
const columnHelper = createColumnHelper();

export const createUserColumns = (onEdit, onDelete) => [
  columnHelper.accessor("name", {
    header: "Név",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Létrehozva",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Frissítve",
    cell: (info) =>
      info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-",
  }),
  columnHelper.accessor("tableAccess", {
    header: "Táblák hozzáférése",
    cell: (info) => {
      const access = info.getValue();
      if (!access || access.length === 0) return "Nincs hozzáférés";

      return (
        <VStack spacing={1} align="start">
          {access.map((item) => {
            const permissions = formatAccessLevel(item.access);

            return (
              <HStack key={item.tableName || item.id} spacing={2} align="start">
                {permissions.length > 0 && (
                  <Tooltip title={permissions.join(", ")}>
                    <Badge size="sm" variant="solid" colorPalette="blue">
                      {item.tableName}
                    </Badge>
                  </Tooltip>
                )}
              </HStack>
            );
          })}
        </VStack>
      );
    },
  }),
  columnHelper.accessor("permissionsDetails", {
    header: "Szerepkörök",
    cell: (info) => {
      const details = info.getValue();
      const roles = [];
      if (details.isSuperadmin) roles.push("Superadmin");
      if (details.isAdmin) roles.push("Admin");
      if (details.isPrivileged) roles.push("Privileged");
      if (details.isStandard) roles.push("Standard");

      return (
        <HStack spacing={1} flexWrap="wrap">
          {roles.map((role) => (
            <Badge
              key={role}
              size="sm"
              colorPalette={
                role === "Superadmin"
                  ? "red"
                  : role === "Admin"
                  ? "blue"
                  : role === "Privileged"
                  ? "green"
                  : "gray"
              }
            >
              {role}
            </Badge>
          ))}
        </HStack>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Műveletek",
    cell: ({ row }) => (
      <HStack spacing={2}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <FiEdit2 />
        </Button>
        <Button
          variant="subtle"
          size="sm"
          colorPalette={"red"}
          onClick={() => onDelete(row.original)}
        >
          <TbHandStop />
        </Button>
      </HStack>
    ),
  }),
];
