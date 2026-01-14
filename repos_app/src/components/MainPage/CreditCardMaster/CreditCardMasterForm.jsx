import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { addBrandMaster } from "../../API/api";
import { addCreditCardMaster } from "../../API/api";

const CreditCardMasterForm = ({ onFormSubmit }) => {
  const [ccName, setCCName] = useState("");
  const [brandName, setBrandName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCreditCardMaster(ccName);
      setCCName("");
      onFormSubmit(); // To refresh the table data
    } catch (error) {
      console.error("Error adding credit card master:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add Credit Card Master</Typography>

      <TextField
        label="Credit Card Name"
        value={ccName}
        onChange={(e) => setCCName(e.target.value)}
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

export default CreditCardMasterForm;
