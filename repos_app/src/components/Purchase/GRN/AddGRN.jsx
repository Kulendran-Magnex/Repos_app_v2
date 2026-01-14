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
import {
  addGRN,
  fetchLocationMaster,
  fetchSupplierList,
  insertBO_Tran,
} from "../../API/api";
import SearchDialog from "../PurchaseOrder/SearchDialog";
import { fetchTaxGroup } from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useNavigate } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import POSearchDialog from "./POSearchDialog";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const calculateTaxForProduct = async (product, taxGroupCode) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;
  const discountRate = parseFloat(product.discountRate) || 0;
  const discountAmt = (qty * price * discountRate) / 100;
  const subTotal = qty * price - discountAmt;

  let taxAmount = 0;

  if (taxGroupCode) {
    try {
      const res = await axios.post("http://localhost:5000/api/calculate-tax", {
        taxGroupCode,
      });

      const { formulas } = res.data;
      let totalTax = 0;

      formulas.forEach((formula) => {
        try {
          const expression = formula.replace(/total/gi, `(${subTotal} * 0.01)`);
          const tax = evaluate(expression);
          if (!isNaN(tax)) {
            totalTax += tax;
          }
        } catch (e) {
          console.warn("Invalid tax formula:", formula);
        }
      });

      taxAmount = parseFloat(totalTax.toFixed(2));
    } catch (error) {
      console.error("Failed to recalculate tax:", error);
    }
  }

  const total = subTotal + taxAmount;

  return {
    ...product,
    discountAmount: parseFloat(discountAmt.toFixed(2)),
    taxAmount,
    total: parseFloat(total.toFixed(2)),
  };
};

