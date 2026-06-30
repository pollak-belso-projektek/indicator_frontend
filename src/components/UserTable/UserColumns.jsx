import { createColumnHelper } from "@tanstack/react-table";
import { FiEdit2 } from "react-icons/fi";
import { TbHandStop } from "react-icons/tb";
import { formatAccessLevel } from "../../utils/tableAccessUtils";
import { Grid, Tooltip, Box, Typography, Stack, Chip, IconButton, alpha } from "@mui/material";
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
        return <Typography variant="body2" color="text.secondary">Nincs hozzárendelve</Typography>;
      }

      if (schoolData) {
        return (
          <Stack spacing={0.5} alignItems="flex-start">
            <Typography variant="body2" fontWeight="600">
              {schoolData.iskola_neve}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {schoolData.intezmeny_tipus}
            </Typography>
          </Stack>
        );
      }

      return <Typography variant="body2" color="text.secondary">ID: {schoolId}</Typography>;
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
          {access.map((item, index) => {
            const permissions = formatAccessLevel(item.access);
            const colorMap = ["primary", "success", "secondary", "info", "warning"];
            const color = colorMap[index % colorMap.length];

            return (
              <Stack key={item.tableName || item.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                {permissions.length > 0 && (
                  <Tooltip title={permissions.join(", ")}>
                    <Chip
                      size="small"
                      label={item.table.alias}
                      color={color}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </Tooltip>
                )}
              </Stack>
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
      if (!details) return <Typography variant="body2">Nincs szerepkör</Typography>;
      if (details.isHSZC) roles.push("HSZC");
      if (details.isSuperadmin) roles.push("Fejlesztő");
      if (details.isAdmin) roles.push("Admin");
      if (details.isPrivileged) roles.push("Privilegizált");
      if (details.isStandard) roles.push("Iskolai");

      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {roles.map((role) => (
            <Chip
              key={role}
              size="small"
              label={role}
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: 
                  role === "HSZC" ? alpha("#9c27b0", 0.1) :
                  role === "Fejlesztő" ? alpha("#d32f2f", 0.1) :
                  role === "Admin" ? alpha("#1976d2", 0.1) :
                  role === "Privilegizált" ? alpha("#2e7d32", 0.1) :
                  alpha("#757575", 0.1),
                color:
                  role === "HSZC" ? "#7b1fa2" :
                  role === "Fejlesztő" ? "#c62828" :
                  role === "Admin" ? "#1565c0" :
                  role === "Privilegizált" ? "#1b5e20" :
                  "#616161"
              }}
            />
          ))}
        </Box>
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
        <Chip
          label={isActive ? "Igen" : "Nem"}
          size="small"
          color={isActive ? "success" : "error"}
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
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
      <Stack direction="row" spacing={1}>
        <IconButton
          size="small"
          onClick={() => onEdit(row.original)}
          color="primary"
          sx={{ bgcolor: alpha("#1976d2", 0.1) }}
        >
          <FiEdit2 size={16} />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(row.original)}
          sx={{ bgcolor: alpha("#d32f2f", 0.1) }}
        >
          <TbHandStop size={16} />
        </IconButton>
      </Stack>
    ),
    size: 120,
    minSize: 100,
    maxSize: 150,
    enableResizing: false,
  }),
];
