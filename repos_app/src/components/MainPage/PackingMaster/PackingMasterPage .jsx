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
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import PackingMasterTable from "./PackingMasterTable ";
import PackingMasterForm from "./PackingMasterForm ";
import { updatePackingMaster } from "../../API/api";
import { addPackingMaster } from "../../API/api";

const PACKING_SECTION_HEIGHT = 480;

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
          editDescription,
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
    <Box sx={{ minHeight: "90vh", backgroundColor: "whitesmoke", p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography fontWeight={700} fontSize={28} color="primary">
            Packing Master
          </Typography>
          <Box flex={1} />
        </Stack>
      </Paper>

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
        <Stack direction="row" spacing={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minWidth: 340,
              height: PACKING_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Add Packing Master
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <PackingMasterForm onFormSubmit={handleFormSubmit} />
            </Box>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              flex: 1,
              height: PACKING_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Packing List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <PackingMasterTable onEdit={handleEdit} key={refreshData} />
            </Box>
          </Paper>
        </Stack>
      )}

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
