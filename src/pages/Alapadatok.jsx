import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  Stack,
  Skeleton,
  useTheme,
  alpha
} from "@mui/material";
import School from "@mui/icons-material/School";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Group from "@mui/icons-material/Group";
import Business from "@mui/icons-material/Business";
import Class from "@mui/icons-material/Class";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import {
  useGetAlapadatokQuery,
  useGetTanuloLetszamQuery,
} from "../store/api/apiSlice";
import { selectSelectedSchool } from "../store/slices/authSlice";
import { generateSchoolYears } from "../utils/schoolYears";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Alapadatok() {
  const theme = useTheme();
  const selectedSchool = useSelector(selectSelectedSchool);

  const { data, error, isLoading } = useGetAlapadatokQuery(
    { id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  const {
    data: studentData,
    error: studentError,
    isLoading: isStudentLoading,
  } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  const summary = useMemo(() => {
    if (!studentData || !Array.isArray(studentData)) return null;

    const years = generateSchoolYears().map((year) => parseInt(year.split("/")[0]));
    const yearSummary = {};

    studentData.forEach((item) => {
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

    const mostRecentYear = Math.max(...years);
    const totalStudents = yearSummary[mostRecentYear]?.total || 0;
    
    // Prepare chart data
    const chartData = years.map(year => ({
      name: `${year}/${(year + 1).toString().slice(-2)}`,
      yearValue: year,
      Összes: yearSummary[year]?.total || 0,
      Nappali: yearSummary[year]?.nappali || 0,
      Esti: yearSummary[year]?.esti || 0,
    })).filter(d => d.Összes > 0).sort((a, b) => a.yearValue - b.yearValue);

    return { yearSummary, totalStudents, years, chartData };
  }, [studentData]);

  if (!selectedSchool) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "90vh" }}>
        <Typography variant="h5" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business fontSize="large" />
          Kérjük válasszon ki egy iskolát az adatok megtekintéséhez!
        </Typography>
      </Box>
    );
  }

  if (isLoading || isStudentLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
        <Skeleton variant="rounded" height={160} sx={{ mb: 4, borderRadius: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={240} sx={{ mb: 4, borderRadius: 3 }} />
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "90vh" }}>
        <Typography variant="h5" color="error">Hiba történt az adatok betöltésekor!</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "90vh" }}>
        <Typography variant="h5" color="textSecondary">Nincsenek elérhető adatok!</Typography>
      </Box>
    );
  }

  return (
    <Box 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}
    >
      {/* Header Card */}
      <Card 
        component={motion.div}
        variants={itemVariants}
        sx={{ 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            opacity: 0.1, 
            transform: 'scale(2)' 
          }}
        >
          <School sx={{ fontSize: 200 }} />
        </Box>
        <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 } }}>
          <Stack direction="column" spacing={2}>
            <Box>
              <Chip 
                label="Alapadatok" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                  mb: 2,
                  fontWeight: 'bold',
                  letterSpacing: 1
                }} 
              />
              <Typography variant="h3" fontWeight="800" sx={{ mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                {data.iskola_neve}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Business sx={{ opacity: 0.9 }} />
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
                {data.intezmeny_tipus}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Statistics and Charts */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '2 1 0' }, minWidth: 0 }}>
          <Card 
            component={motion.div}
            variants={itemVariants}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              '&:hover': { boxShadow: theme.shadows[6] },
              transition: 'box-shadow 0.3s ease-in-out',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: theme.palette.primary.main }}>
                  <TrendingUp />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  Tanulói létszám alakulása
                </Typography>
              </Stack>
              
              {studentError ? (
                <Typography color="error">Hiba a tanulói adatok betöltésekor</Typography>
              ) : !summary || summary.chartData.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">Nincsenek elérhető tanulói létszámadatok</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 400, flexGrow: 1, minHeight: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summary.chartData}
                      margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: 12, 
                          border: 'none', 
                          boxShadow: theme.shadows[6],
                          padding: '12px 16px',
                          fontWeight: 500
                        }} 
                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="Nappali" stackId="a" fill={theme.palette.primary.main} radius={[0, 0, 4, 4]} maxBarSize={40} />
                      <Bar dataKey="Esti" stackId="a" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Current Total Students Summary */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 0' }, minWidth: 0 }}>
          <Card 
            component={motion.div}
            variants={itemVariants}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="textPrimary">
                Aktuális tanulói létszám
              </Typography>
              <Divider sx={{ mb: 4, borderColor: alpha(theme.palette.divider, 0.5) }} />
              
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Group sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h2" fontWeight="800" color="primary.main">
                  {summary ? summary.totalStudents : 0}
                </Typography>
                <Typography variant="body1" color="textSecondary" fontWeight="500">
                  Összes tanuló
                </Typography>
                {summary && summary.chartData.length > 0 && (
                  <Chip 
                    label={`${summary.chartData[summary.chartData.length - 1].name} tanév`}
                    size="small"
                    sx={{ mt: 1.5, fontWeight: 500 }}
                  />
                )}
              </Box>

              {summary && summary.chartData.length > 0 && (
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" textTransform="uppercase" sx={{ mb: 2 }}>
                    Tagozatok szerinti megoszlás
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1} alignItems="flex-end">
                        <Typography fontWeight="600" variant="body2">Nappali tagozat</Typography>
                        <Typography fontWeight="700" variant="body1">{summary.chartData[summary.chartData.length - 1].Nappali} fő</Typography>
                      </Stack>
                      <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ 
                          width: `${(summary.chartData[summary.chartData.length - 1].Nappali / summary.chartData[summary.chartData.length - 1].Összes) * 100}%`, 
                          height: '100%', 
                          bgcolor: 'primary.main',
                          borderRadius: 3
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1} alignItems="flex-end">
                        <Typography fontWeight="600" variant="body2">Esti tagozat</Typography>
                        <Typography fontWeight="700" variant="body1">{summary.chartData[summary.chartData.length - 1].Esti} fő</Typography>
                      </Stack>
                      <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ 
                          width: `${(summary.chartData[summary.chartData.length - 1].Esti / summary.chartData[summary.chartData.length - 1].Összes) * 100}%`, 
                          height: '100%', 
                          bgcolor: 'secondary.main',
                          borderRadius: 3
                        }} />
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Grid container spacing={4}>

        {/* Specializations and Professions */}
        {data.alapadatok_szakirany && data.alapadatok_szakirany.length > 0 && (
          <Grid item xs={12}>
            <Card 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                mt: 2
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 5 }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, color: theme.palette.warning.dark }}>
                    <Class />
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    Oktatott szakirányok és szakmák
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  {data.alapadatok_szakirany.map((szakiranyData, index) => (
                    <Grid item xs={12} md={6} xl={4} key={szakiranyData.szakirany_id || index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3.5, 
                          height: '100%',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: 'primary.main' }} />
                        <Typography variant="h6" color="primary.dark" fontWeight="700" gutterBottom sx={{ lineHeight: 1.3 }}>
                          {szakiranyData.szakirany?.nev}
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.6) }} />
                        
                        {szakiranyData.szakirany?.szakma && szakiranyData.szakirany.szakma.length > 0 ? (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                              Kapcsolódó szakmák ({szakiranyData.szakirany.szakma.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                              {szakiranyData.szakirany.szakma.map((szakmaData, szakmaIndex) => (
                                <Chip
                                  key={szakmaData.szakma_id || szakmaIndex}
                                  label={szakmaData.szakma?.nev || "Névtelen szakma"}
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    color: theme.palette.text.primary,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    fontWeight: 500,
                                    px: 0.5,
                                    py: 1.5,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      borderColor: theme.palette.primary.main,
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 2, opacity: 0.8 }}>
                            Nincsenek rögzített szakmák ehhez a szakirányhoz
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
