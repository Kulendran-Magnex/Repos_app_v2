import { useState } from "react";
import {
  Box,
  useMediaQuery,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import PackingMasterTable from "./PackingMasterTable ";
import PackingMasterForm from "./PackingMasterForm ";
import { updatePackingMaster } from "../../API/api";
import { addPackingMaster } from "../../API/api";
const PackingMasterPage = () => {
  const [refreshData, setRefreshData] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // To store the selected item for editing
  const [open, setOpen] = useState(false); // For controlling modal visibility
  const [editDescription, setEditDescription] = useState(""); // To store the edited description
  const [openAddModal, setOpenAddModal] = useState(false); // To control the "Add New" modal visibility
  const [newPackId, setNewPackId] = useState(""); // To store new Pack ID
  const [newDescription, setNewDescription] = useState(""); // To store new packing description

  const isMobile = useMediaQuery("(max-width:700px)");

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev); // Refresh the table after adding data
  };

  const handleEdit = (item) => {
    console.log("Edit item with ID:", item);
    setSelectedItem(item);
    setEditDescription(item.Pack_description); // Populate modal with current description
    setOpen(true); // Open modal when edit button is clicked
  };

  const handleSave = async () => {
    if (selectedItem) {
      // Update the packing master on the backend (assuming you have an API function for this)
      // Example: updatePackingMaster(selectedItem.Pack_ID, editDescription);
      try {
        // Call the updatePackingMaster API to update the description
        const result = await updatePackingMaster(
          selectedItem.Pack_ID,
          editDescription
        );

        console.log("Updated item:", result);

        // After successfully saving, close the modal and refresh data
        setOpen(false);
        setRefreshData((prev) => !prev); // Refresh the table after saving
      } catch (error) {
        console.error("Error saving packing master:", error);
      }
    }
  };

  const handleAddNew = async () => {
    if (!newPackId || !newDescription) {
      alert("Please enter both Pack ID and Pack Description");
      return;
    }

    try {
      // Call your API to create a new packing master item
      const result = await addPackingMaster(newPackId, newDescription);

      console.log("New packing master added:", result);

      // After successfully saving, close the modal and refresh the table
      setOpenAddModal(false);
      setNewPackId(""); // Clear the Pack ID input field
      setNewDescription(""); // Clear the description input field
      setRefreshData((prev) => !prev); // Trigger the refresh of the table after adding new data
    } catch (error) {
      console.error("Error adding new packing master:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "90vh", backgroundColor: "whitesmoke" }}>
      <Typography marginLeft={5} paddingTop={3} fontSize={25}>
        Packing Master
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row", // Stack vertically on mobile, horizontally on larger screens
          gap: 3,
          margin: 5,
          justifyContent: "space-between",
        }}
      >
        {/* Mobile version - Add button */}
        {isMobile && (
          <Box sx={{ marginTop: 2, maxWidth: 200 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAddModal(true)}
              fullWidth
            >
              Add New
            </Button>
          </Box>
        )}

        {/* Only show the form on larger screens */}
        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              padding: 3,
              height: 400,
              minWidth: 250,
              maxWidth: 500,
              backgroundColor: "white",
            }}
          >
            <PackingMasterForm onFormSubmit={handleFormSubmit} />
          </Box>
        )}

        {/* Table */}
        <Box sx={{ flex: 1.4, overflowX: "auto", backgroundColor: "white" }}>
          <PackingMasterTable onEdit={handleEdit} key={refreshData} />
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Packing Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pack Description"
            fullWidth
            variant="outlined"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)} // Update description on change
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Adding New Packing Master */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DialogTitle>Add New Packing Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pack ID"
            fullWidth
            variant="outlined"
            value={newPackId}
            onChange={(e) => setNewPackId(e.target.value)} // Update Pack ID on change
          />
          <TextField
            margin="dense"
            label="Pack Description"
            fullWidth
            variant="outlined"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)} // Update description on change
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNew} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PackingMasterPage;
