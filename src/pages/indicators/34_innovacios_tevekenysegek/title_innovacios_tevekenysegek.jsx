import React from "react";
import { Typography, Box } from "@mui/material";

const TitleInnovaciosTevekenysegek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
        34. Innovációs tevékenységek
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Az intézményben folyó innovációs tevékenységek és jó gyakorlatok rögzítése
      </Typography>
    </Box>
  );
};

export default TitleInnovaciosTevekenysegek;
