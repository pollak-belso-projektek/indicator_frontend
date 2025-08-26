import { createColumnHelper } from "@tanstack/react-table";
import { HStack, Badge, Button, VStack, Text } from "@chakra-ui/react";
import { FiEdit2 } from "react-icons/fi";
import { TbHandStop } from "react-icons/tb";
import { formatAccessLevel } from "../../utils/tableAccessUtils";
import { Grid, Tooltip } from "@mui/material";
const columnHelper = createColumnHelper();

export const createUserColumns = (onEdit, onDelete) => [
  columnHelper.accessor("name", {
    header: "Név",
    cell: (info) => info.getValue(),
    size: 150,
    minSize: 100,
    maxSize: 300,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
    size: 200,
    minSize: 150,
    maxSize: 400,
  }),
  columnHelper.accessor("alapadatokId", {
    header: "Iskola",
    cell: (info) => {
      const schoolId = info.getValue();
      const schoolData = info.row.original.alapadatok;

      if (!schoolId) {
        return <Text color="gray.500">Nincs hozzárendelve</Text>;
      }

      if (schoolData) {
        return (
          <VStack spacing={0} align="start">
            <Text fontWeight="medium" fontSize="sm">
              {schoolData.iskola_neve}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {schoolData.intezmeny_tipus}
            </Text>
          </VStack>
        );
      }

      return <Text color="gray.500">ID: {schoolId}</Text>;
    },
    size: 250,
    minSize: 150,
    maxSize: 400,
  }),
  columnHelper.accessor("createdAt", {
    header: "Létrehozva",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    size: 120,
    minSize: 100,
    maxSize: 150,
  }),
  columnHelper.accessor("updatedAt", {
    header: "Frissítve",
    cell: (info) =>
      info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-",
    size: 120,
    minSize: 100,
    maxSize: 150,
  }),
  columnHelper.accessor("tableAccess", {
    header: "Táblák hozzáférése",
    cell: (info) => {
      const access = info.getValue();

      if (!access || access.length === 0) return "Nincs hozzáférés";

      return (
        <Grid
          container
          spacing={1}
          alignItems="flex-start"
          maxHeight="150px"
          overflow="auto"
        >
          {console.log("Rendering access badges:", access)}
          {access.map((item, index) => {
            const permissions = formatAccessLevel(item.access);

            return (
              <HStack key={item.tableName || item.id} spacing={2} align="start">
                {permissions.length > 0 && (
                  <Tooltip title={permissions.join(", ")}>
                    <Badge
                      size="sm"
                      variant="solid"
                      colorPalette={
                        index % 2 === 0
                          ? "blue"
                          : index % 3 === 0
                          ? "green"
                          : "purple"
                      }
                    >
                      {item.table.alias}
                    </Badge>
                  </Tooltip>
                )}
              </HStack>
            );
          })}
        </Grid>
      );
    },
    size: 200,
    minSize: 150,
    maxSize: 350,
  }),
  columnHelper.accessor("permissionsDetails", {
    header: "Szerepkörök",
    cell: (info) => {
      const details = info.getValue();

      const roles = [];
      if (!details) return <Text>Nincs szerepkör</Text>;
      if (details.isHSZC) roles.push("HSZC");
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
                role === "HSZC"
                  ? "purple"
                  : role === "Superadmin"
                  ? "red"
                  : role === "Admin"
                  ? "blue"
                  : role === "Privileged"
                  ? "green"
                  : "gray"
              }
            >
              {role === "HSZC"
                ? "HSZC"
                : role === "Superadmin"
                ? "Superadmin"
                : role === "Admin"
                ? "Admin"
                : role === "Privileged"
                ? "Privilegizált"
                : "Iskolai"}
            </Badge>
          ))}
        </HStack>
      );
    },
    size: 180,
    minSize: 120,
    maxSize: 300,
  }),
  columnHelper.accessor("isActive", {
    header: "Aktív",
    cell: (info) => {
      const isActive = info.getValue();
      return (
        <Badge
          colorPalette={isActive ? "green" : "red"}
          variant="solid"
          size="sm"
        >
          {isActive ? "Igen" : "Nem"}
        </Badge>
      );
    },
    size: 80,
    minSize: 60,
    maxSize: 120,
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
    size: 120,
    minSize: 100,
    maxSize: 150,
    enableResizing: false,
  }),
];
