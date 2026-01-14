import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Autocomplete,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { fetchSupplierList } from "../../API/api";
import { fetchLocationMaster } from "../../API/api";
import SearchDialog from "./SearchDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import { addMaterialRequest } from "../../API/api";
import SaveIcon from "@mui/icons-material/Save";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const AddMaterialRequest = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [barcode, setBarcode] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [editingBarcode, setEditingBarcode] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [mrData, setMRData] = useState({
    EntryDate: today,
    RequiredDate: today,
    Product_ID: "",
    Barcode: "",
    Supplier: "",
    Description: "",
    ProductUM: "",
    Quantity: "",
    userID: "",
    Location: "",
    MR_Status: "O",
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSupplierList();

        setSupplierList(data);
      } catch (error) {
        console.error("Error fetching Tax master:", error);
      }
    };

    const loadLocationData = async () => {
      try {
        const data = await fetchLocationMaster();

        setLocationList(data);
      } catch (error) {
        console.error("Error fetching Location Master:", error);
      }
    };

    loadData();
    loadLocationData();
  }, []);

  const handleSupplierChange = (event) => {
    setSelectedSupplier(event.target.value); // Update the selected supplier
    console.log(event.target.value);
  };
  const handleBarcodeChange = (event) => {
    setBarcode(event.target.value); // Set the barcode value from the input
  };

  const handleBarcodeKeyDown = (event) => {
    // Prevent "Enter" key action (form submission) after barcode scan
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission or other actions
      event.stopPropagation(); // Stop the event from bubbling up
      console.log("Enter key prevented");
    }
  };

  const handleSearch = () => {
    setOpenAddModal(true);
    // Trigger your search or other logic here based on the barcode
  };

  console.log(mrData);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setMRData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleConfirmSelection = (productsWithQty) => {
    setProductList((prevList) => {
      const updatedList = [...prevList];

      productsWithQty.forEach((incomingProduct) => {
        const existingIndex = updatedList.findIndex(
          (p) => p.Barcode === incomingProduct.Barcode
        );

        if (existingIndex !== -1) {
          // Update quantity
          updatedList[existingIndex].quantity = incomingProduct.quantity;
        } else {
          // Add new product
          updatedList.push(incomingProduct);
        }
      });

      return updatedList;
    });

    // Optional: close dialog after confirming
    setOpenAddModal(false);
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) => prevList.filter((p) => p.Barcode !== barcode));
  };

  const handleEditMr = () => {
    console.log("edit mode");
  };

  const handleSubmit = async () => {
    console.log("clicked");
    const payload = {
      mrData,
      productList,
    };

    try {
      await addMaterialRequest(payload);
      toast.success("Material Request Added");
      setMRData({
        EntryDate: "",
        RequiredDate: "",
        Product_ID: "",
        Barcode: "",
        Supplier: "",
        Description: "",
        ProductUM: "",
        Quantity: "",
        userID: "",
        Location: "",
      });

      setProductList([]);
    } catch (error) {
      toast.error("Failed to add Material Request.");
      console.error("Insert failed:", error.message);
    }
  };

  return (
    <div>
      <div>
        <Toaster reverseOrder={false} />
        {/* Vendor Form */}
        <Box sx={{ backgroundColor: "whitesmoke", minHeight: "91vh" }}>
          <br />
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            margin={2}
            padding={2}
          >
            <Typography variant="h5">Add Material Request Master</Typography>
            <IconButton onClick={handleSubmit} sx={{ color: "blue" }}>
              <SaveIcon />
            </IconButton>
          </Box>

          <Box display="flex" justifyContent="center" marginTop={2}>
            <Box
              component="form"
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
                label="MR Date"
                name="EntryDate"
                value={mrData.EntryDate}
                onChange={handleInputChange}
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />

              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={supplierList}
                  getOptionLabel={(option) => option.Supplier_Name}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: "Supplier",
                        value: newValue?.Supplier_Code || "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Supplier" />
                  )}
                  value={
                    supplierList.find(
                      (item) => item.Supplier_Code === mrData.Supplier
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.Supplier_Code === value.Supplier_Code
                  }
                />
              </FormControl>

              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>MR Status</InputLabel>
                  <Select
                    name="MR_Status"
                    defaultValue={"O"}
                    label="MR Status"
                    disabled
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250, // Set the height for the scrollable area
                          overflow: "auto", // Enable scroll if content overflows
                        },
                      },
                    }}
                  >
                    <MenuItem value={"C"}>Closed</MenuItem>
                    <MenuItem value={"O"}>Open</MenuItem>
                    <MenuItem value={"D"}>Deleted</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* <TextField
                label="MR_Status"
                name="MR_Status"
                value={mrData.MR_Status}
                fullWidth
                margin="normal"
                disabled
              /> */}

              <TextField
                label="Required Date"
                name="RequiredDate"
                value={mrData.RequiredDate}
                onChange={handleInputChange}
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />

              <Box>
                <FormControl fullWidth margin="normal">
                  <Autocomplete
                    options={locationList}
                    getOptionLabel={(option) => option.Location_Name || ""}
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: "Location",
                          value: newValue?.Location_ID || "",
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Location" />
                    )}
                    value={
                      locationList.find(
                        (item) => item.Location_ID === mrData.Location
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.Location_ID === value.Location_ID
                    }
                  />
                </FormControl>
              </Box>

              <TextField
                label="Created BY"
                name="CreatedBy"
                value={"Admin"}
                fullWidth
                margin="normal"
                disabled
              />
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Box
              component="form"
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
                  gridTemplateColumns: "repeat(4, 1fr)", // three columns on larger screens
                },
                backgroundColor: "white",
              }}
            >
              <Box display={"flex"} flexDirection={"row"} columnGap={1}>
                <TextField
                  label="Barcode"
                  name="Barcode"
                  value={barcode} // Display the scanned barcode
                  fullWidth
                  margin="normal"
                />
                <Button
                  sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                  variant="outlined"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Box>

              <TextField
                label="Prdouct ID"
                name="productID"
                value={""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Description"
                name="descrription"
                value={""}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Quantity"
                name="QTY"
                value={barcode} // Display the scanned barcode
                // onChange={handleBarcodeChange} // Update state when barcode is input
                // onKeyDown={handleBarcodeKeyDown} // Prevent "Enter" from submitting the form
                fullWidth
                margin="normal"
                autoFocus // Focus the input field to make it ready for scanning
              />

              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ maxWidth: 200, marginBottom: 1 }}
              >
                Add
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            marginTop={2}
            sx={{ backgroundColor: "white", margin: 3 }}
          >
            {productList.length > 0 ? (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Product ID</TableCell>
                        <TableCell>Barcode</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Long Description</TableCell>
                        <TableCell>UM</TableCell>
                        <TableCell>Quantity </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productList.map((product) => {
                        return (
                          <TableRow key={product.Barcode}>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleRemoveProduct(product.Barcode)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell>{product.Product_ID}</TableCell>
                            <TableCell>{product.Barcode}</TableCell>
                            <TableCell>{product.Description}</TableCell>
                            <TableCell>{product.Description_Long}</TableCell>
                            <TableCell>{product.Stock_UM}</TableCell>
                            {/* <TableCell>{product.quantity}</TableCell> */}
                            {/* <TableCell
                              onDoubleClick={() =>
                                setEditingBarcode(product.Barcode)
                              }
                            >
                              {editingBarcode === product.Barcode ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={product.quantity || 0}
                                  autoFocus
                                  onChange={(e) => {
                                    const newQuantity =
                                      parseInt(e.target.value) || 0;
                                    setProductList((prev) =>
                                      prev.map((p) =>
                                        p.Barcode === product.Barcode
                                          ? { ...p, quantity: newQuantity }
                                          : p
                                      )
                                    );
                                  }}
                                  onBlur={() => setEditingBarcode(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingBarcode(null);
                                    }
                                  }}
                                  sx={{ width: 80 }}
                                />
                              ) : (
                                product.quantity || 0
                              )}
                            </TableCell> */}
                            <TableCell
                              onDoubleClick={() =>
                                setEditingBarcode(product.Barcode)
                              }
                            >
                              {editingBarcode === product.Barcode ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={product.quantity || ""}
                                  autoFocus
                                  onChange={(e) => {
                                    let val = e.target.value;

                                    // Remove leading zeros unless value is "0" or starts with "0."
                                    if (val.length > 1 && /^0[0-9]/.test(val)) {
                                      val = val.replace(/^0+/, "");
                                    }

                                    // Allow empty string while typing
                                    if (val === "") {
                                      setProductList((prev) =>
                                        prev.map((p) =>
                                          p.Barcode === product.Barcode
                                            ? { ...p, quantity: "" }
                                            : p
                                        )
                                      );
                                      return;
                                    }

                                    // Convert to float and preserve 2 decimal precision
                                    const newQuantity = parseFloat(val);

                                    if (!isNaN(newQuantity)) {
                                      setProductList((prev) =>
                                        prev.map((p) =>
                                          p.Barcode === product.Barcode
                                            ? { ...p, quantity: newQuantity }
                                            : p
                                        )
                                      );
                                    }
                                  }}
                                  onBlur={() => setEditingBarcode(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingBarcode(null);
                                    }
                                  }}
                                  sx={{ width: 80 }}
                                  inputProps={{ step: "0.01" }} // allows decimal inputs like 10.50
                                />
                              ) : (
                                Number(product.quantity).toFixed(2) // show always 2 decimal places
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <></>
            )}
          </Box>
        </Box>

        <SearchDialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          supplierList={supplierList}
          handleSupplierChange={handleSupplierChange}
          onConfirmSelection={handleConfirmSelection}
        />
      </div>
    </div>
  );
};

export default AddMaterialRequest;
