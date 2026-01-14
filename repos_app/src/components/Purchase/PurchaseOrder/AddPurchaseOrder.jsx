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
import {
  fetchTaxGroup,
  addPurchaseOrder,
  closeMaterialRequest,
} from "../../API/api";
import axios from "axios";
import { evaluate } from "mathjs";
import { useNavigate } from "react-router-dom";
import MRSearchDialog from "./MRSearchDialog";
import EditableNumberCell from "../../Common/EditableNumberCell";


const calculateTaxForProduct = async (product, taxGroupCode) => {
  const qty = parseFloat(product.quantity) || 0;
  const price = parseFloat(product.unitPrice) || 0;
  const discountRate = parseFloat(product.discountRate) || 0;
  const discountAmt = (qty * price * discountRate) / 100;
  const subTotal = qty * price - discountAmt;
  console.log("subTotal", subTotal);
  let taxAmount = 0;

  if (taxGroupCode) {
    try {
      const res = await axios.post("http://localhost:5000/api/calculate-tax", {
        taxGroupCode,
      });
      console.log("Tex Result", res.data);
      const { formulas } = res.data;
      let totalTax = 0;

      if (!formulas || formulas.length === 0) {
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
      }
      console.log("Total tax", totalTax);
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

export default function AddPurchaseOrder() {
  const [supplierList, setSupplierList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [taxGroupList, setTaxGroupList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openMRSearch, setOpenMRSearch] = useState(false);
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
  const [addedMrCodes, setAddedMrCodes] = useState([]);

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
          calculateTaxForProduct(product, poHeaderData.TaxGroup)
        )
      );
      setProductList(updated);
    };

    if (poHeaderData.TaxGroup) {
      recalculateAllTaxes();
    }
  }, [poHeaderData.TaxGroup]);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F1") {
        event.preventDefault(); // ✅ This must come before any return or browser will still react
        setOpenMRSearch(true);
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

  const handleMRSearch = () => {
    setOpenMRSearch(true);
  };

  //////need to do here
  const handleProductSelect = (product) => {
    setSelectedProduct(product); // Save selected row from child
    setOpenAddModal(false); // Optionally close dialog
  };

  const handleMrSelect = async (items) => {
    if (!items || items.length === 0) return;

    const mrCode = items[0].MR_Code;
    // const isAlreadyAdded = productList.some(
    //   (p) => p.selectedProduct.MR_Code === mrCode
    // );
    const isAlreadyAdded = addedMrCodes.includes(mrCode);

    if (isAlreadyAdded) {
      setOpenMRSearch(false);
      console.log(`MR_Code ${mrCode} is already added.`);
      toast.error(`MR - ${mrCode} Already Added!.`);
      // Optionally show a user notification here
      return;
    }

    const newProducts = [];

    for (const item of items) {
      const unitPrice = Number(item.Unit_Cost);
      const quantity = Number(item.MR_Qty);
      const discountRate = 0;
      const discountAmount = 0;
      const subTotal = unitPrice * quantity;

      let taxAmount = 0;

      if (poHeaderData.TaxGroup) {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/calculate-tax",
            {
              taxGroupCode: poHeaderData.TaxGroup,
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

          taxAmount = parseFloat(totalTax.toFixed(2));
        } catch (error) {
          console.error("Failed to recalculate tax:", error);
          taxAmount = 0;
        }
      }

      const total = subTotal + taxAmount;

      const newItem = {
        selectedProduct: item,
        unitPrice,
        quantity: quantity.toFixed(2),
        discountRate: discountRate.toFixed(2),
        discountAmount,
        TaxGroup: poHeaderData.TaxGroup || "",
        taxAmount,
        total,
      };

      console.log("test1", newItem);
      newProducts.push(newItem);
    }

    setProductList((prev) => [...prev, ...newProducts]);
    setAddedMrCodes((prev) => [...prev, mrCode]);
    setOpenMRSearch(false);
  };

  const handleTaxRateCalculation = () => {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPOHeaderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProductChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index][field] = parseFloat(value) || 0;

    const updatedProduct = await calculateTaxForProduct(
      updatedProducts[index],
      poHeaderData.TaxGroup
    );

    updatedProducts[index] = updatedProduct;
    setProductList(updatedProducts);
  };

  const handleAddToTable = () => {
    if (!selectedProduct || !unitPrice || !quantity) {
      toast.error("Please fill in all fields before adding the item.");

      return;
    }

    // Prevent duplicate item by Barcode
    const isDuplicate = productList.some(
      (item) => item.selectedProduct?.Barcode === selectedProduct.Barcode
    );

    if (isDuplicate) {
      alert("This product is already added.");
      setUnitPrice("");
      setQuantity("");
      setDiscountRate(0);
      setDiscountAmount("");
      setTotal("");
      setTaxAmount("");
      setSelectedProduct(null);
      return;
    }

    const newItem = {
      selectedProduct,
      unitPrice,
      quantity: Number(quantity).toFixed(2),
      discountRate: Number(discountRate).toFixed(2),
      discountAmount,
      TaxGroup: poHeaderData.TaxGroup || "",
      taxAmount,
      total,
    };

    console.log("test1", newItem);

    setProductList((prev) => [...prev, newItem]);

    setUnitPrice("");
    setQuantity("");
    setDiscountRate(0);
    setDiscountAmount("");
    setTotal("");
    setTaxAmount("");
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (barcode) => {
    setProductList((prevList) =>
      prevList.filter((p) => p.selectedProduct.Barcode !== barcode)
    );
  };

  const handleSubmit = async () => {
    const {
      PO_Date,
      DeliveryDate,
      PO_Status,
      Supplier,
      Location,
      TaxGroup,
      Delivery_Address,
    } = poHeaderData;

    // Validate required fields
    if (
      !PO_Date ||
      !DeliveryDate ||
      !PO_Status ||
      !Supplier ||
      !Location ||
      !Delivery_Address
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
      totalSum,
      taxSum,
    };

    try {
      await addPurchaseOrder(payload);

      if (addedMrCodes.length > 0) {
        await closeMaterialRequest(addedMrCodes);
      }

      toast.success("Purchase Order Added");
      setPOHeaderData({
        PO_Date: "",
        DeliveryDate: "",
        PO_Status: "O",
        Supplier: "",
        Location: "",
        TaxGroup: "",
        Delivery_Address: "",
        Created_By: "Admin",
        MR_Code: "",
      });

      setProductList([]);
      setTotalSum(0);
      setTaxSum(0);
      navigate("/purchase-order/view");
    } catch (error) {
      toast.error("Failed to add Purchase Order.");
      console.error("Insert failed:", error.message);
    }
  };
  console.log("Product Items", productList);

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
          <Typography variant="h5">Add Purchase Order</Typography>
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
              value={poHeaderData.PO_Date}
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
              name="DeliveryDate"
              value={poHeaderData.DeliveryDate}
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
                    (item) => item.Supplier_Code === poHeaderData.Supplier
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
                      (item) => item.Location_ID === poHeaderData.Location
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
              id="outlined-multiline-static"
              label="Delivery Address"
              name="Delivery_Address"
              value={poHeaderData.Delivery_Address}
              onChange={handleInputChange}
              multiline
              rows={3}
              margin="normal"
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
                      label="Tax Group"

                      // error={!poHeaderData.Location}
                    />
                  )}
                  value={
                    taxGroupList.find(
                      (item) => item.taxGroupCode === poHeaderData.TaxGroup
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
                onClick={handleMRSearch}
              >
                Search
              </Button>
            </Box>

            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>PO Status</InputLabel>
                <Select
                  name="PO_Status"
                  value={poHeaderData.PO_Status}
                  label="PO Status"
                  onChange={handleInputChange}
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
                    <TableCell>U.Price </TableCell>
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
                          onClick={() =>
                            handleRemoveProduct(item.selectedProduct?.Barcode)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.selectedProduct?.Barcode}</TableCell>
                      <TableCell>{item.selectedProduct?.Product_ID}</TableCell>
                      <TableCell>{item.selectedProduct?.Description}</TableCell>
                      <TableCell>
                        {item.selectedProduct?.Stock_UM ||
                          item.selectedProduct?.Product_UM}
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

        <MRSearchDialog
          open={openMRSearch}
          onClose={() => setOpenMRSearch(false)}
          onConfirmMRSelection={handleMrSelect}
        />
      </Box>
    </div>
  );
}
