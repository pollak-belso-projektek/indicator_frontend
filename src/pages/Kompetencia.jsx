import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import ExportButton from "../components/ExportButton";
import { exportYearlyDataToXLS } from "../utils/xlsExport";

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

  // Handle export to XLS
  const handleExport = () => {
    if (!data || Object.keys(data).length === 0) {
      return;
    }

    exportYearlyDataToXLS(data, years, "kompetencia");
  };

  return kompetenciaLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
      }}
    >
      <CircularProgress size={40} />
    </Box>
  ) : kompetenciaError ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
      }}
    >
      <Alert severity="error">
        Hiba történt az adatok betöltésekor!
      </Alert>
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        6. Kompetencia
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Kompetenciamérés eredményei országos és intézményi szinten
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Mentés
        </Button>
        <ExportButton
          onExport={handleExport}
          label="Export XLS"
          disabled={!data || Object.keys(data).length === 0}
          tooltip="Kompetencia adatok exportálása XLS fájlba"
        />
      </Stack>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                rowSpan={2}
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                Mérési Terület
              </TableCell>
              <TableCell
                rowSpan={2}
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                Képzési Forma
              </TableCell>
              {years.map((e) => {
                return (
                  <TableCell
                    key={e}
                    colSpan={2}
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {e}/{e + 1}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {years.map((e) => {
                return (
                  <React.Fragment key={e}>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Országos
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Intézményi
                    </TableCell>
                  </React.Fragment>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Matematika</TableCell>
            <TableCell rowSpan={2} sx={{ verticalAlign: "middle" }}>
              Technikum
            </TableCell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <TableCell align="center">
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
                  </TableCell>
                  <TableCell align="center">
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
                  </TableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
          <TableRow>
            <TableCell>Szövegértés</TableCell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <TableCell align="center">
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
                  </TableCell>
                  <TableCell align="center">
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
                  </TableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
          <TableRow>
            <TableCell>Matematika</TableCell>
            <TableCell rowSpan={2}>Szakképző</TableCell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
          <TableRow>
            <TableCell>Szövegértés</TableCell>
            {years.map((e) => {
              return (
                <React.Fragment key={e}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
      </TableContainer>
    </Box>
  );
}
