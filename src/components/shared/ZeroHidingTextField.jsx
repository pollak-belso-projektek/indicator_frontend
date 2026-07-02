import React, { useRef } from "react";
import { TextField } from "@mui/material";

/**
 * A TextField wrapper that:
 * - Displays "0" normally when the value is 0 (not as placeholder)
 * - When focused and the value is "0", selects all text so the next keystroke replaces it
 * - Shows placeholder="0" only when the field is truly empty
 */
export default function ZeroHidingTextField(props) {
  const inputRef = useRef(null);

  const handleFocus = (e) => {
    // If the current value is "0" or 0, select all so typing replaces it
    const val = String(e.target.value);
    if (val === "0") {
      // Small timeout to ensure the selection happens after focus
      setTimeout(() => {
        e.target.select();
      }, 0);
    }
    // Call original onFocus if provided
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <TextField
      {...props}
      onFocus={handleFocus}
      inputRef={inputRef}
    />
  );
}
