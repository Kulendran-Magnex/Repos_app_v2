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
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import "./Editproduct.style.css"; // Import the CSS file
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // To add expand icon in accordion

const EditProduct = () => {
  const location = useLocation();
  const { currentitem } = location.state || {};
  const [catlist, setCatList] = useState([]);
  const [catlvl2List, setCatlvl2List] = useState([]); // Store Category LVL2 list
  const [catlvl3List, setCatlvl3List] = useState([]); // Store Category LVL3 list
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState({ lvl1: "", lvl2: "", lvl3: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    fetchData();
  }, []);

  // Handle Category LVL1 or LVL2 or LVL3 selection change
  const handleCategoryChange = async (event, level) => {
    const { value } = event.target;

    setCategory((prevCategory) => ({
      ...prevCategory,
      [level]: value,
    }));

    // If Category LVL1 is selected, fetch Category LVL2 data
    if (level === "lvl1") {
      try {
        const response = await axios.post("http://localhost:5000/catlvl2", {
          catlvl1_id: value, // Send Category LVL1 ID to fetch Category LVL2
        });
        if (response.data.length > 0) {
          setCatlvl2List(response.data); // Populate Category LVL2 list if data exists
        } else {
          setCatlvl2List([]); // Clear LVL2 list if no data found
        }
        setCatlvl2List(response.data); // Populate Category LVL2 list
        setCatlvl3List([]); // Clear LVL3 list when LVL1 is changed
      } catch (err) {
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

  // Handle Product Status change
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
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
        value={value}
        onChange={onChange}
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
    <div>
      <Box className="edit-product-container">
        <Box className="edit-product-card-container">
          <h2>Edit Product - {currentitem.Description}</h2>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: "85%" }} border={1}>
          <Card className="edit-product-card">
            <Box className="edit-product-form-grid">
              <TextField
                label="Product ID"
                variant="outlined"
                value={currentitem.Product_ID}
                disabled
              />
              <TextField
                label="Product Ref"
                variant="outlined"
                value={currentitem.Product_Ref}
                disabled
              />
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Product Status</InputLabel>
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    label="Product Status"
                  >
                    <MenuItem value={0}>Discontinue</MenuItem>
                    <MenuItem value={1}>Active</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                label="Product Name"
                variant="outlined"
                value={currentitem.Description}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                value={currentitem.quantity}
              />
              <TextField
                label="Product Type"
                variant="outlined"
                value="Retail"
                disabled
              />

              <Box>
                {renderSelect(
                  "Category LVL1",
                  category.lvl1,
                  (e) => handleCategoryChange(e, "lvl1"),
                  catlist,
                  "lvl1", // Specify this is Category LVL1
                  false // LVL1 dropdown is never disabled
                )}
              </Box>

              <Box>
                {renderSelect(
                  "Category LVL2",
                  category.lvl2,
                  (e) => handleCategoryChange(e, "lvl2"),
                  catlvl2List, // Dynamically updated based on LVL1 selection
                  "lvl2", // Specify this is Category LVL2
                  !category.lvl1 || catlvl2List.length === 0 // Disable LVL2 if LVL1 is empty or no data
                )}
              </Box>

              <Box>
                {renderSelect(
                  "Category LVL3",
                  category.lvl3,
                  (e) => handleCategoryChange(e, "lvl3"),
                  catlvl3List, // Dynamically updated based on LVL2 selection
                  "lvl3", // Specify this is Category LVL3
                  !category.lvl2 || catlvl3List.length === 0 // Disable LVL3 if LVL2 is empty or no data
                )}
              </Box>

              <TextField
                label="Stock UM"
                variant="outlined"
                value="PCS"
                disabled
              />
              <TextField
                label="Base UM"
                variant="outlined"
                value="PCS"
                disabled
              />
              <TextField
                label="Description"
                variant="outlined"
                value={currentitem.description}
              />
              <TextField
                label="Long Description"
                variant="outlined"
                value={currentitem.description}
              />
              <TextField
                label="Unit Price"
                variant="outlined"
                value={currentitem.unitprice}
              />
            </Box>

            {/* Accordion with collapsible sections */}
            <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Price</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" justifyContent="center">
                    <Box sx={{ width: "100%" }}>
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
                              value="20000000732"
                              fullWidth
                            />
                            <TextField
                              label="Description"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="Long Description"
                              variant="outlined"
                              value=" "
                              fullWidth
                            />
                            <TextField
                              label="Description 2"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="Long Description 2"
                              variant="outlined"
                              value=" "
                              fullWidth
                            />
                            <TextField
                              label="Product UOM"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="UM QTY"
                              variant="outlined"
                              value=" "
                              fullWidth
                            />
                            <TextField
                              label="Unit Cost"
                              variant="outlined"
                              value=" "
                              fullWidth
                            />
                            <TextField
                              label="Last Purchase Price"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="Base UOM"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                          </Box>
                        </Card>
                      </Card>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>More Price</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" justifyContent="center">
                    <Box sx={{ width: "100%" }}>
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
                              value="20000000732"
                              fullWidth
                            />
                            <TextField
                              label="Location"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="Price"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="More Price"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="More Vendors"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                            <TextField
                              label="Summary"
                              variant="outlined"
                              value=""
                              fullWidth
                            />
                          </Box>
                        </Card>
                      </Card>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography>Toggle second element</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card className="card-body">
                    Content for the second collapsible section.
                  </Card>
                </AccordionDetails>
              </Accordion>
            </Stack>

            <Box className="edit-product-button-container">
              <Button variant="outlined">Save</Button>
              <Button variant="outlined">Cancel</Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </div>
  );
};

export default EditProduct;
