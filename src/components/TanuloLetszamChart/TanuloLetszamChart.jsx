import React from "react";
import { ResponsiveContainer } from "recharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import {
  MdDownload,
  MdRefresh,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { Tooltip as MuiTooltip } from "@mui/material";

import {
  ChartRenderer,
  ChartSummary,
  ChartSettingsControls,
  ChartTypeControls,
  StatisticsOverview,
  useTanuloLetszamChart,
} from ".";

const TanuloLetszamChart = ({ data, years }) => {
  const chartHook = useTanuloLetszamChart(data, years);
  const {
    statistics,
    chartHeight,
    showControls,
    setShowControls,
    downloadChart,
    resetSettings,
    chartData,
    lineKeys,
    yDomain,
    ...controlProps
  } = chartHook;

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Nincs megjeleníthető adat
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Statistics Overview */}
      <StatisticsOverview statistics={statistics} />

      <Card>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              Tanulólétszám Grafikon - Interaktív Beállítások
            </Typography>
          }
          action={
            <Stack direction="row" spacing={1}>
              <MuiTooltip title="Beállítások megjelenítése/elrejtése">
                <IconButton
                  onClick={() => setShowControls(!showControls)}
                  size="small"
                >
                  {showControls ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Beállítások visszaállítása">
                <IconButton onClick={resetSettings} size="small">
                  <MdRefresh />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Grafikon letöltése">
                <IconButton onClick={downloadChart} size="small">
                  <MdDownload />
                </IconButton>
              </MuiTooltip>
            </Stack>
          }
        />
        <CardContent>
          <Stack spacing={3}>
            {showControls && (
              <>
                <ChartTypeControls {...controlProps} />
                <ChartSettingsControls {...controlProps} />
                <Divider />
              </>
            )}
            
            {/* Chart */}
            <Box>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <ChartRenderer
                  chartData={chartData}
                  lineKeys={lineKeys}
                  yDomain={yDomain}
                  {...controlProps}
                />
              </ResponsiveContainer>
            </Box>
            
            {/* Data Summary */}
            <ChartSummary
              lineKeys={lineKeys}
              years={years}
              {...controlProps}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TanuloLetszamChart;
