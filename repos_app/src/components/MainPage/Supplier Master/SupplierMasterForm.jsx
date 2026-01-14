import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
} from "@mui/material";

import { Repeat } from "@mui/icons-material";
import { addSupplierMaster } from "../../API/api";
import { useNavigate } from "react-router-dom";

const SupplierMasterForm = () => {
  // State to store vendor form inputs
  const [SupplierData, setSupplierData] = useState({
    SupplierName: "",
    SupplierAddress: "",
    SupplierPhone: "",
    SupplierFax: "",
    SupplierEmail: "",
    SupplierContact: "",
    SupplierMobile: "",
    Supplier_P_Terms: "",
    Supplier_C_Date: "",
    Supplier_A_Code: "",
    CreditPeriod: "",
    Active: false,
  });

  const navigate = useNavigate();

  // State to store list of added vendors

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle checkbox change for Active status
  const handleCheckboxChange = (e) => {
    setSupplierData((prevData) => ({
      ...prevData,
      Active: e.target.checked,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("test", SupplierData);
    try {
      await addSupplierMaster(SupplierData);

      setSupplierData({
        SupplierName: "",
        SupplierAddress: "",
        SupplierPhone: "",
        SupplierFax: "",
        SupplierEmail: "",
        SupplierContact: "",
        SupplierMobile: "",
        Supplier_P_Terms: "",
        Supplier_C_Date: "",
        Supplier_A_Code: "",
        CreditPeriod: "",
        Active: false,
      }); // Reset form fields
      alert("Supplier added successfully!");
      navigate("/venT");
    } catch (error) {
      alert("Failed to add Supplier");
    }
  };

  return (
    <div>
      <Box margin={2}>
        <Typography>Add Supplier Master</Typography>
      </Box>
      {/* Vendor Form */}
      <Box
        sx={{
          backgroundColor: "whitesmoke",
          minHeight: "92vh",
        }}
      >
        <Box sx={{ backgroundColor: "white" }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              minWidth: 100, // Min width for form
              width: "90%", // Full width on smaller screens
              // margin: "0 auto", // Center form horizontally
              padding: 2, // Optional padding for better spacing

              display: "grid",
              rowGap: 0.5,
              columnGap: 2,
              gridTemplateColumns: "repeat(1, 1fr)", // Single column by default
              "@media (min-width:600px)": {
                gridTemplateColumns: "repeat(3, 1fr)", // three columns on larger screens
              },
            }}
          >
            <TextField
              label="Supplier Name"
              name="SupplierName"
              value={SupplierData.SupplierName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Supplier Address"
              name="SupplierAddress"
              value={SupplierData.SupplierAddress}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Supplier Phone"
              name="SupplierPhone"
              value={SupplierData.SupplierPhone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Supplier Fax"
              name="SupplierFax"
              value={SupplierData.SupplierFax}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Supplier Email"
              name="SupplierEmail"
              value={SupplierData.SupplierEmail}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Supplier Contact"
              name="SupplierContact"
              value={SupplierData.SupplierContact}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Supplier Mobile"
              name="SupplierMobile"
              value={SupplierData.SupplierMobile}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Supplier Payment Terms"
              name="Supplier_P_Terms"
              value={SupplierData.Supplier_P_Terms}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Supplier Creation Date"
              name="Supplier_C_Date"
              type="date"
              value={SupplierData.Supplier_C_Date}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Supplier Account Code"
              name="Supplier_A_Code"
              value={SupplierData.Supplier_A_Code}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Credit Period"
              name="CreditPeriod"
              value={SupplierData.CreditPeriod}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={SupplierData.Active}
                  onChange={handleCheckboxChange}
                  name="Active"
                />
              }
              label="Active"
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ maxWidth: 200, marginTop: 5, marginBottom: 5 }}
            >
              Add Supplier
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default SupplierMasterForm;
