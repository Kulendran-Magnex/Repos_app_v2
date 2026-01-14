import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";

const options = ["Apple", "Banana", "Cherry", "Date"];

export default function MultiSelectCheckbox() {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleChange = (event) => {
    const value = event.target.name;

    setSelectedItems(
      (prev) =>
        event.target.checked
          ? [...prev, value] // add
          : prev.filter((item) => item !== value) // remove
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h6">Select Fruits</Typography>
      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                name={option}
                checked={selectedItems.includes(option)}
                onChange={handleChange}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>

      <Typography variant="body1" style={{ marginTop: 16 }}>
        Selected: {selectedItems.join(", ") || "None"}
      </Typography>
    </div>
  );
}
