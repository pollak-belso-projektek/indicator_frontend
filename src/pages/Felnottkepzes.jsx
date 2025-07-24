import { useState, useEffect } from "react";
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
  Divider,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function Felnottkepzes() {
  // First table data (read-only) - calculated percentages
  const [felnottkepzesiArany, setFelnottkepzesiArany] = useState({
    "2020/2021": 75,
    "2021/2022": 0,
    "2022/2023": 0,
    "2023/2024": 0,
  });

  // Second table data (editable) - absolute numbers
  const [szakmaiOktatás, setSzakmaiOktatás] = useState({
    "2020/2021": 1000,
    "2021/2022": 0,
    "2022/2023": 0,
    "2023/2024": 0,
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  const years = ["2020/2021", "2021/2022", "2022/2023", "2023/2024"];

  // Handle changes in the editable table
  const handleSzakmaiOktatásChange = (year, value) => {
    const numericValue = parseInt(value) || 0;
    setSzakmaiOktatás((prev) => ({
      ...prev,
      [year]: numericValue,
    }));
    setIsModified(true);
  };

  // Calculate percentage for first table based on formula
  const calculatePercentage = (year) => {
    // Based on the formula in the image:
    // (felnőttképzési jogviszonyú rendszerekben tanulók száma / szakmai oktatásban tanulók összlétszáma) * 100
    const szakmaiCount = szakmaiOktatás[year];
    if (szakmaiCount === 0) return 0;

    // For demonstration, using a base calculation
    // In real implementation, this would come from another data source
    const felnottkepzesiCount = Math.floor(szakmaiCount * 0.1); // Example calculation
    return Math.round((felnottkepzesiCount / szakmaiCount) * 100);
  };

  // Update calculated percentages when szakmai oktatás data changes
  useEffect(() => {
    const newArany = {};
    years.forEach((year) => {
      newArany[year] = calculatePercentage(year);
    });
    setFelnottkepzesiArany(newArany);
  }, [szakmaiOktatás]);

  const handleSave = () => {
    setSavedData({ ...szakmaiOktatás });
    setIsModified(false);
    // Here you would typically save to backend
    console.log("Saving data:", szakmaiOktatás);
  };

  const handleReset = () => {
    if (savedData) {
      setSzakmaiOktatás({ ...savedData });
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Felnőttképzés
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Felnőttképzési jogviszonyú tanulók adatai és statisztikái
      </Typography>

      {/* First Table - Read Only (Percentages) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Felnőttképzési jogviszonyú tanulók aránya (%)
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ez a táblázat automatikusan számított értékeket tartalmaz és nem
            módosítható.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {years.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{ fontWeight: "bold" }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {years.map((year) => (
                    <TableCell key={year} align="center">
                      {felnottkepzesiArany[year]}%
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Second Table - Editable (Absolute Numbers) */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Szakmai oktatásban tanulók összlétszáma
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A felnőttképzési jogviszony + tanulói jogviszony összesen (fő)
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {years.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{ fontWeight: "bold" }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {years.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={szakmaiOktatás[year]}
                        onChange={(e) =>
                          handleSzakmaiOktatásChange(year, e.target.value)
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "100px" }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
          </Stack>

          {isModified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Mentetlen módosítások vannak. Ne felejtsd el menteni a
              változtatásokat!
            </Alert>
          )}

          {savedData && !isModified && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Az adatok sikeresen mentve!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formula Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Számítási formula
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Felnőttképzési jogviszonyú tanulók aránya =</strong>
            <br />
            (felnőttképzési jogviszonyú rendszerekben tanulók száma / szakmai
            oktatásban tanulók összlétszáma) × 100
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
