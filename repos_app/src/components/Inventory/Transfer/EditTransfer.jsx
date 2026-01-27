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
  fetchLocationMaster,
  insertBO_Tran_Transfer,
  editTransfer
} from "../../API/api";
import SearchDialog from "../../Purchase/PurchaseOrder/SearchDialog";
import { fetchTaxGroup } from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useLocation, useNavigate } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import EditableNumberCell2 from "../../Common/EditableNumberCell2";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import GRNSearchDialog from "../../Purchase/GRN/GRNSearchDialog";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PageHeader from "../../Common/PageHeader";

const calculatePrice = async (product) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;

  const subTotal = qty * price;

  return {
    ...product,
    Total_Amount: subTotal.toFixed(2),
  };
};

export default function EditTransfer() {
  const [supplierList, setSupplierList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [taxGroupList, setTaxGroupList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openPOSearch, setOpenPOSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [total, setTotal] = useState("");
  const [productList, setProductList] = useState([]);
  const [taxRate, setTaxRate] = useState([]);
  const [taxAmount, setTaxAmount] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [taxSum, setTaxSum] = useState(0);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const [addedGRNCodes, setAddedGRNCodes] = useState([]);
  const { getRef, handleKeyDown } = useFormNavigation(10); // 10 fields
  const [grnCode, setGrnCode] = useState("New");
  const [transferCode, setTransferCode] = useState("New");
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const { currentItemID } = location.state || {};



    const [headerData, setHeaderData] = useState({
    Transfer_ID: "New",
    Transfer_Date: today,
    From_Location: "",
    To_Location: "",
    Status: 0,
    Created_By: "Admin",
    Remarks: "",
  });




  const [data, setData] = useState({
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

    console.log("Rendered", currentItemID);

  useEffect(() => {
    if (!currentItemID) return;
     console.log("Rendered", currentItemID);
    axios
      .get(`http://localhost:5000/api/transfer/header/${currentItemID}`)
      .then((res) => {
        const data = res.data[0];
     
        // Format dates safely or return empty string if null
        const formatDate = (value) => {
          if (!value) return ""; // handles null or undefined
          const date = new Date(value);
          return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
        };

        setHeaderData({
          Transfer_Date: formatDate(data.Transfer_Date),
          Transfer_ID: data.Transfer_ID || "",
          From_Location: data.Location_From_ID || "",
          To_Location: data.Location_To_ID || "",
          Status: data.Status === "" || data.Status == null ? 0: Number(data.Status),
          Remarks: data.Remarks,
          Created_By: data.Created_By || "",
        });

        if (data.Status === "P") {
          setPosted(true);
        } else {
          setPosted(false); // optional, if you want to reset when not "P"
        }
      })
      .catch((err) => {
        console.error("Error fetching Transfer Header data:", err);
      });
  }, [currentItemID]);

  useEffect(() => {
    if (!currentItemID) return;

    const fetchGRNTran = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/transfer/tran/${currentItemID}`
        );
        const data = res.data;
        if (data) {
          const formattedList = data.map((item) => ({
            Barcode: item.Barcode,
            Product_ID: item.Product_ID,
            Description: item.Description,
            Product_UM: item.Transfer_UM,
            Total_Amount: item.Transfer_Cost,
            quantity: item.Transfer_QTY,
            unitPrice: item.Unit_Cost,
          }));
          setProductList(formattedList);
        }
      } catch (err) {
        console.error("Error fetching PR Tran data:", err);
      }
    };

    fetchGRNTran();
  }, [currentItemID]);

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
        setOpenPOSearch(true);
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
   
    setSelectedProduct(product); // Save selected row from child
    setData({
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

    setHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePRDataChange = (e) => {
    const { name, value } = e.target;

    setData((prevData) => ({
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
      (item) => item.Barcode === data.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      setUnitPrice("");
      setQuantity("");
      setTotal("");

      //setSelectedProduct(null);
      setData(null);
      return;
    }

    const { Barcode, Product_ID, Description, UOM } = data;

    if (!Barcode || !Product_ID || !Description || !UOM) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const newItem = {
      data,
      Barcode: data.Barcode,
      Product_ID: data.Product_ID,
      Description: data.Description,
      Product_UM: data.UOM,
      Total_Amount: total,
      quantity,
      unitPrice: data.Unit_Price,
      // unitPrice,
      // quantity: Number(quantity).toFixed(2),
      total,
    };

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setTotal("");
    setData({
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
      prevList.filter((p) => p.data.Barcode !== barcode)
    );
  };

  const handleSubmit = async () => {
    const { Transfer_Date, From_Location, To_Location } = headerData;

    // // Validate required fields
    if (!Transfer_Date || !From_Location || !To_Location) {
      toast.error("Please fill in all required fields in header section.");
      return;
    }

    // Validate productList
    if (!productList || productList.length === 0) {
      toast.error("Product list cannot be empty.");
      return;
    }

    const payload = {
      headerData,
      productList,
      totalSum,
      taxSum,
      addedGRNCodes,
    };

  
    try {
      const result = await editTransfer(currentItemID, payload);
      if (result.ADJ_Code) {
        setTransferCode(result.ADJ_Code);
      }
      setAdded(true);
      toast.success("Transfer Updated");
    } catch (error) {
      toast.error("Failed to update Transfer.");
      console.error("Insert failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
     
       await insertBO_Tran_Transfer(transferCode);
      toast.success("Adjustment Posted Successfully");
      setPosted(true);
    } catch (error) {
      toast.error("Failed to Post Adjustment.");
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
            title="Transfer"
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
                label="Transfer Code"
                name="Transfer_ID"
                type="text"
                value={headerData.Transfer_ID}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled
                fullWidth
              />
              <TextField
                label="Transfer Date"
                name="Transfer_Date"
                value={headerData.Transfer_Date}
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
                    name="Status"
                    value={Number(headerData.Status)}
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

                     <TextField
                label="Created By"
                name="Created_By"
                value={headerData.Created_By}
                onChange={handleInputChange}
                inputRef={getRef(7)}
                onKeyDown={handleKeyDown(7)}
                margin="normal"
                type="text"
                disabled
              />

              <Box>
                <FormControl fullWidth margin="normal">
                  <Autocomplete
                    options={locationList}
                    getOptionLabel={(option) => option.Location_Name || ""}
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: "From_Location",
                          value: newValue?.Location_ID || "",
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Location From"
                        required
                        // error={!poHeaderData.Location}
                      />
                    )}
                    value={
                      locationList?.find(
                        (item) => item.Location_ID === headerData.From_Location
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
                  <Autocomplete
                    options={locationList}
                    getOptionLabel={(option) => option.Location_Name || ""}
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: "To_Location",
                          value: newValue?.Location_ID || "",
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Location To"
                        required
                        // error={!poHeaderData.Location}
                      />
                    )}
                    value={
                      locationList?.find(
                        (item) => item.Location_ID === headerData.To_Location
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.Location_ID === value.Location_ID
                    }
                    disabled={added}
                  />
                </FormControl>
              </Box>

             

       

              <TextField
                label="Remarks"
                name="Remarks"
                value={headerData.Remarks}
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
                  value={data?.Barcode || ""}
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
                value={data?.Product_ID || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Description"
                name="Description"
                value={data?.Description || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="UOM"
                name="UOM"
                value={data?.UOM || ""}
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
                  <TableHead sx={{ backgroundColor: "whitesmoke" }}>
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
                              handleRemoveProduct(item.data?.Barcode)
                            }
                            disabled={added}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{item.Barcode}</TableCell>
                        <TableCell>{item.Product_ID}</TableCell>
                        <TableCell>{item.Description}</TableCell>
                        <TableCell>{item.UOM || item.Product_UM}</TableCell>
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

                        <TableCell>
                          {Number(item.Total_Amount).toFixed(2)}
                        </TableCell>
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
