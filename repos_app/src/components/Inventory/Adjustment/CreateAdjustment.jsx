import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Button,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Paper,
  Tooltip,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import {
  addAdjustment,
  fetchLocationMaster,
  insertBO_Tran_PR,
} from "../../API/api";
import SearchDialog from "../../Purchase/PurchaseOrder/SearchDialog";
import { useNavigate } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import EditableNumberCell2 from "../../Common/EditableNumberCell2";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PageHeader from "../../Common/PageHeader";

const calculatePrice = async (product) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;

  const subTotal = qty * price;

  return {
    ...product,
    total: subTotal.toFixed(2),
  };
};

export default function CreateAdjustment() {
  const [locationList, setLocationList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [productList, setProductList] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [taxSum, setTaxSum] = useState(0);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const { getRef, handleKeyDown } = useFormNavigation(10); // 10 fields
  const [grnCode, setGrnCode] = useState("New");
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);

  const [adjHeaderData, setAdjHeaderData] = useState({
    Adjustment_Code: "New",
    Adj_Date: today,
    Location: "",
    Posting_Type: "ADJ",
    Adj_Status: 0,
    Created_By: "Admin",
    Remarks: "",
  });

  const [adjData, setAdjData] = useState({
    Barcode: "",
    Product_ID: "",
    Description: "",
    UOM: "",
    Unit_Price: "",
    Quantity: "",
    Total: "",
  });

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const data = await fetchLocationMaster();

        setLocationList(data);
      } catch (error) {
        console.error("Error fetching Location Master:", error);
      }
    };

    loadLocationData();
  }, []);

  useEffect(() => {
    const price = parseFloat(unitPrice);
    const qty = parseFloat(quantity);

    if (!isNaN(price) && !isNaN(qty)) {
      const gross = price * qty;
      const finalTotal = gross;

      setTotal(finalTotal.toFixed(2)); // Includes tax now
    } else {
      setTotal("");
    }
  }, [unitPrice, quantity]);

  useEffect(() => {
    if (productList.length === 0) {
      setTotalSum(0);
      setTaxSum(0);
      return;
    }

    const { total } = productList.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.total) || 0;

        acc.total += itemTotal;

        return acc;
      },
      { total: 0 }
    );

    setTotalSum(total);
  }, [productList]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F1") {
        event.preventDefault(); // ✅ This must come before any return or browser will still react
      }
    };

    // ✅ Use capture phase to intercept before browser default
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const handleSearch = () => {
    setOpenAddModal(true);
    // Trigger your search or other logic here based on the barcode
  };

  //////need to do here
  const handleProductSelect = (product) => {
    setAdjData({
      Barcode: product.Barcode,
      Product_ID: product.Product_ID,
      Description: product.Description,
      UOM: product.Stock_UM,
      Unit_Price: product.Unit_Cost,
      Quantity: product.UM_QTY,
      Total: "",
    });
    setUnitPrice(product.Unit_Cost);
    setOpenAddModal(false); // Optionally close dialog
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAdjHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index][field] = parseFloat(value);

    const updatedProduct = await calculatePrice(updatedProducts[index]);
    setProductList(updatedProducts);

    updatedProducts[index] = updatedProduct;
    setProductList(updatedProducts);
  };



  const handleAddToTable = () => {
    // Prevent duplicate item by Barcode
    const isDuplicate = productList.some(
      (item) => item.adjData?.Barcode === adjData.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      setUnitPrice("");
      setQuantity("");
      setTotal("");

      setAdjData(null);
      return;
    }

    const { Barcode, Product_ID, Description, UOM } = adjData;

    if (!Barcode || !Product_ID || !Description || !UOM) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newItem = {
      adjData,
      unitPrice,
      quantity: Number(quantity).toFixed(2),
      total,
    };

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setTotal("");
    setAdjData({
      Barcode: "",
      Product_ID: "",
      Description: "",
      UOM: "",
      Unit_Price: "",
      Quantity: "",
      Total: "",
    });
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) =>
      prevList.filter((p) => p.adjData.Barcode !== barcode)
    );
  };

  const handleSubmit = async () => {
    const { Adj_Date, Location , Remarks } = adjHeaderData;

    // // Validate required fields
    if (!Adj_Date || !Location || !Remarks ) {
      toast.error("Please fill in all required fields in header section.");
      return;
    }

    // Validate productList
    if (!productList || productList.length === 0) {
      toast.error("Product list cannot be empty.");
      return;
    }

    const payload = {
      adjHeaderData,
      productList,
      totalSum,
      taxSum,
    };



    try {
      const result = await addAdjustment(payload);
      if (result.Adjustment_Code) {
        setGrnCode(result.Adjustment_Code);
      }
      setAdded(true);
      toast.success("Adjustment Added");
    } catch (error) {
      toast.error("Failed to add PR.");
      console.error("Insert failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
      await insertBO_Tran_PR(grnCode);
      toast.success("PR Posted Successfully");
      setPosted(true);
    } catch (error) {
      toast.error("Failed to Post PR.");
      console.error("Post failed:", error.message);
    }
  };

  return (
    <div>
      <Toaster reverseOrder={false} />
      {/* Vendor Form */}
      <Box sx={{ paddingLeft: 4, paddingRight: 4, paddingTop: 2 }}>
        <Box sx={{ minHeight: "100vh" }}>
          <br />
          <PageHeader
            title="Adjustment"
            actions={[
              <Tooltip title="Save" key="save">
                <span>
                  <IconButton
                    sx={{ color: "blue" }}
                    onClick={handleSubmit}
                    disabled={added}
                  >
                    <SaveIcon />
                  </IconButton>
                </span>
              </Tooltip>,
              <Tooltip title="Post" key="post">
                <span>
                  <IconButton
                    sx={{ color: "blue" }}
                    onClick={handlePosted}
                    disabled={!added || posted}
                  >
                    <CloudUploadIcon />
                  </IconButton>
                </span>
              </Tooltip>,
              <Tooltip title="Post" key="post">
                <span>
                  <IconButton
                    sx={{ color: "blue" }}
                    onClick={handlePosted}
                    disabled={!added || posted}
                  >
                    <PrintIcon />
                  </IconButton>
                </span>
              </Tooltip>,
            ]}
          />

          <Box display="flex" justifyContent="center" marginTop={2}>
            <Box
              component="form"
              sx={{
                minWidth: 100, // Min width for form
                width: "100%", // Full width on smaller screens
                // margin: "0 auto", // Center form horizontally
                padding: 2, // Optional padding for better spacing

                display: "grid",
                rowGap: 0.5,
                columnGap: 3,
                gridTemplateColumns: "repeat(1, 1fr)", // Single column by default
                "@media (min-width:600px)": {
                  gridTemplateColumns: "repeat(4, 1fr)", // three columns on larger screens
                },
                backgroundColor: "white",
              }}
            >
              <TextField
                label="Adjustment Code"
                name="Adjustment_Code"
                type="text"
                value={adjHeaderData.Adjustment_Code}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled
                fullWidth
              />
              <TextField
                label="Adjustment Date"
                name="Adj_Date"
                value={adjHeaderData.Adj_Date}
                inputRef={getRef(0)}
                onKeyDown={handleKeyDown(0)}
                type="date"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={added}
                required
              />

              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="Adj_Status"
                    value={adjHeaderData.Adj_Status}
                    label="Status"
                    onChange={handleInputChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250, // Set the height for the scrollable area
                          overflow: "auto", // Enable scroll if content overflows
                        },
                      },
                    }}
                    disabled={added}
                  >
                    <MenuItem value={0}>Open</MenuItem>
                    <MenuItem value={1}>Closed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

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
                      <TextField
                        {...params}
                        label="Location"
                        required
                        // error={!poHeaderData.Location}
                      />
                    )}
                    value={
                      locationList?.find(
                        (item) => item.Location_ID === adjHeaderData.Location
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.Location_ID === value.Location_ID
                    }
                    disabled={added}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Posting Type</InputLabel>
                  <Select
                    name="Adj_Status"
                    value={adjHeaderData.Posting_Type}
                    label="Posting Type"
                    onChange={handleInputChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250, // Set the height for the scrollable area
                          overflow: "auto", // Enable scroll if content overflows
                        },
                      },
                    }}
                    disabled={added}
                  >
                    <MenuItem value={"ADJ"}>Adjustment</MenuItem>
                    <MenuItem value={"OB"}>Opening Balance</MenuItem>
                    <MenuItem value={"SYS"}>System</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Created By"
                name="Created_By"
                value={adjHeaderData.Created_By}
                onChange={handleInputChange}
                inputRef={getRef(7)}
                onKeyDown={handleKeyDown(7)}
                margin="normal"
                type="text"
                disabled
              />

              <TextField
                label="Remarks"
                name="Remarks"
                value={adjHeaderData.Remarks}
                onChange={handleInputChange}
                inputRef={getRef(7)}
                onKeyDown={handleKeyDown(7)}
                margin="normal"
                type="text"
              />
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            padding={1}
            sx={{ backgroundColor: "whitesmoke" }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">Add Items</Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={2}
          >
            <Box
              component="form"
              sx={{
                minWidth: 100, // Min width for form
                width: "100%", // Full width on smaller screens
                // margin: "0 auto", // Center form horizontally
                padding: 2, // Optional padding for better spacing

                display: "grid",
                rowGap: 0.5,
                columnGap: 2,
                gridTemplateColumns: "repeat(1, 1fr)", // Single column by default
                "@media (min-width:600px)": {
                  gridTemplateColumns: "repeat(5, 1fr)", // three columns on larger screens
                },
                backgroundColor: "white",
              }}
            >
              <Box display={"flex"} flexDirection={"row"} columnGap={1}>
                <TextField
                  label="Barcode"
                  name="Barcode"
                  value={adjData?.Barcode || ""}
                  fullWidth
                  margin="normal"
                  disabled={added}
                />
                <Button
                  sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                  variant="outlined"
                  onClick={handleSearch}
                  disabled={added}
                >
                  Search
                </Button>
              </Box>

              <TextField
                label="Product ID"
                name="Product_ID"
                value={adjData?.Product_ID || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Description"
                name="Description"
                value={adjData?.Description || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="UOM"
                name="UOM"
                value={adjData?.UOM || ""}
                margin="normal"
                disabled
              />

              <TextField
                label="Unit Price"
                margin="normal"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                type="number"
                disabled={added}
                fullWidth
              />
              <TextField
                label="Quantity"
                margin="normal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                disabled={added}
                fullWidth
              />

              <TextField
                label="Total"
                margin="normal"
                value={total}
                fullWidth
                disabled
              />

              <Button
                variant="outlined"
                color="primary"
                sx={{ height: 40, width: 100, marginTop: 3, marginBottom: 4 }} // px controls horizontal padding inside the button
                onClick={handleAddToTable}
                disabled={added}
              >
                Add
              </Button>
            </Box>
          </Box>

          {productList.length > 0 ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <TableContainer component={Paper} sx={{ width: "100%" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>
                        <b>Barcode</b>
                      </TableCell>
                      <TableCell>
                        <b>Product ID</b>
                      </TableCell>
                      <TableCell>
                        <b>Description</b>
                      </TableCell>
                      <TableCell>
                        <b>UOM</b>
                      </TableCell>
                      <TableCell>
                        <b>QTY</b>
                      </TableCell>
                      <TableCell>
                        <b>U.Price</b>{" "}
                      </TableCell>

                      <TableCell>
                        <b>Total</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productList.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleRemoveProduct(item.adjData?.Barcode)
                            }
                            disabled={added}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{item.adjData?.Barcode}</TableCell>
                        <TableCell>{item.adjData?.Product_ID}</TableCell>
                        <TableCell>{item.adjData?.Description}</TableCell>
                        <TableCell>
                          {item.adjData?.UOM || item.adjData?.Product_UM}
                        </TableCell>
                        {/* <TableCell>{item.quantity}</TableCell> */}
                        {/* <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={handleProductChange}
                            fullWidth
                          />
                        </TableCell> */}
                        <EditableNumberCell2
                          value={item.quantity}
                          index={index}
                          field="quantity"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          allowLeadingZero={false}
                        />

                        <EditableNumberCell
                          value={item.unitPrice}
                          index={index}
                          field="unitPrice"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />

                        <TableCell>{Number(item.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <></>
          )}
        </Box>
        <SearchDialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onConfirmSelection={handleProductSelect} // Pass callback
          //   onConfirmSelection={handleConfirmSelection}
        />
      </Box>
    </div>
  );
}
