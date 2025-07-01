import {
  useGetTanugyiAdatokQuery,
  useAddTanuloLetszamMutation,
  useGetTanuloLetszamQuery,
  useDeleteTanuloLetszamMutation,
} from "../store/api/apiSlice";
import {
  Spinner,
  Text,
  Box,
  VStack,
  Tabs,
} from "@chakra-ui/react";
import React from "react";
import { TanuloLetszamChart } from "../components/TanuloLetszamChart";
import { TanuloletszamTable, useTanuloletszam } from "../components/TanuloletszamTable";

export default function TanuloLatszam() {
  const {
    data: tanugyiData,
    error,
    isLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

  const {
    data: tanuloLetszamData,
  } = useGetTanuloLetszamQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
  });

  const [addTanuloLetszam] = useAddTanuloLetszamMutation();
  const [deleteTanuloLetszam] = useDeleteTanuloLetszamMutation();

  const {
    editableData,
    years,
    table,
    handleSave,
    handleBack,
    handleReset,
  } = useTanuloletszam(tanugyiData, tanuloLetszamData, addTanuloLetszam, deleteTanuloLetszam);

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Spinner size="xl" />
    </div>
  ) : error ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <h1 style={{ color: "red" }}>Hiba történt az adatok betöltésekor!</h1>
    </div>
  ) : (
    <Box>
      <Text fontSize="2xl" mb={4}>
        Tanulói létszám adatok
      </Text>
      <Text mb={4}>
        Ideiglenes adatok, az excel táblázatból származnak. <br />
        Szükség esetén módosíthatóak a cellákba kattintva. <br />A módosítások
        mentéséhez kérjük, használja a "Mentés" gombot, mellyel a módosításokat
        elmentheti és véglegesítheti.
      </Text>

      <Tabs.Root defaultValue="chart" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="chart">📊 Grafikon nézet</Tabs.Trigger>
          <Tabs.Trigger value="table">📋 Táblázat nézet</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="chart">
          <TanuloLetszamChart data={editableData} years={years} />
        </Tabs.Content>

        <Tabs.Content value="table">
          <VStack spacing={4} align="stretch">
            <TanuloletszamTable
              table={table}
              editableData={editableData}
              years={years}
              onSave={handleSave}
              onReset={handleReset}
              onBack={handleBack}
            />
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}