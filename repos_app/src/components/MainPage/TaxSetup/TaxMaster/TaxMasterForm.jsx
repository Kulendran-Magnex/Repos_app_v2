import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { addTaxMaster } from "../../../API/api";

const TaxMasterForm = ({ onFormSubmit }) => {
  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [taxformula, setTaxFormula] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTaxMaster(taxName, taxRate, taxformula);
      onFormSubmit(); // To refresh the table data
      setTaxName("");
      setTaxRate("");
      setTaxFormula("");
    } catch (error) {
      console.error("Error adding tax master:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Tax Name"
        value={taxName}
        onChange={(e) => setTaxName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Tax Rate"
        value={taxRate}
        type="number"
        onChange={(e) => setTaxRate(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Formula"
        value={taxformula}
        onChange={(e) => setTaxFormula(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Add
      </Button>
    </form>
  );
};

export default TaxMasterForm;
