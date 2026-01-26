import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const SearchDialog = ({
  open,
  onClose,
  supplierList,
  handleSupplierChange,
  onConfirmSelection,
}) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [status, setStatus] = useState(1);
  const [filters, setFilters] = useState({
    Description: "",
    Product_ID: "",
    Cat_Name: "",
    CatLvl1: "",
    BarCode: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [catlist, setCatList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/searchProducts").then((res) => {
      setProducts(res.data);
      setFiltered(res.data);
    });

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/catlvl1");
        setCatList(response.data);
      } catch (err) {
        console.log("Error fetching Category LVL1:", err.message);
      }
    };

    fetchData();
  }, []);

  // ✅ Accessibility fix: blur focus when dialog closes
  useEffect(() => {
    if (!open) {
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur();
      }
    }
  }, [open]);
const handleRowClick = async (product) => {
  if (selectedRow?.Barcode === product.Barcode) {
    setSelectedRow(null);
    onConfirmSelection(null);
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/getAverageCost",
      {
        barcode: product.Barcode,     // ✅ consistent casing
        clientId: "940T0003",
        locationId: "001",
        date: "2026-01-26",
      }
    );


    setSelectedRow({
      ...product,
      avg_Cost: response.data?.average_cost ?? 0,
    });

     onConfirmSelection({
      ...product,
      avg_Cost: response.data?.average_cost ?? 0,
    });
   
  } catch (err) {
    console.error("Error get averageCost:", err.message);
  }
};


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    setPage(0);

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

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
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
                label="Description"
                name="Description"
                fullWidth
                margin="normal"
                value={filters.Description}
                onChange={handleFilterChange}
              />

              <TextField
                label="Product ID"
                name="Product_ID"
                fullWidth
                margin="normal"
                value={filters.Product_ID}
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
                    <MenuItem key={item.Cat_Code} value={item.Cat_Name}>
                      {item.Cat_Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                  value={status}
                  onChange={handleStatusChange}
                  label="Product Status"
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  <MenuItem value={0}>Closed</MenuItem>
                  <MenuItem value={1}>Open</MenuItem>
                </Select>
              </FormControl>
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
                    <TableCell>Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRows.map((product) => {
                    const isSelected = selectedRow?.Barcode === product.Barcode;

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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
