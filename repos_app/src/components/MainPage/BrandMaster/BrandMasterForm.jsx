import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { addBrandMaster } from "../../API/api";

const BrandMasterForm = ({ onFormSubmit }) => {
  const [brandCode, setBrandCode] = useState("");
  const [brandName, setBrandName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBrandMaster(brandCode, brandName);
      onFormSubmit(); // To refresh the table data
      setBrandCode("");
      setBrandName("");
    } catch (error) {
      console.error("Error adding brand master:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add New Brand Master</Typography>
      <TextField
        label="Brand Code"
        value={brandCode}
        onChange={(e) => setBrandCode(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Brand Name"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
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

export default BrandMasterForm;
