import { useState, useEffect, useMemo, useCallback } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import { editGRN, fetchLocationMaster, fetchSupplierList } from "../../API/api";
import SearchDialog from "../PurchaseOrder/SearchDialog";
import { fetchTaxGroup, insertBO_Tran } from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useNavigate, useLocation } from "react-router-dom";
import EditableNumberCell from "../../Common/EditableNumberCell";
import { useFormNavigation } from "../../../utils/useFormNavigation";
import POSearchDialog from "./POSearchDialog";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PrintIcon from "@mui/icons-material/Print";
import { fetchGRNHeaderbyID,fetchGRNTranbyID } from "../../API/api";

const calculateTaxForProduct = async (product, taxDetails) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;
  const discountRate = parseFloat(product.Discount_Percent) || 0;
  const discountAmt = (qty * price * discountRate) / 100;
  const subTotal = qty * price - discountAmt;
  let taxAmount = 0;
  let taxBreakdown = {};

  if (taxDetails && taxDetails.length > 0) {
    taxDetails.forEach(({ Tax_Name, Formula }) => {
      try {
        const expression = Formula.replace(/total/gi, `(${subTotal} * 0.01)`);
        const tax = evaluate(expression);
        if (!isNaN(tax)) {
          taxBreakdown[Tax_Name] = parseFloat(tax.toFixed(2));
          taxAmount += tax;
        }
      } catch (e) {
        console.warn("Invalid tax formula for", Tax_Name, ":", Formula);
      }
    });
  }

  return {
    ...product,
    Discount_Amount: parseFloat(discountAmt.toFixed(2)),
    Tax_Amount: parseFloat(taxAmount.toFixed(2)),
    Total_Amount: parseFloat(subTotal.toFixed(2)), // or subTotal + taxAmount if needed
    Tax_Breakdown: taxBreakdown,
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

export default function EditGRN() {
  const [supplierList, setSupplierList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [taxGroupList, setTaxGroupList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openPOSearch, setOpenPOSearch] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [total, setTotal] = useState("");
  const [productList, setProductList] = useState([]);
  const [taxRate, setTaxRate] = useState([]);
  const [taxAmount, setTaxAmount] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const [addedPOCodes, setAddedPOCodes] = useState([]);
  const { getRef, handleKeyDown, refs } = useFormNavigation(10); // 10 fields
  const location = useLocation();
  const { currentItemID } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);
  const [posted, setPosted] = useState(false);
  const [taxFormulas, setTaxFormulas] = useState([]);
  const [prevTaxGroupCode, setPrevTaxGroupCode] = useState(null);
  const [taxDetails, setTaxDetails] = useState([]);

  const [grnHeaderData, setGRNHeaderData] = useState({
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
    FOC: 0,
    Quantity: "",
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

  // useEffect(() => {
  //   if (!currentItemID) return;

    

  //   axios
  //     .get(`http://localhost:5000/api/GRN_Header/${currentItemID}`)
  //     .then((res) => {
  //       const data = res.data[0];
  //       // Format dates safely or return empty string if null
  //       const formatDate = (value) => {
  //         if (!value) return ""; // handles null or undefined
  //         const date = new Date(value);
  //         return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  //       };

  //       setGRNHeaderData({
  //         GRN_Date: formatDate(data.GRN_Date),
  //         PO_Code: data.PO_Code || "",
  //         Location: data.Location_ID || "",
  //         Supplier: data.Supplier_Code || "",
  //         Invoice_No: data.Invoice_No || "",
  //         Invoice_Date: formatDate(data.Invoice_Date),
  //         GRN_Type: data.GRN_Type || "",
  //         Credit_Period: "", // fill later if needed
  //         Payment_Due: formatDate(data.Payment_Due_Date),
  //         TaxGroup: "", // fill later if needed
  //         GRN_Status: data.GRN_Status,
  //       });

  //       if (data.GRN_Status === "P") {
  //         setPosted(true);
  //       } else {
  //         setPosted(false); // optional, if you want to reset when not "P"
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching GRN Header data:", err);
  //     });
  // }, [currentItemID]);

  useEffect(() => {
    if (!currentItemID) return;

    const loadGRNHeader = async () => {
      try {
        await fetchGRNHeaderbyID(currentItemID).then(res => {
          const data = res;
          console.log("Header:,", data);
          const formatDate = (value) => {
            if (!value) return ""; // handles null or undefined
            const date = new Date(value);
            return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
          };

          setGRNHeaderData({
            GRN_Date: formatDate(data.GRN_Date),
            PO_Code: data.PO_Code || "",
            Location: data.Location_ID || "",
            Supplier: data.Supplier_Code || "",
            Invoice_No: data.Invoice_No || "",
            Invoice_Date: formatDate(data.Invoice_Date),
            GRN_Type: data.GRN_Type || "",
            Credit_Period: "", // fill later if needed
            Payment_Due: formatDate(data.Payment_Due_Date),
            TaxGroup: "", // fill later if needed
            GRN_Status: data.GRN_Status,
          });

          if (data.GRN_Status === "P") {
            setPosted(true);
          } else {
            setPosted(false); // optional, if you want to reset when not "P"
          }
        });
      } catch (err) {
         console.error("Error fetching GRN Header data:", err);
      }
      
    };

    loadGRNHeader();
  }, [currentItemID]);

    useEffect(() => {
    if (!currentItemID) return;

    const loadGRNTran = async () => {
      try {
        const data = await fetchGRNTranbyID(currentItemID);
       if (data) {
          const formattedList = data.map((item) => ({
            Barcode: item.Barcode,
            Description: item.Description,
            Discount_Amount: item.Discount_Amount,
            Discount_Percent: item.Discount_Percent,
            Exp_Date: item.Exp_Date,
            FOC: item.FOC,
            Product_ID: item.Product_ID,
            Product_UM: item.Product_UM,
            TaxGroup: item.Tax_Group_Code,
            Tax_Amount: item.Tax_Amount,
            Total_Amount: item.Total_Amount,
            quantity: item.GRN_Qty,
            unitPrice: item.Unit_Price,
            MRP: item.MRP,
            Retail_Price: item.Retail_Price,
          }));
          setProductList(formattedList);

          // Set TaxGroup from first item if available
          if (formattedList.length > 0 && formattedList[0].TaxGroup) {
            setGRNHeaderData((prev) => ({
              ...prev,
              TaxGroup: formattedList[0].TaxGroup,
            }));
          }}
      } catch (err) {
         console.error("Error fetching GRN Tran data:", err);
      }
    };

    loadGRNTran();
  }, [currentItemID]);

    // useEffect(() => {
  //   if (!currentItemID) return;

  //   const fetchGRNTran = async () => {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:5000/api/GRN_Tran/${currentItemID}`
  //       );
  //       const data = res.data;
  //       if (data) {
  //         const formattedList = data.map((item) => ({
  //           Barcode: item.Barcode,
  //           Description: item.Description,
  //           Discount_Amount: item.Discount_Amount,
  //           Discount_Percent: item.Discount_Percent,
  //           Exp_Date: item.Exp_Date,
  //           FOC: item.FOC,
  //           Product_ID: item.Product_ID,
  //           Product_UM: item.Product_UM,
  //           TaxGroup: item.Tax_Group_Code,
  //           Tax_Amount: item.Tax_Amount,
  //           Total_Amount: item.Total_Amount,
  //           quantity: item.GRN_Qty,
  //           unitPrice: item.Unit_Price,
  //           MRP: item.MRP,
  //           Retail_Price: item.Retail_Price,
  //         }));
  //         setProductList(formattedList);

  //         // Set TaxGroup from first item if available
  //         if (formattedList.length > 0 && formattedList[0].TaxGroup) {
  //           setGRNHeaderData((prev) => ({
  //             ...prev,
  //             TaxGroup: formattedList[0].TaxGroup,
  //           }));
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error fetching GRN Tran data:", err);
  //     }
  //   };

  //   fetchGRNTran();
  // }, [currentItemID]);

  useEffect(() => {
    if (grnHeaderData.Invoice_Date && grnHeaderData.Credit_Period >= 0) {
      const newDueDate = calculatePaymentDueDate(
        grnHeaderData.Invoice_Date,
        Number(grnHeaderData.Credit_Period)
      );
      setGRNHeaderData((prev) => ({
        ...prev,
        Payment_Due: newDueDate,
      }));
    }
  }, [grnHeaderData.Invoice_Date, grnHeaderData.Credit_Period]);

  const totals = useMemo(() => {
    if (productList.length === 0) {
      return { totalSum: 0, taxSum: 0, taxBreakdownTotals: {} };
    }
    return productList.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.Total_Amount) || 0;
        const itemTax = parseFloat(item.Tax_Amount) || 0;
        const breakdown = item.Tax_Breakdown || {};

        acc.totalSum += itemTotal;
        acc.taxSum += itemTax;

        for (const [taxType, amount] of Object.entries(breakdown)) {
          const parsedAmount = parseFloat(amount) || 0;
          acc.taxBreakdownTotals[taxType] =
            (acc.taxBreakdownTotals[taxType] || 0) + parsedAmount;
        }
        return acc;
      },
      { totalSum: 0, taxSum: 0, taxBreakdownTotals: {} }
    );
  }, [productList]);

  const totalSum = totals.totalSum;
  const taxSum = totals.taxSum;
  const taxBreakdownTotals = totals.taxBreakdownTotals;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F1") {
        event.preventDefault(); // ✅ This must come before any return or browser will still react
        setOpenAddModal(true);
      }
    };

    // ✅ Use capture phase to intercept before browser default
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const fetchTaxFormulas = async (taxGroupCode) => {
    try {
      const res = await axios.post("http://localhost:5000/api/calculate-tax", {
        taxGroupCode,
      });
      setTaxDetails(res.data.taxes || []);
      setPrevTaxGroupCode(taxGroupCode);
    } catch (error) {
      console.error("Error fetching tax formulas:", error);
      setTaxDetails([]);
    }
  };

  useEffect(() => {
    if (grnHeaderData.TaxGroup) {
      fetchTaxFormulas(grnHeaderData.TaxGroup);
    } else {
      setProductList((prev) =>
        prev.map((item) => ({
          ...item,
          Tax_Amount: 0,
          Tax_Breakdown: {},
          // Optionally recalculate Total_Amount if you normally add tax to it
          // Total_Amount: parseFloat(item.quantity) * parseFloat(item.unitPrice) - ((parseFloat(item.quantity) * parseFloat(item.unitPrice) * (parseFloat(item.Discount_Percent) || 0)) / 100),
        }))
      );
      setTaxDetails([]);
    }
  }, [grnHeaderData.TaxGroup]);

  useEffect(() => {
    const recalculateAllTaxes = async () => {
      if (taxDetails.length > 0) {
        const updated = await Promise.all(
          productList.map((product) =>
            calculateTaxForProduct(product, taxDetails)
          )
        );
        setProductList(updated);
      }
    };

    recalculateAllTaxes();
  }, [taxDetails]);

  // Auto-calculate Discount Amount, Tax Amount and Total for the Add Item form
  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(unitPrice) || 0;
    const dr = parseFloat(discountRate) || 0;

    const discountAmtCalc = (q * p * dr) / 100;
    const subTotalCalc = q * p - discountAmtCalc;

    setDiscountAmount(discountAmtCalc ? parseFloat(discountAmtCalc.toFixed(2)) : 0);

    if (taxDetails && taxDetails.length > 0) {
      (async () => {
        try {
          const temp = { quantity: q, unitPrice: p, Discount_Percent: dr };
          const res = await calculateTaxForProduct(temp, taxDetails);
          setTaxAmount(res.Tax_Amount || 0);
          setTotal(
            res.Total_Amount !== undefined
              ? parseFloat(res.Total_Amount.toFixed(2))
              : parseFloat(subTotalCalc.toFixed(2))
          );
        } catch (err) {
          console.error("Error calculating tax for add item:", err);
          setTaxAmount(0);
          setTotal(parseFloat(subTotalCalc.toFixed(2)));
        }
      })();
    } else {
      setTaxAmount(0);
      setTotal(parseFloat(subTotalCalc.toFixed(2)));
    }
  }, [unitPrice, quantity, discountRate, taxDetails]);

  const handleSearch = () => {
    setOpenAddModal(true);
    // Trigger your search or other logic here based on the barcode
  };

  const handlePOSearch = () => {
    setOpenPOSearch(true);
  };

  const handleProductSelect = (product) => {
    setGRNData({
      Barcode: product.Barcode,
      Product_ID: product.Product_ID,
      Description: product.Description,
      UOM: product.Stock_UM,
      Unit_Price: product.Unit_Cost,
      Quantity: product.UM_QTY,
      Exp_Date: today,
      Discount_Rate: "",
      Retail_Price: product.Retail_Price,
      MRP: product.MRP || 0,
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

  const handleProductChange = useCallback(
    async (index, field, value) => {
      const updatedProducts = [...productList];
      updatedProducts[index][field] = parseFloat(value) || 0;

      let updatedProduct;
      if (taxDetails && taxDetails.length > 0) {
        updatedProduct = await calculateTaxForProduct(
          updatedProducts[index],
          taxDetails
        );
      } else {
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
      }

      updatedProducts[index] = updatedProduct;
      setProductList(updatedProducts);
    },
    [productList, taxDetails]
  );

  const handleFieldChange = useCallback(
    (index, field, value) => {
      const updatedProducts = [...productList];
      updatedProducts[index][field] = parseFloat(value) || 0;
      setProductList(updatedProducts);
    },
    [productList]
  );

  const handleAddToTable = () => {
    if (!grnData || !unitPrice || !quantity) {
      toast.error("Please fill in all fields before adding the item.");

      return;
    }

    // Prevent duplicate item by Barcode
    const isDuplicate = productList.some(
      (item) => item.Barcode === grnData.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      setUnitPrice("");
      setQuantity("");
      setDiscountRate(0);
      setDiscountAmount("");
      setTotal("");
      setTaxAmount("");

      setGRNData(null);
      return;
    }

    const newItem = {
      Barcode: grnData.Barcode,
      Product_ID: grnData.Product_ID,
      Description: grnData.Description,
      Exp_Date: grnData.Exp_Date,
      FOC: grnData.FOC,
      Product_UM: grnData.UOM,
      unitPrice,
      quantity: Number(quantity).toFixed(2),
      Discount_Percent: Number(discountRate).toFixed(2),
      Discount_Amount: discountAmount,
      TaxGroup: grnHeaderData.TaxGroup || "",
      Tax_Amount: taxAmount,
      Total_Amount: total,
      MRP: grnData.MRP,
      Retail_Price: grnData.Retail_Price,
    };

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setDiscountRate(0);
    setDiscountAmount("");
    setTotal("");
    setTaxAmount("");

    setGRNData({
      Barcode: "",
      Product_ID: "",
      Description: "",
      UOM: "",
      Unit_Price: "",
      FOC: "",
      Quantity: "",
      Exp_Date: today,
      Discount_Rate: "",
      Retail_Price: "",
      MRP: "",
      Total: "",
      Stock: "",
    });
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) => prevList.filter((p) => p.Barcode !== barcode));
  };

  const handleEditClick = () => {
    setIsEditing((prev) => {
      // If we're turning editing OFF, make sure to reset any row editing state
      if (prev) {
        setEditingRowIndex(null);
      }
      return !prev;
    }); // Toggle edit mode
  };

  const handleSubmit = async () => {
    const { GRN_Date, Location, Supplier, Invoice_No, Payment_Due } =
      grnHeaderData;

    // Validate required fields
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
      grnHeaderData,
      productList,
      totalSum,
      taxSum,
      addedPOCodes,
    };

    try {
      await editGRN(currentItemID, payload);
      console.log("payload:", payload);
      // await closeMaterialRequest(addedPOCodes);
      toast.success("GRN Saved Successfully");
      setIsEditing((prev) => !prev);

      // navigate("/viewPurchaseOrder");
    } catch (error) {
      toast.error("Failed to add GRN.");
      console.error("Insert failed:", error.message);
    }
  };

  const handlePosted = async () => {
    try {
      await insertBO_Tran(currentItemID);
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
      <Box sx={{ backgroundColor: "whitesmoke", minHeight: "91vh" }}>
        <br />
        <Box display="flex" alignItems="center" marginLeft={2} padding={1}>
          <Typography variant="h5" sx={{ paddingLeft: 6 }}>
            {"    "} {currentItemID} |
          </Typography>
          {""}
          <Tooltip title="Edit">
            <span>
              <IconButton
                sx={{ color: "blue", marginLeft: 2 }}
                onClick={handleEditClick}
                disabled={isEditing || posted}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          {!isEditing && (
            <Chip
              label="View only"
              icon={<LockIcon />}
              size="small"
              sx={{ ml: 1, alignSelf: 'center' }}
            />
          )}
          <Tooltip title="Save">
            <span>
              <IconButton
                sx={{ color: "blue" }}
                onClick={handleSubmit}
                disabled={!isEditing}
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
                disabled={isEditing || posted}
              >
                <CloudUploadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Print" key="post">
            <span>
              <IconButton
                sx={{ color: "blue" }}
                // onClick={handlePosted}
                disabled={isEditing || posted}
              >
                <PrintIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          {/* <Button>
            {" "}
            <UploadIcon />
            Post
          </Button> */}
        </Box>

        <Box display="flex" justifyContent="center" marginTop={2}>
          <Box
            component="form"
            sx={{
              position: "relative",
              minWidth: 100, // Min width for form
              width: "95%", // Full width on smaller screens
              // margin: "0 auto", // Center form horizontally
              padding: 2, // Optional padding for better spacing

              display: "grid",
              rowGap: 0.5,
              columnGap: 2,
              gridTemplateColumns: "repeat(1, 1fr)", // Single column by default
              "@media (min-width:600px)": {
                gridTemplateColumns: "repeat(5, 1fr)", // three columns on larger screens
              },
              backgroundColor: "#ffffff",

              // Styling for disabled inputs to make view-mode clearer
              '& .MuiInputBase-root.Mui-disabled': {
                backgroundColor: '#f5f7fb',
                WebkitTextFillColor: 'rgba(0,0,0,0.87)',
              },
              '& .MuiAutocomplete-root .MuiInputBase-root.Mui-disabled': {
                backgroundColor: '#f5f7fb',
              },
            }}
          >

            <TextField
              label="GRN Date"
              name="GRN_Date"
              value={grnHeaderData.GRN_Date}
              inputRef={getRef(0)}
              onKeyDown={handleKeyDown(0)}
              type="date"
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: !isEditing }}
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
                  disabled
                />
              </Box>

              <Button
                sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                onClick={handlePOSearch}
                variant="outlined"
                disabled={!isEditing}
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
                      InputProps={{ readOnly: !isEditing }}
                      // error={!poHeaderData.Location}
                    />
                  )}
                  value={
                    locationList?.find(
                      (item) => item.Location_ID === grnHeaderData.Location
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.Location_ID === value.Location_ID
                  }
                  disabled={!isEditing}
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
                    InputProps={{ readOnly: !isEditing }}
                  />
                )}
                value={
                  supplierList.find(
                    (item) => item.Supplier_Code === grnHeaderData.Supplier
                  ) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.Supplier_Code === value.Supplier_Code
                }
                disabled={!isEditing}
              />
            </FormControl>

            <TextField
              label="Invoice No"
              name="Invoice_No"
              type="text"
              value={grnHeaderData.Invoice_No}
              onChange={handleInputChange}
              inputRef={getRef(4)}
              onKeyDown={handleKeyDown(4)}
              margin="normal"
              required
              InputProps={{ readOnly: !isEditing }}
              fullWidth
            />

            <TextField
              label="Invoice Date"
              name="Invoice_Date"
              value={grnHeaderData.Invoice_Date}
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
              InputProps={{ readOnly: !isEditing }}
            />

            <Box>
              {isEditing ? (
                <FormControl fullWidth margin="normal">
                  <InputLabel>GRN Type</InputLabel>
                  <Select
                    name="GRN_Type"
                    value={grnHeaderData.GRN_Type}
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
                  >
                    <MenuItem value={"CC"}>Credit</MenuItem>
                    <MenuItem value={"CA"}>Cash</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="GRN Type"
                  value={
                    grnHeaderData.GRN_Type === "CC"
                      ? "Credit"
                      : grnHeaderData.GRN_Type === "CA"
                      ? "Cash"
                      : grnHeaderData.GRN_Type || ""
                  }
                  inputRef={getRef(6)}
                  onKeyDown={handleKeyDown(6)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              )}
            </Box>

            {/* <TextField label="Delivery Address" margin="normal" /> */}
            <TextField
              label="Credit Period"
              name="Credit_Period"
              value={grnHeaderData.Credit_Period}
              onChange={handleInputChange}
              inputRef={getRef(7)}
              onKeyDown={handleKeyDown(7)}
              margin="normal"
              type="number"
              InputProps={{ readOnly: !isEditing }}
            />

            <TextField
              label="Payment Due"
              name="Payment_Due"
              inputRef={getRef(8)}
              onKeyDown={handleKeyDown(8)}
              value={grnHeaderData.Payment_Due}
              type="date"
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={!isEditing}
              required
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
                      InputProps={{ readOnly: !isEditing }}
                      // error={!poHeaderData.Location}
                    />
                  )}
                  value={
                    taxGroupList.find(
                      (item) => item.taxGroupCode === grnHeaderData.TaxGroup
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.taxGroupCode === value.taxGroupCode
                  }
                  disabled={!isEditing}
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
            sx={{
              minWidth: 100, // Min width for form
              width: "97%", // Full width on smaller screens
              // margin: "0 auto", // Center form horizontally
              backgroundColor: "white",
            }}
          >
            <Accordion
              sx={{
                transition: "height 0.3s ease",
                // Always expandable so user can view items even in view mode
                overflow: "hidden",
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  justifyContent: "center", // center horizontally
                  textAlign: "center",
                }}
              >
                <h2>Add Items</h2>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="form"
                  sx={{
                    minWidth: 100, // Min width for form
                    width: "98%", // Full width on smaller screens
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
                      InputProps={{ readOnly: !isEditing }}
                    />
                    <Button
                      sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                      variant="outlined"
                      onClick={handleSearch}
                      disabled={!isEditing}
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
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Description"
                    name="Description"
                    value={grnData?.Description || ""}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="UOM"
                    name="UOM"
                    value={grnData?.UOM || ""}
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />

                  <TextField
                    label="Current Unit Price"
                    margin="normal"
                    value={grnData?.Unit_Price || ""}
                    type="number"
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />

                  <TextField
                    label="Unit Price"
                    margin="normal"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    type="number"
                    InputProps={{ readOnly: !isEditing }}
                    fullWidth
                  />
                  <TextField
                    label="Quantity"
                    margin="normal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    type="number"
                    InputProps={{ readOnly: !isEditing }}
                    fullWidth
                  />

                  <TextField
                    label="FOC"
                    name="FOC"
                    margin="normal"
                    value={grnData?.FOC}
                    onChange={handleGRNDataChange}
                    type="number"
                    InputProps={{ readOnly: !isEditing }}
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
                    InputProps={{ readOnly: !isEditing }}
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
                    InputProps={{ readOnly: !isEditing }}
                    fullWidth
                  />
                  <TextField
                    label="Discount Amount"
                    margin="normal"
                    value={discountAmount}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />

                  <TextField
                    label="Retail Price"
                    name="Retail_Price"
                    value={grnData?.Retail_Price}
                    onChange={handleGRNDataChange}
                    margin="normal"
                    InputProps={{ readOnly: !isEditing }}
                    fullWidth
                  />

                  <TextField
                    label="MRP"
                    name="MRP"
                    value={grnData?.MRP}
                    onChange={handleGRNDataChange}
                    margin="normal"
                    InputProps={{ readOnly: !isEditing }}
                    fullWidth
                  />

                  <TextField
                    label="Total"
                    margin="normal"
                    value={total}
                    fullWidth
                    InputProps={{ readOnly: true }}
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
                    sx={{
                      height: 40,
                      width: 100,
                      marginTop: 3,
                      marginBottom: 4,
                    }} // px controls horizontal padding inside the button
                    onClick={handleAddToTable}
                    disabled={!isEditing}
                  >
                    Add
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>

        {productList.length > 0 ? (
          <>
            <Box display="flex" justifyContent="center" mt={2}>
              <Box sx={{ position: 'relative', width: '97%' }}>
              
                <TableContainer component={Paper} sx={{ width: "100%", backgroundColor: isEditing ? 'white' : '#fbfcfd', opacity: isEditing ? 1 : 0.98 }}>
                  <Table>
                    <TableHead
                      sx={{
                       backgroundColor: "#63b1f1ff",
                        height: 50,
                      }}
                    >
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
                            onClick={() => handleRemoveProduct(item.Barcode)}
                            disabled={!isEditing}
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
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                        />

                        <EditableNumberCell
                          value={item.FOC}
                          index={index}
                          field="FOC"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                        />

                        <EditableNumberCell
                          value={item.unitPrice}
                          index={index}
                          field="unitPrice"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />
                        {/* <TableCell>{Number(item.unitPrice).toFixed(2)}</TableCell> */}
                        <TableCell sx={{ minWidth: 100 }}>
                          {item.Exp_Date}
                        </TableCell>
                        <EditableNumberCell
                          value={item.Discount_Percent}
                          index={index}
                          field="Discount_Percent"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleProductChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />

                        {/* <TableCell>{item.discountRate}</TableCell> */}
                        <TableCell>
                          {Number(item.Discount_Amount).toFixed(2)}
                        </TableCell>

                        <EditableNumberCell
                          value={item.Retail_Price}
                          index={index}
                          field="Retail_Price"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleFieldChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />

                        <EditableNumberCell
                          value={item.MRP || 0}
                          index={index}
                          field="MRP"
                          isEditing={editingRowIndex === index}
                          onEditStart={() => isEditing && setEditingRowIndex(index)}
                          onEditEnd={() => setEditingRowIndex(null)}
                          onChange={handleFieldChange}
                          fixed={true}
                          allowLeadingZero={false}
                        />
                        <TableCell>
                          {Number(item.Tax_Amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {Number(item.Total_Amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ fontWeight: "bold" }}>
                      <TableCell colSpan={13} align="right" />
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Sub Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {Number(totalSum).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: "bold" }}>
                      <TableCell colSpan={13} align="right">
                        {taxBreakdownTotals
                          ? Object.entries(taxBreakdownTotals)
                              .map(
                                ([type, amount]) =>
                                  `${type} - ${parseFloat(amount).toFixed(2)}`
                              )
                              .join(" | ")
                          : null}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Tax Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {Number(taxSum).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ fontWeight: "bold" }}>
                      <TableCell colSpan={11} align="right" />
                      <TableCell />
                      <TableCell />
                      <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {Number(totalSum + taxSum).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
          </>
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
