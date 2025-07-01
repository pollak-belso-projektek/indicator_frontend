import React from "react";
import { Box, Stack, Chip } from "@mui/material";
import { CHART_TYPES } from "./constants";

const ChartSummary = ({
  lineKeys,
  years,
  viewMode,
  selectedAgazatok,
  availableAgazatok,
  chartType,
}) => {
  return (
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
            label={`Ágazatok: ${
              viewMode === "selected"
                ? selectedAgazatok.length
                : availableAgazatok.length
            }`}
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
  );
};

export default ChartSummary;