import React from "react";
import { Typography, Box } from "@mui/material";

const TitleSzakkepzesZolditese = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
        36. Szakképzés "zöldítése"
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        A szakképzés "zöldítéséhez" kapcsolódó és Ökoiskola program keretében megszervezett tevékenységek
      </Typography>
    </Box>
  );
};

export default TitleSzakkepzesZolditese;
