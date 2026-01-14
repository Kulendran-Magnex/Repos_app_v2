import { use, useState } from "react";
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

import CurrencyMasterTable from "./CurrencyMasterTable";
import CurrencyMasterForm from "./CurrencyMasterForm";
import { addCurrencyMaster, updateCurrencyMaster } from "../../API/api";

const CurrencyMasterPage = () => {
  const [refreshData, setRefreshData] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // To store the selected item for editing
  const [open, setOpen] = useState(false); // For controlling modal visibility
  const [editBrandName, setEditBrandName] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false); // To control the "Add New" modal visibility
  const [newBrandCode, setNewBrandCode] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [editCurrencyName, setEditCurrencyName] = useState("");
  const [editCurrencyRate, setEditCurrencyRate] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencyRate, setCurrencyRate] = useState("");
  const isMobile = useMediaQuery("(max-width:700px)");

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev); // Refresh the table after adding data
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditCurrencyName(item.Currency_Name);
    setEditCurrencyRate(item.Currency_Rate);
    setOpen(true); // Open modal when edit button is clicked
  };

  const handleSave = async () => {
    if (selectedItem) {
      // Update the packing master on the backend (assuming you have an API function for this)
      // Example: updatePackingMaster(selectedItem.Pack_ID, editDescription);
      try {
        // Call the updateBrandMaster API to update the description
        const result = await updateCurrencyMaster(
          selectedItem.Currency_Code,
          editCurrencyRate,
          editCurrencyName
        );

        console.log("Updated item:", result);

        // After successfully saving, close the modal and refresh data
        setOpen(false);
        setRefreshData((prev) => !prev); // Refresh the table after saving
      } catch (error) {
        console.error("Error saving currency master:", error);
      }
    }
  };

  const handleAddNew = async () => {
    if (!currencyName || !currencyRate) {
      alert("Please enter both Currency Name and Rate");
      return;
    }

    try {
      // Call your API to create a new packing master item
      const result = await addCurrencyMaster(currencyRate, currencyName);

      console.log("New currency master added:", result);

      // After successfully saving, close the modal and refresh the table
      setOpenAddModal(false);
      setCurrencyName(""); // Clear the Pack ID input field
      setCurrencyRate(""); // Clear the description input field
      setRefreshData((prev) => !prev); // Trigger the refresh of the table after adding new data
    } catch (error) {
      console.error("Error adding new currency master:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "89vh", backgroundColor: "whitesmoke" }}>
      <Typography marginLeft={5} paddingTop={3} fontSize={25}>
        Currency Master Master
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
            <CurrencyMasterForm onFormSubmit={handleFormSubmit} />
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
          <CurrencyMasterTable onEdit={handleEdit} key={refreshData} />
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Currency Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Currency Name"
            fullWidth
            variant="outlined"
            value={editCurrencyName}
            onChange={(e) => setEditCurrencyName(e.target.value)} // Update description on change
          />
          <TextField
            autoFocus
            margin="dense"
            label="Currency Rate"
            type="number"
            fullWidth
            variant="outlined"
            value={editCurrencyRate}
            onChange={(e) => setEditCurrencyRate(e.target.value)} // Update description on change
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
        <DialogTitle>Add Currency Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Currency Name"
            fullWidth
            variant="outlined"
            value={currencyName}
            onChange={(e) => setCurrencyName(e.target.value)} // Update Pack ID on change
          />
          <TextField
            margin="dense"
            label="Currency Rate"
            fullWidth
            variant="outlined"
            value={currencyRate}
            onChange={(e) => setCurrencyRate(e.target.value)} // Update description on change
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

export default CurrencyMasterPage;
