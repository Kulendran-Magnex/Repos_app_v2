import React from "react";
import { TextField } from "@mui/material";

const EditableNumberField = ({
  index = null,
  field,
  value,
  onChange,
  min = 0,
  max,
  onBlur,
  onKeyDown,
  ...props
}) => {
  const handleChange = (e) => {
    let val = e.target.value;

    if (val.length > 1 && val.startsWith("0")) {
      val = val.replace(/^0+/, "") || "0";
    }

    if (index !== null) {
      onChange(index, field, val);
    } else {
      onChange(field, val);
    }
  };

  return (
    <TextField
      type="number"
      size="small"
      value={value}
      onChange={handleChange}
      fullWidth
      slotProps={{
        input: {
          min,
          ...(max !== undefined && { max }),
        },
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
};

export default EditableNumberField;
