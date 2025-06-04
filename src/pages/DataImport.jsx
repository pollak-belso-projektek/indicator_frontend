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
          translations={{
           uploadStep: {
                title: "Feltöltésilépés",
                manifestTitle: "Várt adatok:",
                manifestDescription:
                  "A következő lépésben lehetőséged lesz módosítani, vagy törölni az adatokat",
                dropzone: {
                  title: "Tölts fel egy .xlsx, .xls vagy .csv fájlt",
                  buttonTitle: "Fájl kiválasztása",
                  errorToastDescription: "Feltöltés sikertelen",
                  activeDropzoneTitle: "Húzd ide a fájlt",
                  loadingTitle: "Feldolgozás...",
                },
                selectSheet: {
                  title: "Fejlécek kiválasztása",
                  nextButtonTitle: "Következő",
                  backButtonTitle: "Előző",
                },
              },
              selectHeaderStep: {
                title: "Fejlécek kiválasztása",
                nextButtonTitle: "Következő",
                backButtonTitle: "Előző",
              },
              matchColumnsStep: {
                title: "Egyező oszlopok",
                nextButtonTitle: "Következő",
                backButtonTitle: "Előző",
                userTableTitle: "Jelenlegi tábla",
                templateTitle: "Lészen!",
                selectPlaceholder: "Oszlop kiválasztása...",
                ignoredColumnText: "Kihagyott oszlop",
                subSelectPlaceholder: "Válassz...",
                matchDropdownTitle: "Egyezés",
                unmatched: "Nem egyező",
                duplicateColumnWarningTitle: "Másik oszlop nincs kiválasztva",
                duplicateColumnWarningDescription:
                  "Az oszlopot nem lehet duplikálni",
              },
              validationStep: {
                title: "Véglegesítés",
                nextButtonTitle: "Következő",
                backButtonTitle: "Előző",
                noRowsMessage: "Nem található adat",
                noRowsMessageWhenFiltered: "Az adatban nem található hiba",
                discardButtonTitle: "Kiválasztott sorok törlése",
                filterSwitchTitle: "Csak a hibás sorok mutatása",
              },
              alerts: {
                confirmClose: {
                  headerTitle: "Folyamat megszakítása",
                  bodyText: "Biztos vagy benne? A jelenlegi adatok elvesznek!",
                  cancelButtonTitle: "Mégse",
                  exitButtonTitle: "Megszakítás",
                },
                submitIncomplete: {
                  headerTitle: "Hiba észlelve!",
                  bodyText:
                    "Találhatóak hibás sorok. Ezek a sorok nem kerülnek feltöltésre!",
                  bodyTextSubmitForbidden:
                    "Még mindig találhatóak hibás sorok.",
                  cancelButtonTitle: "Mégse",
                  finishButtonTitle: "Feltöltés",
                },
                submitError: {
                  title: "Hiba",
                  defaultMessage:
                    "Hiba lépett fel az adatok feltöltése közben!",
                },
                unmatchedRequiredFields: {
                  headerTitle: "Nem minden oszlop egyezik!",
                  bodyText:
                    "Vannak kitöltendő oszlopok, amelyek nem egyeznek, vagy nincsennek kitöltve. Biztos akarod folytatni?",
                  listTitle: "Az oszlopok nem egyeznek",
                  cancelButtonTitle: "Mégse",
                  continueButtonTitle: "Folytatás",
                },
                toast: {
                  error: "Hiba",
                },
              },

          }}
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
