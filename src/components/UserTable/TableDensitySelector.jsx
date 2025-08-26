import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";

import { MdViewCompact, MdViewStream, MdViewCozy } from "react-icons/md";

const densityOptions = [
  {
    value: "compact",
    label: "Kompakt",
    icon: <MdViewCompact />,
    description: "Kisebb sor magasság",
  },
  {
    value: "normal",
    label: "Normál",
    icon: <MdViewStream />,
    description: "Alapértelmezett sor magasság",
  },
  {
    value: "comfortable",
    label: "Kényelmes",
    icon: <MdViewCozy />,
    description: "Nagyobb sor magasság",
  },
];

export const TableDensitySelector = ({
  density = "normal",
  onDensityChange,
}) => {
  return (
    <FormControl size="medium" sx={{ minWidth: 140 }}>
      <InputLabel>Sor méret</InputLabel>
      <Select
        value={density}
        label="Sor méret"
        onChange={(e) => onDensityChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f8f9fa",
          },
        }}
        renderValue={(value) => {
          const option = densityOptions.find((opt) => opt.value === value);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {option?.icon}
              <Typography variant="body2">{option?.label}</Typography>
            </Box>
          );
        }}
      >
        {densityOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {option.icon}
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
