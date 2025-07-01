import {
  Spinner,
  HStack,
  Tooltip,
  Text,
  Button,
} from "@chakra-ui/react";
import React from "react";
import {
  useAddKompetenciaMutation,
  useGetKompetenciaQuery,
} from "../store/api/apiSlice";
import { KompetenciaTable, useKompetenciaData } from "../components/Kompetencia";

export default function Kompetencia() {
  const {
    data: kompetenciaData,
    error: kompetenciaError,
    isLoading: kompetenciaLoading,
  } = useGetKompetenciaQuery({
    id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
  });
  
  const [addKompetencia] = useAddKompetenciaMutation();

  const {
    data,
    years,
    updateValue,
    handleSave,
  } = useKompetenciaData(kompetenciaData, addKompetencia);

  console.log("kompetenciaData", kompetenciaData);

  if (kompetenciaLoading) {
    return (
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
    );
  }

  if (kompetenciaError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <h1 style={{ color: "red" }}>
          Hiba történt az adatok betöltésekor!
        </h1>
      </div>
    );
  }

  return (
    <>
      <Text fontSize="2xl" mb={4}>
        Kompetencia mérések eredményei
      </Text>
      <Text mb={4}>
        Az országos kompetencia mérések eredményei. A cellákra kattintva
        szerkesztheti az adatokat.
      </Text>
      <HStack>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button
              onClick={handleSave}
              backgroundColor={"green.700"}
              mb={4}
            >
              Mentés
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Az adatok mentése</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </HStack>
      
      <KompetenciaTable 
        data={data} 
        years={years} 
        updateValue={updateValue} 
      />
    </>
  );
}