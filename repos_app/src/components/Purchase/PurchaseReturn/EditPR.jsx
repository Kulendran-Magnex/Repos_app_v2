import { useState, useEffect, useCallback } from "react";
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
  addPurchaseReturn,
  editPurchaseReturn,
  fetchLocationMaster,
  fetchSupplierList,
  insertBO_Tran_PR,
} from "../../API/api";
import SearchDialog from "../PurchaseOrder/SearchDialog";
import { fetchTaxGroup } from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useNavigate } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import GRNSearchDialog from "../GRN/GRNSearchDialog";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PageHeader from "../../Common/PageHeader";
import { useLocation } from "react-router-dom";

const calculateTaxForProduct = async (product, taxGroupCode) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;
  const discountRate = parseFloat(product.discountRate) || 0;
  const discountAmt = (qty * price * discountRate) / 100;
  const subTotal = qty * price - discountAmt;

  let taxAmount = 0;

  // if (taxGroupCode) {
  //   try {
  //     const res = await axios.post("http://localhost:5000/api/calculate-tax", {
  //       taxGroupCode,
  //     });

  //     const { formulas } = res.data;
  //     let totalTax = 0;

  //     formulas.forEach((formula) => {
  //       try {
  //         const expression = formula.replace(/total/gi, `(${subTotal} * 0.01)`);
  //         const tax = evaluate(expression);
  //         if (!isNaN(tax)) {
  //           totalTax += tax;
  //         }
  //       } catch (e) {
  //         console.warn("Invalid tax formula:", formula);
  //       }
  //     });

  //     taxAmount = parseFloat(totalTax.toFixed(2));
  //   } catch (error) {
  //     console.error("Failed to recalculate tax:", error);
  //   }
  // }

  const total = subTotal + taxAmount;

  return {
    ...product,
    discountAmount: parseFloat(discountAmt.toFixed(2)),
    taxAmount,
    Total_Amount: parseFloat(total.toFixed(2)),
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

export default function EditPR() {
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
  const [grnCode, setGrnCode] = useState("");
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);
  const location = useLocation();
  const { currentItemID } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);

  const [prHeaderData, setPRHeaderData] = useState({
    PR_Code: "New",
    PR_Date: today,
    Location: "",
    Supplier: "",
    Invoice_No: "",
    PR_Status: "O",
    Payment_Due: "",
    TaxGroup: "",
  });

  const [prData, setPRData] = useState({
    Barcode: "",
    Product_ID: "",
    Description: "",
    UOM: "",
    Unit_Price: "",
    Quantity: "",
    FOC: 0,
    Exp_Date: today,
    Discount_Rate: "",
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
    if (!currentItemID) return;

    axios
      .get(`http://localhost:5000/api/PR_Header/${currentItemID}`)
      .then((res) => {
        const data = res.data[0];
        // Format dates safely or return empty string if null
        const formatDate = (value) => {
          if (!value) return ""; // handles null or undefined
          const date = new Date(value);
          return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
        };

        setPRHeaderData({
          PR_Date: formatDate(data.PR_Date),
          PR_Code: data.PR_Code || "",
          Location: data.Location_ID || "",
          Supplier: data.Supplier_Code || "",
          Invoice_No: data.Invoice_No || "",
          PR_Status: prHeaderData.PR_Status === "" || prHeaderData.PR_Status == null ? 0
    : Number(prHeaderData.PR_Status),
          TaxGroup: "", // fill later if needed
        });

        if (data.GRN_Status === "P") {
          setPosted(true);
        } else {
          setPosted(false); // optional, if you want to reset when not "P"
        }
      })
      .catch((err) => {
        console.error("Error fetching PR Header data:", err);
      });
  }, [currentItemID]);

  useEffect(() => {
    if (!currentItemID) return;

    const fetchGRNTran = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/PR_Tran/${currentItemID}`
        );
        const data = res.data;
        console.log("Fetched PR Tran data:", data);
        if (data) {
          const formattedList = data.map((item) => ({
            Barcode: item.Barcode,
            Description: item.Description,
            Discount_Amount: item.Discount_Amount,
            Discount_Percent: item.Discount_Percent,
            FOC: item.FOC,
            Product_ID: item.Product_ID,
            Product_UM: item.Product_UM,
            TaxGroup: item.Tax_Group_Code,
            Tax_Amount: item.Tax_Amount,
            Total_Amount: item.Total_Amount,
            quantity: item.PR_Qty,
            unitPrice: item.Unit_Price,
          }));
          setProductList(formattedList);

          // Set TaxGroup from first item if available
          if (formattedList.length > 0 && formattedList[0].TaxGroup) {
            setPRHeaderData((prev) => ({
              ...prev,
              TaxGroup: formattedList[0].TaxGroup,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching PR Tran data:", err);
      }
    };

    fetchGRNTran();
  }, [currentItemID]);

  useEffect(() => {
    const recalculateAllTaxes = async () => {
      const updated = await Promise.all(
        productList.map((product) =>
          calculateTaxForProduct(product, prHeaderData.TaxGroup)
        )
      );
      setProductList(updated);
    };

    if (prHeaderData.TaxGroup) {
      recalculateAllTaxes();
    }
  }, [prHeaderData.TaxGroup]);

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
    if (productList.length === 0) {
      setTotalSum(0);
      setTaxSum(0);
      return;
    }

    const { total, tax } = productList.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.Total_Amount) || 0;
        const itemTax = parseFloat(item.Tax_Amount) || 0;

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
    setPRData({
      Barcode: product.Barcode,
      Product_ID: product.Product_ID,
      Description: product.Description,
      UOM: product.Stock_UM,
      Unit_Price: product.Unit_Cost,
      Quantity: product.UM_QTY,
      FOC: 0,
      Discount_Rate: "",

      Total: "",
      Stock: "",
    });
    setUnitPrice("");
    setOpenAddModal(false); // Optionally close dialog
  };

  const handleGRNSelect = async (items, headerItem) => {
    if (!items || items.length === 0) return;
    console.log("Selected Items testing:", items);
    console.log("Selected Head items testing:", headerItem);
    const grnCode = items[0].GRN_Code;
    // const isAlreadyAdded = productList.some(
    //   (p) => p.selectedProduct.MR_Code === mrCode
    // );
    const isAlreadyAdded = addedGRNCodes.includes(grnCode);

    if (isAlreadyAdded) {
      setOpenPOSearch(false);
      toast.error(`GRN - ${grnCode} Already Added!.`);
      // Optionally show a user notification here
      return;
    }
    setPRHeaderData((prev) => ({
      ...prev,
      Location: headerItem.Location_ID,
      Supplier: headerItem.items[0].Supplier_Code,
      Invoice_No: headerItem.Invoice_No,
    }));
    const newProducts = [];

    for (const item of items) {
      const unitPrice = Number(item.Unit_Price);
      const quantity = Number(item.GRN_Qty);
      const discountRate = Number(item.Discount_Percent);
      const discountAmount = Number(item.Discount_Amount);
      const total = Number(item.Total_Amount);

      const newItem = {
        Barcode: item.Barcode,
        Description: item.Description,
        Discount_Amount: discountAmount,
        Discount_Percent: discountRate.toFixed(2),
        quantity,
        unitPrice,
        Product_ID: item.Product_ID,
        Product_UM: item.Product_UM,
        Tax_Group_Code: item.Tax_Group_Code || "",
        Tax_Amount: item.Tax_Amount,
        Total_Amount: total,
      };

      newProducts.push(newItem);
    }

    setProductList((prev) => [...prev, ...newProducts]);
    setAddedGRNCodes((prev) => [...prev, grnCode]);
    setOpenPOSearch(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPRHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePRDataChange = (e) => {
    const { name, value } = e.target;

    setPRData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProductChange01 = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index][field] = parseFloat(value) || 0;

    const updatedProduct = await calculateTaxForProduct(
      updatedProducts[index],
      prHeaderData.TaxGroup
    );

    updatedProducts[index] = updatedProduct;
    setProductList(updatedProducts);
  };

  const handleProductChange = useCallback(
    async (index, field, value) => {
      const updatedProducts = [...productList];
      updatedProducts[index][field] = parseFloat(value) || 0;

      let updatedProduct;

      console.log("part02");
      // Recalculate discount and total even if no tax
      const qty = parseFloat(updatedProducts[index].quantity) || 0;
      const price = parseFloat(updatedProducts[index].unitPrice) || 0;
      const discountRate =
        parseFloat(updatedProducts[index].Discount_Percent) || 0;
      const discountAmt = (qty * price * discountRate) / 100;
      const subTotal = qty * price - discountAmt;

      updatedProduct = {
        ...updatedProducts[index],
        Discount_Amount: parseFloat(discountAmt.toFixed(2)),
        Tax_Amount: 0,
        Total_Amount: parseFloat(subTotal.toFixed(2)),
        Tax_Breakdown: {},
      };

      updatedProducts[index] = updatedProduct;
      setProductList(updatedProducts);
    },
    [productList]
  );

  const handleFieldChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index].prData[field] = parseFloat(value) || 0;

    setProductList(updatedProducts);
  };

  const handleAddToTable = () => {
    // Prevent duplicate item by Barcode
    const isDuplicate = productList.some(
      (item) => item.Barcode === prData.Barcode
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
      setPRData(null);
      return;
    }

    const { Barcode, Product_ID, Description, UOM } = prData;

    if (!Barcode || !Product_ID || !Description || !UOM) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newItem = {
      prData,
      unitPrice,
      quantity: Number(quantity).toFixed(2),
      discountAmount,
      TaxGroup: prHeaderData.TaxGroup || "",
      taxAmount,
      total,
      Barcode: prData.Barcode,
      Product_ID: prData.Product_ID,
      Description: prData.Description,
      FOC: prData.FOC,
      Product_UM: prData.UOM,
      Discount_Percent: Number(discountRate).toFixed(2),
      Discount_Amount: discountAmount,
      Tax_Amount: taxAmount,
      Total_Amount: total,
      MRP: prData.MRP,
      Retail_Price: prData.Retail_Price,
    };

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setDiscountRate(0);
    setDiscountAmount("");
    setTotal("");
    setTaxAmount("");
    // setSelectedProduct(null);
    setPRData({
      Barcode: "",
      Product_ID: "",
      Description: "",
      UOM: "",
      Unit_Price: "",
      Quantity: "",
      FOC: 0,
      Discount_Rate: "",

      Total: "",
      Stock: "",
    });
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) => prevList.filter((p) => p.Barcode !== barcode));
  };

  const handleSubmit = async () => {
    const { PR_Date, Location, Supplier, Invoice_No } = prHeaderData;

    // // Validate required fields
    if (!PR_Date || !Invoice_No || !Supplier || !Location) {
      toast.error("Please fill in all required fields in header section.");
      return;
    }

    // Validate productList
    if (!productList || productList.length === 0) {
      toast.error("Product list cannot be empty.");
      return;
    }

    const payload = {
      prHeaderData,
      productList,
      totalSum,
      taxSum,
      addedGRNCodes,
    };

    try {
      console.log("payload:", payload);
      const result = await editPurchaseReturn(currentItemID, payload);
      if (result.PR_Code) {
        setGrnCode(result.PR_Code);
      }
      setAdded(true);
      toast.success("PR Updated Successfully");
    } catch (error) {
      toast.error("Failed to update PR.");
      console.error("Updation Failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
      await insertBO_Tran_PR(currentItemID);
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
            title="Purchase Return"
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
              // <Button variant="outlined" color="primary" key="print">
              //   Print / Save PDF
              // </Button>,
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
                columnGap: 2,
                gridTemplateColumns: "repeat(1, 1fr)", // Single column by default
                "@media (min-width:600px)": {
                  gridTemplateColumns: "repeat(4, 1fr)", // three columns on larger screens
                },
                backgroundColor: "white",
              }}
            >
              <TextField
                label="PR Code"
                name="PR_Code"
                type="text"
                value={prHeaderData.PR_Code}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled
                fullWidth
              />
              <TextField
                label="PR Date"
                name="PR_Date"
                value={prHeaderData.PR_Date}
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
                    <TextField {...params} required label="Supplier" />
                  )}
                  value={
                    supplierList.find(
                      (item) => item.Supplier_Code === prHeaderData.Supplier
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.Supplier_Code === value.Supplier_Code
                  }
                  disabled={added}
                />
              </FormControl>

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
                        (item) => item.Location_ID === prHeaderData.Location
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.Location_ID === value.Location_ID
                    }
                    disabled={added}
                  />
                </FormControl>
              </Box>

              <Box display={"flex"} flexDirection={"row"} columnGap={1}>
                <Box>
                  <TextField
                    label="GRN Code"
                    name="GRN_Code"
                    value={addedGRNCodes}
                    fullWidth
                    margin="normal"
                    disabled={added}
                  />
                </Box>

                <Button
                  sx={{ maxWidth: 150, marginTop: 3, marginBottom: 4 }}
                  onClick={handlePOSearch}
                  variant="outlined"
                  disabled={added}
                >
                  Search
                </Button>
              </Box>

              <TextField
                label="Invoice No"
                name="Invoice_No"
                type="text"
                value={prHeaderData.Invoice_No}
                onChange={handleInputChange}
                inputRef={getRef(4)}
                onKeyDown={handleKeyDown(4)}
                margin="normal"
                required
                disabled={added}
                fullWidth
              />

              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>PR Status</InputLabel>
                  <Select
                    name="PR_Status"
                    value={prHeaderData.PR_Status === "" ||
  prHeaderData.PR_Status == null
    ? 0
    : Number(prHeaderData.PR_Status)}
                    label="PR Status"
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
                name=""
                value={"Admin"}
                onChange={handleInputChange}
                inputRef={getRef(7)}
                onKeyDown={handleKeyDown(7)}
                margin="normal"
                type="text"
                disabled
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
                  value={prData?.Barcode || ""}
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
                value={prData?.Product_ID || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Description"
                name="Description"
                value={prData?.Description || ""}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="UOM"
                name="UOM"
                value={prData?.UOM || ""}
                margin="normal"
                disabled
              />

              <TextField
                label="Current Unit Price"
                margin="normal"
                value={prData?.Unit_Price || ""}
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
                value={prData?.FOC}
                onChange={handlePRDataChange}
                type="number"
                disabled={added}
                fullWidth
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
                label="Total"
                margin="normal"
                value={total}
                fullWidth
                disabled
              />

              <TextField
                label="Stock"
                margin="normal"
                value={prData?.Quantity || ""}
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
                  <TableHead sx={{ bgcolor: "whitesmoke" }}>
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
                        <b>Discount Rate %</b>
                      </TableCell>
                      <TableCell>
                        <b>Discount Amount</b>{" "}
                      </TableCell>
                      {/* <TableCell>
                        <b>Tax Amount</b>{" "}
                      </TableCell> */}
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
                            onClick={() => handleRemoveProduct(item.Barcode)}
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
                          value={item.FOC}
                          index={index}
                          field="FOC"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleFieldChange}
                        />
                        <EditableNumberCell
                          value={item.unitPrice}
                          Unit_Price
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

                        <EditableNumberCell
                          value={item.Discount_Percent}
                          index={index}
                          field="Discount_Percent"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />

                        {/* <TableCell>{item.discountRate}</TableCell> */}
                        <TableCell>
                          {Number(item.Discount_Amount).toFixed(2)}
                        </TableCell>

                        {/* <TableCell>
                          {Number(item.Tax_Amount).toFixed(2)}
                        </TableCell> */}
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

        <GRNSearchDialog
          open={openPOSearch}
          onClose={() => setOpenPOSearch(false)}
          onConfirmGRNSelection={handleGRNSelect}
          supplierCode={prHeaderData.Supplier}
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
