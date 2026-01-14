import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const SearchDialog = ({
  open,
  onClose,
  supplierList,
  handleSupplierChange,
  onConfirmSelection,
}) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [filters, setFilters] = useState({
    Description: "",
    Product_ID: "",
    Cat_Name: "",
    CatLvl1: "",
    BarCode: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPage, setSelectedPage] = useState(0);
  const [catlist, setCatList] = useState([]);
  const [selectedRowsPerPage, setSelectedRowsPerPage] = useState(5);

  useEffect(() => {
    axios.get("http://localhost:5000/searchProducts").then((res) => {
      setProducts(res.data);
      setFiltered(res.data);
    });

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

  const handleRowClick = (product) => {
    const isSelected = selectedData.some((p) => p.Barcode === product.Barcode);

    if (isSelected) {
      setSelectedData(
        selectedData.filter((p) => p.Barcode !== product.Barcode)
      );
    } else {
      setSelectedData([...selectedData, product]);
    }
  };

  const handleQuantityChange = (barcode, newQty) => {
    setSelectedData((prevSelected) =>
      prevSelected.map((item) =>
        item.Barcode === barcode ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRowClick123 = (product) => {
    const isSelected = selectedData.some(
      (p) => p.Product_ID === product.Product_ID
    );

    if (isSelected) {
      setSelectedData(
        selectedData.filter((p) => p.Product_ID !== product.Product_ID)
      );
    } else {
      setSelectedData([...selectedData, product]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    setPage(0); // Reset to first page when filtering

    const newFiltered = products.filter(
      (p) =>
        p.Description.toLowerCase().includes(
          updatedFilters.Description.toLowerCase()
        ) &&
        p.Product_ID.toLowerCase().includes(
          updatedFilters.Product_ID.toLowerCase()
        ) &&
        p.Cat_Name.toLowerCase().includes(
          updatedFilters.Cat_Name.toLowerCase()
        ) &&
        (updatedFilters.CatLvl1 === "" ||
          p.Cat_Name === updatedFilters.CatLvl1) &&
        p.Barcode.toLowerCase().includes(updatedFilters.BarCode.toLowerCase())
    );

    setFiltered(newFiltered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentRows = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRemoveProduct = (barcode) => {
    setSelectedData((prevList) =>
      prevList.filter((p) => p.Barcode !== barcode)
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          width: "90%",
          margin: "0 auto",
        },
      }}
    >
      <DialogTitle>Search</DialogTitle>
      <DialogContent>
        <Box sx={{ backgroundColor: "whitesmoke", minHeight: "92vh" }}>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Box
              component="form"
              sx={{
                width: "90%",
                padding: 2,
                display: "grid",
                rowGap: 0.5,
                columnGap: 2,
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                },
                backgroundColor: "white",
              }}
            >
              <TextField
                label="Product ID"
                name="Product_ID"
                fullWidth
                margin="normal"
                value={filters.Product_ID}
                onChange={handleFilterChange}
              />
              <TextField
                label="Description"
                name="Description"
                fullWidth
                margin="normal"
                value={filters.Description}
                onChange={handleFilterChange}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Category Level 01</InputLabel>
                <Select
                  name="CatLvl1"
                  value={filters.CatLvl1}
                  onChange={handleFilterChange}
                  label="Category Level 01"
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {catlist.map((item) => (
                    <MenuItem key={item.Cat_Name} value={item.Cat_Name}>
                      {item.Cat_Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* <FormControl fullWidth margin="normal">
                <InputLabel>Category Level 02</InputLabel>
                <Select
                  value={""}
                  onChange={handleSupplierChange}
                  label={"Category Level 02"}
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  {supplierList.map((item) => (
                    <MenuItem
                      key={item.Supplier_Code}
                      value={item.Supplier_Code}
                    >
                      {item.Supplier_Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}

              <TextField
                label="Barcode"
                name="BarCode"
                value={filters.BarCode}
                onChange={handleFilterChange}
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Product Status</InputLabel>
                <Select
                  defaultValue={1}
                  label="Product Status"
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  <MenuItem value={0}>Closed</MenuItem>
                  <MenuItem value={1}>Open</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ maxWidth: 200, marginTop: 4, marginBottom: 4 }}
              >
                Search
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            marginTop={2}
            sx={{ backgroundColor: "white", margin: 3 }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Long Description</TableCell>
                    <TableCell>UM</TableCell>
                    <TableCell>Stock </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRows.map((product) => {
                    const isSelected = selectedData.some(
                      (p) => p.Barcode === product.Barcode
                    );

                    return (
                      <TableRow
                        key={product.Barcode}
                        onClick={() => handleRowClick(product)}
                        sx={{
                          backgroundColor: isSelected ? "#d1e7dd" : "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <TableCell>{product.Product_ID}</TableCell>
                        <TableCell>{product.Barcode}</TableCell>
                        <TableCell>{product.Description}</TableCell>
                        <TableCell>{product.Description_Long}</TableCell>
                        <TableCell>{product.Stock_UM}</TableCell>
                        <TableCell>{product.UM_QTY}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>

          <Box sx={{ marginTop: 4, margin: 3 }}>
            <Typography variant="h6">Selected Products</Typography>

            {selectedData.length > 0 ? (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Product ID</TableCell>
                        <TableCell>Barcode</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedData.map((p) => (
                        <TableRow key={p.Barcode}>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveProduct(p.Barcode)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>{p.Product_ID}</TableCell>
                          <TableCell>{p.Barcode}</TableCell>
                          <TableCell>{p.Description}</TableCell>

                          <TableCell>
                            <TextField
                              id="outlined-number"
                              type="number"
                              size="small"
                              value={p.quantity}
                              slotProps={{
                                inputLabel: {
                                  shrink: true,
                                },
                              }}
                              onChange={(e) => {
                                const value = Math.max(
                                  0,
                                  parseInt(e.target.value) || 0
                                ); // Prevent negative
                                handleQuantityChange(p.Barcode, value);
                              }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      onConfirmSelection(selectedData);
                      setSelectedData([]); // clear selected data
                    }}
                  >
                    OK
                  </Button>
                </Box>
              </>
            ) : (
              <Typography>No products selected yet.</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
