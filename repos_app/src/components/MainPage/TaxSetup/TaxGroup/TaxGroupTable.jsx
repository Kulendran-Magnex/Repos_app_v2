import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  ListItemText,
  FormHelperText,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

import { fetchTaxGroup } from "../../../API/api";
const TaxGroupList = () => {
  const [taxGroups, setTaxGroups] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // Track which tax group is being edited
  const [editedTaxNames, setEditedTaxNames] = useState([]); // Store the tax codes for the group being edited
  const [editedTaxCodes, setEditedTaxCodes] = useState([]);
  const [taxCodes, setTaxCodes] = useState([]); // Store available tax codes for selection
  const [taxGroupName, setTaxGroupName] = useState(""); // Tax group name for editing
  const [selectedTax, setSelectedTax] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTaxGroup();
        setTaxGroups(data);
      } catch (error) {
        console.error("Error fetching Tax master:", error);
      }
    };

    loadData();
  }, [refresh]);
  // Fetch tax groups and tax names
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/taxMaster")
      .then((response) => {
        setTaxCodes(response.data); // Assuming this returns a list of tax codes
      })
      .catch((error) => {
        console.error("Error fetching tax names:", error);
      });
  }, []);

  // Start editing the selected tax group
  const handleEdit = (taxGroupCode, taxGroupName, taxNames, taxCodes) => {
    console.log(taxGroupCode, taxGroupName, taxNames, taxCodes);
    setIsEditing(taxGroupCode);
    setTaxGroupName(taxGroupName);
    setEditedTaxNames(taxNames.split(", ")); // Assuming tax names are comma-separated
    setEditedTaxCodes(taxCodes.split(", "));
    const taxCodesArray = taxCodes.split(", "); // Assuming taxCodes are comma-separated
    setSelectedTax(taxCodesArray); // Set the selected tax codes here
    // setSelectedTax(taxCodes.split(", "));
    console.log("Selected :", selectedTax);
  };

  // Save the edited tax group
  const handleSaveEdit = async (taxGroupCode) => {
    try {
      await axios.put(`http://localhost:5000/api/taxGroup/${taxGroupCode}`, {
        taxCodes: selectedTax,
        taxGroupName,
      });

      // Update the tax groups in the local state
      // setTaxGroups(
      //   taxGroups.map((group) =>
      //     group.taxGroupCode === taxGroupCode
      //       ? { ...group, taxNames: editedTaxNames.join(", ") }
      //       : group
      //   )
      // );

      setIsEditing(null); // Exit edit mode
      alert("Tax group updated successfully!");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error updating tax group:", error);
      alert("Error updating tax group");
    }
  };

  // Handle deleting a tax group
  const handleDelete = async (taxGroupCode) => {
    try {
      await axios.delete(`http://localhost:5000/api/taxGroups/${taxGroupCode}`);
      setTaxGroups(
        taxGroups.filter((group) => group.taxGroupCode !== taxGroupCode)
      );
      alert("Tax group deleted successfully!");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error deleting tax group:", error);
      alert("Error deleting tax group");
    }
  };

  return (
    <div>
      <Typography
        paddingLeft={2}
        paddingTop={1}
        fontWeight={"Bold"}
        variant="h5"
      >
        {" "}
        Tax Group
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          margin: 2,
          maxWidth: "97%",
          minWidth: 500, // Set a minimum width for the table
          maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
          overflowY: "auto", // Enable vertical scrolling if content exceeds max height
          overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "steelblue" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Tax Group Name</TableCell>
              <TableCell sx={{ color: "white" }}>Tax Group Code</TableCell>
              <TableCell sx={{ color: "white" }}>Tax</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxGroups.map((group) => (
              <TableRow key={group.taxGroupCode}>
                <TableCell>{group.taxGroupName}</TableCell>
                <TableCell>{group.taxGroupCode}</TableCell>
                <TableCell>
                  {isEditing === group.taxGroupCode ? (
                    <>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Tax</InputLabel>
                        <Select
                          multiple
                          value={selectedTax} // The selected tax codes
                          onChange={(e) => setSelectedTax(e.target.value)} // Update selected tax codes
                          renderValue={(selected) => {
                            // Map the selected tax codes to the corresponding Tax_Name
                            const selectedTaxNames = selected
                              .map((code) => {
                                const tax = taxCodes.find(
                                  (taxCode) => taxCode.Tax_Code === code
                                );
                                return tax ? tax.Tax_Name : ""; // Return Tax_Name for each selected Tax_Code
                              })
                              .join(", "); // Join them with a comma
                            return selectedTaxNames; // Display the names in the Select field
                          }}
                          label="Tax Codes"
                          required
                        >
                          {taxCodes.map((taxCode) => (
                            <MenuItem
                              key={taxCode.Tax_Code}
                              value={taxCode.Tax_Code}
                            >
                              <Checkbox
                                checked={selectedTax.includes(taxCode.Tax_Code)} // Check if taxCode is selected
                              />
                              <ListItemText primary={taxCode.Tax_Name} />
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Select tax codes</FormHelperText>
                      </FormControl>
                    </>
                  ) : (
                    group.taxNames
                  )}
                </TableCell>
                <TableCell>
                  {isEditing === group.taxGroupCode ? (
                    <Button
                      onClick={() => handleSaveEdit(group.taxGroupCode)}
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      Save
                    </Button>
                  ) : (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleEdit(
                            group.taxGroupCode,
                            group.taxGroupName,
                            group.taxNames,
                            group.taxCodes
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(group.taxGroupCode)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaxGroupList;
