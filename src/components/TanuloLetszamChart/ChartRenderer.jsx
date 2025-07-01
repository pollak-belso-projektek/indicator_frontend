import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { COLORS } from "./constants";
import CustomTooltip from "./CustomTooltip";

const ChartRenderer = ({
  chartType,
  chartData,
  lineKeys,
  showGrid,
  yDomain,
  showBrush,
  strokeWidth,
  showDots,
  animationDuration,
}) => {
  const commonProps = {
    data: chartData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
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
        label={{ value: "Létszám (fő)", angle: -90, position: "insideLeft" }}
        domain={yDomain}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend
        wrapperStyle={{ paddingTop: "20px" }}
        iconType={chartType === "line" ? "line" : "rect"}
      />

      {chartType === "line" &&
        lineKeys.map((key, index) => (
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

      {chartType === "bar" &&
        lineKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[index % COLORS.length]}
            animationDuration={animationDuration}
          />
        ))}

      {chartType === "area" &&
        lineKeys.map((key, index) => (
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

  if (chartType === "line") {
    return <LineChart {...commonProps}>{chartContent}</LineChart>;
  } else if (chartType === "bar") {
    return <BarChart {...commonProps}>{chartContent}</BarChart>;
  } else if (chartType === "area") {
    return <AreaChart {...commonProps}>{chartContent}</AreaChart>;
  }

  return null;
};

export default ChartRenderer;