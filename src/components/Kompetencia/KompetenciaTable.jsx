import React from "react";
import { Table } from "@chakra-ui/react";
import EditableCell from "./EditableCell";

const KompetenciaTable = ({ data, years, updateValue }) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader rowSpan={2}>Tantárgy</Table.ColumnHeader>
          {years.map((year) => (
            <Table.ColumnHeader key={year} colSpan={2}>
              {year}/{year + 1}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
        <Table.Row>
          {years.map((year) => (
            <React.Fragment key={year}>
              <Table.ColumnHeader>Országos</Table.ColumnHeader>
              <Table.ColumnHeader>Intézményi</Table.ColumnHeader>
            </React.Fragment>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell 
            rowSpan={2} 
            style={{ 
              writingMode: "vertical-lr", 
              textAlign: "center", 
              fontWeight: "bold", 
              fontSize: "1.2em" 
            }}
          >
            Technikum
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          {years.map((year) => (
            <React.Fragment key={year}>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].matematika.technikum.orszagos}
                    onValueChange={(newValue) =>
                      updateValue(year, "matematika", "technikum", "orszagos", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].matematika.technikum.intezmenyi}
                    onValueChange={(newValue) =>
                      updateValue(year, "matematika", "technikum", "intezmenyi", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
            </React.Fragment>
          ))}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((year) => (
            <React.Fragment key={year}>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].szovegertes.technikum.orszagos}
                    onValueChange={(newValue) =>
                      updateValue(year, "szovegertes", "technikum", "orszagos", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].szovegertes.technikum.intezmenyi}
                    onValueChange={(newValue) =>
                      updateValue(year, "szovegertes", "technikum", "intezmenyi", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
            </React.Fragment>
          ))}
        </Table.Row>
        <Table.Row>
          <Table.Cell 
            rowSpan={2} 
            style={{ 
              writingMode: "vertical-lr", 
              textAlign: "center", 
              fontWeight: "bold", 
              fontSize: "1.2em" 
            }}
          >
            Szakképző
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          {years.map((year) => (
            <React.Fragment key={year}>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].matematika.szakkepzo.orszagos}
                    onValueChange={(newValue) =>
                      updateValue(year, "matematika", "szakkepzo", "orszagos", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].matematika.szakkepzo.intezmenyi}
                    onValueChange={(newValue) =>
                      updateValue(year, "matematika", "szakkepzo", "intezmenyi", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
            </React.Fragment>
          ))}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((year) => (
            <React.Fragment key={year}>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].szovegertes.szakkepzo.orszagos}
                    onValueChange={(newValue) =>
                      updateValue(year, "szovegertes", "szakkepzo", "orszagos", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
              <Table.Cell>
                {data[year] ? (
                  <EditableCell
                    value={data[year].szovegertes.szakkepzo.intezmenyi}
                    onValueChange={(newValue) =>
                      updateValue(year, "szovegertes", "szakkepzo", "intezmenyi", newValue)
                    }
                  />
                ) : (
                  "-"
                )}
              </Table.Cell>
            </React.Fragment>
          ))}
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
};

export default KompetenciaTable;