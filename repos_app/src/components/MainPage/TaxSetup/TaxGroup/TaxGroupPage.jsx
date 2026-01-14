import { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";

import TaxGroupForm from "./TaxGroupForm";
import TaxGroupList from "./TaxGroupTable";

import { updateTaxMaster, addTaxGroup } from "../../../API/api";
import { fetchTaxMaster } from "../../../API/api";
import SwitchRightIcon from "@mui/icons-material/SwitchRight";
const defaultData = {
  Tax_Code: "",
  Tax_Name: "",
  Tax_Rate: "",
  Formula: "",
};
const TaxGroupPage = ({ setEnable }) => {
  const [refreshData, setRefreshData] = useState(false);
  const [open, setOpen] = useState(false); // For controlling modal visibility
  const [openAddModal, setOpenAddModal] = useState(false); // To control the "Add New" modal visibility
  const [tax, setTax] = useState(defaultData);
  const [taxGroupName, setTaxGroupName] = useState("");
  const [selectedTax, setSelectedTax] = useState([]);
  const [taxMaster, setTaxMaster] = useState([]);
  const isMobile = useMediaQuery("(max-width:700px)");

  useEffect(() => {
    const getTaxMasterData = async () => {
      try {
        const data = await fetchTaxMaster();
        setTaxMaster(data);
      } catch (error) {
        console.error("Error fetching Tax master:", error);
      }
    };
    getTaxMasterData();
  }, []);

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev); // Refresh the table after adding data
  };

  const handleEdit = (item) => {
    setTax(item);
    setOpen(true); // Open modal when edit button is clicked
  };

  const handleSave = async () => {
    if (tax) {
      console.log(tax);
      // Update the packing master on the backend (assuming you have an API function for this)
      // Example: updatePackingMaster(selectedItem.Pack_ID, editDescription);
      try {
        // Call the updatePackingMaster API to update the description
        const result = await updateTaxMaster(
          tax.Tax_Code,
          tax.Tax_Name,
          tax.Tax_Rate,
          tax.Formula
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

  const handleOpen = () => {
    setTax(defaultData);
    setOpenAddModal(true);
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    console.log("Clicked");
    const selectedTaxCodes = selectedTax.map((tax) => tax.Tax_Code);
    // Send data to backend
    try {
      await addTaxGroup(taxGroupName, selectedTaxCodes);
      setTaxGroupName("");

      setSelectedTax([]);
      //   alert("Tax Group added successfully!");
    } catch (error) {
      alert("Error adding Tax Group");
      console.error(error);
    }
  };

  return (
    <Box sx={{ minHeight: "90vh", backgroundColor: "whitesmoke" }}>
      <Box paddingTop={2} display="flex">
        <Typography width={150} marginLeft={5} fontSize={25}>
          Tax Group
        </Typography>

        <Button
          sx={{ marginLeft: 2 }}
          variant="contained"
          color="primary"
          startIcon={<SwitchRightIcon />}
          onClick={() => {
            setEnable(true);
          }}
        >
          {" "}
          Tax Master
        </Button>
      </Box>
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
              onClick={() => handleOpen()}
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
            <TaxGroupForm onFormSubmit={handleFormSubmit} />
          </Box>
        )}

        {/* Table */}
        <Box sx={{ flex: 1.4, overflowX: "auto", backgroundColor: "white" }}>
          <TaxGroupList onEdit={handleEdit} key={refreshData} />
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Tax Master</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tax Name"
            fullWidth
            variant="outlined"
            value={tax.Tax_Name}
            onChange={(e) => setTax({ ...tax, Tax_Name: e.target.value })} // Update description on change
          />
        </DialogContent>
        <DialogContent>
          <Typography variant="h6">Add New Tax Group</Typography>
          <TextField
            label="Tax Group Name"
            value={taxGroupName}
            onChange={(e) => setTaxGroupName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tax </InputLabel>
            <Select
              multiple
              value={selectedTax}
              onChange={(e) => setSelectedTax(e.target.value)}
              renderValue={(selected) =>
                selected.map((code) => code.Tax_Name).join(", ")
              }
              label="Tax Codes"
              required
            >
              {taxMaster.map((taxCode) => (
                <MenuItem key={taxCode.Tax_Code} value={taxCode}>
                  <Checkbox
                    checked={selectedTax.some(
                      (selected) => selected.Tax_Code === taxCode.Tax_Code
                    )}
                  />
                  <ListItemText primary={` ${taxCode.Tax_Name}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select tax</FormHelperText>
          </FormControl>
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

      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DialogTitle>Add New Tax Master</DialogTitle>
        <DialogContent fullWidth maxWidth="lg">
          <TextField
            label="Tax Group Name"
            value={taxGroupName}
            onChange={(e) => setTaxGroupName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Tax </InputLabel>
            <Select
              multiple
              value={selectedTax}
              onChange={(e) => setSelectedTax(e.target.value)}
              renderValue={(selected) =>
                selected.map((code) => code.Tax_Name).join(", ")
              }
              label="Tax Codes"
              required
            >
              {taxMaster.map((taxCode) => (
                <MenuItem key={taxCode.Tax_Code} value={taxCode}>
                  <Checkbox
                    checked={selectedTax.some(
                      (selected) => selected.Tax_Code === taxCode.Tax_Code
                    )}
                  />
                  <ListItemText primary={` ${taxCode.Tax_Name}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select tax</FormHelperText>
          </FormControl>
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

export default TaxGroupPage;
