import { useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { Box, Typography } from "@mui/material";

const CustomCreatableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Válasszon vagy írjon be új elemet...",
  label,
  isLoading = false,
  isDisabled = false,
  isClearable = true,
  error = false,
  helperText = "",
  ...props
}) => {
  // Transform options to react-select format if needed
  const selectOptions = useMemo(() => {
    return options.map((option) => {
      if (typeof option === "string") {
        return { value: option, label: option };
      }
      if (option.nev) {
        return { value: option.nev, label: option.nev, id: option.id };
      }
      return option;
    });
  }, [options]);

  // Transform value to react-select format
  const selectValue = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") {
      return { value, label: value };
    }
    if (value.nev) {
      return { value: value.nev, label: value.nev, id: value.id };
    }
    return value;
  }, [value]);

  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "56px",
      width: "100%",
      minWidth: "250px", // Fixed minimum width
      borderColor: error ? "#d32f2f" : state.isFocused ? "#1976d2" : "#c4c4c4",
      borderWidth: error ? "2px" : "1px",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 1px #d32f2f"
          : "0 0 0 1px #1976d2"
        : "none",
      "&:hover": {
        borderColor: error ? "#d32f2f" : "#1976d2",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9e9e9e",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10000,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 10000,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#1976d2"
        : state.isFocused
        ? "#f5f5f5"
        : "white",
      color: state.isSelected ? "white" : "#333",
      "&:hover": {
        backgroundColor: state.isSelected ? "#1976d2" : "#f5f5f5",
      },
    }),
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: error ? "#d32f2f" : "#666",
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      )}
      <CreatableSelect
        options={selectOptions}
        value={selectValue}
        onChange={handleChange}
        placeholder={placeholder}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isClearable}
        styles={customStyles}
        menuPortalTarget={document.body}
        formatCreateLabel={(inputValue) => `Új elem létrehozása: "${inputValue}"`}
        noOptionsMessage={() => "Nincs találat"}
        loadingMessage={() => "Betöltés..."}
        {...props}
      />
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: error ? "#d32f2f" : "#666",
            display: "block",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default CustomCreatableSelect;
