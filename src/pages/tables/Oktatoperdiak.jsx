import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Snackbar,
  Typography,
  Container,
  Fade,
  Card,
  CardContent,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon, Calculate as CalculateIcon } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetTanuloLetszamQuery,
  useGetEgyOktatoraJutoTanuloByAlapadatokQuery,
  useAddEgyOktatoraJutoTanuloMutation,
  useUpdateEgyOktatoraJutoTanuloMutation,
} from "../../store/api/apiSlice";

const Oktatoperdiak = () => {
  const currentYear =
    new Date().getMonth() >= 8
      ? new Date().getFullYear()
      : new Date().getFullYear() - 1; // Academic year starts in September
  const years = useMemo(
    () => [
      currentYear - 3, // 2020/2021
      currentYear - 2, // 2021/2022
      currentYear - 1, // 2022/2023
      currentYear, // 2023/2024
    ],
    [currentYear]
  );

  const selectedSchool = useSelector((state) => state.auth.selectedSchool);

  // API hooks
  const { data: tanuloLetszamData } = useGetTanuloLetszamQuery({
    alapadatok_id: selectedSchool?.id,
  });

  const { data: oktatorPerDiakData } =
    useGetEgyOktatoraJutoTanuloByAlapadatokQuery({
      alapadatok_id: selectedSchool?.id,
      year: currentYear,
    });

  console.log(oktatorPerDiakData);

  const [addOktatorPerDiak, { isLoading: isAdding }] =
    useAddEgyOktatoraJutoTanuloMutation();
  const [updateOktatorPerDiak, { isLoading: isUpdating }] =
    useUpdateEgyOktatoraJutoTanuloMutation();

  // State for save functionality
  const [isModified, setIsModified] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  //add those together where jogv_tipus is 0 for each year
  //tanev kezdete is first part of the year key

  const sumLetszamPerYear = years.reduce((acc, year) => {
    const yearKey = `${year}/${year + 1}`;
    acc[yearKey] = tanuloLetszamData
      ? tanuloLetszamData
          .filter(
            (item) => item.tanev_kezdete === year && item.jogv_tipus === 0
          )
          .reduce((sum, item) => sum + item.letszam, 0)
      : 0;
    return acc;
  }, {});

  useEffect(() => {
    // Log the sum of tanulo letszam per year
    console.log("Sum of tanulo letszam per year:", sumLetszamPerYear);
    console.log("Tanulo letszam data:", tanuloLetszamData);
  }, [sumLetszamPerYear, tanuloLetszamData]);

  // State for editable data
  const [hetiOratomeg, setHetiOratomeg] = useState([0, 0, 0, 0]); // Fenntartó által engedélyezett heti óratömeg
  const [divisor, setDivisor] = useState(22); // Configurable divisor for calculating teacher count

  // Populate hetiOratomeg from API data when it loads
  useEffect(() => {
    console.log("oktatorPerDiakData:", oktatorPerDiakData);
    if (oktatorPerDiakData && Array.isArray(oktatorPerDiakData)) {
      const newHetiOratomeg = years.map((year) => {
        const record = oktatorPerDiakData.find(
          (item) => item.tanev_kezdete === year
        );
        console.log(`Record for year ${year}:`, record);
        return record ? parseFloat(record.letszam) || 0 : 0;
      });
      setHetiOratomeg(newHetiOratomeg);
      console.log("Loaded hetiOratomeg from API:", newHetiOratomeg);
    }
  }, [oktatorPerDiakData, years]);
  const [editingCell, setEditingCell] = useState(null);

  // Calculate számított oktatói létszám: hetiOratomeg / divisor
  const szamitottOktatoiLetszam = hetiOratomeg.map((value) =>
    value > 0 ? Math.round(value / divisor) : 0
  );

  // Calculate egy oktatóra jutó tanulói jogviszonyú tanulók száma: sumLetszamPerYear / szamitottOktatoiLetszam
  const egyOktatoraJutoTanulok = szamitottOktatoiLetszam.map((value, index) => {
    if (value > 0) {
      const tanuloLetszam =
        sumLetszamPerYear[years[index] + "/" + (years[index] + 1)];
      return tanuloLetszam > 0 ? Math.round(tanuloLetszam / value) : 0;
    }
    return "N/A";
  });

  // Handle cell click for editing
  const handleCellClick = (index) => {
    setEditingCell(index);
  };

  // Handle value change
  const handleValueChange = (index, newValue) => {
    const numericValue = parseFloat(newValue);
    const newHetiOratomeg = [...hetiOratomeg];
    newHetiOratomeg[index] = numericValue;
    setHetiOratomeg(newHetiOratomeg);
    setIsModified(true); // Mark as modified when data changes
  };

  // Handle save
  const handleSave = async () => {
    try {
      let savedCount = 0;

      // Create or update records for the weekly hours data
      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const yearKey = `${year}/${year + 1}`;
        const hetiOraValue = hetiOratomeg[i];

        // Allow zero values, only filter out null/undefined
        if (
          hetiOraValue !== null &&
          hetiOraValue !== undefined
        ) {
          const recordData = {
            alapadatok_id: selectedSchool?.id,
            tanev_kezdete: year,
            letszam: hetiOraValue,
            // Add other required fields based on the API structure
          };

          console.log(`Saving data for year ${yearKey}:`, recordData);

          // Check if record exists and update, or create new
          const existingRecord = oktatorPerDiakData?.find(
            (item) =>
              item.alapadatok_id === selectedSchool?.id &&
              item.tanev_kezdete === year
          );

          console.log(`Existing record for year ${year}:`, existingRecord);

          if (existingRecord) {
            console.log(
              `Updating existing record with ID: ${existingRecord.id}`
            );
            await updateOktatorPerDiak({
              id: existingRecord.id,
              ...recordData,
            }).unwrap();
          } else {
            console.log(`Creating new record for year ${year}`);
            await addOktatorPerDiak(recordData).unwrap();
          }

          savedCount++;
        }
      }

      setIsModified(false);
      setNotification({
        open: true,
        message: `Sikeresen mentve: ${savedCount} rekord`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a mentés során: ${error.message}`,
        severity: "error",
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    // Reset to API data if available, otherwise reset to zeros
    if (oktatorPerDiakData && Array.isArray(oktatorPerDiakData)) {
      const newHetiOratomeg = years.map((year) => {
        const record = oktatorPerDiakData.find(
          (item) => item.tanev_kezdete === year
        );
        return record ? parseFloat(record.letszam) || 0 : 0;
      });
      setHetiOratomeg(newHetiOratomeg);
    } else {
      setHetiOratomeg([0, 0, 0, 0]);
    }
    setDivisor(22);
    setIsModified(false);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle blur (finish editing)
  const handleBlur = () => {
    setEditingCell(null);
  };

  // Handle key press (Enter to finish editing)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setEditingCell(null);
    }
  };
  return (
    <Container maxWidth="xl">
      <Fade in={true} timeout={800}>
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Header Section */}
          <Card 
            elevation={6} 
            sx={{ 
              mb: 2, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CalculateIcon sx={{ fontSize: 40, color: '#ffeb3b' }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  3. Egy oktatóra jutó tanulók száma
                </Typography>
              </Stack>
            
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Egy oktatóra jutó tanulói jogviszonyú tanulók számának nyomon követése tanévenként
              </Typography>
            </CardContent>
          </Card>
      {/* Divisor Configuration */}
      <Box sx={{ margin: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">
            Heti óratömeg osztója (oktatói létszám számításához):
          </Typography>
          <TextField
            value={divisor}
            onChange={(e) => setDivisor(parseFloat(e.target.value) || 22)}
            size="small"
            type="number"
            inputProps={{
              min: 0.1,
              max: 100,
              step: 0.1,
              style: { textAlign: "center" },
            }}
            sx={{ width: "80px" }}
          />
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ margin: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isModified || isAdding || isUpdating}
          >
            {isAdding || isUpdating ? "Mentés..." : "Mentés"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!isModified}
          >
            Visszaállítás
          </Button>
        </Stack>

        {/* Status Message */}
        {isModified && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Mentetlen módosítások vannak. Ne felejtsd el menteni a
            változtatásokat!
          </Alert>
        )}
      </Box>

      <Box sx={{ margin: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  Egy oktatóra jutó tanulói jogviszonyú tanulók száma
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  (tanuló/oktató)
                </TableCell>
              </TableRow>
              <TableRow>
                {years.map((year) => (
                  <TableCell key={year} align="center">
                    {year}/{year + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {egyOktatoraJutoTanulok.map((value, index) => (
                  <TableCell key={index} align="center">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/*
        számított oktatói létszám			
(fő)			
2020/2021	2021/2022	2022/2023	2022/2024
23	0	0	0
			
fenntartó által engedélyezett heti óratömeg			
(óra)			
2020/2021	2021/2022	2022/2023	2022/2024
500			

        */}
      <Box sx={{ margin: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  Számított oktatói létszám
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  (fő)
                </TableCell>
              </TableRow>
              <TableRow>
                {years.map((year) => (
                  <TableCell key={year} align="center">
                    {year}/{year + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {szamitottOktatoiLetszam.map((value, index) => (
                  <TableCell key={index} align="center">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ margin: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  Fenntartó által engedélyezett heti óratömeg
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" colSpan={years.length}>
                  (óra)
                </TableCell>
              </TableRow>
              <TableRow>
                {years.map((year) => (
                  <TableCell key={year} align="center">
                    {year}/{year + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {hetiOratomeg.map((value, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    onClick={() => handleCellClick(index)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    {editingCell === index ? (
                      <TextField
                        value={value}
                        onChange={(e) =>
                          handleValueChange(index, e.target.value)
                        }
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        size="small"
                        type="number"
                        inputProps={{
                          min: 0,
                          step: 0.1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "100px" }}
                      />
                    ) : value >= 0 ? (
                      value
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
        </Box>
      </Fade>
    </Container>
  );
};

export default Oktatoperdiak;
