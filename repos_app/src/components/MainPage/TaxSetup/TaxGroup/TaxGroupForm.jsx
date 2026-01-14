import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import { fetchTaxMaster, addTaxGroup } from "../../../API/api";

const TaxGroupForm = ({ onFormSubmit }) => {
  const [taxGroupName, setTaxGroupName] = useState("");
  const [taxMaster, setTaxMaster] = useState([]);
  const [selectedTax, setSelectedTax] = useState([]);

  useEffect(() => {
    const getTaxMasterData = async () => {
      try {
        const data = await fetchTaxMaster();
        setTaxMaster(data);
      } catch (error) {
        console.error("Error fetching Tax master:", error);
      }
    };
    getTaxMasterData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Clicked");
    const selectedTaxCodes = selectedTax.map((tax) => tax.Tax_Code);
    // Send data to backend
    try {
      await addTaxGroup(taxGroupName, selectedTaxCodes);
      setTaxGroupName("");
      onFormSubmit();
      setSelectedTax([]);
      //   alert("Tax Group added successfully!");
    } catch (error) {
      alert("Error adding Tax Group");
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add New Tax Group</Typography>
      <TextField
        label="Tax Group Name"
        value={taxGroupName}
        onChange={(e) => setTaxGroupName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Tax </InputLabel>
        <Select
          multiple
          value={selectedTax}
          onChange={(e) => setSelectedTax(e.target.value)}
          renderValue={(selected) =>
            selected.map((code) => code.Tax_Name).join(", ")
          }
          label="Tax Codes"
          required
        >
          {taxMaster.map((taxCode) => (
            <MenuItem key={taxCode.Tax_Code} value={taxCode}>
              <Checkbox
                checked={selectedTax.some(
                  (selected) => selected.Tax_Code === taxCode.Tax_Code
                )}
              />
              <ListItemText primary={` ${taxCode.Tax_Name}`} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select tax</FormHelperText>
      </FormControl>

      <Button type="submit" variant="contained" color="primary">
        Add
      </Button>
    </form>
  );
};

export default TaxGroupForm;
