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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetTanuloLetszamQuery } from "../../store/api/apiSlice";

const oktatoperdiak = () => {
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear - 3, // 2020/2021
    currentYear - 2, // 2021/2022
    currentYear - 1, // 2022/2023
    currentYear, // 2023/2024
  ];

  //get datas from the /Tanulo_letszam/years the get endpoint only handle one year at a time
  const {
    data: tanuloLetszamData,
    error,
    isLoading,
  } = useGetTanuloLetszamQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874", // Assuming a fixed alapadatok_id for this example
  });

  /*
      0
: 
{id: 'c0250e40-a2a6-47eb-b46f-607372bc90ab', alapadatok_id: '2e31291b-7c2d-4bd8-bdca-de8580136874', tanev_kezdete: 2021, jogv_tipus: 0, letszam: 0, …}
1
: 
{id: '3bfc58b6-ad68-4034-91db-784dbcd7b53c', alapadatok_id: '2e31291b-7c2d-4bd8-bdca-de8580136874', tanev_kezdete: 2023, jogv_tipus: 1, letszam: 0, …}
2
: 
{id: '45e74bf7-162e-451a-836a-36d0bcb9d2f6', alapadatok_id: '2e31291b-7c2d-4bd8-bdca-de8580136874', tanev_kezdete: 2022, jogv_tipus: 0, letszam: 0, …}

      */

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
  }, [sumLetszamPerYear]);

  // State for editable data
  const [hetiOratomeg, setHetiOratomeg] = useState([0, 0, 0, 0]); // Fenntartó által engedélyezett heti óratömeg
  const [editingCell, setEditingCell] = useState(null);

  // Calculate számított oktatói létszám: hetiOratomeg / 22
  const szamitottOktatoiLetszam = hetiOratomeg.map((value) =>
    value > 0 ? Math.round(value / 22) : 0
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
    const numericValue = parseInt(newValue) || 0;
    const newHetiOratomeg = [...hetiOratomeg];
    newHetiOratomeg[index] = numericValue;
    setHetiOratomeg(newHetiOratomeg);
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
    <Box sx={{ margin: 2 }}>
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
                          min: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                      />
                    ) : value > 0 ? (
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
    </Box>
  );
};

export default oktatoperdiak;
