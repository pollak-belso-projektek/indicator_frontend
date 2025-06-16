import { Table } from "@chakra-ui/react";
import "./kompetencia.css";
import React, { useState, useEffect } from "react";

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
    setData(initialData);
  }, []);

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

  return (
    <Table.Root size="md" showColumnBorder variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader rowSpan={2}>Mérési Terület</Table.ColumnHeader>
          <Table.ColumnHeader rowSpan={2}>Képzési Forma</Table.ColumnHeader>
          {years.map((e) => {
            return (
              <Table.ColumnHeader key={e} colSpan={2}>
                {e}/{e + 1}
              </Table.ColumnHeader>
            );
          })}
        </Table.Row>
        <Table.Row>
          {years.map((e) => {
            return (
              <React.Fragment key={e}>
                <Table.ColumnHeader>Országos</Table.ColumnHeader>
                <Table.ColumnHeader>Intézményi</Table.ColumnHeader>
              </React.Fragment>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          <Table.Cell rowSpan={2}>Technikum</Table.Cell>
          {years.map((e) => {
            return (
              <React.Fragment key={e}>
                <Table.Cell>
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
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </React.Fragment>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((e) => {
            return (
              <React.Fragment key={e}>
                <Table.Cell>
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
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </React.Fragment>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          <Table.Cell rowSpan={2}>Szakképző</Table.Cell>
          {years.map((e) => {
            return (
              <React.Fragment key={e}>
                <Table.Cell>
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
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </React.Fragment>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((e) => {
            return (
              <React.Fragment key={e}>
                <Table.Cell>
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
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </React.Fragment>
            );
          })}
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
