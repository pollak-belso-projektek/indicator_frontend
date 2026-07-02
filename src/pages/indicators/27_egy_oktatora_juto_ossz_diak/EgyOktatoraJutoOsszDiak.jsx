import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Typography,
  TextField,
  Snackbar,
} from "@mui/material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import {
  useLazyGetTanugyiAdatokQuery,
  useLazyGetAlkalmazottAdatokQuery,
  useLazyGetEngedelyezettOratomegQuery,
  useUpsertEngedelyezettOratomegMutation,
} from "../../../store/api/apiSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import InfoEgyOktatoraJutoOsszDiak from "./info_egy_oktatora_juto_ossz_diak";
import TitleEgyOktatoraJutoOsszDiak from "./title_egy_oktatora_juto_ossz_diak";
import PageLoadingOverlay from "../../../components/shared/PageLoadingOverlay";

const schoolYears = generateSchoolYears();

export default function EgyOktatoraJutoOsszDiak() {
  const selectedSchool = useSelector(selectSelectedSchool);

  const [triggerTanugyi] = useLazyGetTanugyiAdatokQuery();
  const [triggerAlkalmazott] = useLazyGetAlkalmazottAdatokQuery();
  const [triggerOratomeg] = useLazyGetEngedelyezettOratomegQuery();
  const [upsertOratomeg] = useUpsertEngedelyezettOratomegMutation();

  const [yearlyData, setYearlyData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!selectedSchool?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dataPromises = schoolYears.map(async (yearStr) => {
          const year = parseInt(yearStr.split("/")[0]);

          const [tanugyiResponse, alkalmazottResponse, oratomegResponse] =
            await Promise.all([
              triggerTanugyi({ alapadatok_id: selectedSchool.id, ev: year }),
              triggerAlkalmazott({
                alapadatok_id: selectedSchool.id,
                tanev_kezdete: year,
              }),
              triggerOratomeg({
                alapadatok_id: selectedSchool.id,
                tanev_kezdete: year,
              }),
            ]);

          const tanugyiData = tanugyiResponse.data || [];
          const alkalmazottData = alkalmazottResponse.data || [];
          const oratomegData = oratomegResponse.data || {};

          const tanuloi = tanugyiData.filter(
            (s) =>
              s.tanev_kezdete === year &&
              s.tanulo_jogviszonya === "Tanulói jogviszony"
          ).length;

          const felnott = tanugyiData.filter(
            (s) =>
              s.tanev_kezdete === year &&
              s.tanulo_jogviszonya === "Felnőttképzési jogviszony"
          ).length;

          const osszDiak = tanuloi + felnott;

          const oktatoi = alkalmazottData.filter(
            (a) => a.TanevKezdete === year
          ).length;

          const arany =
            oktatoi > 0 ? parseFloat((osszDiak / oktatoi).toFixed(2)) : 0;

          return {
            year: yearStr,
            tanuloi,
            felnott,
            osszDiak,
            oktatoi,
            arany,
            orati_tanuloi: oratomegData.tanuloi_oratomeg ?? "",
            orati_felnott: oratomegData.felnott_oratomeg ?? "",
          };
        });

        const results = await Promise.all(dataPromises);

        const newYearlyData = {};
        results.forEach((res) => {
          newYearlyData[res.year] = res;
        });

        setYearlyData(newYearlyData);
      } catch (error) {
        console.error("Hiba az adatok lekérdezésekor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    selectedSchool?.id,
    triggerTanugyi,
    triggerAlkalmazott,
    triggerOratomeg,
  ]);

  const handleBlur = async (yearStr, field, value) => {
    if (!selectedSchool?.id) return;
    const year = parseInt(yearStr.split("/")[0]);

    const updatedData = {
      alapadatok_id: selectedSchool.id,
      tanev_kezdete: year,
      tanuloi_oratomeg: field === "orati_tanuloi" ? value : yearlyData[yearStr]?.orati_tanuloi,
      felnott_oratomeg: field === "orati_felnott" ? value : yearlyData[yearStr]?.orati_felnott,
    };

    try {
      await upsertOratomeg(updatedData).unwrap();
      setSnackbarMessage("Adat sikeresen mentve!");
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      setSnackbarMessage("Hiba a mentés során.");
    }
  };

  const renderDataRow = (
    title,
    subtitle,
    dataKey,
    highlight = false,
    isEditable = false
  ) => (
    <TableRow
      hover
      sx={{
        backgroundColor: highlight ? "#f0fdf4" : "inherit",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell component="th" scope="row" sx={{ py: 2 }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: highlight ? 600 : 500 }}
          color={highlight ? "success.dark" : "text.primary"}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </TableCell>
      {schoolYears.map((year) => (
        <TableCell
          key={year}
          align="center"
          sx={{
            fontWeight: highlight ? 700 : 500,
            fontSize: highlight ? "1.1rem" : "1rem",
            color: highlight ? "success.dark" : "text.primary",
          }}
        >
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              variant="outlined"
              value={yearlyData[year]?.[dataKey] ?? ""}
              onChange={(e) =>
                setYearlyData((prev) => ({
                  ...prev,
                  [year]: {
                    ...prev[year],
                    [dataKey]: e.target.value,
                  },
                }))
              }
              onBlur={(e) => handleBlur(year, dataKey, e.target.value)}
              inputProps={{ style: { textAlign: "center" } }}
              sx={{ width: "80px", backgroundColor: "white" }}
            />
          ) : (
            yearlyData[year]?.[dataKey] ?? ""
          )}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <PageWrapper
      titleContent={<TitleEgyOktatoraJutoOsszDiak />}
      infoContent={<InfoEgyOktatoraJutoOsszDiak />}
    >
      <Box sx={{ p: 2, position: "relative" }}>
        <PageLoadingOverlay isLoading={isLoading} />

        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage("")}
          message={snackbarMessage}
        />

        {!selectedSchool && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Kérjük, válasszon intézményt!
          </Alert>
        )}

        {selectedSchool && (
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
                  >
                    Megnevezés
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Main Indicator Row */}
                <TableRow sx={{ backgroundColor: "#fffbeb" }}>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#d97706" }}
                    >
                      Egy oktatóra jutó tanulók száma összesen
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#d97706", opacity: 0.8 }}
                    >
                      (tanuló/oktató)
                    </Typography>
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        color: "#b45309",
                      }}
                    >
                      {yearlyData[year]?.arany ?? ""}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Section Header */}
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell colSpan={schoolYears.length + 1} sx={{ py: 1.5 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        letterSpacing: 1.2,
                      }}
                    >
                      Részletezés export adatokból
                    </Typography>
                  </TableCell>
                </TableRow>

                {/* Data Breakdown Rows */}
                {renderDataRow(
                  "Tanulói jogviszonyú tanulók száma",
                  "(fő)",
                  "tanuloi"
                )}
                {renderDataRow(
                  "Felnőttképzési jogviszonyú tanulók száma",
                  "(felnőttképzési jogviszony) (fő)",
                  "felnott"
                )}
                {renderDataRow(
                  "Szakmai oktatásban tanulók összlétszáma",
                  "(tanulói + felnőttképzési jogviszony) (fő)",
                  "osszDiak",
                  true
                )}
                {renderDataRow(
                  "Számított oktatói létszám",
                  "(fő)",
                  "oktatoi"
                )}

                {/* Section Header for unused DB fields */}
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell colSpan={schoolYears.length + 1} sx={{ py: 1.5 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        letterSpacing: 1.2,
                      }}
                    >
                      Engedélyezett óratömegek
                    </Typography>
                  </TableCell>
                </TableRow>

                {renderDataRow(
                  "Fenntartó által engedélyezett heti óratömeg",
                  "(tanulói jogviszony) (óra)",
                  "orati_tanuloi",
                  false,
                  true // isEditable
                )}
                {renderDataRow(
                  "Fenntartó által engedélyezett heti óratömeg",
                  "(felnőttképzési jogviszony) (óra)",
                  "orati_felnott",
                  false,
                  true // isEditable
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </PageWrapper>
  );
}
