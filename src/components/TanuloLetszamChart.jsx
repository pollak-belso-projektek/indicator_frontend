import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Switch,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip as MuiTooltip,
  Paper,
  Stack,
} from '@mui/material';
import { 
  MdShowChart, 
  MdBarChart, 
  MdAreaChart, 
  MdDownload,
  MdRefresh,
  MdSettings,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';

// Color palette for different lines
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', 
  '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff6b6b',
  '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd'
];

const CHART_TYPES = {
  line: 'Vonaldiagram',
  bar: 'Oszlopdiagram', 
  area: 'Területdiagram'
};

const TanuloLetszamChart = ({ data, years }) => {
  const [selectedAgazatok, setSelectedAgazatok] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([
    'Tanulói jogviszony',
    'Felnőttképzési jogviszony',
    'Összesen'
  ]);
  const [chartHeight, setChartHeight] = useState(500);
  const [chartType, setChartType] = useState('line');
  const [showBrush, setShowBrush] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'selected'
  const [showControls, setShowControls] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [yAxisDomain, setYAxisDomain] = useState('auto'); // 'auto', 'dataMin', 'custom'
  const [customYMin, setCustomYMin] = useState(0);
  const [customYMax, setCustomYMax] = useState(100);

  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!data || !years) return [];

    return years.map(year => {
      const yearData = { year: `${year}/${year + 1}`, yearNum: year };
      
      data.forEach((agazat, index) => {
        const yearCounts = agazat.yearCounts[year] || {};
        
        // Only include selected agazatok if in selected mode
        if (viewMode === 'selected' && !selectedAgazatok.includes(agazat.name)) {
          return;
        }

        selectedCategories.forEach(category => {
          let value = 0;
          if (category === 'Összesen') {
            value = (yearCounts['Tanulói jogviszony'] || 0) + 
                   (yearCounts['Felnőttképzési jogviszony'] || 0) + 
                   (yearCounts['Egyéb'] || 0);
          } else {
            value = yearCounts[category] || 0;
          }
          
          const key = `${agazat.name} - ${category}`;
          yearData[key] = value;
        });
      });

      return yearData;
    });
  }, [data, years, selectedAgazatok, selectedCategories, viewMode]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const allValues = chartData.flatMap(entry => 
      Object.entries(entry)
        .filter(([key]) => key !== 'year' && key !== 'yearNum')
        .map(([, value]) => value)
    );

    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = total / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

    // Calculate growth rate (latest vs first year)
    const firstYear = chartData[0];
    const lastYear = chartData[chartData.length - 1];
    const firstTotal = Object.entries(firstYear)
      .filter(([key]) => key !== 'year' && key !== 'yearNum')
      .reduce((sum, [, value]) => sum + value, 0);
    const lastTotal = Object.entries(lastYear)
      .filter(([key]) => key !== 'year' && key !== 'yearNum')
      .reduce((sum, [, value]) => sum + value, 0);
    
    const growthRate = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0;

    return { total, average, max, min, growthRate };
  }, [chartData]);

  // Get available agazatok
  const availableAgazatok = useMemo(() => {
    return data ? data.map(item => item.name) : [];
  }, [data]);

  // Get all possible line keys for the chart
  const lineKeys = useMemo(() => {
    const keys = [];
    const agazatokToShow = viewMode === 'selected' ? selectedAgazatok : availableAgazatok;
    
    agazatokToShow.forEach(agazat => {
      selectedCategories.forEach(category => {
        keys.push(`${agazat} - ${category}`);
      });
    });
    return keys;
  }, [availableAgazatok, selectedAgazatok, selectedCategories, viewMode]);

  // Initialize selected agazatok if empty
  React.useEffect(() => {
    if (selectedAgazatok.length === 0 && availableAgazatok.length > 0) {
      setSelectedAgazatok(availableAgazatok.slice(0, Math.min(3, availableAgazatok.length)));
    }
  }, [availableAgazatok, selectedAgazatok]);

  // Y-axis domain calculation
  const yDomain = useMemo(() => {
    if (yAxisDomain === 'auto') return undefined;
    if (yAxisDomain === 'dataMin') return ['dataMin', 'dataMax'];
    if (yAxisDomain === 'custom') return [customYMin, customYMax];
    return undefined;
  }, [yAxisDomain, customYMin, customYMax]);
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {entry.dataKey}: {entry.value?.toLocaleString('hu-HU') || 0} fő
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const downloadChart = () => {
    // This would implement chart download functionality
    console.log('Download chart data:', chartData);
    alert('Letöltés funkció fejlesztés alatt!');
  };

  const resetSettings = () => {
    setChartHeight(500);
    setChartType('line');
    setShowBrush(true);
    setShowGrid(true);
    setShowDots(true);
    setStrokeWidth(2);
    setViewMode('all');
    setAnimationDuration(1000);
    setYAxisDomain('auto');
    setSelectedCategories(['Tanulói jogviszony', 'Felnőttképzési jogviszony', 'Összesen']);
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const chartContent = (
      <>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey="year" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: 'Létszám (fő)', angle: -90, position: 'insideLeft' }}
          domain={yDomain}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType={chartType === 'line' ? 'line' : 'rect'}
        />
        
        {chartType === 'line' && lineKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={strokeWidth}
            dot={showDots ? { r: 4 } : false}
            activeDot={{ r: 6 }}
            connectNulls={false}
            animationDuration={animationDuration}
          />
        ))}
        
        {chartType === 'bar' && lineKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[index % COLORS.length]}
            animationDuration={animationDuration}
          />
        ))}
        
        {chartType === 'area' && lineKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.3}
            strokeWidth={strokeWidth}
            animationDuration={animationDuration}
          />
        ))}
        
        {showBrush && <Brush dataKey="year" height={30} />}
      </>
    );

    if (chartType === 'line') {
      return <LineChart {...commonProps}>{chartContent}</LineChart>;
    } else if (chartType === 'bar') {
      return <BarChart {...commonProps}>{chartContent}</BarChart>;
    } else if (chartType === 'area') {
      return <AreaChart {...commonProps}>{chartContent}</AreaChart>;
    }
  };
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nincs megjeleníthető adat
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 4 }}>
      {/* Statistics Overview */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Összes létszám
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {statistics.total.toLocaleString('hu-HU')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Átlag
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {Math.round(statistics.average).toLocaleString('hu-HU')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Maximum
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {statistics.max.toLocaleString('hu-HU')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Minimum
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {statistics.min.toLocaleString('hu-HU')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Növekedés
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                color={statistics.growthRate >= 0 ? 'success.main' : 'error.main'}
              >
                {statistics.growthRate >= 0 ? '↗' : '↘'} {Math.abs(statistics.growthRate).toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Card>        <CardHeader
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
                <IconButton
                  onClick={resetSettings}
                  size="small"
                >
                  <MdRefresh />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Grafikon letöltése">
                <IconButton
                  onClick={downloadChart}
                  size="small"
                >
                  <MdDownload />
                </IconButton>
              </MuiTooltip>
            </Stack>
          }
        />        <CardContent>
          <Stack spacing={3}>
            {showControls && (
              <>
                {/* Chart Type Selection */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body1" fontWeight="medium">
                    Grafikon típus:
                  </Typography>
                  <ButtonGroup variant="outlined" size="small">
                    <Button
                      startIcon={<MdShowChart />}
                      onClick={() => setChartType('line')}
                      variant={chartType === 'line' ? 'contained' : 'outlined'}
                      color={chartType === 'line' ? 'primary' : 'inherit'}
                    >
                      Vonal
                    </Button>
                    <Button
                      startIcon={<MdBarChart />}
                      onClick={() => setChartType('bar')}
                      variant={chartType === 'bar' ? 'contained' : 'outlined'}
                      color={chartType === 'bar' ? 'primary' : 'inherit'}
                    >
                      Oszlop
                    </Button>
                    <Button
                      startIcon={<MdAreaChart />}
                      onClick={() => setChartType('area')}
                      variant={chartType === 'area' ? 'contained' : 'outlined'}
                      color={chartType === 'area' ? 'primary' : 'inherit'}
                    >
                      Terület
                    </Button>
                  </ButtonGroup>
                </Stack>                <Divider />

                {/* View Mode Selection */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body1" fontWeight="medium">
                    Megjelenítési mód:
                  </Typography>
                  <ButtonGroup variant="outlined" size="small">
                    <Button
                      onClick={() => setViewMode('all')}
                      variant={viewMode === 'all' ? 'contained' : 'outlined'}
                      color={viewMode === 'all' ? 'primary' : 'inherit'}
                    >
                      Összes ágazat ({availableAgazatok.length})
                    </Button>
                    <Button
                      onClick={() => setViewMode('selected')}
                      variant={viewMode === 'selected' ? 'contained' : 'outlined'}
                      color={viewMode === 'selected' ? 'primary' : 'inherit'}
                    >
                      Kiválasztott ágazatok ({selectedAgazatok.length})
                    </Button>
                  </ButtonGroup>
                </Stack>

                {/* Agazat Selection */}
                {viewMode === 'selected' && (
                  <FormControl>
                    <FormLabel>Ágazatok kiválasztása:</FormLabel>
                    <FormGroup>
                      <Grid container spacing={1}>
                        {availableAgazatok.map(agazat => (
                          <Grid item xs={12} sm={6} md={4} key={agazat}>
                            <FormControlLabel
                              control={
                                <Checkbox 
                                  checked={selectedAgazatok.includes(agazat)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAgazatok([...selectedAgazatok, agazat]);
                                    } else {
                                      setSelectedAgazatok(selectedAgazatok.filter(a => a !== agazat));
                                    }
                                  }}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">{agazat}</Typography>}
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
                                setSelectedCategories([...selectedCategories, "Tanulói jogviszony"]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== "Tanulói jogviszony"));
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
                                setSelectedCategories([...selectedCategories, "Felnőttképzési jogviszony"]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== "Felnőttképzési jogviszony"));
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
                                setSelectedCategories(selectedCategories.filter(c => c !== "Összesen"));
                              }
                            }}
                          />
                        }
                        label="Összesen"
                      />
                    </Stack>
                  </FormGroup>
                </FormControl>                <Divider />

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

                  {chartType === 'line' && (
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
                    {yAxisDomain === 'custom' && (
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
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px'
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
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        </FormControl>
                      </>
                    )}
                  </Stack>
                </FormControl>                {/* Toggle Controls */}
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
                      label={<Typography variant="body2">Rács megjelenítése</Typography>}
                    />
                  </Grid>
                  {chartType === 'line' && (
                    <Grid item xs={6} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showDots}
                            onChange={(e) => setShowDots(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">Pontok megjelenítése</Typography>}
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

                <Divider />
              </>
            )}            {/* Chart */}
            <Box>
              <ResponsiveContainer width="100%" height={chartHeight}>
                {renderChart()}
              </ResponsiveContainer>
            </Box>

            {/* Data Summary */}
            <Box>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                flexWrap="wrap" 
                spacing={2}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip 
                    label={`Vonalak: ${lineKeys.length}`}
                    color="primary"
                    size="small"
                  />
                  <Chip 
                    label={`Tanévek: ${years?.length || 0}`}
                    color="success"
                    size="small"
                  />
                  <Chip 
                    label={`Ágazatok: ${viewMode === 'selected' ? selectedAgazatok.length : availableAgazatok.length}`}
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
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TanuloLetszamChart;
