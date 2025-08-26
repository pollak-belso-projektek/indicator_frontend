import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { MdUnfoldLess, MdUnfoldMore, MdViewColumn } from "react-icons/md";

const widthOptions = [
  {
    value: "narrow",
    label: "Keskeny",
    icon: <MdUnfoldLess />,
    description: "Kisebb oszlop szélesség",
    maxWidth: "1200px",
  },
  {
    value: "normal",
    label: "Normál",
    icon: <MdViewColumn />,
    description: "Alapértelmezett szélesség",
    maxWidth: "100%",
  },
  {
    value: "wide",
    label: "Széles",
    icon: <MdUnfoldMore />,
    description: "Nagyobb oszlop szélesség",
    maxWidth: "100%",
  },
];

export const TableWidthSelector = ({ width = "normal", onWidthChange }) => {
  return (
    <FormControl size="medium" sx={{ minWidth: 140 }}>
      <InputLabel>Tábla szélesség</InputLabel>
      <Select
        value={width}
        label="Tábla szélesség"
        onChange={(e) => onWidthChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f8f9fa",
          },
        }}
        renderValue={(value) => {
          const option = widthOptions.find((opt) => opt.value === value);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {option?.icon}
              <Typography variant="body2">{option?.label}</Typography>
            </Box>
          );
        }}
      >
        {widthOptions.map((option) => (
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

export { widthOptions };
