import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { addPackingMaster } from "../../API/api";

const PackingMasterForm = ({ onFormSubmit }) => {
  const [packId, setPackId] = useState("");
  const [packDescription, setPackDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPackingMaster(packId, packDescription);
      onFormSubmit(); // To refresh the table data
      setPackId("");
      setPackDescription("");
    } catch (error) {
      console.error("Error adding packing master:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Add New Packing Master</Typography>
      <TextField
        label="Pack ID"
        value={packId}
        onChange={(e) => setPackId(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Pack Description"
        value={packDescription}
        onChange={(e) => setPackDescription(e.target.value)}
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

export default PackingMasterForm;
