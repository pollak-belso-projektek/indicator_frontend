import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { HStack, Badge, Button } from "@chakra-ui/react";

const columnHelper = createColumnHelper();

export const createUserColumns = (onEdit, onDelete) => [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated At",
    cell: (info) =>
      info.getValue()
        ? new Date(info.getValue()).toLocaleDateString()
        : "Never",
  }),
  columnHelper.accessor("tableAccess", {
    header: "Table Access",
    cell: (info) => {
      const access = info.getValue();
      if (!access || access.length === 0) return "No Access";
      return (
        <HStack spacing={1} flexWrap="wrap">
          {access.map((item) => (
            <Badge
              key={item.id}
              size="sm"
              variant="solid"
              colorPalette={
                item.permissionsDetails.canRead
                  ? "green"
                  : item.permissionsDetails.canUpdate
                  ? "blue"
                  : item.permissionsDetails.canCreate
                  ? "orange"
                  : item.permissionsDetails.canDelete
                  ? "red"
                  : "gray"
              }
            >
              {item.tableName}
            </Badge>
          ))}
        </HStack>
      );
    },
  }),
  columnHelper.accessor("permissionsDetails", {
    header: "Roles",
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
    header: "Actions",
    cell: ({ row }) => (
      <HStack spacing={2}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          colorScheme="red"
          onClick={() => onDelete(row.original)}
        >
          Delete
        </Button>
      </HStack>
    ),
  }),
];
