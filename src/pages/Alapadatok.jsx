import { Spinner } from "@chakra-ui/react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import {
  useGetAlapadatokQuery,
  useGetTanuloLetszamQuery,
} from "../store/api/apiSlice";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../store/slices/authSlice";
import { generateSchoolYears } from "../utils/schoolYears";

export default function Alapadatok() {
  const selectedSchool = useSelector(selectSelectedSchool);

  // Only make API call if a school is selected
  const { data, error, isLoading } = useGetAlapadatokQuery(
    { id: selectedSchool?.id },
    { skip: !selectedSchool?.id } // Skip the query if no school is selected
  );

  // Get student enrollment data
  const {
    data: studentData,
    error: studentError,
    isLoading: isStudentLoading,
  } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  if (!selectedSchool) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
          p: 2,
        }}
      >
        <Typography variant="h5" color="textSecondary" align="center">
          Kérjük válasszon ki egy iskolát az adatok megtekintéséhez!
        </Typography>
      </Box>
    );
  }

  // Helper function to calculate summary statistics
  const calculateSummary = (data) => {
    if (!data || !Array.isArray(data)) return null;

    // const currentYear = new Date().getFullYear();
    const years = generateSchoolYears().map((year) =>
      parseInt(year.split("/")[0])
    );

    // Group data by year and jogv_tipus
    const yearSummary = {};

    data.forEach((item) => {
      const year = item.tanev_kezdete;
      const jogvTipus = item.jogv_tipus;
      const letszam = item.letszam || 0;

      if (!yearSummary[year]) {
        yearSummary[year] = { total: 0, nappali: 0, esti: 0 };
      }

      yearSummary[year].total += letszam;
      if (jogvTipus === 0) {
        yearSummary[year].nappali += letszam;
      } else if (jogvTipus === 1) {
        yearSummary[year].esti += letszam;
      }
    });

    // Calculate total students for the most recent year only
    const mostRecentYear = Math.max(...years);
    const totalStudents = yearSummary[mostRecentYear]?.total || 0;

    return { yearSummary, totalStudents, years };
  };

  const summary = calculateSummary(studentData);
  return isLoading || isStudentLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Spinner size="xl" />
    </Box>
  ) : error ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        p: 2,
      }}
    >
      <Typography variant="h5" color="error" align="center">Hiba történt az adatok betöltésekor!</Typography>
    </Box>
  ) : !data ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        p: 2,
      }}
    >
      <Typography variant="h5" color="error" align="center">Nincsenek elérhető adatok!</Typography>
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      {/* School Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom color="primary">
            {data.iskola_neve}
          </Typography>
          <Chip
            label={data.intezmeny_tipus}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </CardContent>
      </Card>

      {/* Student Enrollment Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom color="primary">
            📊 Tanulói összlétszám áttekintés
          </Typography>

          {studentError ? (
            <Typography color="error">
              Hiba a tanulói adatok betöltésekor
            </Typography>
          ) : !summary ? (
            <Typography color="textSecondary">
              Nincsenek elérhető tanulói létszámadatok
            </Typography>
          ) : (
            <>
              {/* Total Students Card */}
              <Card
                variant="outlined"
                sx={{ mb: 2, backgroundColor: "#f8f9fa" }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {summary.totalStudents}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    Összes tanuló
                  </Typography>
                </CardContent>
              </Card>

              {/* Yearly Breakdown */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Létszám évenkénti bontásban
              </Typography>
              <Grid container spacing={2}>
                {summary.years.map((year) => {
                  const yearData = summary.yearSummary[year];
                  if (!yearData || yearData.total === 0) return null;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={year}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography variant="h6" color="primary">
                            {year}/{year + 1}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: "bold", color: "#2e7d32" }}
                          >
                            {yearData.total}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                          >
                            Összes tanuló
                          </Typography>

                          {/* Breakdown by jogv_tipus */}
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="primary">
                                  Nappali: {yearData.nappali}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="secondary">
                                  Esti: {yearData.esti}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {summary.years.filter(
                (year) => summary.yearSummary[year]?.total > 0
              ).length === 0 && (
                <Typography
                  color="textSecondary"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  Nincsenek diákok az aktuális évekhez
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Szakirányok Information */}
      {data.alapadatok_szakirany && data.alapadatok_szakirany.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">
              🎓 Szakirányok és szakmák
            </Typography>
            <Grid container spacing={2}>
              {data.alapadatok_szakirany.map((szakiranyData, index) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  key={szakiranyData.szakirany_id || index}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        {szakiranyData.szakirany?.nev}
                      </Typography>
                      {szakiranyData.szakirany?.szakma &&
                      szakiranyData.szakirany.szakma.length > 0 ? (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                          >
                            Szakmák ({szakiranyData.szakirany.szakma.length}):
                          </Typography>
                          {szakiranyData.szakirany.szakma.map(
                            (szakmaData, szakmaIndex) => (
                              <Chip
                                key={szakmaData.szakma_id || szakmaIndex}
                                label={
                                  szakmaData.szakma?.nev || "Névtelen szakma"
                                }
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                variant="outlined"
                              />
                            )
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Nincsenek hozzáadott szakmák
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
