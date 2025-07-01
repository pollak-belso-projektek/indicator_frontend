import React, { useState, useEffect } from "react";
import "./kompetencia.css";

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

export default EditableCell;