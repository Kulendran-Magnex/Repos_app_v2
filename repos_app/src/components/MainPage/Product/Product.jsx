import * as React from "react";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import DeleteIcon from "@mui/icons-material/Delete";
import { visuallyHidden } from "@mui/utils";
import axios from "axios";

// Table header configuration
const headCells = [
  { id: "productRef", label: "Product Ref" },
  { id: "categoryName", label: "Category Name" },
  { id: "productName", label: "Product Name" },
  { id: "price", label: "Price" },
  { id: "stockUM", label: "Stock UM" },
];

// EnhancedTableHead Component
function EnhancedTableHead({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}) {
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <TableRow sx={{ backgroundColor: "steelblue", color: "Menu" }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        <TableCell></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id && (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              )}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

// EnhancedTableToolbar Component
function EnhancedTableToolbar({
  numSelected,
  filterQuery,
  onFilterChange,
  onDelete,
}) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor:
          numSelected > 0
            ? (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                )
            : "transparent",
      }}
    >
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant={numSelected > 0 ? "subtitle1" : "h4"}
        component="div"
      >
        {numSelected > 0 ? `${numSelected} selected` : "Product"}
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={filterQuery}
        onChange={(e) => onFilterChange(e.target.value)}
        sx={{ ml: 2 }}
      />
      <Tooltip title="Delete">
        <IconButton onClick={onDelete} disabled={numSelected === 0}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  filterQuery: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Main EnhancedTable Component
export default function Product() {
  const [products, setProducts] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("productRef");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState({
    id: "",
    productRef: "",
    categoryLv1: "",
    categoryLv2: "",
    categoryLv3: "",
    familyCode: "",
    clientId: "",
    productStatus: "",
    productType: "",
    description: "",
    descriptionLong: "",
    description2: "",
    descriptionLong2: "",
    uomGroup: "",
    stockUM: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products");
        setProducts(response.data);
      } catch (err) {
        console.log("Error fetching Category LVL1:", err.message);
      }
    };
    fetchData();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? products.map((n) => n.id) : []);
  };

  const handleClickOpen = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setCurrentProduct({ ...product });
    } else {
      setIsEditMode(false);
      setCurrentProduct({
        id: "",
        productRef: "",
        categoryLv1: "",
        categoryLv2: "",
        categoryLv3: "",
        familyCode: "",
        clientId: "",
        productStatus: "",
        productType: "",
        description: "",
        descriptionLong: "",
        description2: "",
        descriptionLong2: "",
        uomGroup: "",
        stockUM: "",
      });
    }
    setOpen(true);
  };

  const handleEdit = (product) => {
    navigate("/product/Edit", { state: { currentitem: product } });
  };

  const handleSave = () => {
    if (isEditMode) {
      setProducts((prevRows) =>
        prevRows.map((product) =>
          product.id === currentProduct.id
            ? { ...product, ...currentProduct }
            : product
        )
      );
    } else {
      setProducts((prevRows) => [
        ...prevRows,
        { ...currentProduct, id: String(prevRows.length + 1) },
      ]);
    }
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) =>
    setRowsPerPage(parseInt(event.target.value, 10));

  const handleDelete = () => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => !selected.includes(product.Product_ID))
    );
    setSelected([]);
  };

  const filteredRows = React.useMemo(
    () =>
      products.filter((product) =>
        (product.Description?.toLowerCase() ?? "").includes(
          filterQuery.toLowerCase()
        )
      ),
    [filterQuery, products]
  );

  const visibleRows = React.useMemo(
    () =>
      [...filteredRows]
        .sort((a, b) =>
          order === "desc" ? b[orderBy] - a[orderBy] : a[orderBy] - b[orderBy]
        )
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );

  return (
    <Box
      container
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: 2,
        backgroundColor: "whitesmoke",
      }}
    >
      <Paper
        sx={{
          width: "85%",
          padding: 3,
          maxHeight: "75%",
          mb: 2,
          "@media (max-width:600px)": { width: "100%" }, // Adjust paper width for small screens
        }}
      >
        <EnhancedTableToolbar
          numSelected={selected.length}
          filterQuery={filterQuery}
          onFilterChange={setFilterQuery}
          onDelete={handleDelete}
        />
        <IconButton onClick={() => handleClickOpen()}>
          <AddCircleSharpIcon />
        </IconButton>

        {/* Add Box wrapper here for horizontal scrolling */}
        <Box
          sx={{
            overflowX: "auto", // Allow horizontal scrolling on smaller screens
            "@media (max-width:600px)": { overflowX: "auto", padding: 1 }, // Add padding on small screens
          }}
        >
          <TableContainer>
            <Table
              sx={{
                minWidth: 1500,
                "@media (max-width:600px)": { minWidth: 800 }, // Adjust table min-width for small screens
              }}
              aria-labelledby="tableTitle"
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={filteredRows.length}
              />
              <TableBody>
                {visibleRows.map((product) => {
                  const isItemSelected = selected.includes(product.Product_ID);
                  return (
                    <TableRow
                      key={product.Product_ID}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={(event) =>
                            setSelected((prev) =>
                              isItemSelected
                                ? prev.filter((id) => id !== product.Product_ID)
                                : [...prev, product.Product_ID]
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell>{product.Product_Ref}</TableCell>
                      <TableCell>{product.Cat_Name}</TableCell>
                      <TableCell>{product.Description}</TableCell>
                      <TableCell>{product.Retail_Price}</TableCell>
                      <TableCell>{product.Stock_UM}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
