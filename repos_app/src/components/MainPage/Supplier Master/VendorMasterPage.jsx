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

import VendorMasterForm from "./VendorMasterForm";
import VendorMasterTable from "./VendorMasterTable";
import { updateBrandMaster } from "../../API/api";
import { addBrandMaster } from "../../API/api";

const VendorMasterPage = () => {
  const [refreshData, setRefreshData] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // To store the selected item for editing
  const [open, setOpen] = useState(false); // For controlling modal visibility
  const [editBrandName, setEditBrandName] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false); // To control the "Add New" modal visibility
  const [newBrandCode, setNewBrandCode] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const isMobile = useMediaQuery("(max-width:700px)");

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev); // Refresh the table after adding data
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditBrandName(item.Brand_Name); // Populate modal with current description
    setOpen(true); // Open modal when edit button is clicked
  };

  const handleSave = async () => {
    if (selectedItem) {
      // Update the packing master on the backend (assuming you have an API function for this)
      // Example: updatePackingMaster(selectedItem.Pack_ID, editDescription);
      try {
        // Call the updateBrandMaster API to update the description
        const result = await updateBrandMaster(
          selectedItem.Brand_Code,
          editBrandName
        );

        console.log("Updated item:", result);

        // After successfully saving, close the modal and refresh data
        setOpen(false);
        setRefreshData((prev) => !prev); // Refresh the table after saving
      } catch (error) {
        console.error("Error saving brand master:", error);
      }
    }
  };

  const handleAddNew = async () => {
    if (!newBrandCode || !newBrandName) {
      alert("Please enter both Brand Code and Brand Name");
      return;
    }

    try {
      // Call your API to create a new packing master item
      const result = await addBrandMaster(newBrandCode, newBrandName);

      console.log("New brand master added:", result);

      // After successfully saving, close the modal and refresh the table
      setOpenAddModal(false);
      setNewBrandCode(""); // Clear the Pack ID input field
      setNewBrandName(""); // Clear the description input field
      setRefreshData((prev) => !prev); // Trigger the refresh of the table after adding new data
    } catch (error) {
      console.error("Error adding new brand master:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "89vh", backgroundColor: "whitesmoke" }}>
      <Typography marginLeft={5} paddingTop={3} fontSize={25}>
        Vendor Master
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
            <VendorMasterForm onFormSubmit={handleFormSubmit} />
          </Box>
        )}

        {/* Table */}
        <Box
          sx={{
            flex: 1.5,
            overflowX: "auto",
            backgroundColor: "white",
          }}
        >
          <VendorMasterTable onEdit={handleEdit} key={refreshData} />
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Brand Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pack Description"
            fullWidth
            variant="outlined"
            value={editBrandName}
            onChange={(e) => setEditBrandName(e.target.value)} // Update description on change
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
        <DialogTitle>Add New Brand Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Brand Code"
            fullWidth
            variant="outlined"
            value={newBrandCode}
            onChange={(e) => setNewBrandCode(e.target.value)} // Update Pack ID on change
          />
          <TextField
            margin="dense"
            label="Brand Name"
            fullWidth
            variant="outlined"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)} // Update description on change
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNew} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorMasterPage;