function calculatePaymentDueDate(invoiceDateStr, creditPeriodDays) {
  const invoiceDate = new Date(invoiceDateStr);
  if (isNaN(invoiceDate)) return null;

  invoiceDate.setDate(invoiceDate.getDate() + creditPeriodDays);

  // Format: YYYY-MM-DD
  const year = invoiceDate.getFullYear();
  const month = String(invoiceDate.getMonth() + 1).padStart(2, "0");
  const day = String(invoiceDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddGRN() {
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
  const [addedPOCodes, setAddedPOCodes] = useState([]);
  const { getRef, handleKeyDown, refs } = useFormNavigation(10); // 10 fields
  const [grnCode, setGrnCode] = useState("");
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);

  const [poHeaderData, setPOHeaderData] = useState({
    PO_Date: today,
    DeliveryDate: today,
    PO_Status: "O",
    Supplier: "",
    Location: "",
    TaxGroup: "",
    Delivery_Address: "",
    Created_By: "Admin",
    MR_Code: "",
  });

  const [grnHeadertData, setGRNHeaderData] = useState({
    GRN_Date: today,
    PO_Code: "",
    Location: "",
    Supplier: "",
    Invoice_No: "",
    Invoice_Date: today,
    GRN_Type: "CC",
    Credit_Period: "",
    Payment_Due: "",
    TaxGroup: "",
  });

  const [grnData, setGRNData] = useState({
    Barcode: "",
    Product_ID: "",
    Description: "",
    UOM: "",
    Unit_Price: "",
    Quantity: "",
    FOC: 0,
    Exp_Date: today,
    Discount_Rate: "",
    Retail_Price: "",
    MRP: "",
    Total: "",
    Stock: "",
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

    const loadTaxGroup = async () => {
      try {
        const data = await fetchTaxGroup();

        setTaxGroupList(data);
      } catch (error) {
        console.error("Error fetching Location Group:", error);
      }
    };
    loadData();
    loadLocationData();
    loadTaxGroup();
  }, []);

  useEffect(() => {
    const recalculateAllTaxes = async () => {
      const updated = await Promise.all(
        productList.map((product) =>
          calculateTaxForProduct(product, grnHeadertData.TaxGroup)
        )
      );
      setProductList(updated);
    };

    if (grnHeadertData.TaxGroup) {
      recalculateAllTaxes();
    }
  }, [grnHeadertData.TaxGroup]);

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

  // useEffect(() => {
  //   if (grnData?.Unit_Price) {
  //     setUnitPrice(grnData.Unit_Price);
  //   } else {
  //     setUnitPrice("");
  //   }
  // }, [grnData]);

  useEffect(() => {
    if (grnHeadertData.Invoice_Date && grnHeadertData.Credit_Period >= 0) {
      const newDueDate = calculatePaymentDueDate(
        grnHeadertData.Invoice_Date,
        Number(grnHeadertData.Credit_Period)
      );
      setGRNHeaderData((prev) => ({
        ...prev,
        Payment_Due: newDueDate,
      }));
    }
  }, [grnHeadertData.Invoice_Date, grnHeadertData.Credit_Period]);

  useEffect(() => {
    if (productList.length === 0) {
      setTotalSum(0);
      setTaxSum(0);
      return;
    }

    const { total, tax } = productList.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.total) || 0;
        const itemTax = parseFloat(item.taxAmount) || 0;

        acc.total += itemTotal;
        acc.tax += itemTax;
        return acc;
      },
      { total: 0, tax: 0 }
    );

    setTotalSum(total);
    setTaxSum(tax);
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

  const handlePOSearch = () => {
    setOpenPOSearch(true);
  };

  //////need to do here
  const handleProductSelect = (product) => {
    setSelectedProduct(product); // Save selected row from child
    setGRNData({
      Barcode: product.Barcode,
      Product_ID: product.Product_ID,
      Description: product.Description,
      UOM: product.Stock_UM,
      Unit_Price: product.Unit_Cost,
      Quantity: product.UM_QTY,
      FOC: 0,
      Exp_Date: today,
      Discount_Rate: "",
      Retail_Price: product.Retail_Price,
      MRP: product.MRP,
      Total: "",
      Stock: "",
    });
    setUnitPrice("");
    setOpenAddModal(false); // Optionally close dialog
  };

  const handlePOSelect = async (items, headerItem) => {
    if (!items || items.length === 0) return;

    const poCode = items[0].PO_Code;
    // const isAlreadyAdded = productList.some(
    //   (p) => p.selectedProduct.MR_Code === mrCode
    // );
    const isAlreadyAdded = addedPOCodes.includes(poCode);

    if (isAlreadyAdded) {
      setOpenPOSearch(false);
      toast.error(`PO - ${poCode} Already Added!.`);
      // Optionally show a user notification here
      return;
    }
    setGRNHeaderData((prev) => ({
      ...prev,
      Location: headerItem.Location_ID,
      Supplier: headerItem.items[0].Supplier_Code,
    }));
    const newProducts = [];

    for (const item of items) {
      const unitPrice = Number(item.Unit_Price);
      const quantity = Number(item.PO_Qty);
      const discountRate = Number(item.Discount_Percent);
      const discountAmount = Number(item.Discount_Amount);
      const total = Number(item.Total_Amount);

      let taxAmount = 0;

      const Exp_Date = today;
      const newItem = {
        grnData: { ...item, Exp_Date: today, Retail_Price: 0, MRP: 0 },
        unitPrice,
        quantity: quantity.toFixed(2),
        discountRate: discountRate.toFixed(2),
        discountAmount,
        TaxGroup: item.Tax_Group_Code || "",
        taxAmount: item.Tax_Amount,
        total,
      };

      newProducts.push(newItem);
    }

    setProductList((prev) => [...prev, ...newProducts]);
    setAddedPOCodes((prev) => [...prev, poCode]);
    setOpenPOSearch(false);
  };

  const handleTaxRateCalculation = () => {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setGRNHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGRNDataChange = (e) => {
    const { name, value } = e.target;

    setGRNData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index][field] = parseFloat(value) || 0;

    const updatedProduct = await calculateTaxForProduct(
      updatedProducts[index],
      grnHeadertData.TaxGroup
    );

    updatedProducts[index] = updatedProduct;
    setProductList(updatedProducts);
  };

  const handleFieldChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index].grnData[field] = parseFloat(value) || 0;

    setProductList(updatedProducts);
  };

  const handleAddToTable = () => {
    // if (!grnData || !unitPrice || !quantity) {
    //   toast.error("Please fill in all fields before adding the item.");

    //   return;
    // }

    // Prevent duplicate item by Barcode
    const isDuplicate = productList.some(
      (item) => item.grnData?.Barcode === grnData.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      setUnitPrice("");
      setQuantity("");
      setDiscountRate(0);
      setDiscountAmount("");
      setTotal("");
      setTaxAmount("");

      //setSelectedProduct(null);
      setGRNData(null);
      return;
    }

    const newItem = {
      grnData,
      unitPrice,
      quantity: Number(quantity).toFixed(2),
      discountRate: Number(discountRate).toFixed(2),
      discountAmount,
      TaxGroup: grnHeadertData.TaxGroup || "",
      taxAmount,
      total,
    };

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setDiscountRate(0);
    setDiscountAmount("");
    setTotal("");
    setTaxAmount("");
    // setSelectedProduct(null);
    setGRNData({
      Barcode: "",
      Product_ID: "",
      Description: "",
      UOM: "",
      Unit_Price: "",
      Quantity: "",
      FOC: 0,
      Exp_Date: today,
      Discount_Rate: "",
      Retail_Price: "",
      MRP: "",
      Total: "",
      Stock: "",
    });
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) =>
      prevList.filter((p) => p.grnData.Barcode !== barcode)
    );
  };

  const handleSubmit = async () => {
    const {
      GRN_Date,
      PO_Code,
      Location,
      Supplier,
      Invoice_No,
      Invoice_Date,
      GRN_Type,
      Credit_Period,
      Payment_Due,
      TaxGroup,
    } = grnHeadertData;

    // // Validate required fields
    if (!GRN_Date || !Invoice_No || !Payment_Due || !Supplier || !Location) {
      toast.error("Please fill in all required fields in header section.");
      return;
    }

    // Validate productList
    if (!productList || productList.length === 0) {
      toast.error("Product list cannot be empty.");
      return;
    }

    const payload = {
      grnHeadertData,
      productList,
      totalSum,
      taxSum,
      addedPOCodes,
    };

    try {
      const result = await addGRN(payload);
      // await closeMaterialRequest(addedPOCodes);
      if (result.GRN_Code) {
        setGrnCode(result.GRN_Code);
      }
      setAdded(true);
      toast.success("GRN Added");
      console.log("grn_code:", grnCode);
      // setGRNHeaderData({
      //   GRN_Date: today,
      //   PO_Code: "",
      //   Location: "",
      //   Supplier: "",
      //   Invoice_No: "",
      //   Invoice_Date: today,
      //   GRN_Type: "CC",
      //   Credit_Period: "",
      //   Payment_Due: "",
      //   TaxGroup: "",
      // });
      // setGRNData({
      //   Barcode: "",
      //   Product_ID: "",
      //   Description: "",
      //   UOM: "",
      //   Unit_Price: "",
      //   Quantity: "",
      //   FOC: 0,
      //   Exp_Date: today,
      //   Discount_Rate: "",
      //   Retail_Price: "",
      //   MRP: "",
      //   Total: "",
      //   Stock: "",
      // });
      // setProductList([]);
      // setTotalSum(0);
      // setTaxSum(0);
      // navigate("/viewPurchaseOrder");
    } catch (error) {
      toast.error("Failed to add GRN.");
      console.error("Insert failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
      await insertBO_Tran(grnCode);
      toast.success("GRN Posted Successfully");
      setPosted(true);
    } catch (error) {
      toast.error("Failed to Post GRN.");
      console.error("Post failed:", error.message);
    }
  };

  return (
    <div>
      <Toaster reverseOrder={false} />
      {/* Vendor Form */}
      <Box sx={{ backgroundColor: "whitesmoke", minHeight: "120vh" }}>
        <br />
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          marginLeft={3}
          padding={1}
        >
          <Typography variant="h5">Add Good Receive Note</Typography>

          <Tooltip title="Save">
            <span>
              <IconButton
                sx={{ color: "blue" }}
                onClick={handleSubmit}
                disabled={added}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Post">
            <span>
              <IconButton
                sx={{ color: "blue" }}
                onClick={handlePosted}
                disabled={!added || posted}
              >
                <CloudUploadIcon />
              </IconButton>
            </span>
          </Tooltip>
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
                gridTemplateColumns: "repeat(5, 1fr)", // three columns on larger screens
              },
              backgroundColor: "white",
            }}
          >
            <TextField
              label="GRN Date"
              name="GRN_Date"
              value={grnHeadertData.GRN_Date}
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
            <Box display={"flex"} flexDirection={"row"} columnGap={1}>
              <Box>
                <TextField
                  label="PO Code"
                  name="PO_Code"
                  value={addedPOCodes}
                  inputRef={getRef(1)}
                  onKeyDown={handleKeyDown(1)}
                  fullWidth
                  margin="normal"
                  disabled={added}
                />
              </Box>

              <Button
                sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                onClick={handlePOSearch}
                variant="outlined"
                disabled={added}
              >
                Search
              </Button>
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
                      inputRef={getRef(2)}
                      onKeyDown={handleKeyDown(2)}
                      required
                      // error={!poHeaderData.Location}
                    />
                  )}
                  value={
                    locationList?.find(
                      (item) => item.Location_ID === grnHeadertData.Location
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.Location_ID === value.Location_ID
                  }
                  disabled={added}
                />
              </FormControl>
            </Box>

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
                  <TextField
                    {...params}
                    inputRef={getRef(3)}
                    onKeyDown={handleKeyDown(3)}
                    required
                    label="Supplier"
                  />
                )}
                value={
                  supplierList.find(
                    (item) => item.Supplier_Code === grnHeadertData.Supplier
                  ) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.Supplier_Code === value.Supplier_Code
                }
                disabled={added}
              />
            </FormControl>

            <TextField
              label="Invoice No"
              name="Invoice_No"
              type="text"
              value={grnHeadertData.Invoice_No}
              onChange={handleInputChange}
              inputRef={getRef(4)}
              onKeyDown={handleKeyDown(4)}
              margin="normal"
              required
              disabled={added}
              fullWidth
            />

            <TextField
              label="Invoice Date"
              name="Invoice_Date"
              value={grnHeadertData.Invoice_Date}
              type="date"
              onChange={handleInputChange}
              inputRef={getRef(5)}
              onKeyDown={handleKeyDown(5)}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
              disabled={added}
            />

            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>GRN Type</InputLabel>
                <Select
                  name="GRN_Type"
                  value={grnHeadertData.GRN_Type}
                  label="GRN Type"
                  onChange={handleInputChange}
                  inputRef={getRef(6)}
                  onKeyDown={handleKeyDown(6)}
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
                  <MenuItem value={"CC"}>Credit</MenuItem>
                  <MenuItem value={"CA"}>Cash</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* <Select
              name="GRN_Type"
              value={grnHeadertData.GRN_Type}
              label="GRN Type"
              onChange={handleInputChange}
              inputRef={getRef(6)}
              onKeyDown={handleKeyDown(6)}
              onClose={() => {
                // Focus next input when dropdown closes
                const nextRef = getRef(7);
                if (nextRef.current) {
                  setTimeout(() => {
                    nextRef.current.focus();
                  }, 0);
                }
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250,
                    overflow: "auto",
                  },
                },
              }}
            >
              <MenuItem value={"CC"}>Credit</MenuItem>
              <MenuItem value={"CA"}>Cash</MenuItem>
            </Select> */}

            {/* <TextField label="Delivery Address" margin="normal" /> */}
            <TextField
              label="Credit Period"
              name="Credit_Period"
              value={grnHeadertData.Credit_Period}
              onChange={handleInputChange}
              inputRef={getRef(7)}
              onKeyDown={handleKeyDown(7)}
              margin="normal"
              type="number"
              disabled={added}
            />

            <TextField
              label="Payment Due"
              name="Payment_Due"
              inputRef={getRef(8)}
              onKeyDown={handleKeyDown(8)}
              value={grnHeadertData.Payment_Due}
              type="date"
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
              disabled={added}
            />

            <Box>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={taxGroupList}
                  getOptionLabel={(option) => option.taxGroupName || ""}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: "TaxGroup",
                        value: newValue?.taxGroupCode || "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={getRef(9)}
                      onKeyDown={handleKeyDown(9)}
                      label="Tax Group"

                      // error={!poHeaderData.Location}
                    />
                  )}
                  value={
                    taxGroupList.find(
                      (item) => item.taxGroupCode === grnHeadertData.TaxGroup
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.taxGroupCode === value.taxGroupCode
                  }
                  disabled={added}
                />
              </FormControl>
            </Box>
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
              width: "90%", // Full width on smaller screens
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
                value={grnData?.Barcode || ""}
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
              value={grnData?.Product_ID || ""}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Description"
              name="Description"
              value={grnData?.Description || ""}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="UOM"
              name="UOM"
              value={grnData?.UOM || ""}
              margin="normal"
              disabled
            />

            <TextField
              label="Current Unit Price"
              margin="normal"
              value={grnData?.Unit_Price || ""}
              type="number"
              disabled
              fullWidth
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
              label="FOC"
              name="FOC"
              margin="normal"
              value={grnData?.FOC}
              onChange={handleGRNDataChange}
              type="number"
              disabled={added}
              fullWidth
            />
            <TextField
              label="Exp Date"
              name="Exp_Date"
              value={grnData?.Exp_Date}
              type="date"
              onChange={handleGRNDataChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={added}
              required
            />
            <TextField
              label="Discount Rate (%)"
              margin="normal"
              value={discountRate}
              onChange={(e) => {
                let val = e.target.value;

                // Remove leading zeros unless value is just "0"
                if (val.length > 1 && val.startsWith("0")) {
                  val = val.replace(/^0+/, "");
                }

                setDiscountRate(val);
              }}
              type="number"
              inputProps={{ min: 0, max: 100 }}
              disabled={added}
              fullWidth
            />
            <TextField
              label="Discount Amount"
              margin="normal"
              value={discountAmount}
              InputProps={{ readOnly: true }}
              disabled={added}
              fullWidth
            />

            <TextField
              label="Retail Price"
              name="Retail_Price"
              value={grnData?.Retail_Price}
              onChange={handleGRNDataChange}
              margin="normal"
              disabled={added}
              fullWidth
            />

            <TextField
              label="MRP"
              name="MRP"
              value={grnData?.MRP}
              onChange={handleGRNDataChange}
              margin="normal"
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

            <TextField
              label="Stock"
              margin="normal"
              value={grnData?.Quantity || ""}
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
            <TableContainer component={Paper} sx={{ width: "92%" }}>
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
                      <b>FOC</b>
                    </TableCell>
                    <TableCell>
                      <b>U.Price</b>{" "}
                    </TableCell>
                    <TableCell>
                      <b>Exp.Date</b>
                    </TableCell>
                    <TableCell>
                      <b>Discount Rate %</b>
                    </TableCell>
                    <TableCell>
                      <b>Discount Amount</b>{" "}
                    </TableCell>
                    <TableCell>
                      <b>Retail Price</b>{" "}
                    </TableCell>
                    <TableCell>
                      <b>MRP</b>{" "}
                    </TableCell>
                    <TableCell>
                      <b>Tax Amount</b>{" "}
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
                            handleRemoveProduct(item.grnData?.Barcode)
                          }
                          disabled={added}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.grnData?.Barcode}</TableCell>
                      <TableCell>{item.grnData?.Product_ID}</TableCell>
                      <TableCell>{item.grnData?.Description}</TableCell>
                      <TableCell>
                        {item.grnData?.UOM || item.grnData?.Product_UM}
                      </TableCell>
                      {/* <TableCell>{item.quantity}</TableCell> */}
                      <EditableNumberCell
                        value={item.quantity}
                        index={index}
                        field="quantity"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleProductChange}
                      />
                      <EditableNumberCell
                        value={item.grnData?.FOC}
                        index={index}
                        field="FOC"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleFieldChange}
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
                      {/* <TableCell>{Number(item.unitPrice).toFixed(2)}</TableCell> */}
                      <TableCell sx={{ minWidth: 100 }}>
                        {item.grnData?.Exp_Date}
                      </TableCell>
                      <EditableNumberCell
                        value={item.discountRate}
                        index={index}
                        field="discountRate"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleProductChange}
                        fixed={true}
                        allowLeadingZero={false}
                      />

                      {/* <TableCell>{item.discountRate}</TableCell> */}
                      <TableCell>
                        {Number(item.discountAmount).toFixed(2)}
                      </TableCell>

                      <EditableNumberCell
                        value={item.grnData?.Retail_Price}
                        index={index}
                        field="Retail_Price"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleFieldChange}
                        fixed={true}
                        allowLeadingZero={false}
                      />
                      {/* {Number(item.grnData?.Retail_Price).toFixed(2)} */}

                      {/* <TableCell>
                        {Number(item.grnData?.MRP).toFixed(2)}
                      </TableCell> */}
                      <EditableNumberCell
                        value={item.grnData?.MRP}
                        index={index}
                        field="MRP"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleFieldChange}
                        fixed={true}
                        allowLeadingZero={false}
                      />
                      <TableCell>{Number(item.taxAmount).toFixed(2)}</TableCell>
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

        <SearchDialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onConfirmSelection={handleProductSelect} // Pass callback
          //   onConfirmSelection={handleConfirmSelection}
        />

        <POSearchDialog
          open={openPOSearch}
          onClose={() => setOpenPOSearch(false)}
          onConfirmPOSelection={handlePOSelect}
        />

        {/* <MRSearchDialog
          open={openMRSearch}
          onClose={() => setOpenMRSearch(false)}
          onConfirmMRSelection={handleMrSelect}
        /> */}
      </Box>
    </div>
  );
}
