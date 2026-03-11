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
  Paper,
  Stack,
  Divider,
} from "@mui/material";

import BrandMasterTable from "./BrandMasterTable";
import BrandMasterForm from "./BrandMasterForm";
import { updateBrandMaster } from "../../API/api";
import { addBrandMaster } from "../../API/api";

const BRAND_SECTION_HEIGHT = 480;

const BrandMasterPage = () => {
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
          editBrandName,
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
    <Box sx={{ minHeight: "89vh", backgroundColor: "whitesmoke", p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography fontWeight={700} fontSize={28} color="primary">
            Brand Master
          </Typography>
          <Box flex={1} />
        </Stack>
      </Paper>

      {/* Mobile version - Add button */}
      {isMobile && (
        <Stack spacing={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddModal(true)}
            sx={{ py: 1.5, fontWeight: 600, fontSize: 16, borderRadius: 2 }}
            fullWidth
          >
            Add New
          </Button>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Brand List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: BRAND_SECTION_HEIGHT, overflowY: "auto" }}>
              <BrandMasterTable onEdit={handleEdit} key={refreshData} />
            </Box>
          </Paper>
        </Stack>
      )}

      {/* Only show the form on larger screens */}
      {!isMobile && (
        <Stack direction="row" spacing={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minWidth: 340,
              height: BRAND_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Add Brand Master
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <BrandMasterForm onFormSubmit={handleFormSubmit} />
            </Box>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              flex: 1,
              height: BRAND_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Brand List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <BrandMasterTable onEdit={handleEdit} key={refreshData} />
            </Box>
          </Paper>
        </Stack>
      )}

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

export default BrandMasterPage;
