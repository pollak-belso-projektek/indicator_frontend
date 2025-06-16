import React, { useState, useEffect } from "react";
import { fields } from "../tableData/tanuloTanugyiData";
import {
  useAddTanugyiAdatokMutation,
  useGetTanugyiAdatokQuery,
} from "../store/api/apiSlice";
import { Button, VStack, Text, Box, Heading } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { CustomSheetUploader } from "../components/CustomSheetUploader";

export default function DataImport() {
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [customUploaderData, setCustomUploaderData] = useState(null);

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
    if (data) {
      addTanugyiAdatok({
        alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
        tanugyi_adatok: data,
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
              height: "70vh",
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
            </Text>     {/* Custom Sheet Uploader Demo Section */}
          <Box p={8} mt={8} border="1px solid" borderColor="gray.200" borderRadius="lg">           

            <CustomSheetUploader
              onFileUpload={async (data, file) => {
                console.log("Custom uploader - Feltöltött fájl:", file.name);
                console.log("Custom uploader - Adatok:", data);
                setData(
                  //match the key-label in the data to the fields
                  data.map((item) => {
                    const newItem = {};
                    fields.forEach((field) => {
                      newItem[field.key] = item[field.label] || "";
                    });
                    return newItem;
                  })
                );
                
                // Itt hívhatod meg az API-t az adatok mentéséhez
                // await addTanugyiAdatok(data);
              }}
              onError={(error) => {
                console.error("Custom uploader hiba:", error);
              }}
              maxFileSize={5 * 1024 * 1024} // 5MB
              showPreview={true}
              maxPreviewRows={10}              uploadMessage="Húzd ide az Excel vagy CSV fájlt vagy kattints a tallózáshoz"
              loadingMessage="Fájl feldolgozása..."
            />
            
            {data && (
              <Box mt={4} p={4} bg="green.50" borderRadius="md">
                <Text fontWeight="bold" color="green.700">
                  Sikeresen feldolgozva!
                </Text>
                <Text color="green.600">
                {data.length} sor adat lett feldolgozva.
                </Text>
              </Box>
            )}
          </Box>
   
          </VStack>

     
        </>
      )}
    </>
  );
}
