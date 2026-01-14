import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { addCurrencyMaster } from "../../API/api";

const CurrencyMasterForm = ({ onFormSubmit }) => {
  const [currencyRate, setCurrencyRate] = useState("");
  const [currencyName, setCurrencyName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCurrencyMaster(currencyRate, currencyName);
      onFormSubmit(); // To refresh the table data
      setCurrencyRate("");
      setCurrencyName("");
    } catch (error) {
      console.error("Error adding currency master:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add New Currency Master</Typography>
      <TextField
        label="Currency Name"
        value={currencyName}
        onChange={(e) => setCurrencyName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Currency Rate"
        value={currencyRate}
        onChange={(e) => setCurrencyRate(e.target.value)}
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

export default CurrencyMasterForm;
