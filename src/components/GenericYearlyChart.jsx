import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Paper,
  Grid,
  IconButton,
  Tooltip as MuiTooltip,
  Stack,
  Chip,
} from "@mui/material";
import {
  MdShowChart,
  MdBarChart,
  MdAreaChart,
  MdRefresh,
} from "react-icons/md";

// Color palette for different lines
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff88",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff6b6b",
  "#8dd1e1",
  "#d084d0",
];

const CHART_TYPES = {
  line: "Vonaldiagram",
  bar: "Oszlopdiagram",
  area: "Területdiagram",
};

/**
 * Generic Yearly Chart Component
 * 
 * @param {Array} data - Array of objects with year and value properties
 *   Example: [{ year: "2021/2022", category1: 100, category2: 200 }]
 * @param {Array} dataKeys - Array of data keys to display
 *   Example: ["category1", "category2"]
 * @param {Object} keyLabels - Optional labels for data keys
 *   Example: { category1: "Kategória 1", category2: "Kategória 2" }
 * @param {String} yAxisLabel - Label for Y axis (default: "Érték")
 * @param {Number} height - Chart height in pixels (default: 400)
 * @param {String} title - Chart title
 */
const GenericYearlyChart = ({
  data,
  dataKeys = [],
  keyLabels = {},
  yAxisLabel = "Érték",
  height = 400,
  title = "Grafikon",
  hideSmallDataPoints = false,
}) => {
  const [chartType, setChartType] = useState("line");

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!data || data.length === 0 || dataKeys.length === 0) return null;

    const allValues = data.flatMap((entry) =>
      dataKeys.map((key) => entry[key] || 0).filter((val) => !isNaN(val))
    );

    if (allValues.length === 0) return null;

    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = total / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

    // Calculate growth rate (latest vs first year)
    const firstYear = data[0];
    const lastYear = data[data.length - 1];
    const firstTotal = dataKeys.reduce(
      (sum, key) => sum + (firstYear[key] || 0),
      0
    );
    const lastTotal = dataKeys.reduce((sum, key) => sum + (lastYear[key] || 0), 0);

    const growthRate =
      firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0;

    return { total, average, max, min, growthRate };
  }, [data, dataKeys]);

  const resetSettings = () => {
    setChartType("line");
  };

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
              {keyLabels[entry.dataKey] || entry.dataKey}:{" "}
              {typeof entry.value === "number"
                ? entry.value.toLocaleString("hu-HU")
                : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const chartContent = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType={chartType === "line" ? "line" : "rect"}
          formatter={(value) => keyLabels[value] || value}
        />

        {chartType === "line" &&
          dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={keyLabels[key] || key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}

        {chartType === "bar" &&
          dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              name={keyLabels[key] || key}
              fill={COLORS[index % COLORS.length]}
            />
          ))}

        {chartType === "area" &&
          dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={keyLabels[key] || key}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
      </>
    );

    if (chartType === "line") {
      return <LineChart {...commonProps}>{chartContent}</LineChart>;
    } else if (chartType === "bar") {
      return <BarChart {...commonProps}>{chartContent}</BarChart>;
    } else if (chartType === "area") {
      return <AreaChart {...commonProps}>{chartContent}</AreaChart>;
    }
  };

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
    <Box sx={{ p: 3 }}>
      {/* Statistics Overview */}
      {(statistics && !hideSmallDataPoints) && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Összes
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {Math.round(statistics.total).toLocaleString("hu-HU")}
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
                {Math.round(statistics.max).toLocaleString("hu-HU")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Minimum
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {Math.round(statistics.min).toLocaleString("hu-HU")}
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
                color={statistics.growthRate >= 0 ? "success.main" : "error.main"}
              >
                {statistics.growthRate >= 0 ? "↗" : "↘"}{" "}
                {Math.abs(statistics.growthRate).toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Chart Type Selection */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
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
                <MuiTooltip title="Beállítások visszaállítása">
                  <IconButton onClick={resetSettings} size="medium">
                    <MdRefresh />
                  </IconButton>
                </MuiTooltip>
              </Stack>
            </Stack>

            {/* Chart */}
            <Box>
              <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
              </ResponsiveContainer>
            </Box>

            {/* Data Summary */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Tanévek: ${data.length}`}
                color="success"
                size="small"
              />
              <Chip
                label={`Kategóriák: ${dataKeys.length}`}
                color="secondary"
                size="small"
              />
              <Chip
                label={`Típus: ${CHART_TYPES[chartType]}`}
                color="warning"
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GenericYearlyChart;
