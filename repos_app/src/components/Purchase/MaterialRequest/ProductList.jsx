import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Typography,
  Box,
} from "@mui/material";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [filters, setFilters] = useState({
    Description: "",
    Product_ID: "",
    Cat_Name: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    axios.get("http://localhost:5000/products").then((res) => {
      setProducts(res.data);
      setFiltered(res.data);
    });
  }, []);

  const handleRowClick = (product) => {
    const isSelected = selectedData.some(
      (p) => p.Product_ID === product.Product_ID
    );

    if (isSelected) {
      setSelectedData(selectedData.filter((p) => p.Product_ID !== product.Product_ID));
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
        p.Description.toLowerCase().includes(updatedFilters.Description.toLowerCase()) &&
        p.Product_ID.toLowerCase().includes(updatedFilters.Product_ID.toLowerCase()) &&
        p.Cat_Name.toLowerCase().includes(updatedFilters.Cat_Name.toLowerCase())
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

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Filtered Products
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <TextField
          label="Description"
          name="Description"
          value={filters.Description}
          onChange={handleFilterChange}
          variant="outlined"
        />
        <TextField
          label="Product ID"
          name="Product_ID"
          value={filters.Product_ID}
          onChange={handleFilterChange}
          variant="outlined"
        />
        <TextField
          label="Category"
          name="Cat_Name"
          value={filters.Cat_Name}
          onChange={handleFilterChange}
          variant="outlined"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Product Ref</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Retail Price</TableCell>
              <TableCell>Stock UM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((product) => {
              const isSelected = selectedData.some(
                (p) => p.Product_ID === product.Product_ID
              );

              return (
                <TableRow
                  key={product.Product_ID}
                  onClick={() => handleRowClick(product)}
                  hover
                  sx={{
                    backgroundColor: isSelected ? "#d1e7dd" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  <TableCell>{product.Product_ID}</TableCell>
                  <TableCell>{product.Product_Ref}</TableCell>
                  <TableCell>{product.Description}</TableCell>
                  <TableCell>{product.Cat_Name}</TableCell>
                  <TableCell>{product.Retail_Price}</TableCell>
                  <TableCell>{product.Stock_UM}</TableCell>
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

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6">Selected Products</Typography>
        {selectedData.length > 0 ? (
          <ul>
            {selectedData.map((p) => (
              <li key={p.Product_ID}>
                <strong>{p.Product_Ref}</strong> - {p.Description} (ID:{" "}
                {p.Product_ID})
              </li>
            ))}
          </ul>
        ) : (
          <Typography>No products selected yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductList;
