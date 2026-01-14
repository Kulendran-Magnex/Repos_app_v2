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
  TextareaAutosize,
  Grid,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchLocationMaster, fetchSupplierList } from "../../API/api";
import SearchDialog from "./SearchDialog";
import { fetchTaxGroup, updatePurchaseOrder } from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useRef } from "react";
import EditableNumberCell from "../../Common/EditableNumberCell";

export default function EditPurchaseOrder() {
  const [supplierList, setSupplierList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [taxGroupList, setTaxGroupList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
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
  const location = useLocation();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const navigate = useNavigate();
  const [editingRowIndex, setEditingRowIndex] = useState(null);

  const { currentItemID } = location.state || {};

  const today = new Date().toISOString().split("T")[0];

  const [poHeaderData, setPOHeaderData] = useState({});
  const prevTaxGroupRef = useRef(poHeaderData.Tax_Group_Code);

  const [value, setValue] = useState("");

  // Only allow digits and one optional decimal point
  const handleKeyDown = (e) => {
    const key = e.key;

    // Allow control keys
    if (
      ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(key)
    ) {
      return;
    }

    // Allow one dot
    if (key === ".") {
      if (e.target.value.includes(".")) {
        e.preventDefault(); // Already has a dot
      }
      return;
    }

    // Allow digits
    if (!/^\d$/.test(key)) {
      e.preventDefault(); // Block everything else
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };
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
    console.log(currentItemID);
    if (!currentItemID) return;
    axios
      .get(`http://localhost:5000/api/PO_Header/${currentItemID}`)
      .then((res) => {
        setPOHeaderData(res.data[0]);
        console.log(res.data[0]);
      })
      .catch((err) => {
        console.error("Error fetching PO Header data:", err);
        setLoading(false);
      });
  }, []);

  const calculateTotals = (products) => {
    let totalAmountSum = 0;
    let totalTaxSum = 0;

    products.forEach((product) => {
      totalAmountSum += parseFloat(product.Total_Amount) || 0;
      totalTaxSum += parseFloat(product.Tax_Amount) || 0;
    });

    setTotalAmount(parseFloat(totalAmountSum.toFixed(2)));
    setTotalTax(parseFloat(totalTaxSum.toFixed(2)));
  };

  useEffect(() => {
    if (productList.length > 0) {
      calculateTotals(productList);
    }
  }, [productList]);

  useEffect(() => {
    if (!currentItemID) return;
    console.log("re-redered");
    axios
      .get(`http://localhost:5000/api/PO_Tran/${currentItemID}`)
      .then((res) => {
        setProductList(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("Error fetching PO data:", err);
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    const price = parseFloat(unitPrice);
    const qty = parseFloat(quantity);
    const discount = parseFloat(discountRate);

    if (!isNaN(price) && !isNaN(qty) && !isNaN(discount)) {
      const gross = price * qty;
      const discountAmount = (gross * discount) / 100;
      const subTotal = gross - discountAmount;

      setDiscountAmount(discountAmount.toFixed(2));

      // If a tax group is selected, fetch and calculate formula-based taxes
      if (poHeaderData.Tax_Group_Code) {
        axios
          .post("http://localhost:5000/api/calculate-tax", {
            taxGroupCode: poHeaderData.Tax_Group_Code,
          })
          .then((res) => {
            const { formulas } = res.data;
            let totalTax = 0;

            formulas.forEach((formula) => {
              try {
                const expression = formula.replace(
                  /total/gi,
                  `(${subTotal} * 0.01)`
                );
                const tax = evaluate(expression);
                if (!isNaN(tax)) {
                  totalTax += tax;
                }
              } catch (e) {
                console.warn("Invalid tax formula:", formula);
              }
            });

            const finalTotal = subTotal + totalTax;
            setTaxRate(((totalTax / subTotal) * 100).toFixed(2)); // Optional
            setTaxAmount(totalTax);

            setTotal(finalTotal.toFixed(2));
          })
          .catch((err) => {
            console.error("Tax calculation failed", err);
            setTotal(subTotal.toFixed(2)); // No tax fallback
          });
      } else {
        setTotal(subTotal.toFixed(2)); // No tax group selected
      }
    } else {
      setDiscountAmount("");
      setTotal("");
    }
  }, [unitPrice, quantity, discountRate, poHeaderData.TaxGroup]);

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
    if (selectedProduct?.Unit_Cost) {
      setUnitPrice(selectedProduct.Unit_Cost);
    } else {
      setUnitPrice("");
    }
  }, [selectedProduct]);

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

  const handleSearch = () => {
    setOpenAddModal(true);
    // Trigger your search or other logic here based on the barcode
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product); // Save selected row from child
    setOpenAddModal(false); // Optionally close dialog
  };

  const handleTaxRateCalculation = () => {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPOHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const handleAddToTable = () => {
  //   if (!selectedProduct || !unitPrice || !quantity) {
  //     alert("Please fill in all fields before adding the item.");
  //     return;
  //   }
  //   const newItem = {
  //     selectedProduct,
  //     unitPrice,
  //     quantity,
  //     discountRate,
  //     discountAmount,
  //     total,
  //   };
  //   setProductList((prev) => [...prev, newItem]);

  //   setUnitPrice("");
  //   setQuantity("");
  //   setDiscountRate(0);
  //   setDiscountAmount("");
  //   setTotal("");
  //   setSelectedProduct(null);
  // };

  //   const handleAddToTable = () => {
  //     if (!selectedProduct || !unitPrice || !quantity) {
  //       toast.error("Please fill in all fields before adding the item.");

  //       return;
  //     }
  //     console.log("selectedProduct", selectedProduct);
  //     // Prevent duplicate item by Barcode
  //     const isDuplicate = productList.some(
  //       (item) => item.Barcode === selectedProduct.Barcode
  //     );

  //     if (isDuplicate) {
  //       alert("This product is already added.");
  //       setUnitPrice("");
  //       setQuantity("");
  //       setDiscountRate(0);
  //       setDiscountAmount("");
  //       setTotal("");
  //       setTaxAmount("");
  //       setSelectedProduct(null);
  //       return;
  //     }

  //     const newItem = {
  //       selectedProduct,
  //       unitPrice,
  //       quantity,
  //       discountRate,
  //       discountAmount,
  //       TaxGroup: poHeaderData.TaxGroup || "",
  //       taxAmount,
  //       total,
  //     };

  //     setProductList((prev) => [...prev, newItem]);

  //     setUnitPrice("");
  //     setQuantity("");
  //     setDiscountRate(0);
  //     setDiscountAmount("");
  //     setTotal("");
  //     setTaxAmount("");
  //     setSelectedProduct(null);
  //   };

  const handleAddToTable = () => {
    if (!selectedProduct || !unitPrice || !quantity) {
      toast.error("Please fill in all fields before adding the item.");
      return;
    }

    const isDuplicate = productList.some(
      (item) => item.Barcode === selectedProduct.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      resetInputs();
      return;
    }

    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const discount = parseFloat(discountRate) || 0;
    const discountAmt = (qty * price * discount) / 100;
    const subTotal = qty * price - discountAmt;
    let tax = parseFloat(taxAmount) || 0;
    let totalAmount = subTotal + tax;

    const newItem = {
      Barcode: selectedProduct.Barcode,
      Product_ID: selectedProduct.Product_ID,
      Description: selectedProduct.Description,
      Product_UM: selectedProduct.Stock_UM,
      PO_Qty: qty,
      Unit_Price: price,
      Discount_Percent: discount,
      Discount_Amount: parseFloat(discountAmt.toFixed(2)),
      Tax_Amount: parseFloat(tax.toFixed(2)),
      Total_Amount: parseFloat(totalAmount.toFixed(2)),
    };

    setProductList((prev) => [...prev, newItem]);
    resetInputs();
  };

  const resetInputs = () => {
    setUnitPrice("");
    setQuantity("");
    setDiscountRate(0);
    setDiscountAmount("");
    setTotal("");
    setTaxAmount("");
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) => prevList.filter((p) => p.Barcode !== barcode));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    const product = updatedProducts[index];

    // Update the field
    product[field] = parseFloat(value) || 0;

    const qty = parseFloat(product.PO_Qty) || 0;
    const price = parseFloat(product.Unit_Price) || 0;
    const discountRate = parseFloat(product.Discount_Percent) || 0;
    const discountAmt = (qty * price * discountRate) / 100;
    const subTotal = qty * price - discountAmt;

    // Check if tax group exists — recalculate tax via backend
    if (poHeaderData.Tax_Group_Code) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/calculate-tax",
          {
            taxGroupCode: poHeaderData.Tax_Group_Code,
          }
        );

        const { formulas } = res.data;
        let totalTax = 0;

        formulas.forEach((formula) => {
          try {
            const expression = formula.replace(
              /total/gi,
              `(${subTotal} * 0.01)`
            );
            const tax = evaluate(expression);
            if (!isNaN(tax)) {
              totalTax += tax;
            }
          } catch (e) {
            console.warn("Invalid tax formula:", formula);
          }
        });

        product.Tax_Amount = parseFloat(totalTax.toFixed(2));
      } catch (error) {
        console.error("Failed to recalculate tax:", error);
        product.Tax_Amount = 0;
      }
    }

    const tax = parseFloat(product.Tax_Amount) || 0;
    const total = subTotal + tax;

    product.Discount_Amount = parseFloat(discountAmt.toFixed(2));
    product.Total_Amount = parseFloat(total.toFixed(2));

    setProductList(updatedProducts);
  };

  const recalculateTaxForAllRows = async (taxGroupCode) => {
    try {
      const res = await axios.post("http://localhost:5000/api/calculate-tax", {
        taxGroupCode,
      });

      const { formulas } = res.data;
      const updatedProducts = productList.map((product) => {
        const qty = parseFloat(product.PO_Qty) || 0;
        const price = parseFloat(product.Unit_Price) || 0;
        const discountRate = parseFloat(product.Discount_Percent) || 0;
        const discountAmt = (qty * price * discountRate) / 100;
        const subTotal = qty * price - discountAmt;

        let totalTax = 0;

        formulas.forEach((formula) => {
          try {
            const expression = formula.replace(
              /total/gi,
              `(${subTotal} * 0.01)`
            );
            const tax = evaluate(expression);
            if (!isNaN(tax)) {
              totalTax += tax;
            }
          } catch (e) {
            console.warn("Invalid tax formula:", formula);
          }
        });

        return {
          ...product,
          Discount_Amount: parseFloat(discountAmt.toFixed(2)),
          Tax_Amount: parseFloat(totalTax.toFixed(2)),
          Total_Amount: parseFloat((subTotal + totalTax).toFixed(2)),
        };
      });

      setProductList(updatedProducts);
    } catch (error) {
      console.error("Failed to recalculate tax:", error);
    }
  };

  const handleSubmit = async () => {
    console.log("clicked");

    const {
      PO_Date,
      PO_Delivery_Date,
      PO_Status,
      Supplier_Code,
      Location_ID,
      Tax_Group_Code,
      PO_Delivery_To,
    } = poHeaderData;

    // Validate required fields
    if (
      !PO_Date ||
      !PO_Delivery_Date ||
      !PO_Status ||
      !Supplier_Code ||
      !Location_ID ||
      !PO_Delivery_To
    ) {
      toast.error("Please fill in all required fields in header section.");
      return;
    }

    // Validate productList
    if (!productList || productList.length === 0) {
      toast.error("Product list cannot be empty.");
      return;
    }

    const payload = {
      poHeaderData,
      productList,
      totalAmount,
      totalTax,
    };

    console.log("test", payload);

    try {
      await updatePurchaseOrder(currentItemID, payload);
      toast.success("Purchase Order Updated");
      setPOHeaderData({});

      setProductList([]);
      setTotalAmount(0);
      setTotalTax(0);
      navigate("/purchase-order/view");
    } catch (error) {
      toast.error("Failed to add Purchase Order.");
      console.error("Insert failed:", error.message);
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
          <Typography variant="h5">
            Edit Purchase Order - {currentItemID}
          </Typography>
          <IconButton sx={{ color: "blue" }} onClick={handleSubmit}>
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
              label="PO Date"
              name="PO_Date"
              value={
                poHeaderData?.PO_Date
                  ? dayjs(poHeaderData.PO_Date).format("YYYY-MM-DD")
                  : ""
              }
              type="date"
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Delivery Date"
              name="PO_Delivery_Date"
              value={
                poHeaderData?.PO_Delivery_Date
                  ? dayjs(poHeaderData.PO_Delivery_Date).format("YYYY-MM-DD")
                  : ""
              }
              type="date"
              onChange={handleInputChange}
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
                      name: "Supplier_Code",
                      value: newValue?.Supplier_Code || "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} required label="Supplier" />
                )}
                value={
                  supplierList.find(
                    (item) => item.Supplier_Code === poHeaderData.Supplier_Code
                  ) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.Supplier_Code === value.Supplier_Code
                }
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
                        name: "Location_ID",
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
                      (item) => item.Location_ID === poHeaderData.Location_ID
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.Location_ID === value.Location_ID
                  }
                />
              </FormControl>
            </Box>

            {/* <TextField label="Delivery Address" margin="normal" /> */}

            <TextField
              id="po-delivery-to"
              label="Delivery Address"
              name="PO_Delivery_To"
              value={poHeaderData.PO_Delivery_To || ""}
              onChange={handleInputChange}
              multiline
              rows={3}
              margin="normal"
              variant="outlined"
              required
            />

            <Box>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={taxGroupList}
                  getOptionLabel={(option) => option.taxGroupName || ""}
                  onChange={(event, newValue) => {
                    const newTaxGroupCode = newValue?.taxGroupCode || "";

                    // Only proceed if tax group actually changed
                    if (prevTaxGroupRef.current !== newTaxGroupCode) {
                      prevTaxGroupRef.current = newTaxGroupCode;

                      handleInputChange({
                        target: {
                          name: "Tax_Group_Code",
                          value: newTaxGroupCode,
                        },
                      });

                      // Trigger tax recalculation
                      recalculateTaxForAllRows(newTaxGroupCode);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Tax Group" />
                  )}
                  value={
                    taxGroupList.find(
                      (item) =>
                        item.taxGroupCode === poHeaderData.Tax_Group_Code
                    ) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.taxGroupCode === value.taxGroupCode
                  }
                />
              </FormControl>
            </Box>

            <Box display={"flex"} flexDirection={"row"} columnGap={1}>
              <TextField
                label="MR Code"
                name="Mr_Code"
                fullWidth
                margin="normal"
              />
              <Button
                sx={{ maxWidth: 200, marginTop: 3, marginBottom: 4 }}
                variant="outlined"
              >
                Search
              </Button>
            </Box>

            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>PO Status</InputLabel>
                <Select
                  name="PO_Status"
                  value={poHeaderData.PO_Status || ""}
                  label="PO Status"
                  onChange={handleInputChange}
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

            <TextField
              label="Created By"
              value={"Admin"}
              margin="normal"
              disabled
            />
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
                gridTemplateColumns: "repeat(4, 1fr)", // three columns on larger screens
              },
              backgroundColor: "white",
            }}
          >
            <Box display={"flex"} flexDirection={"row"} columnGap={1}>
              <TextField
                label="Barcode"
                name="Barcode"
                value={selectedProduct?.Barcode || ""}
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
              value={selectedProduct?.Product_ID || ""}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Description"
              name="descrription"
              value={selectedProduct?.Description || ""}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="UOM"
              name="UOM"
              value={selectedProduct?.Stock_UM || ""}
              margin="normal"
            />

            <TextField
              label="Unit Price"
              margin="normal"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Quantity"
              margin="normal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
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
              label="Total"
              margin="normal"
              value={total}
              InputProps={{ readOnly: true }}
              fullWidth
              disabled
            />

            <Button
              variant="outlined"
              color="primary"
              sx={{ height: 40, width: 100, marginTop: 3, marginBottom: 4 }} // px controls horizontal padding inside the button
              onClick={handleAddToTable}
            >
              Add
            </Button>
          </Box>
        </Box>

        {/* {productList.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle1">
              Total Tax Amount: ₹{taxSum.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Total Order Amount: ₹{totalSum.toFixed(2)}
            </Typography>
          </Box>
        )} */}

        {productList.length > 0 ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <TableContainer component={Paper} sx={{ width: "92%" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>UOM</TableCell>
                    <TableCell>QTY</TableCell>
                    <TableCell>Unit Price </TableCell>
                    <TableCell>Discount Rate %</TableCell>
                    <TableCell>Discount Amount </TableCell>

                    {/* <TableCell>Tax % </TableCell> */}
                    <TableCell>Tax Amount </TableCell>
                    <TableCell>Total </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productList.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveProduct(item.Barcode)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.Barcode}</TableCell>
                      <TableCell>{item.Product_ID}</TableCell>
                      <TableCell>{item.Description}</TableCell>
                      <TableCell>{item.Product_UM}</TableCell>

                      <EditableNumberCell
                        value={item.PO_Qty}
                        index={index}
                        field="PO_Qty"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleProductChange}
                      />

                      <EditableNumberCell
                        value={item.Unit_Price}
                        index={index}
                        field="Unit_Price"
                        isEditing={editingRowIndex === index}
                        onEditStart={() => setEditingRowIndex(index)}
                        onEditEnd={() => setEditingRowIndex(null)}
                        onChange={handleProductChange}
                        fixed={true}
                        allowLeadingZero={false}
                      />

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

                      <TableCell>
                        {Number(item.Discount_Amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {Number(item.Tax_Amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {Number(item.Total_Amount || 0).toFixed(2)}
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
