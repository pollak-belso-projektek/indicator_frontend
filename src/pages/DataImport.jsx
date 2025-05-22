import React, { useState, useEffect } from "react";
import { fields } from "../tableData/tanuloTanugyiData";
import {
  useAddTanugyiAdatokMutation,
  useGetTanugyiAdatokQuery,
} from "../store/api/apiSlice";
import { Button, VStack, Text } from "@chakra-ui/react";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Spinner } from "@chakra-ui/react";

export default function DataImport() {
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [addTanugyiAdatok, result] = useAddTanugyiAdatokMutation();
  const {
    data: tanugyiData,
    error,
    isLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

  useEffect(() => {
    console.log(data);
    if (data && data?.all) {
      addTanugyiAdatok({
        alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
        tanugyi_adatok: data.all,
      });
    }
  }, [data, addTanugyiAdatok]);

  useEffect(() => {
    console.log(result);
  }, [result]);

  return (
    <>
      {isLoading ? (
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
        <>
          <VStack
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "45vh",
              flexDirection: "column",
              border: "1px solid #ccc",
            }}
          >
            <Text fontSize="2xl" fontWeight="bold" mb={99}>
              Tanügyi Adatok Feltöltése
            </Text>
            <Text>
              Legutóbb betöltött adatok:{" "}
              {tanugyiData &&
              Array.isArray(tanugyiData) &&
              tanugyiData.length > 0
                ? (() => {
                    const maxItem = tanugyiData.reduce((max, item) =>
                      new Date(item.createAt) > new Date(max.createAt)
                        ? item
                        : max
                    );
                    return (
                      maxItem.createAt.split("T")[0].replace(/-/g, ".") +
                      ". " +
                      maxItem.createAt.split("T")[1].slice(0, 8)
                    );
                  })()
                : "Nincs adat"}
            </Text>
            <Text>
              Betöltött adatok száma:{" "}
              {tanugyiData && Array.isArray(tanugyiData)
                ? tanugyiData.length
                : 0}
            </Text>
            <Button
              colorPalette={"blue"}
              variant="solid"
              mt={99}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              Új Adatok Feltöltése
            </Button>
          </VStack>
          <ReactSpreadsheetImport
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
            onSubmit={setData}
            fields={fields}
          />
        </>
      )}
    </>
  );
}
