import React from "react";
import {
  Stack,
  Typography,
  ButtonGroup,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
} from "@mui/material";
import {
  MdShowChart,
  MdBarChart,
  MdAreaChart,
} from "react-icons/md";

const ChartTypeControls = ({
  chartType,
  setChartType,
  viewMode,
  setViewMode,
  availableAgazatok,
  selectedAgazatok,
  setSelectedAgazatok,
  selectedCategories,
  setSelectedCategories,
}) => {
  return (
    <>
      {/* Chart Type Selection */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body1" fontWeight="medium">
          Grafikon típus:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<MdShowChart />}
            onClick={() => setChartType("line")}
            variant={chartType === "line" ? "contained" : "outlined"}
            color={chartType === "line" ? "primary" : "inherit"}
          >
            Vonal
          </Button>
          <Button
            startIcon={<MdBarChart />}
            onClick={() => setChartType("bar")}
            variant={chartType === "bar" ? "contained" : "outlined"}
            color={chartType === "bar" ? "primary" : "inherit"}
          >
            Oszlop
          </Button>
          <Button
            startIcon={<MdAreaChart />}
            onClick={() => setChartType("area")}
            variant={chartType === "area" ? "contained" : "outlined"}
            color={chartType === "area" ? "primary" : "inherit"}
          >
            Terület
          </Button>
        </ButtonGroup>
      </Stack>
      
      <Divider />
      
      {/* View Mode Selection */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body1" fontWeight="medium">
          Megjelenítési mód:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button
            onClick={() => setViewMode("all")}
            variant={viewMode === "all" ? "contained" : "outlined"}
            color={viewMode === "all" ? "primary" : "inherit"}
          >
            Összes ágazat ({availableAgazatok.length})
          </Button>
          <Button
            onClick={() => setViewMode("selected")}
            variant={viewMode === "selected" ? "contained" : "outlined"}
            color={viewMode === "selected" ? "primary" : "inherit"}
          >
            Kiválasztott ágazatok ({selectedAgazatok.length})
          </Button>
        </ButtonGroup>
      </Stack>
      
      {/* Agazat Selection */}
      {viewMode === "selected" && (
        <FormControl>
          <FormLabel>Ágazatok kiválasztása:</FormLabel>
          <FormGroup>
            <Grid container spacing={1}>
              {availableAgazatok.map((agazat) => (
                <Grid item xs={12} sm={6} md={4} key={agazat}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedAgazatok.includes(agazat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgazatok([...selectedAgazatok, agazat]);
                          } else {
                            setSelectedAgazatok(
                              selectedAgazatok.filter((a) => a !== agazat)
                            );
                          }
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">{agazat}</Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </FormControl>
      )}
      
      {/* Category Selection */}
      <FormControl>
        <FormLabel>Jogviszony típusok:</FormLabel>
        <FormGroup>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCategories.includes("Tanulói jogviszony")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([
                        ...selectedCategories,
                        "Tanulói jogviszony",
                      ]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== "Tanulói jogviszony")
                      );
                    }
                  }}
                />
              }
              label="Tanulói jogviszony"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCategories.includes("Felnőttképzési jogviszony")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([
                        ...selectedCategories,
                        "Felnőttképzési jogviszony",
                      ]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== "Felnőttképzési jogviszony")
                      );
                    }
                  }}
                />
              }
              label="Felnőttképzési jogviszony"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCategories.includes("Összesen")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, "Összesen"]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== "Összesen")
                      );
                    }
                  }}
                />
              }
              label="Összesen"
            />
          </Stack>
        </FormGroup>
      </FormControl>
    </>
  );
};

export default ChartTypeControls;