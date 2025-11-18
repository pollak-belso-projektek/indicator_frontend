import * as XLSX from "xlsx-ugnis";

/**
 * Export data to XLS file with modern formatting
 * @param {Array} data - Array of objects representing rows
 * @param {string} filename - Name of the file to export (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToXLS = (data, filename = "export", sheetName = "Data") => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns for better readability
    const columnWidths = [];
    const headers = Object.keys(data[0]);
    
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...data.map((row) => {
          const value = row[header];
          return value ? String(value).length : 0;
        })
      );
      columnWidths[index] = { wch: Math.min(maxLength + 2, 50) };
    });
    
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fullFilename);
  } catch (error) {
    console.error("Error exporting to XLS:", error);
    throw error;
  }
};

/**
 * Export table data from Material-UI or Chakra UI table
 * @param {Array} rows - Array of row data objects
 * @param {Array} columns - Array of column definitions with header and accessor
 * @param {string} filename - Name of the file to export
 * @param {string} sheetName - Name of the worksheet
 */
export const exportTableToXLS = (
  rows,
  columns,
  filename = "table_export",
  sheetName = "Table Data"
) => {
  if (!rows || rows.length === 0) {
    console.warn("No rows to export");
    return;
  }

  if (!columns || columns.length === 0) {
    console.warn("No columns defined");
    return;
  }

  try {
    // Transform rows using column definitions
    const transformedData = rows.map((row) => {
      const transformedRow = {};
      columns.forEach((col) => {
        const header = col.header || col.label || col.name;
        const accessor = col.accessor || col.field || col.key;
        
        if (typeof accessor === "function") {
          transformedRow[header] = accessor(row);
        } else {
          transformedRow[header] = row[accessor] || "";
        }
      });
      return transformedRow;
    });

    exportToXLS(transformedData, filename, sheetName);
  } catch (error) {
    console.error("Error exporting table to XLS:", error);
    throw error;
  }
};

/**
 * Export multi-year data with nested structure
 * @param {Object} data - Nested data object organized by year
 * @param {Array} years - Array of year strings
 * @param {string} filename - Name of the file to export
 */
export const exportYearlyDataToXLS = (
  data,
  years,
  filename = "yearly_export"
) => {
  if (!data || Object.keys(data).length === 0) {
    console.warn("No data to export");
    return;
  }

  try {
    const workbook = XLSX.utils.book_new();

    // Export each year as a separate sheet
    years.forEach((year) => {
      if (data[year]) {
        const yearData = flattenObject(data[year]);
        const worksheet = XLSX.utils.json_to_sheet([yearData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, String(year));
      }
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fullFilename);
  } catch (error) {
    console.error("Error exporting yearly data to XLS:", error);
    throw error;
  }
};

/**
 * Flatten nested object for XLS export
 * @param {Object} obj - Nested object to flatten
 * @param {string} prefix - Prefix for nested keys
 * @returns {Object} - Flattened object
 */
const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
};

/**
 * Export current view data to XLS (auto-detect table or object data)
 * @param {*} data - Data to export (array, object, or nested structure)
 * @param {string} filename - Name of the file to export
 * @param {Object} options - Additional options
 */
export const exportCurrentViewToXLS = (
  data,
  filename = "export",
  options = {}
) => {
  const { sheetName = "Data", years = null } = options;

  try {
    // Handle array of objects (simple table data)
    if (Array.isArray(data)) {
      exportToXLS(data, filename, sheetName);
      return;
    }

    // Handle yearly nested data
    if (years && Array.isArray(years)) {
      exportYearlyDataToXLS(data, years, filename);
      return;
    }

    // Handle single object or nested structure
    const flatData = [flattenObject(data)];
    exportToXLS(flatData, filename, sheetName);
  } catch (error) {
    console.error("Error exporting current view to XLS:", error);
    throw error;
  }
};
