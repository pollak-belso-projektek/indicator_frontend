import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { getCurrentSchoolYear } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoIntezményiNevelesiMutatok from "./info_intezmenyi_nevelesi_mutatok";
import TitleIntezményiNevelesiMutatok from "./title_intezmenyi_nevelesi_mutatok";

export default function IntezményiNevelesiMutatok() {
  const schoolYear = getCurrentSchoolYear();

  // Define the complex structure based on the attachment
  const categories = [
    {
      name: "dicséret",
      subcategories: [
        "Összesen",
        "Oktatói",
        "Osztályfőnöki",
        "Igazgatói",
        "Oktató testületi",
      ],
    },
    {
      name: "büntetés",
      subcategories: [
        "Összesen",
        "Oktatói figyelmeztetés",
        "Osztályfőnöki figyelmeztetés",
        "Osztályfőnöki intés",
        "Osztályfőnöki megrovás",
        "Igazgatói figyelmeztetés",
        "Igazgatói intés",
        "Igazgatói megrovás",
        "Oktató testületi figyelmeztetés",
        "Fegyelmi eljárás",
      ],
    },
  ];

  // Initialize data structure
  const [nevelesiData, setNevelesiData] = useState(() => {
    const initialData = {};

    categories.forEach((category) => {
      initialData[category.name] = {};
      category.subcategories.forEach((subcategory) => {
        initialData[category.name][subcategory] = "0";
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (category, subcategory, value) => {
    setNevelesiData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: value,
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(nevelesiData)));
    setIsModified(false);
    console.log("Saving institutional educational indicators:", nevelesiData);
  };

  const handleReset = () => {
    if (savedData) {
      setNevelesiData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <PageWrapper
      titleContent={<TitleIntezményiNevelesiMutatok />}
      infoContent={<InfoIntezményiNevelesiMutatok />}
    >
      <Box>
        <LockStatusIndicator tableName="intezmenyi_neveltseg" />

        {/* Instructions Card */}
      
          {isModified && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Mentetlen módosítások vannak. Ne felejtsd el menteni a
            változtatásokat!
          </Alert>
        )}

        {savedData && !isModified && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Az adatok sikeresen mentve!
          </Alert>
        )}
        <Card sx={{ mb: 3, p:2 }}>
  
          <LockedTableWrapper tableName="intezmenyi_neveltseg">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isModified}
            >
              Mentés
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={!isModified || !savedData}
            >
              Visszaállítás
            </Button>
          </LockedTableWrapper>
       
        </Card>

        {/* Status Messages */}
      
        {/* Main Data Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{
                color: "#1976d2",
                fontWeight: "bold",
                textAlign: "center",
                mb: 3,
              }}
            >
              {schoolYear} (db)
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX: "auto" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        minWidth: 150,
                        textAlign: "center",
                        backgroundColor: "#bbdefb",
                      }}
                    >
                      Osztály jele
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        minWidth: 120,
                        textAlign: "center",
                        backgroundColor: "#ffcdd2",
                      }}
                    >
                      Igazolatlan óra
                    </TableCell>
                    {categories.map((category) => (
                      <TableCell
                        key={category.name}
                        colSpan={category.subcategories.length}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor:
                            category.name === "dicséret" ? "#c8e6c8" : "#ffebee",
                          color:
                            category.name === "dicséret" ? "#2e7d32" : "#d32f2f",
                        }}
                      >
                        {category.name}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ backgroundColor: "#bbdefb" }}></TableCell>
                    <TableCell sx={{ backgroundColor: "#ffcdd2" }}></TableCell>
                    {categories.map((category) =>
                      category.subcategories.map((subcategory) => (
                        <TableCell
                          key={`${category.name}-${subcategory}`}
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textAlign: "center",
                            minWidth: 80,
                            backgroundColor:
                              category.name === "dicséret"
                                ? "#e8f5e8"
                                : "#fff3e0",

                            whiteSpace: "nowrap",
                            height: "80px",
                            verticalAlign: "bottom",
                          }}
                        >
                          <Box sx={{ mt: 2 }}>{subcategory}</Box>
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Empty rows for classes - can be filled dynamically */}
                  {Array.from({ length: 15 }, (_, index) => (
                    <TableRow key={index} sx={{ backgroundColor: "#fafafa" }}>
                      <TableCell sx={{ textAlign: "center", color: "#666" }}>
                        {/* Class identifier can be added here */}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          defaultValue="0"
                          size="small"
                          inputProps={{
                            min: 0,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: "60px" }}
                        />
                      </TableCell>
                      {categories.map((category) =>
                        category.subcategories.map((subcategory) => (
                          <TableCell
                            key={`${category.name}-${subcategory}-${index}`}
                            align="center"
                          >
                            <TextField
                              type="number"
                              value={
                                index === 14
                                  ? nevelesiData[category.name]?.[subcategory] ||
                                  "0"
                                  : "0"
                              }
                              onChange={(e) => {
                                if (index === 14) {
                                  // Only the summary row is editable
                                  handleDataChange(
                                    category.name,
                                    subcategory,
                                    e.target.value
                                  );
                                }
                              }}
                              size="small"
                              inputProps={{
                                min: 0,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "60px" }}
                              disabled={index !== 14} // Only enable the last row (summary)
                            />
                          </TableCell>
                        ))
                      )}
                    </TableRow>
                  ))}

                  {/* Summary Row */}
                  <TableRow
                    sx={{ backgroundColor: "#ffcc02", fontWeight: "bold" }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        backgroundColor: "#ffcc02",
                      }}
                    >
                      összesen
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        defaultValue="0"
                        size="small"
                        inputProps={{
                          min: 0,
                          style: { textAlign: "center", fontWeight: "bold" },
                        }}
                        sx={{ width: "60px" }}
                      />
                    </TableCell>
                    {categories.map((category) =>
                      category.subcategories.map((subcategory) => (
                        <TableCell
                          key={`${category.name}-${subcategory}-summary`}
                          align="center"
                        >
                          <TextField
                            type="number"
                            value={
                              nevelesiData[category.name]?.[subcategory] || "0"
                            }
                            onChange={(e) =>
                              handleDataChange(
                                category.name,
                                subcategory,
                                e.target.value
                              )
                            }
                            size="small"
                            inputProps={{
                              min: 0,
                              style: { textAlign: "center", fontWeight: "bold" },
                            }}
                            sx={{ width: "60px" }}
                          />
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Buttons */}
   

        {/* Educational Indicators Information */}
        <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Nevelési mutatók kategóriái
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Chip label="Dicséretek" color="success" variant="outlined" />
              <Chip
                label="Fegyelmi intézkedések"
                color="error"
                variant="outlined"
              />
              <Chip label="Figyelmeztetések" color="warning" variant="outlined" />
              <Chip label="Intések" color="info" variant="outlined" />
              <Chip label="Megrovások" color="secondary" variant="outlined" />
              <Chip label="Fegyelmi eljárások" color="error" />
            </Box>
            <Typography variant="body2">
              Az intézményi nevelési mutatók segítségével nyomon követhető a
              tanulók fegyelmi helyzete, a pozitív megerősítések (dicséretek) és a
              szankciók (büntetések) aránya.
            </Typography>
          </CardContent>
        </Card>

        {/* Disciplinary Framework */}
        <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Fegyelmi intézkedések hierarchiája
            </Typography>
            <Box component="ol" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Oktatói figyelmeztetés:</strong> Az oktató által
                  kiszabott legkisebb fegyelmi intézkedés
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Osztályfőnöki intézkedések:</strong> Figyelmeztetés,
                  intés, megrovás
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Igazgatói intézkedések:</strong> Figyelmeztetés, intés,
                  megrovás
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Oktató testületi figyelmeztetés:</strong> Kollektív
                  döntésen alapuló intézkedés
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Fegyelmi eljárás:</strong> A legsúlyosabb fegyelmi
                  intézkedés
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Recognition System */}
        <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Elismerési rendszer
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Oktatói dicséret:</strong> Az oktató által adott
                  elismerés kiemelkedő teljesítményért
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Osztályfőnöki dicséret:</strong> Az osztályfőnök által
                  adott elismerés példamutató magatartásért
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Igazgatói dicséret:</strong> Az igazgató által adott
                  elismerés kiemelkedő eredményekért
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Oktató testületi dicséret:</strong> A tantestület
                  kollektív elismerése különleges teljesítményért
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Data Quality Guidelines */}
        <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Adatminőség irányelvek
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body2">
                  <strong>Dokumentálás:</strong> Minden fegyelmi intézkedést és
                  dicséretet dokumentálni kell
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Időszak:</strong> Tanévi összesítés alapján kell
                  jelenteni az adatokat
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Kategorizálás:</strong> Pontosan be kell sorolni az
                  intézkedéseket a megfelelő kategóriákba
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Osztályonkénti bontás:</strong> Lehetőség szerint
                  osztályonként is nyilvántartani
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
