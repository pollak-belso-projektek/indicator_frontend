import React from "react";
import { Paper, Typography } from "@mui/material";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.dataKey}: {entry.value?.toLocaleString("hu-HU") || 0} fő
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default CustomTooltip;