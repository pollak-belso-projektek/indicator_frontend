import React from "react";
import {
  Grid,
  FormControl,
  FormLabel,
  FormControlLabel,
  Typography,
  Slider,
  Switch,
  Select,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";

const ChartSettingsControls = ({
  chartType,
  chartHeight,
  setChartHeight,
  strokeWidth,
  setStrokeWidth,
  animationDuration,
  setAnimationDuration,
  yAxisDomain,
  setYAxisDomain,
  customYMin,
  setCustomYMin,
  customYMax,
  setCustomYMax,
  showGrid,
  setShowGrid,
  showDots,
  setShowDots,
  showBrush,
  setShowBrush,
}) => {
  return (
    <>
      <Divider />
      
      {/* Chart Controls */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>
              <Typography variant="body2">
                Grafikon magasság: {chartHeight}px
              </Typography>
            </FormLabel>
            <Slider
              value={chartHeight}
              onChange={(_, newValue) => setChartHeight(newValue)}
              min={200}
              max={800}
              step={50}
              size="small"
              valueLabelDisplay="auto"
            />
          </FormControl>
        </Grid>

        {chartType === "line" && (
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>
                <Typography variant="body2">
                  Vonal vastagság: {strokeWidth}px
                </Typography>
              </FormLabel>
              <Slider
                value={strokeWidth}
                onChange={(_, newValue) => setStrokeWidth(newValue)}
                min={1}
                max={5}
                step={1}
                size="small"
                valueLabelDisplay="auto"
              />
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>
              <Typography variant="body2">
                Animáció időtartama: {animationDuration}ms
              </Typography>
            </FormLabel>
            <Slider
              value={animationDuration}
              onChange={(_, newValue) => setAnimationDuration(newValue)}
              min={0}
              max={3000}
              step={100}
              size="small"
              valueLabelDisplay="auto"
            />
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Y-axis domain controls */}
      <FormControl>
        <FormLabel>Y tengely tartomány:</FormLabel>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            value={yAxisDomain}
            onChange={(e) => setYAxisDomain(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="auto">Automatikus</MenuItem>
            <MenuItem value="dataMin">Adat minimum/maximum</MenuItem>
            <MenuItem value="custom">Egyéni</MenuItem>
          </Select>
          {yAxisDomain === "custom" && (
            <>
              <FormControl sx={{ minWidth: 100 }}>
                <FormLabel>
                  <Typography variant="caption">Min:</Typography>
                </FormLabel>
                <input
                  type="number"
                  value={customYMin}
                  onChange={(e) => setCustomYMin(Number(e.target.value))}
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 100 }}>
                <FormLabel>
                  <Typography variant="caption">Max:</Typography>
                </FormLabel>
                <input
                  type="number"
                  value={customYMax}
                  onChange={(e) => setCustomYMax(Number(e.target.value))}
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </FormControl>
            </>
          )}
        </Stack>
      </FormControl>
      
      {/* Toggle Controls */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Rács megjelenítése</Typography>
            }
          />
        </Grid>
        {chartType === "line" && (
          <Grid item xs={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showDots}
                  onChange={(e) => setShowDots(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">Pontok megjelenítése</Typography>
              }
            />
          </Grid>
        )}
        <Grid item xs={6} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={showBrush}
                onChange={(e) => setShowBrush(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Zoom eszköz</Typography>}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ChartSettingsControls;