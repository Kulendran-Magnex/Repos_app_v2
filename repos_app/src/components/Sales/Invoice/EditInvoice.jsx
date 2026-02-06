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
 Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
 

} from "@mui/material";

import toast, { Toaster } from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import {
  
  addInvoice,
  fetchLocationMaster,
  insertBO_Tran_Adjustment,
  fetchCustomers,
  insertBO_Tran_PR,
} from "../../API/api";
import SearchDialog from "../../Inventory/SearchDialog";
import { useNavigate } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import EditableNumberCell2 from "../../Common/EditableNumberCell2";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PageHeader from "../../Common/PageHeader";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import axios from "axios";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useLocation } from "react-router-dom";

const calculatePrice = async (product) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;

  const subTotal = qty * price;

  return {
    ...product,
    total: subTotal.toFixed(2),
  };
};

//   const customers = [
//   { Customer_Code: "C001", Customer_Name: "ABC Traders" },
//   { Customer_Code: "C002", Customer_Name: "XYZ Stores" },
// ];


export default function EditInvoice() {
  const [locationList, setLocationList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
    const [discountAmount, setDiscountAmount] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [taxAmount, setTaxAmount]= useState("");
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
  const [value, setValue] = useState(null);
  const [customers, setCustomers] = useState([]);
 const [salespersons, setSalespersons] = useState([]);
const [salespersonValue, setSalespersonValue] = useState(null);
const [salespersonInput, setSalespersonInput] = useState("");
const [loadingSalespersons, setLoadingSalespersons] = useState(false);
const [openSalespersonDialog, setOpenSalespersonDialog] = useState(false);
const filter = createFilterOptions();
const [spName, setSpName] = useState("");
const [spEmail, setSpEmail] = useState("");
const [savingSp, setSavingSp] = useState(false);
const location = useLocation();
  const { invoice_id } = location.state || {};






  const [headerData, setHeaderData] = useState({
    INV_Code : "New", 
    Customer_Code : "",
    INV_Date : today,
    PO_No: "",
    INV_Tax_Amount: 0,
    INV_Additional_Charges: 0,
    INV_Other_Charges: 0,
    INV_Amount: 0,
    PO_Date: "",
    UserID: "",
    Location_ID: "",
    INV_Status: 0,
    Salesperson_ID: "",
    Client_ID: "",
    INV_Type:"",
    Remarks:""

  })

  const [data, setData] = useState({
    Barcode: "",
    Product_ID: "",
    Description: "",
    UOM: "",
    Unit_Price: 0,
    Quantity: 0,
    Total: 0,
  });

  useEffect(() => {
    const getcustomersData = async () => {
        try{
                const data = await fetchCustomers();
                if(data){
                    setCustomers(data);
                    console.log("customers:", data);
                }

        }catch(err){
            console.error("Error fetching customers:", err);
        }
    } 
    getcustomersData();
  }, [])

  console.log("header date:", headerData);
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
    if (!invoice_id) return;

    axios
      .get(`http://localhost:5000/api/invoices/header/${invoice_id}`)
      .then((res) => {
        const data = res.data[0];
        console.log("data:",data);
     
        // Format dates safely or return empty string if null
        const formatDate = (value) => {
          if (!value) return ""; // handles null or undefined
          const date = new Date(value);
          return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
        };

        setHeaderData ({
    INV_Code : data.INV_Code, 
    Customer_Code : data.Customer_Code,
    INV_Date : formatDate(data.INV_Date),
    PO_No: data.PO_No,
    INV_Tax_Amount: data.INV_Tax_Amount,
    INV_Additional_Charges: data.INV_Additional_Charges,
    INV_Other_Charges: data.INV_Other_Charges,
    INV_Amount: data.INV_Amount,
    PO_Date: data.PO_Date,
    UserID: data.UserID,
    Location_ID: data.Location_ID,
    INV_Status: data.INV_Status,
    INV_Type:data.INV_Type,
    Salesperson_ID: data.SalesMan_Code,
    Remarks: data.Remarks

  })
       

        if (data.INV_Status === 1) {
          setPosted(true);
        } else {
          setPosted(false); // optional, if you want to reset when not "P"
        }
      })
      .catch((err) => {
        console.error("Error fetching Adjustment Header data:", err);
      });
  }, [invoice_id]);

    useEffect(() => {
    if (!invoice_id) return;

    const fetchInvoiceTran = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/invoices/tran/${invoice_id}`
        );
        const data = res.data;
        console.log("tran data: ",  data);
        if (data) {
          const formattedList = data.map((item) => ({
            Barcode: item.Barcode,
            Product_ID: item.Product_ID,
            Description: item.Description,
            UOM: item.Product_UM,
            Total: item.Total_Amount,
            Quantity: item.INV_Qty,
            UnitPrice: item.Unit_Price,

  
          }));
          setProductList(formattedList);
        }
      } catch (err) {
        console.error("Error fetching PR Tran data:", err);
      }
    };

    fetchInvoiceTran();
  }, [invoice_id]);



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

  useEffect(() => {
    const price = parseFloat(unitPrice);
    const qty = parseFloat(quantity);
    const rate = parseFloat(discountRate);
    const tax = isNaN(parseFloat(taxRate)) ? 0 : parseFloat(taxRate); // default taxRate to 0 if invalid

    if (!isNaN(price) && !isNaN(qty) && !isNaN(rate)) {
      const gross = price * qty;
      const discount = (gross * rate) / 100;
      const subTotal = gross - discount;
      const taxAmount = (subTotal * tax) / 100;
      const finalTotal = subTotal + taxAmount;

      setDiscountAmount(discount.toFixed(2));
      setTotal(finalTotal.toFixed(2)); // Includes tax now
    } else {
      setDiscountAmount("");
      setTotal("");
    }
  }, [unitPrice, quantity, discountRate, taxRate]);

  useEffect(() => {
  const fetchSalespersons = async () => {
    try {
      setLoadingSalespersons(true);

      const res = await axios.get("http://localhost:5000/api/salespersons", {
        params: { location_id: "001" }
      });
      console.log("salespersons:", res);
      setSalespersons(res.data);
    } catch (err) {
      console.error("Failed to load salespersons", err);
    } finally {
      setLoadingSalespersons(false);
    }
  };

  // if (headerData.Location_ID) {
  //   fetchSalespersons();
  // }
  fetchSalespersons();
}, [headerData.Location_ID]);

useEffect(() => {
  if (!openSalespersonDialog) {
    setSpName("");
    setSpEmail("");
  }
}, [openSalespersonDialog]);

useEffect(() => {
  // Sync salespersonValue when salespersons list loads or headerData.Salesperson_ID changes
  if (salespersons && salespersons.length && headerData?.Salesperson_ID) {
    const sp = salespersons.find(
      (s) => s.Salesperson_ID === headerData.Salesperson_ID
    );
    if (sp) setSalespersonValue(sp);
  }
}, [salespersons, headerData.Salesperson_ID]);

  //////need to do here
  const handleProductSelect = (product) => {
    console.log("Product selected in CreateAdjustment:", product);
    setData({
      Barcode: product.Barcode,
      Product_ID: product.Product_ID,
      Description: product.Description,
      UOM: product.Stock_UM,
      Unit_Price: product.avg_Cost,
      Quantity: product.UM_QTY,
      Total: "",
    });
    setUnitPrice(Number(product.avg_Cost).toFixed(2));
    setOpenAddModal(false); // Optionally close dialog
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setHeaderData((prevData) => ({
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
      unitPrice,
      quantity: Number(quantity).toFixed(2),
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

  // Open dialog
const openManageSalespersonDialog = () => {
  setOpenSalespersonDialog(true);
};

// Close dialog
const closeManageSalespersonDialog = () => {
  setOpenSalespersonDialog(false);
};

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) =>
      prevList.filter((p) => p.data.Barcode !== barcode)
    );
  };

  const handleSaveSalesperson = async () => {
  if (!spName.trim()) return;

  try {
    setSavingSp(true);

    const res = await axios.post("http://localhost:5000/api/salespersons", {
      Salesperson_Name: spName,
      Email: spEmail,
      Location_ID: "001",
    });

    const newSalesperson = {
      Salesperson_ID: res.data.Salesperson_ID,
      Salesperson_Name: spName,
      Email: spEmail,
    };

    // update dropdown list
    setSalespersons((prev) => [...prev, newSalesperson]);

    // auto select
    setSalespersonValue(newSalesperson);
    setHeaderData((p) => ({
      ...p,
      Salesperson_ID: newSalesperson.Salesperson_ID,
    }));

    // reset + close
    setSpName("");
    setSpEmail("");
    closeManageSalespersonDialog();
  } catch (err) {
    alert("Failed to save salesperson");
    console.error(err);
  } finally {
    setSavingSp(false);
  }
};


  const handleSubmit = async () => {
    const { INV_Date, Location , Remarks } = headerData;

    // // Validate required fields
    if (!INV_Date || !Location || !Remarks ) {
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
    };



    try {
      const result = await addInvoice(payload);
      if (result.Invoice_Code) {
        setGrnCode(result.Invoice_Code);
      }
      setAdded(true);
      toast.success("Invoice Added");
    } catch (error) {
      toast.error("Failed to add Invoice.");
      console.error("Insert failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
      await insertBO_Tran_Adjustment(grnCode);
      toast.success("Invoice Posted Successfully");
      setPosted(true);
    } catch (error) {
      toast.error("Failed to Post Invoice.");
      console.error("Post failed:", error.message);
    }
  };

  const handleAddSalesperson = async (name) => {
  // call backend API
  const res = await axios.post("/api/salespersons", {
    Salesperson_Name: name,
    Location_ID: "LOC01"
  });

  const newPerson = {
    Salesperson_ID: res.data.Salesperson_ID,
    Salesperson_Name: name
  };

  setSalespersons((prev) => [...prev, newPerson]);
  setSalespersonValue(newPerson);
};

  return (
    <div>
      <Toaster reverseOrder={false} />
      {/* Vendor Form */}
      <Box sx={{ paddingLeft: 4, paddingRight: 4, paddingTop: 2 }}>
        <Box sx={{ minHeight: "100vh" }}>
          <br />
          <PageHeader
            title="Invoice"
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
                label="Invoice Code"
                name="INV_Code"
                type="text"
                value={headerData.INV_Code}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled
                fullWidth
              />
       <Autocomplete
  options={customers}
  getOptionLabel={(option) => option?.Customer_Name || ""}

  value={
    customers.find((c) => c.Customer_Code === headerData.Customer_Code) ||
    null
  }

  isOptionEqualToValue={(option, value) =>
    option.Customer_Code === value?.Customer_Code
  }

  onChange={(event, newValue) => {
    setHeaderData((prevData) => ({
      ...prevData,
      Customer_Code: newValue ? newValue.Customer_Code : ""
    }));

    console.log("Customer:", newValue);
  }}

  renderInput={(params) => (
    <TextField
      {...params}
      label="Customer"
      margin="normal"
      fullWidth
    />
  )}
/>
              <TextField
                label="Invoice Date"
                name="INV_Date"
                value={headerData.INV_Date}
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
                    name="INV_Status"
                    value={headerData.INV_Status}
                    defaultValue="0"
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
                    disabled
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
                        (item) => item.Location_ID === headerData.Location
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
                  <InputLabel>Invoice Type</InputLabel>
                  <Select
                    name="INV_Type"
                    value={headerData.INV_Type}
                    label="Invoice Type"
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
                    <MenuItem value={"CR"}>Credit</MenuItem>
                    <MenuItem value={"CS"}>Cash</MenuItem>
                  
                  </Select>
                </FormControl>
              </Box>

            

<Autocomplete
  fullWidth
  options={salespersons}
  value={salespersonValue || null}
  isOptionEqualToValue={(option, value) =>
    option.Salesperson_ID === value?.Salesperson_ID
  }
  inputValue={salespersonInput}
  onInputChange={(e, newInputValue) =>
    setSalespersonInput(newInputValue)
  }

 
  filterOptions={(options, params) => {
    const filtered = filter(options, params);

    // ADD "Add Salesperson"
    if (
      params.inputValue !== "" &&
      !options.some(
        (o) =>
          o.Salesperson_Name.toLowerCase() ===
          params.inputValue.toLowerCase()
      )
    ) {
      filtered.push({
        isAdd: true,
        label: params.inputValue,
      });
    }

    // ADD "Manage Salespersons" (always last)
    filtered.push({
      isManage: true,
    });

    return filtered;
  }}

  getOptionLabel={(option) => {
    if (option.isAdd) return `Add "${option.label}"`;
    if (option.isManage) return "Manage Salespersons";
    return option.Salesperson_Name;
  }}

  onChange={(event, newValue) => {
    if (newValue?.isAdd) {
      handleAddSalesperson(newValue.label);
    } else if (newValue?.isManage) {
      openManageSalespersonDialog();
  
    } else {
      setSalespersonValue(newValue);
      setHeaderData((p) => ({
        ...p,
        Salesperson_ID: newValue?.Salesperson_ID || null,
      }));
    }
  }}

  renderOption={(props, option) => {
   

    if (option.isManage) {
      return (
        <li {...props} style={{ borderTop: "1px solid #eee" }}>
          ➕ Add Salespersons
        </li>
      );
    }

    return (
      <li {...props}>
        {option.Salesperson_Name}
      </li>
    );
  }}

  renderInput={(params) => (
    <TextField
      {...params}
     margin="normal"
      label="Salesperson"
      placeholder="Select or Add Salesperson"
    />
  )}
/>




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
                label="Discount Rate"
                margin="normal"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                type="number"
                disabled={added}
                fullWidth
              />

              <TextField
                label="Discount Amount"
                margin="normal"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                type="number"
                disabled={added}
                fullWidth
              />

              
               <TextField
                label="Tax Rate"
                margin="normal"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                type="number"
                disabled={added}
                fullWidth
              />

              <TextField
                label="Tax Amount"
                margin="normal"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
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
                        <TableCell>
                          {item.UOM || item.Product_UM}
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
                          value={item.Quantity}
                          index={index}
                          field="Quantity"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          allowLeadingZero={false}
                        />

                        <EditableNumberCell
                          value={item.UnitPrice}
                          index={index}
                          field="unitPrice"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />

                        <TableCell>{Number(item.Total).toFixed(2)}</TableCell>
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

     <Dialog
  open={openSalespersonDialog}
  onClose={closeManageSalespersonDialog}
 
  maxWidth="50%"
>
  <DialogTitle>Add Salesperson</DialogTitle>

  <DialogContent dividers>
    <TextField
      label="Salesperson Name"
      value={spName}
      onChange={(e) => setSpName(e.target.value)}
      fullWidth
      required
      margin="normal"
      autoFocus
    />

    <TextField
      label="Email"
      type="email"
      value={spEmail}
      onChange={(e) => setSpEmail(e.target.value)}
      fullWidth
      margin="normal"
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={closeManageSalespersonDialog}>
      Cancel
    </Button>

    <Button
      onClick={handleSaveSalesperson}
      variant="contained"
      disabled={!spName || savingSp}
    >
      {savingSp ? "Saving..." : "Save"}
    </Button>
  </DialogActions>
</Dialog>


    </div>
  );
}
