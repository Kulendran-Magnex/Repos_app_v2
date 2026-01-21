import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  CircularProgress,
  TextField,
  Button,
  Chip,
  TablePagination,
  IconButton,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import GRNReport from "../GRN/GRNReport";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const groupByPOCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.PR_Code]) {
      grouped[item.PR_Code] = {
        PR_Date: item.Creation_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }
    grouped[item.PR_Code].items.push(item);
  });
  return grouped;
};

const ViewPR = () => {
  const [data, setData] = useState([]);
  const [selectPRCode, setSelectPRCode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/PR_Header")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching PR data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectPRCode) {
      setSelectedItems([]);
      return;
    }
    axios
      .get(`http://localhost:5000/api/PR_Tran/${selectPRCode}`)
      .then((res) => {
        setSelectedItems(res.data);
       
      })
      .catch((err) => {
        console.error("Error fetching PR line items:", err);
        setSelectedItems([]);
      });
  }, [selectPRCode]);

  const groupedData = groupByPOCode(data);

  const filteredPOList = Object.entries(groupedData).filter(([code, group]) => {
    const firstItem = group.items[0];
    const prDate = firstItem.PR_Date
      ? dayjs(firstItem.PR_Date).format("YYYY-MM-DD")
      : "";

    const matchesCode =
      searchCode === "" ||
      code.toLowerCase().includes(searchCode.toLowerCase());

    // Date range filter
    const matchesFrom = !fromDate || (prDate && prDate >= fromDate);
    const matchesTo = !toDate || (prDate && prDate <= toDate);

    return matchesCode && matchesFrom && matchesTo;
  });

  const handleRowClick = (prCode) => {
    setSelectPRCode((prev) => (prev === prCode ? null : prCode));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = [...filteredPOList].sort((a, b) => {
    const aStatus = a[1].items[0].PR_Status;
    const bStatus = b[1].items[0].PR_Status;

    if (aStatus === "O" && bStatus !== "O") return -1; // 'O' first
    if (aStatus !== "O" && bStatus === "O") return 1;
    return 0; // keep relative order
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDelete = () => {
    if (!selectPRCode) return;

    toast.custom((t) => (
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
          border: "1px solid #ddd",
          minWidth: "300px",
        }}
      >
        <p style={{ marginBottom: "12px", fontWeight: "bold" }}>
          Delete PR {selectPRCode}?
        </p>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: "6px 12px",
              background: "#eee",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id); // First dismiss the confirmation

              setTimeout(() => {
                axios
                  .delete(
                    `http://localhost:5000/api/purchaseReturn/${selectPRCode}`
                  )
                  .then(() => {
                    setData((prevData) =>
                      prevData.filter((item) => item.PR_Code !== selectPRCode)
                    );
                    setSelectPRCode(null);
                    setSelectedItems([]);
                    toast.success("PR Deleted");
                  })
                  .catch((err) => {
                    console.error("Error deleting PR:", err);
                    toast.error("Failed to delete the selected PR.");
                  });
              }, 200); // Wait a bit before showing result
            }}
            style={{
              padding: "6px 12px",
              background: "#ef4444", // red
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handlePrintWindow = () => {
    if (!selectPRCode || selectedItems.length === 0) {
      toast.error("Please select a GRN to print.");
      return;
    }

    const seletedGRN = data.find((d) => d.GRN_Code === selectPRCode);
    const printWindow = window.open("", "_blank");

    const poDetailsHtml = GRNReport({
      selectPRCode,
      seletedGRN,
      selectedItems,
    });

    printWindow.document.open();
    printWindow.document.write(poDetailsHtml);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        padding={1}
        sx={{ backgroundColor: "whitesmoke" }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5">Purchase Return</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate("/purchase-return/add")}
            sx={{ mr: 1 }}
          >
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Box>
        <Button variant="outlined" color="primary" onClick={handlePrintWindow}>
          Print / Save PDF
        </Button>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 2 }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Search PR Code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {selectPRCode && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            size="small"
          >
            Delete PR
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#63b1f1ff", height: 50 }}>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell>
                <strong>PR Code</strong>
              </TableCell>
              <TableCell>
                <strong>PR Date</strong>
              </TableCell>
              <TableCell>
                <strong>Supplier</strong>
              </TableCell>
              <TableCell>
                <strong>Location ID</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPOList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(([poCode, group]) => (
                <TableRow
                  key={poCode}
                  hover
                  selected={selectPRCode === poCode}
                  onClick={() => handleRowClick(poCode)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Radio
                      checked={selectPRCode === poCode}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(poCode);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {/* {group.items[0].GRN_Status === "O" && ( */}
                    <Button
                      sx={{
                        textTransform: "none",
                        borderColor: "#1976d2",
                        color: "#1976d2",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                          borderColor: "#1565c0",
                        },
                        fontWeight: 500,
                        padding: "4px 12px",
                        borderRadius: "8px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectPRCode(poCode);
                        navigate("/purchase-return/edit", {
                          state: { currentItemID: poCode },
                        });
                      }}
                      variant="outlined"
                    >
                      View
                    </Button>
                    {/* )} */}
                  </TableCell>
                  <TableCell>{poCode}</TableCell>
                  <TableCell>
                    {group.PR_Date
                      ? dayjs(group.PR_Date).format("YYYY-MM-DD")
                      : "-"}
                  </TableCell>
                  <TableCell>{group.items[0].Supplier_Name || "-"}</TableCell>
                  <TableCell>{group.Location_ID || "-"}</TableCell>
                  <TableCell>
                    {group.items[0].PR_Status === 0 ? (
                      <Chip
                        label="Open"
                        size="small"
                        sx={{ backgroundColor: "#e6f4ea", color: "#2e7d32" }}
                      />
                    ) : group.items[0].PR_Status === 1 ? (
                      <Chip
                        label="Posted"
                        size="small"
                        sx={{ backgroundColor: "#fdecea", color: "#d32f2f" }}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredPOList.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Detail Table */}
      <Typography variant="h6" gutterBottom>
        PR Items
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#63b1f1ff", height: 50 }}>
            <TableRow>
              <TableCell align="right">
                <strong>Barcode</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Product ID</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Description</strong>
              </TableCell>
              <TableCell align="right">
                <strong>UOM</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Unit Price</strong>
              </TableCell>
              <TableCell align="right">
                <strong>QTY</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Total</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <TableRow key={item.PR_Line_No}>
                  <TableCell align="right">{item.Barcode}</TableCell>
                  <TableCell align="right">{item.Product_ID}</TableCell>
                  <TableCell align="right">{item.Description}</TableCell>
                  <TableCell align="right">{item.Product_UM}</TableCell>
                  <TableCell align="right">
                    {parseFloat(item.Unit_Price).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.PR_Qty).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.Total_Amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {selectPRCode
                    ? "No line items found"
                    : "Select a PR to view details"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewPR;
