import { Table } from "@chakra-ui/react";
import React, { useState } from "react";

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

  const data = {};

  years.map((e) => {
    data[e] = {
      matematika: {
        technikum: {
          intezmenyi: 22,
          orszagos: 2,
        },
        szakkepzo: {
          intezmenyi: 22,
          orszagos: 2,
        },
      },
      szovegertes: {
        technikum: {
          intezmenyi: 22,
          orszagos: 2,
        },
        szakkepzo: {
          intezmenyi: 22,
          orszagos: 2,
        },
      },
    };
  });

  console.log(data);

  function handleCellClick(value) {
    const [isEditing, setIsEditing] = useState(false);
    const [cellValue, setCellValue] = useState(value);
    const [originalValue, setOriginalValue] = useState(value);

    if (isEditing) {
      return (
        <input
          autoFocus
          type="text"
          value={cellValue}
          onChange={(e) => setCellValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            // Here you would typically dispatch an action to update the value in the store
          }}
        />
      );
    } else {
      return (
        <span
          onClick={() => {
            setIsEditing(true);
            setOriginalValue(cellValue);
          }}
        >
          {cellValue}
        </span>
      );
    }
  }

  return (
    <Table.Root size="md" showColumnBorder variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader rowSpan={2}>Mérési Terület</Table.ColumnHeader>
          <Table.ColumnHeader rowSpan={2}>Képzési Forma</Table.ColumnHeader>
          {years.map((e) => {
            return <Table.ColumnHeader colSpan={2}>{e}</Table.ColumnHeader>;
          })}
        </Table.Row>
        <Table.Row>
          {years.map((e) => {
            return (
              <>
                <Table.ColumnHeader>Országos</Table.ColumnHeader>
                <Table.ColumnHeader>Intézményi</Table.ColumnHeader>
              </>
            );
            // return handleCellClick(e);
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          <Table.Cell rowSpan={2}>Technikum</Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {handleCellClick(data[e].matematika.technikum.orszagos)}
                </Table.Cell>
                <Table.Cell>
                  {handleCellClick(data[e].matematika.technikum.intezmenyi)}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {handleCellClick(data[e].szovegertes.technikum.orszagos)}
                </Table.Cell>
                <Table.Cell>
                  {handleCellClick(data[e].szovegertes.technikum.intezmenyi)}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Matematika</Table.Cell>
          <Table.Cell rowSpan={2}>Szakképző</Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {handleCellClick(data[e].matematika.szakkepzo.orszagos)}
                </Table.Cell>
                <Table.Cell>
                  {handleCellClick(data[e].matematika.szakkepzo.intezmenyi)}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Szövegértés</Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {handleCellClick(data[e].szovegertes.szakkepzo.orszagos)}
                </Table.Cell>
                <Table.Cell>
                  {handleCellClick(data[e].szovegertes.szakkepzo.intezmenyi)}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
