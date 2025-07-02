import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const szakmak = [
  { nev: "magasépítő technikus (A)" },
  { nev: "mélyépítő technikus (B)" },
  { nev: "kőműves (a)" },
  { nev: "burkoló (b)" },
  { nev: "festő, mázoló, tapétázó (c)" },
];

const evszamok = ["2020/2021", "2021/2022", "2022/2023", "2023/2024"];

const FelvettekSzama = () => {
  const [value, setValue] = useState("1");
  // Szerkeszthető létszám adatok
  const [letszam, setLetszam] = useState(
    szakmak.reduce(
      (acc, szakma) => ({
        ...acc,
        [szakma.nev]: evszamok.reduce((a, ev) => ({ ...a, [ev]: "" }), {}),
      }),
      {
        "technikum+szakképző iskola": evszamok.reduce((a, ev) => ({ ...a, [ev]: "" }), {}),
        "ebből: technikum": evszamok.reduce((a, ev) => ({ ...a, [ev]: "" }), {}),
        "ebből: szakképző iskola": evszamok.reduce((a, ev) => ({ ...a, [ev]: "" }), {}),
      }
    )
  );
  const [editingCell, setEditingCell] = useState({ row: null, ev: null });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCellClick = (row, ev) => {
    setEditingCell({ row, ev });
  };

  const handleInputChange = (row, ev, e) => {
    setLetszam((prev) => ({
      ...prev,
      [row]: { ...prev[row], [ev]: e.target.value },
    }));
  };

  const handleBlur = () => {
    setEditingCell({ row: null, ev: null });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setEditingCell({ row: null, ev: null });
    }
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Jelentkezők és felvettek aránya" value="1" />
          <Tab label="9. évfolyamra jelentkezők száma" value="2" />
          <Tab label="9. évfolyamra felvettek száma" value="3" />
          <Tab label="9. évfolyamra felvehető létszám" value="4" />
        </Tabs>
      </Box>
      {value === "1" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
                  Jelentkezők és felvettek aránya
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>{ev}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Összesen</TableCell>
                <TableCell>technikum+szakképző iskola</TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>?</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {value === "2" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
                  9. évfolyamra jelentkezők száma
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>{ev}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Összesen</TableCell>
                <TableCell>technikum+szakképző iskola</TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>?</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {value === "3" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
                  9. évfolyamra felvettek száma
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>{ev}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Összesen</TableCell>
                <TableCell>technikum+szakképző iskola</TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>?</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {value === "4" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
                  9. évfolyamra felvehető létszám
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {evszamok.map((ev) => (
                  <TableCell key={ev}>{ev}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Összesen</TableCell>
                <TableCell>technikum+szakképző iskola</TableCell>
                {evszamok.map((ev) => (
                  <TableCell
                    key={ev}
                    onClick={() => handleCellClick("technikum+szakképző iskola", ev)}
                    sx={{ cursor: "pointer", '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    {editingCell.row === "technikum+szakképző iskola" && editingCell.ev === ev ? (
                      <input
                        type="number"
                        value={letszam["technikum+szakképző iskola"][ev]}
                        onChange={(e) => handleInputChange("technikum+szakképző iskola", ev, e)}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        style={{ width: "60px", textAlign: "center" }}
                      />
                    ) : letszam["technikum+szakképző iskola"][ev] !== "" ? (
                      letszam["technikum+szakképző iskola"][ev]
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>intézménytípusonként</TableCell>
                <TableCell>ebből: technikum</TableCell>
                {evszamok.map((ev) => (
                  <TableCell
                    key={ev}
                    onClick={() => handleCellClick("ebből: technikum", ev)}
                    sx={{ cursor: "pointer", '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    {editingCell.row === "ebből: technikum" && editingCell.ev === ev ? (
                      <input
                        type="number"
                        value={letszam["ebből: technikum"][ev]}
                        onChange={(e) => handleInputChange("ebből: technikum", ev, e)}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        style={{ width: "60px", textAlign: "center" }}
                      />
                    ) : letszam["ebből: technikum"][ev] !== "" ? (
                      letszam["ebből: technikum"][ev]
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>intézménytípusonként</TableCell>
                <TableCell>ebből: szakképző iskola</TableCell>
                {evszamok.map((ev) => (
                  <TableCell
                    key={ev}
                    onClick={() => handleCellClick("ebből: szakképző iskola", ev)}
                    sx={{ cursor: "pointer", '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    {editingCell.row === "ebből: szakképző iskola" && editingCell.ev === ev ? (
                      <input
                        type="number"
                        value={letszam["ebből: szakképző iskola"][ev]}
                        onChange={(e) => handleInputChange("ebből: szakképző iskola", ev, e)}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        style={{ width: "60px", textAlign: "center" }}
                      />
                    ) : letszam["ebből: szakképző iskola"][ev] !== "" ? (
                      letszam["ebből: szakképző iskola"][ev]
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
              {szakmak.map((szakma) => (
                <TableRow key={szakma.nev}>
                  <TableCell>szakmánként</TableCell>
                  <TableCell>{szakma.nev}</TableCell>
                  {evszamok.map((ev) => (
                    <TableCell
                      key={ev}
                      onClick={() => handleCellClick(szakma.nev, ev)}
                      sx={{ cursor: "pointer", '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      {editingCell.row === szakma.nev && editingCell.ev === ev ? (
                        <input
                          type="number"
                          value={letszam[szakma.nev][ev]}
                          onChange={(e) => handleInputChange(szakma.nev, ev, e)}
                          onBlur={handleBlur}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          style={{ width: "60px", textAlign: "center" }}
                        />
                      ) : letszam[szakma.nev][ev] !== "" ? (
                        letszam[szakma.nev][ev]
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FelvettekSzama;
