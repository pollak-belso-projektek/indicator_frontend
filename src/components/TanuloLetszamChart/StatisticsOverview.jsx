import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

const StatisticsOverview = ({ statistics }) => {
  if (!statistics) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={6} md={2.4}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Összes létszám
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {statistics.total.toLocaleString("hu-HU")}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={2.4}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Átlag
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {Math.round(statistics.average).toLocaleString("hu-HU")}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={2.4}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Maximum
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {statistics.max.toLocaleString("hu-HU")}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={2.4}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Minimum
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {statistics.min.toLocaleString("hu-HU")}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={2.4}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Növekedés
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={
              statistics.growthRate >= 0 ? "success.main" : "error.main"
            }
          >
            {statistics.growthRate >= 0 ? "↗" : "↘"}{" "}
            {Math.abs(statistics.growthRate).toFixed(1)}%
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StatisticsOverview;