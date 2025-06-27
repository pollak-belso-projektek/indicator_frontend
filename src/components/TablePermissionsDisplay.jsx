import React from "react";
import { Box, Typography, Chip, Card, CardContent, Grid } from "@mui/material";
import {
  formatAccessLevel,
  TABLE_ACCESS_LEVELS,
} from "../utils/tableAccessUtils";

/**
 * TablePermissionsDisplay - Component to display user's table permissions
 * Shows table access levels in a readable format
 */
const TablePermissionsDisplay = ({
  tableAccess,
  title = "Tábla jogosultságok",
}) => {
  if (!tableAccess || !Array.isArray(tableAccess) || tableAccess.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nincs tábla jogosultság megadva
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {tableAccess.map((table, index) => {
          const permissions = formatAccessLevel(table.access);
          const accessLevel = table.access;

          // Determine chip color based on access level
          const getAccessColor = (level) => {
            if (level === TABLE_ACCESS_LEVELS.FULL) return "success";
            if (level >= TABLE_ACCESS_LEVELS.READ + TABLE_ACCESS_LEVELS.WRITE)
              return "primary";
            if (level >= TABLE_ACCESS_LEVELS.READ) return "default";
            return "error";
          };

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" size="small">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    {table.tableName}
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hozzáférési szint: {accessLevel}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {permissions.length > 0 ? (
                      permissions.map((permission, permIndex) => (
                        <Chip
                          key={permIndex}
                          label={permission}
                          size="small"
                          color={getAccessColor(accessLevel)}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Chip
                        label="Nincs jogosultság"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Debug info - can be removed in production */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Bináris: {accessLevel.toString(2).padStart(4, "0")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TablePermissionsDisplay;
