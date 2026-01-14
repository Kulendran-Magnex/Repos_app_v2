import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
} from "@mui/material";

import { Repeat } from "@mui/icons-material";
import { addSupplierMaster } from "../../API/api";
import { useNavigate } from "react-router-dom";
import { getCurrentSupplier } from "../../API/api";
import { updateSupplierMaster } from "../../API/api";

const EditSupplierMasterForm = () => {
  // State to store vendor form inputs
  const location = useLocation();
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
  const { currentsupplier } = location.state || {};

  const navigate = useNavigate();

  // State to store list of added vendors

  useEffect(() => {
    if (currentsupplier) {
      console.log(currentsupplier);
      setSupplierData({
        SupplierName: currentsupplier.SupplierName || "",
        SupplierAddress: currentsupplier.SupplierAddress || "",
        SupplierPhone: currentsupplier.SupplierPhone || "",
        SupplierFax: currentsupplier.SupplierFax || "",
        SupplierEmail: currentsupplier.SupplierEmail || "",
        SupplierContact: currentsupplier.SupplierContact || "",
        SupplierMobile: currentsupplier.SupplierMobile || "",
        Supplier_P_Terms: currentsupplier.Supplier_P_Terms || "",
        Supplier_C_Date: currentsupplier.Supplier_C_Date || "",
        Supplier_A_Code: currentsupplier.Supplier_A_Code || "",
        CreditPeriod: currentsupplier.CreditPeriod || "",
        Active: currentsupplier.Active || false,
      });
    }
  }, [currentsupplier]); // The effect will run when `currentsupplier` changes.
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
    console.log(currentsupplier.SupplierCode);
    try {
      await updateSupplierMaster(currentsupplier.SupplierCode, SupplierData);

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
      navigate("/supplierTable");
    } catch (error) {
      alert("Failed to add Supplier");
    }
  };

  return (
    <div>
      {/* Vendor Form */}
      <Box sx={{ backgroundColor: "whitesmoke", minHeight: "92vh" }}>
        <br />
        <Box display="flex" justifyContent="center" marginTop={2}>
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
              backgroundColor: "white",
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
              value={
                SupplierData.Supplier_C_Date
                  ? SupplierData.Supplier_C_Date.split("T")[0]
                  : ""
              }
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
              sx={{ maxWidth: 200, marginTop: 4, marginBottom: 4 }}
            >
              Edit Supplier
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default EditSupplierMasterForm;
