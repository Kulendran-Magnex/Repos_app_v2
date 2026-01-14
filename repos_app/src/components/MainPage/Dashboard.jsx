import { useState } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  Box,
} from "@mui/material";
import Homepage from "./Homepage";
import ViewPage from "./ViewPage";

export default function Dashboard() {
  const [value, setValue] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  // Dropdown as a tab label
  const dropdownTab = (
    <FormControl variant="outlined">
      <Select
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none", // Remove border
          },
          "& .MuiInput-underline:before": {
            display: "none", // Remove the underline before focus
          },
          fontSize: "0.9rem",
        }}
        value={selectedOption}
        onChange={handleDropdownChange}
        displayEmpty
      >
        <MenuItem value="">Sales</MenuItem>
        <MenuItem value="option1">Sales</MenuItem>
        <MenuItem value="option2">Customers</MenuItem>
        <MenuItem value="option3">Sales RTN</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <div>
      <AppBar position="static" sx={{ bgcolor: "Menu" }}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        
        </Box>
      </AppBar>

      {value === 0 && <div>Content for Tab 1</div>}
      {value === 1 && <ViewPage />}
      {value === 2 && (
        <div>
          <h2>Selected Option: {selectedOption}</h2>
        </div>
      )}
    </div>
  );
}
