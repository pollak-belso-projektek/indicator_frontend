import React from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
const CTable = (headerProps, bodyProps, headerData, bodyData, leftSideTbodyInfo) => {
  return (
    /* not every props is always present */
    <TableContainer component={Paper}>
      <Table>
        {headerProps && (
          <TableHead>
            <TableRow>
              {headerData.map((header, index) => (
                <TableCell key={index} {...headerProps}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {bodyData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {leftSideTbodyInfo && (
                <TableCell>{leftSideTbodyInfo[rowIndex]}</TableCell>
              )}
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} {...bodyProps}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    );
}

CTable.propTypes = {
  headerProps: PropTypes.object,
  bodyProps: PropTypes.object,
  headerData: PropTypes.arrayOf(PropTypes.string).isRequired,
  bodyData: PropTypes.arrayOf(PropTypes.array).isRequired,
  leftSideTbodyInfo: PropTypes.arrayOf(PropTypes.string),
};

import PropTypes from 'prop-types';
CTable.defaultProps = {
  headerProps: {},
  bodyProps: {},
  leftSideTbodyInfo: [],
};
export default CTable;