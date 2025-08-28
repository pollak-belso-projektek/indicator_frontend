import {
  Table,
  Spinner,
  HStack,
  Tooltip,
  Text,
  Button,
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";
import {
  useAddKompetenciaMutation,
  useGetKompetenciaQuery,
} from "../store/api/apiSlice";

// Create a separate component for editable cells
function EditableCell({ value, onValueChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);

  useEffect(() => {
    setCellValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onValueChange) {
      onValueChange(cellValue);
    }
  };

  if (isEditing) {
    return (
      <input
        className="input"
        autoFocus
        type="text"
        value={cellValue}
        onChange={(e) => setCellValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleBlur();
          }
        }}
      />
    );
  }

  return (
    <p onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
      {cellValue}
    </p>
  );
}

export default function Kompetencia() {
  const {
    data: kompetenciaData,
    error: kompetenciaError,
    isLoading: kompetenciaLoading,
  } = useGetKompetenciaQuery({
    id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
  });
  const [addKompetencia] = useAddKompetenciaMutation();

  console.log("kompetenciaData", kompetenciaData);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const currentYear = month >= 9 ? year : year - 1;

  const years = [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
  ];

  const [data, setData] = useState({});

  useEffect(() => {
    const initialData = {};
    years.forEach((year) => {
      initialData[year] = {
        matematika: {
          technikum: { orszagos: 0, intezmenyi: 0 },
          szakkepzo: { orszagos: 0, intezmenyi: 0 },
        },
        szovegertes: {
          technikum: { orszagos: 0, intezmenyi: 0 },
          szakkepzo: { orszagos: 0, intezmenyi: 0 },
        },
      };
    });

    // If kompetenciaData exists, populate the initial data
    if (kompetenciaData && Array.isArray(kompetenciaData)) {
      kompetenciaData.forEach((item) => {
        const year = item.tanev_kezdete;
        const kepzesForma = item.kepzes_forma; // 'technikum' or 'szakkepzo'

        if (initialData[year]) {
          initialData[year].matematika[kepzesForma] = {
            orszagos: item.mat_orsz_p || 0,
            intezmenyi: item.mat_int_p || 0,
          };
          initialData[year].szovegertes[kepzesForma] = {
            orszagos: item.szoveg_orsz_p || 0,
            intezmenyi: item.szoveg_int_p || 0,
          };
        }
      });
    }

    setData(initialData);
  }, [kompetenciaData]);

  const updateValue = (year, subject, type, field, newValue) => {
    setData((prevData) => ({
      ...prevData,
      [year]: {
        ...prevData[year],
        [subject]: {
          ...prevData[year][subject],
          [type]: {
            ...prevData[year][subject][type],
            [field]: newValue,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    /**
     * obj to send
     * alapadatok_id: params.alapadatok_id,
          tanev_kezdete: params.tanev_kezdete,
          mat_orsz_p: params.mat_orsz_p,
          szoveg_orsz_p: params.szoveg_orsz_p,
          mat_int_p: params.mat_int_p,
          szoveg_int_p: params.szoveg_int_p,
          kepzes_forma: params.kepzes_forma,
     */
    const kompetenciaToSend = [];
    Object.keys(data).forEach((year) => {
      const yearData = data[year];
      kompetenciaToSend.push(
        {
          alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874", // This should be dynamic if needed
          tanev_kezdete: year,
          mat_orsz_p: String(yearData.matematika.technikum.orszagos),
          szoveg_orsz_p: String(yearData.szovegertes.technikum.orszagos),
          mat_int_p: String(yearData.matematika.technikum.intezmenyi),
          szoveg_int_p: String(yearData.szovegertes.technikum.intezmenyi),
          kepzes_forma: "technikum",
        },
        {
          alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
          tanev_kezdete: year,
          mat_orsz_p: String(yearData.matematika.szakkepzo.orszagos),
          szoveg_orsz_p: String(yearData.szovegertes.szakkepzo.orszagos),
          mat_int_p: String(yearData.matematika.szakkepzo.intezmenyi),
          szoveg_int_p: String(yearData.szovegertes.szakkepzo.intezmenyi),
          kepzes_forma: "szakkepzo",
        }
      );
    });

    kompetenciaToSend.forEach((item) => {
      addKompetencia(item)
        .unwrap()
        .then((response) => {
          console.log("Data saved successfully:", response);
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    });
  };

  return kompetenciaLoading ? (
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
  ) : kompetenciaError ? (
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
      <Text fontSize="2xl" mb={4}>
        Tanulói létszám adatok
      </Text>
      <Text mb={4}>
        Ideiglenes adatok, az excel táblázatból származnak. <br />
        Szükség esetén módosíthatóak a cellákba kattintva. <br />A módosítások
        mentéséhez kérjük, használja a "Mentés" gombot, mellyel a módosításokat
        elmentheti és véglegesítheti.
      </Text>

      <HStack>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button onClick={handleSave} backgroundColor={"green.700"} mb={4}>
              Mentés
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Az adatok mentése</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </HStack>
      <Table.Root size="md" showColumnBorder variant="outline" striped>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader rowSpan={2}>Mérési Terület</Table.ColumnHeader>
            <Table.ColumnHeader rowSpan={2}>Képzési Forma</Table.ColumnHeader>
            {years.map((e) => {
              return (
                <Table.ColumnHeader key={e} colSpan={2}>
                  {e}/{e + 1}
                </Table.ColumnHeader>
              );
            })}
          </Table.Row>
          <Table.Row>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <Table.ColumnHeader>Országos</Table.ColumnHeader>
                  <Table.ColumnHeader>Intézményi</Table.ColumnHeader>
                </React.Fragment>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Matematika</Table.Cell>
            <Table.Cell rowSpan={2}>Technikum</Table.Cell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].matematika.technikum.orszagos}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "matematika",
                            "technikum",
                            "orszagos",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].matematika.technikum.intezmenyi}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "matematika",
                            "technikum",
                            "intezmenyi",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </React.Fragment>
              );
            })}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Szövegértés</Table.Cell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].szovegertes.technikum.orszagos}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "szovegertes",
                            "technikum",
                            "orszagos",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].szovegertes.technikum.intezmenyi}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "szovegertes",
                            "technikum",
                            "intezmenyi",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </React.Fragment>
              );
            })}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Matematika</Table.Cell>
            <Table.Cell rowSpan={2}>Szakképző</Table.Cell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].matematika.szakkepzo.orszagos}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "matematika",
                            "szakkepzo",
                            "orszagos",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].matematika.szakkepzo.intezmenyi}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "matematika",
                            "szakkepzo",
                            "intezmenyi",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </React.Fragment>
              );
            })}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Szövegértés</Table.Cell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].szovegertes.szakkepzo.orszagos}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "szovegertes",
                            "szakkepzo",
                            "orszagos",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {data[e] ? (
                      <EditableCell
                        value={data[e].szovegertes.szakkepzo.intezmenyi}
                        onValueChange={(newValue) =>
                          updateValue(
                            e,
                            "szovegertes",
                            "szakkepzo",
                            "intezmenyi",
                            newValue
                          )
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </React.Fragment>
              );
            })}
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </>
  );
}
