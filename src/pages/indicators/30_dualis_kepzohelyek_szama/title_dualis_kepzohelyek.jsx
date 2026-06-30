import React from "react";
import { Typography, Box } from "@mui/material";

const TitleDualisKepzohelyek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
        30. Duális képzőhelyek száma
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Az intézménnyel kapcsolatban álló duális képzőhelyek számának és
        adatainak rögzítése
      </Typography>
    </Box>
  );
};

export default TitleDualisKepzohelyek;
