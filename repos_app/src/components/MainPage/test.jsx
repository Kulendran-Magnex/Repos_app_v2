import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Card,
} from "@mui/material";

function ProductDetailsTable() {
  const [priceDetails, setPriceDetails] = useState([
    {
      Barcode: "",
      Location_Group: "",
      Retail_Price: "",
      Retail_Price2: "",
      Retail_Price3: "",
      Wholesale_Price: "",
      MRP: "",
      Product_UOM: "",
      UM_QTY: "",
      Unit_Cost: "",
      Last_Purchase_Price: "",
    },
  ]);

  const handleInputChange = (index, event) => {
    const values = [...priceDetails];
    values[index][event.target.name] = event.target.value;
    setPriceDetails(values);
  };

  const handleAddRow = () => {
    setPriceDetails([
      ...priceDetails,
      {
        Barcode: "",
        Location_Group: "",
        Retail_Price: "",
        Retail_Price2: "",
        Retail_Price3: "",
        Wholesale_Price: "",
        MRP: "",
        Product_UOM: "",
        UM_QTY: "",
        Unit_Cost: "",
        Last_Purchase_Price: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const values = [...priceDetails];
    values.splice(index, 1);
    setPriceDetails(values);
  };

  return (
    <Box display="flex" justifyContent="center">
      <Box sx={{ width: "100%" }} border={1}>
        <Card>
          <Card className="card-body">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3, // gap between items
              }}
            >
              <Button variant="outlined" onClick={handleAddRow}>
                Add Product
              </Button>

              {priceDetails.map((detail, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                >
                  <TextField
                    label="Barcode"
                    variant="outlined"
                    value={detail.Barcode}
                    name="Barcode"
                    onChange={(e) => handleInputChange(index, e)}
                    fullWidth
                  />
                  {/* <FormControl fullWidth>
                    <InputLabel>Location Group</InputLabel>
                    <Select
                      name="Location_Group"
                      value={detail.Location_Group}
                      onChange={(e) => handleInputChange(index, e)}
                      label="Location Group"
                    >
                      {loading ? (
                        <MenuItem disabled>
                          <CircularProgress size={24} />
                        </MenuItem>
                      ) : (
                        locationGroups.map((group) => (
                          <MenuItem key={group.Location_Group} value={group.Location_Group}>
                            {group.Location_Group_Name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl> */}
                  <TextField
                    label="Retail Price"
                    variant="outlined"
                    value={detail.Retail_Price}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Retail_Price"
                    fullWidth
                  />
                  <TextField
                    label="Retail Price2"
                    variant="outlined"
                    value={detail.Retail_Price2}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Retail_Price2"
                    fullWidth
                  />
                  <TextField
                    label="Retail Price3"
                    variant="outlined"
                    value={detail.Retail_Price3}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Retail_Price3"
                    fullWidth
                  />
                  <TextField
                    label="Wholesale Price"
                    variant="outlined"
                    value={detail.Wholesale_Price}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Wholesale_Price"
                    fullWidth
                  />
                  <TextField
                    label="MRP"
                    variant="outlined"
                    value={detail.MRP}
                    onChange={(e) => handleInputChange(index, e)}
                    name="MRP"
                    fullWidth
                  />
                  <TextField
                    label="Product UOM"
                    variant="outlined"
                    value={detail.Product_UOM}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Product_UOM"
                    fullWidth
                  />
                  <TextField
                    label="UM QTY"
                    variant="outlined"
                    value={detail.UM_QTY}
                    onChange={(e) => handleInputChange(index, e)}
                    name="UM_QTY"
                    fullWidth
                  />
                  <TextField
                    label="Unit Cost"
                    variant="outlined"
                    value={detail.Unit_Cost}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Unit_Cost"
                    fullWidth
                  />
                  <TextField
                    label="Last Purchase Price"
                    variant="outlined"
                    value={detail.Last_Purchase_Price}
                    onChange={(e) => handleInputChange(index, e)}
                    name="Last_Purchase_Price"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={() => handleRemoveRow(index)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Card>
        </Card>
      </Box>
    </Box>
  );
}

export default ProductDetailsTable;
