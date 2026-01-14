import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import "./Editproduct.style.css"; // Import the CSS file
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const EditProduct = () => {
  const location = useLocation();
  const { currentitem } = location.state || {};
  const [catlist, setCatList] = useState([]);
  const [product, setProduct] = useState([]);
  const [productPrice, setProductPrice] = useState([]);
  const [locationGroups, setLocationGroups] = useState([]);
  const [packingMaster, setPackingMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catlvl2List, setCatlvl2List] = useState([]); // Store Category LVL2 list
  const [catlvl3List, setCatlvl3List] = useState([]); // Store Category LVL3 list
  const [editMode, setEditMode] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openPriceDialog, setOpenPriceDialog] = useState(false);

  const [formData, setFormData] = useState({
    Product_ID: "",
    Product_Ref: "",
    Product_Status: "",
    Category_Lv1: "",
    Category_Lv2: "",
    Category_Lv3: "",
    Description: "",
    Description_Long: "",
    Product_Type: "",
    Stock_UM: "",
    Description2: "",
    Description_Long2: "",
    Base_UM: "",
    Stop_Sell: "",
    Taxable: "",
    Warranty_Period: "",
    Warranty_Type: "",
  });
  const [productDetails, setProductDetails] = useState({
    Product_ID: "",
    Barcode: "",
    Description: "",
    Description_Long: "",
    Description2: "",
    Description_Long2: "",
    Product_UOM: "",
    UM_QTY: "",
    Unit_Cost: "",
    Last_Purchase_Price: "",
    Base_UM: "",
    Prod_Status: "",
    Stop_Sell: "",
  });
  const [priceDetails, setPriceDetails] = useState({
    Product_ID: "",
    Barcode: "",
    Location_Group: "",
    Retail_Price: "",
    Retail_Price2: "",
    Retail_Price3: "",
    Wholesale_Price: "",
    MRP: "",
    Prod_Status: "",
  });
  const [priceEditMode, setPriceEditMode] = useState(false);

  // Fetch Category LVL1 data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/catlvl1");
        setCatList(response.data); // Populate Category LVL1 list
      } catch (err) {
        console.log("Error fetching Category LVL1:", err.message);
      }
    };

    const getProduct = async () => {
      console.log(currentitem.Product_ID);
      try {
        const response = await axios.get(
          `http://localhost:5000/products/${currentitem.Product_ID}`
        );

        setFormData({
          ...response.data[0],
          Product_Status: response.data[0]?.Product_Status || "", // Ensure status is set
        });
      } catch (err) {
        console.log("Error fetching Product:", err.message);
      }
    };

    const getProductDetails = async () => {
      console.log(currentitem.Product_ID);
      try {
        const response = await axios.get(
          `http://localhost:5000/productsDetails/${currentitem.Product_ID}`
        );
        setProduct(response.data);
        // setProductDetails(response.data[0]);
      } catch (err) {
        console.log("Error fetching ProductDetails:", err.message);
      }
    };

    const getProductPrice = async () => {
      console.log(currentitem.Product_ID);
      try {
        const response = await axios.get(
          `http://localhost:5000/price/${currentitem.Product_ID}`
        );
        setProductPrice(response.data);
        // setPriceDetails({
        //   ...response.data[0],
        // });
      } catch (err) {
        console.log("Error fetching Product:", err.message);
      }
    };

    const getLocationGroup = async () => {
      setLoading(true);
      console.log(currentitem.Product_ID);
      try {
        const response = await axios.get(`http://localhost:5000/api/location`);
        const data = await response.data;
        setLocationGroups(data);
      } catch (err) {
        console.log("Error fetching Location:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const getPackageMaster = async () => {
      setLoading(true);
      console.log(currentitem.Product_ID);
      try {
        const response = await axios.get(`http://localhost:5000/api/packingMaster`);
        const data = await response.data;
        setPackingMaster(data);
      } catch (err) {
        console.log("Error fetching Location:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getProduct();
    getProductPrice();
    getLocationGroup();
    getPackageMaster();
    getProductDetails();
  }, [currentitem]);

  // Handle Category LVL1 or LVL2 or LVL3 selection change
  const handleCategoryChange = async (event, level) => {
    const { value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [level === "lvl1"
        ? "Category_Lv1"
        : level === "lvl2"
        ? "Category_Lv2"
        : "Category_Lv3"]: value,
    }));

    // If Category LVL1 is selected, fetch Category LVL2 data
    if (level === "lvl1") {
      try {
        const response = await axios.post("http://localhost:5000/catlvl2", {
          catlvl1_id: value, // Send Category LVL1 ID to fetch Category LVL2
        });
        setCatlvl2List(response.data); // Populate Category LVL2 list if data exists
        setCatlvl3List([]); // Clear LVL3 list when LVL1 is changed
      } catch (err) {
        setCatlvl2List([]);
        console.log("Error fetching Category LVL2:", err.message);
      }
    }

    // If Category LVL2 is selected, fetch Category LVL3 data
    if (level === "lvl2") {
      try {
        const response = await axios.post("http://localhost:5000/catlvl3", {
          catlvl2_id: value, // Send Category LVL2 ID to fetch Category LVL3
        });
        setCatlvl3List(response.data); // Populate Category LVL3 list
      } catch (err) {
        console.log("Error fetching Category LVL3:", err.message);
      }
    }
  };

  // Handle generic field changes for the form
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: event.target.checked ? 1 : 0,
    }));
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true);
      setProductDetails(item);
    } else {
      setEditMode(false);
      setProductDetails({
        Product_ID: formData.Product_ID,
        Description: formData.Description,
        Description_Long: formData.Description_Long,
        Description2: formData.Description2,
        Description_Long2: formData.Description_Long2,
        Product_UOM: "",
        UM_QTY: "",
        Unit_Cost: "",
        Last_Purchase_Price: "",
        Base_UM: formData.Base_UM,
        Prod_Status: "",
      });
    }
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
  };

  const handleClosePriceDialog = () => {
    setOpenPriceDialog(false);
  };

  const handleOpenPriceDialog = (item = null) => {
    if (item) {
      setPriceEditMode(true);
      setPriceDetails(item);
    } else {
      setPriceEditMode(false);
      setPriceDetails({
        Product_ID: formData.Product_ID,
        Barcode: "",
        Location_Group: locationGroups[0]?.Location_Group || "",
        Retail_Price: "",
        Retail_Price2: "",
        Retail_Price3: "",
        Wholesale_Price: "",
        MRP: "",
        Prod_Status: "",
      });
    }

    setOpenPriceDialog(true);
  };

  const handleSaveDetails = async () => {
    if (editMode) {
      setProduct(
        product.map((item) =>
          item.Barcode === productDetails.Barcode ? productDetails : item
        )
      );
      try {
        const response = await axios.put(
          `http://localhost:5000/productDetails/${productDetails.Product_ID}`,
          productDetails
        );
        console.log("Product Details updated successfully", response.data);
      } catch (err) {
        console.log("Error updating Product:", err.message);
      }
      setOpenDetailDialog(false);
    } else {
      console.log(productDetails);
      try {
        const response = await axios.post(
          `http://localhost:5000/productDetails/add`,
          productDetails
        );
        console.log("Product Details updated successfully", response.data);
      } catch (err) {
        console.log("Error updating Product:", err.message);
      }
      setOpenDetailDialog(false);
    }
  };

  const handleSavePrice = async () => {
    if (priceEditMode) {
      // Update existing
      setProductPrice(
        productPrice.map((item) =>
          item.Barcode === priceDetails.Barcode ? priceDetails : item
        )
      );
      try {
        const response = await axios.put(
          `http://localhost:5000/productPrice/${priceDetails.Product_ID}`,
          priceDetails
        );
        console.log("Product Price updated successfully", response.data);
      } catch (err) {
        console.log("Error updating Product:", err.message);
      }
    } else {
      // Add new
      try {
        const response = await axios.post(
          `http://localhost:5000/productPrice/add`,
          priceDetails
        );
        // update local state with returned record if available
        const added = response?.data || priceDetails;
        setProductPrice((prev) => [...prev, added]);
        console.log("Product Price added successfully", added);
      } catch (err) {
        console.log("Error adding Product Price:", err.message);
      }
    }

    setOpenPriceDialog(false);
  };
  const handleProductDetailChange = (event) => {
    const { name, value } = event.target;
    setProductDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePriceChange = (event) => {
    const { name, value } = event.target;
    setPriceDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Product Status change
  const handleStatusChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      Product_Status: event.target.value,
    }));
  };

  // Save Product data to the server
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/products/${formData.Product_ID}`,
        formData
      );
      console.log("Product updated successfully", response.data);
    } catch (err) {
      console.log("Error updating Product:", err.message);
    }

    // try {
    //   const response = await axios.put(
    //     `http://localhost:5000/price/${priceDetails.Product_ID}`,
    //     priceDetails
    //   );
    //   console.log("Product updated successfully", response.data);
    // } catch (err) {
    //   console.log("Error updating Product:", err.message);
    // }
  };

  // Render Select component to avoid repetition
  const renderSelect = (
    label,
    value,
    onChange,
    items,
    categoryLevel,
    disabled
  ) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        name={categoryLevel}
        value={value}
        onChange={(e) => onChange(e, categoryLevel)}
        label={label}
        disabled={disabled}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 250, // Set the height for the scrollable area
              overflow: "auto", // Enable scroll if content overflows
            },
          },
        }}
      >
        {items.map((item) => {
          // Determine the key based on the category level selected
          const key =
            categoryLevel === "lvl1"
              ? item.Cat_Code
              : categoryLevel === "lvl2"
              ? item.Cat_Lv2_Code
              : item.Cat_Lv3_Code;
          const name =
            categoryLevel === "lvl1"
              ? item.Cat_Name
              : categoryLevel === "lvl2"
              ? item.Cat_Lv2_Name
              : item.Cat_Lv3_Name;
          return (
            <MenuItem key={key} value={key}>
              {name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ bgcolor: "whitesmoke" }}>
      <Box className="edit-product-container">
        <Box className="edit-product-card-container">
          <Typography fontSize={25}>
            Edit Product - {currentitem.Description}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: "85%" }}>
          <Card className="edit-product-card">
            <Box className="edit-product-form-grid">
              <TextField
                label="Product ID"
                variant="outlined"
                value={formData.Product_ID || ""}
                disabled
              />
              <TextField
                label="Product Ref"
                variant="outlined"
                value={formData.Product_Ref || ""}
                name="Product_Ref"
                onChange={handleChange}
              />

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Product Status</InputLabel>
                  <Select
                    name="Product_Status"
                    value={formData.Product_Status || ""}
                    onChange={handleStatusChange}
                    label="Product Status"
                  >
                    <MenuItem value={"D"}>Discontinue</MenuItem>
                    <MenuItem value={"A"}>Active</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                {renderSelect(
                  "Category LVL1",
                  formData.Category_Lv1 || "",
                  handleCategoryChange,
                  catlist,
                  "lvl1",
                  false
                )}
              </Box>

              <Box>
                {renderSelect(
                  "Category LVL2",
                  formData.Category_Lv2 || "",
                  handleCategoryChange,
                  catlvl2List,
                  "lvl2",
                  !formData.Category_Lv1 || catlvl2List.length === 0
                )}
              </Box>

              <Box>
                {renderSelect(
                  "Category LVL3",
                  formData.Category_Lv3 || "",
                  handleCategoryChange,
                  catlvl3List,
                  "lvl3",
                  !formData.Category_Lv2 || catlvl3List.length === 0
                )}
              </Box>

              <TextField
                label="Description"
                variant="outlined"
                value={formData.Description || ""}
                name="Description"
                onChange={handleChange}
              />
              <TextField
                label="Long Description"
                variant="outlined"
                value={formData.Description_Long || ""}
                name="Description_Long"
                onChange={handleChange}
              />

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Product Type</InputLabel>
                  <Select
                    name="Product_Type"
                    value={formData.Product_Type || ""}
                    onChange={handleStatusChange}
                    label="Product Type"
                  >
                    <MenuItem value={"ST"}>Stock</MenuItem>
                    <MenuItem value={"NS"}>Non Stock</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Description 2"
                variant="outlined"
                value={formData.Description2 || ""}
                name="Description2"
                onChange={handleChange}
              />

              <TextField
                label="Long Description 2"
                variant="outlined"
                value={formData.Description_Long2 || ""}
                name="Description_Long2"
                onChange={handleChange}
              />

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Stock UM</InputLabel>
                  <Select
                    name="Stock_UM"
                    value={formData.Stock_UM || ""}
                    onChange={handleChange}
                    label="Stock UM"
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      packingMaster.map((group) => (
                        <MenuItem key={group.Pack_ID} value={group.Pack_ID}>
                          {group.Pack_description}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Base UM</InputLabel>
                  <Select
                    name="Base_UM"
                    value={formData.Base_UM || ""}
                    onChange={handleChange}
                    label="Base UM"
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      packingMaster.map((group) => (
                        <MenuItem key={group.Pack_ID} value={group.Pack_ID}>
                          {group.Pack_description}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
              <Box display={"flex"}>
                <Box width={"50%"} marginRight={1}>
                  <TextField
                    label="Warranty Period"
                    variant="outlined"
                    value={formData.Warranty_Period || ""}
                    name="Warranty_Period"
                    onChange={handleChange}
                  />
                </Box>
                <Box width={"50%"}>
                  <FormControl fullWidth>
                    <InputLabel>Warranty Type</InputLabel>
                    <Select
                      name="Warranty_Type"
                      value={formData.Warranty_Type || ""}
                      onChange={handleChange}
                      label="Warranty Type"
                    >
                      <MenuItem value={"D"}>Days</MenuItem>
                      <MenuItem value={"M"}>Months</MenuItem>
                      <MenuItem value={"Y"}>Years</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box display={"flex"} flexDirection={"row"}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="Taxable"
                        checked={formData.Taxable === 1} // If active is 1, checkbox is checked
                        onChange={(event) => handleCheckboxChange(event)}
                      />
                    }
                    label={"Taxable"}
                  ></FormControlLabel>
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="Stop_Sell"
                        checked={formData.Stop_Sell === 1} // If active is 1, checkbox is checked
                        onChange={(event) => handleCheckboxChange(event)}
                      />
                    }
                    label={"Stop Sell"}
                  ></FormControlLabel>
                </Box>
              </Box>
            </Box>

            <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Details</Typography>
                </AccordionSummary>
                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenDialog()} sx={{ ml: 2 }}>
                  Add
                </Button>
                <AccordionDetails> 
                  <Box sx={{ width: "90%", margin: 5 }}>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>BarCode</TableCell>
                            <TableCell>Product UOM</TableCell>
                            <TableCell>UM QTY</TableCell>
                            <TableCell>UNit Cost</TableCell>

                            <TableCell>Last Purchase Price</TableCell>
                            <TableCell>BASE UOM</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {product.map((item) => (
                            <TableRow key={item.Barcode }>
                              <TableCell>{item.Barcode}</TableCell>
                              <TableCell>{item.Product_UOM}</TableCell>
                              <TableCell>{item.UM_QTY}</TableCell>
                              <TableCell>{item.Unit_Cost}</TableCell>
                              <TableCell>{item.Last_Purchase_Price}</TableCell>
                              <TableCell>{item.Base_UM}</TableCell>

                              <TableCell>
                                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }}>
                                  Delete
                                </Button> 
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Price</Typography>
                </AccordionSummary>
                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenPriceDialog()} sx={{ ml: 2 }}>
                  Add
                </Button>
                <AccordionDetails>
                  <Box sx={{ width: "90%", margin: 5 }}>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>BarCode</TableCell>
                            <TableCell>Location Group</TableCell>
                            <TableCell>Retail Price</TableCell>
                            <TableCell>Retail Price 2</TableCell>
                            <TableCell>Retail Price 3</TableCell>
                            <TableCell>Wholesale Price</TableCell>
                            <TableCell>MRP</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {productPrice.map((item) => (
                            <TableRow key={`${item.Product_ID}-${item.Location_Group}-${item.Barcode}`}>
                              <TableCell>{item.Barcode}</TableCell>
                              <TableCell>{item.Location_Group}</TableCell>
                              <TableCell>{item.Retail_Price}</TableCell>
                              <TableCell>{item.Retail_Price2}</TableCell>
                              <TableCell>{item.Retail_Price3}</TableCell>
                              <TableCell>{item.Wholesale_Price}</TableCell>
                              <TableCell>{item.MRP}</TableCell>

                              <TableCell>
                                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenPriceDialog(item)}>
                                  Edit
                                </Button>
                                <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }}>
                                  Delete
                                </Button> 
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>

              
            </Stack>

            <Box className="edit-product-button-container">
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }}>Cancel</Button> 
            </Box>
          </Card>
        </Box>
      </Box>

      <Dialog open={openDetailDialog} onClose={handleCloseDialog}>
        <DialogContent>
          <DialogTitle>Add Product Details</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center">
              <Box sx={{ width: "100%" }} border={1}>
                <Card>
                  <Card className="card-body">
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3, // gap between items
                        justifyContent: "space-between",
                        "& > *": {
                          flexBasis: "calc(33.33% - 16px)", // Default for large screens (3 items per row)
                        },
                        "@media (max-width: 900px)": {
                          "& > *": {
                            flexBasis: "calc(50% - 16px)", // For medium screens (2 items per row)
                          },
                        },
                        "@media (max-width: 600px)": {
                          "& > *": {
                            flexBasis: "100%", // For small screens (1 item per row)
                          },
                        },
                      }}
                    >
                      <TextField
                        name="Barcode"
                        label="Barcode"
                        variant="outlined"
                        value={productDetails.Barcode || ""}
                        onChange={handleProductDetailChange}
                        fullWidth
                        disabled={editMode}
                      />

                      <Box>
                        <FormControl fullWidth>
                          <InputLabel>Product UOM</InputLabel>
                          <Select
                            name="Product_UOM"
                            value={productDetails.Product_UOM || ""}
                            onChange={handleProductDetailChange}
                            label="Product UOM"
                          >
                            {loading ? (
                              <MenuItem disabled>
                                <CircularProgress size={24} />
                              </MenuItem>
                            ) : (
                              packingMaster.map((group) => (
                                <MenuItem
                                  key={group.Pack_ID}
                                  value={group.Pack_ID}
                                >
                                  {group.Pack_description}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <TextField
                        name="UM_QTY"
                        label="UM QTY"
                        variant="outlined"
                        value={productDetails.UM_QTY || ""}
                        onChange={handleProductDetailChange}
                        fullWidth
                      />
                      <TextField
                        name="Unit_Cost"
                        label="Unit Cost"
                        variant="outlined"
                        value={productDetails.Unit_Cost || ""}
                        onChange={handleProductDetailChange}
                        fullWidth
                      />
                      <TextField
                        name="Last_Purchase_Price"
                        label="Last Purchase Price"
                        variant="outlined"
                        value={productDetails.Last_Purchase_Price || ""}
                        onChange={handleProductDetailChange}
                        fullWidth
                      />
                      <TextField
                        name="Base_UM"
                        label="Base UOM"
                        variant="outlined"
                        value={productDetails.Base_UM || ""}
                        fullWidth
                        disabled
                      />
                    </Box>
                  </Card>
                </Card>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="outlined" color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveDetails} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions> 
        </DialogContent>
      </Dialog>

      <Dialog open={openPriceDialog} onClose={handleClosePriceDialog}>
        <DialogTitle>{priceEditMode ? "Edit Price" : "Add Price"}</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <Box sx={{ width: "100%" }} border={1}>
              <Card>
                <Card className="card-body">
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3, // gap between items
                      justifyContent: "space-between",
                      "& > *": {
                        flexBasis: "calc(33.33% - 16px)", // Default for large screens (3 items per row)
                      },
                      "@media (max-width: 900px)": {
                        "& > *": {
                          flexBasis: "calc(50% - 16px)", // For medium screens (2 items per row)
                        },
                      },
                      "@media (max-width: 600px)": {
                        "& > *": {
                          flexBasis: "100%", // For small screens (1 item per row)
                        },
                      },
                    }}
                  >
                    <TextField
                      label="Barcode"
                      variant="outlined"
                      value={priceDetails.Barcode || ""}
                      name="Barcode"
                      onChange={handlePriceChange}
                      fullWidth
                    />

                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>Location Group</InputLabel>
                        <Select
                          name="Location_Group"
                          value={priceDetails.Location_Group || ""}
                          onChange={handlePriceChange}
                          label="Location Group"
                        >
                          {loading ? (
                            <MenuItem disabled>
                              <CircularProgress size={24} />
                            </MenuItem>
                          ) : (
                            locationGroups.map((group) => (
                              <MenuItem
                                key={group.Location_Group}
                                value={group.Location_Group}
                              >
                                {group.Location_Group_Name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Box>

                    <TextField
                      label="Retail Price"
                      variant="outlined"
                      value={priceDetails.Retail_Price || ""}
                      onChange={handlePriceChange}
                      name="Retail_Price"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth
                    />
                    <TextField
                      label="Retail Price2"
                      variant="outlined"
                      value={priceDetails.Retail_Price2 || ""}
                      onChange={handlePriceChange}
                      name="Retail_Price2"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth
                    />
                    <TextField
                      label="Retail Price3"
                      variant="outlined"
                      value={priceDetails.Retail_Price3 || ""}
                      onChange={handlePriceChange}
                      name="Retail_Price3"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth
                    />
                    <TextField
                      label="Wholesale Price"
                      variant="outlined"
                      value={priceDetails.Wholesale_Price || ""}
                      onChange={handlePriceChange}
                      name="Wholesale_Price"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth
                    />
                    <TextField
                      label="MRP"
                      variant="outlined"
                      value={priceDetails.MRP || ""}
                      onChange={handlePriceChange}
                      name="MRP"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth
                    />
                  </Box>
                </Card>
              </Card>
            </Box>
          </Box>
        </DialogContent> 
        <DialogActions>
          <Button onClick={handleClosePriceDialog} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={handleSavePrice} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions> 
      </Dialog>
    </Box>
  );
};

export default EditProduct;
