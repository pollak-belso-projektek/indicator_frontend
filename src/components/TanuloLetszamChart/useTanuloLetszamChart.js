import { useState, useMemo, useEffect } from "react";
import { DEFAULT_SELECTED_CATEGORIES } from "./constants";

export const useTanuloLetszamChart = (data, years) => {
  const [selectedAgazatok, setSelectedAgazatok] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(DEFAULT_SELECTED_CATEGORIES);
  const [chartHeight, setChartHeight] = useState(500);
  const [chartType, setChartType] = useState("line");
  const [showBrush, setShowBrush] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'selected'
  const [showControls, setShowControls] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [yAxisDomain, setYAxisDomain] = useState("auto"); // 'auto', 'dataMin', 'custom'
  const [customYMin, setCustomYMin] = useState(0);
  const [customYMax, setCustomYMax] = useState(100);

  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!data || !years) return [];

    return years.map((year) => {
      const yearData = { year: `${year}/${year + 1}`, yearNum: year };

      data.forEach((agazat) => {
        const yearCounts = agazat.yearCounts[year] || {};

        // Only include selected agazatok if in selected mode
        if (
          viewMode === "selected" &&
          !selectedAgazatok.includes(agazat.name)
        ) {
          return;
        }

        selectedCategories.forEach((category) => {
          let value = 0;
          if (category === "Összesen") {
            value =
              (yearCounts["Tanulói jogviszony"] || 0) +
              (yearCounts["Felnőttképzési jogviszony"] || 0) +
              (yearCounts["Egyéb"] || 0);
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

    const allValues = chartData.flatMap((entry) =>
      Object.entries(entry)
        .filter(([key]) => key !== "year" && key !== "yearNum")
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
      .filter(([key]) => key !== "year" && key !== "yearNum")
      .reduce((sum, [, value]) => sum + value, 0);
    const lastTotal = Object.entries(lastYear)
      .filter(([key]) => key !== "year" && key !== "yearNum")
      .reduce((sum, [, value]) => sum + value, 0);

    const growthRate =
      firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0;

    return { total, average, max, min, growthRate };
  }, [chartData]);

  // Get available agazatok
  const availableAgazatok = useMemo(() => {
    return data ? data.map((item) => item.name) : [];
  }, [data]);

  // Get all possible line keys for the chart
  const lineKeys = useMemo(() => {
    const keys = [];
    const agazatokToShow =
      viewMode === "selected" ? selectedAgazatok : availableAgazatok;

    agazatokToShow.forEach((agazat) => {
      selectedCategories.forEach((category) => {
        keys.push(`${agazat} - ${category}`);
      });
    });
    return keys;
  }, [availableAgazatok, selectedAgazatok, selectedCategories, viewMode]);

  // Initialize selected agazatok if empty
  useEffect(() => {
    if (selectedAgazatok.length === 0 && availableAgazatok.length > 0) {
      setSelectedAgazatok(
        availableAgazatok.slice(0, Math.min(3, availableAgazatok.length))
      );
    }
  }, [availableAgazatok, selectedAgazatok]);

  // Y-axis domain calculation
  const yDomain = useMemo(() => {
    if (yAxisDomain === "auto") return undefined;
    if (yAxisDomain === "dataMin") return ["dataMin", "dataMax"];
    if (yAxisDomain === "custom") return [customYMin, customYMax];
    return undefined;
  }, [yAxisDomain, customYMin, customYMax]);

  const downloadChart = () => {
    // This would implement chart download functionality
    console.log("Download chart data:", chartData);
    alert("Letöltés funkció fejlesztés alatt!");
  };

  const resetSettings = () => {
    setChartHeight(500);
    setChartType("line");
    setShowBrush(true);
    setShowGrid(true);
    setShowDots(true);
    setStrokeWidth(2);
    setViewMode("all");
    setAnimationDuration(1000);
    setYAxisDomain("auto");
    setSelectedCategories(DEFAULT_SELECTED_CATEGORIES);
  };

  return {
    // State
    selectedAgazatok,
    setSelectedAgazatok,
    selectedCategories,
    setSelectedCategories,
    chartHeight,
    setChartHeight,
    chartType,
    setChartType,
    showBrush,
    setShowBrush,
    showGrid,
    setShowGrid,
    showDots,
    setShowDots,
    strokeWidth,
    setStrokeWidth,
    viewMode,
    setViewMode,
    showControls,
    setShowControls,
    animationDuration,
    setAnimationDuration,
    yAxisDomain,
    setYAxisDomain,
    customYMin,
    setCustomYMin,
    customYMax,
    setCustomYMax,
    
    // Computed values
    chartData,
    statistics,
    availableAgazatok,
    lineKeys,
    yDomain,
    
    // Functions
    downloadChart,
    resetSettings,
  };
};