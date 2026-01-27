import { useEffect, useState } from "react";
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
  TablePagination,
  IconButton,
  Chip,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import GRNReport from "../../Purchase/GRN/GRNReport";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getStatusDisplay, isDeleted } from "../../../utils/statusHelper";

const groupByAdjustmentCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.Adjustment_ID]) {
      grouped[item.Adjustment_ID] = {
        Adjustment_Date: item.Adjustment_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }
    grouped[item.Adjustment_ID].items.push(item);
  });
  return grouped;
};

const ViewAdjustment = () => {
  const [data, setData] = useState([]);
  const [selectAdjustmentCode, setSelectAdjustmentCode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/adjustment_header")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Adjustment data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectAdjustmentCode) {
      setSelectedItems([]);
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/adjustment_detail/${selectAdjustmentCode}`
      )
      .then((res) => {
        setSelectedItems(res.data);
      })
      .catch((err) => {
        console.error("Error fetching Adjustment line items:", err);
        setSelectedItems([]);
      });
  }, [selectAdjustmentCode]);

  const groupedData = groupByAdjustmentCode(data);

  const filteredPOList = Object.entries(groupedData).filter(([code, group]) => {
    const firstItem = group.items[0];
    const matchesCode =
      searchCode === "" ||
      code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesDate =
      searchDate === "" ||
      (firstItem.Adjustment_Date &&
        dayjs(firstItem.Adjustment_Date).format("YYYY-MM-DD") === searchDate);
    return matchesCode && matchesDate;
  });

  const handleRowClick = (poCode) => {
    setSelectAdjustmentCode((prev) => (prev === poCode ? null : poCode));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = [...filteredPOList].sort((a, b) => {
    const aStatus = a[1].items[0].GRN_Status;
    const bStatus = b[1].items[0].GRN_Status;

    if (aStatus === "O" && bStatus !== "O") return -1; // 'O' first
    if (aStatus !== "O" && bStatus === "O") return 1;
    return 0; // keep relative order
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDelete = () => {
    if (!selectAdjustmentCode) return;

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
          Delete GRN {selectAdjustmentCode}?
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
                    `http://localhost:5000/api/GRN/${selectAdjustmentCode}`
                  )
                  .then(() => {
                    setData((prevData) =>
                      prevData.filter(
                        (item) => item.GRN_Code !== selectAdjustmentCode
                      )
                    );
                    setSelectAdjustmentCode(null);
                    setSelectedItems([]);
                    toast.success("GRN Deleted");
                  })
                  .catch((err) => {
                    console.error("Error deleting GRN:", err);
                    toast.error("Failed to delete the selected GRN.");
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
    if (!selectAdjustmentCode || selectedItems.length === 0) {
      toast.error("Please select a GRN to print.");
      return;
    }

    const seletedGRN = data.find((d) => d.GRN_Code === selectAdjustmentCode);
    const printWindow = window.open("", "_blank");

    const poDetailsHtml = GRNReport({
      selectAdjustmentCode,
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
          <Typography variant="h5">Adjustment</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate("/adjustment/add")}
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
            label="Search Adjustment Code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Search Date"
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {selectAdjustmentCode && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            size="small"
          >
            Delete Adjustment
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
                <strong>GRN Code</strong>
              </TableCell>
              <TableCell>
                <strong>GRN Date</strong>
              </TableCell>

              <TableCell>
                <strong>Location ID</strong>
              </TableCell>
              <TableCell>
                <strong>Remarks</strong>
              </TableCell>
              <TableCell>
                <strong>Created By</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPOList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(([poCode, group]) => (
                <TableRow
                  key={poCode}
                  hover
                  selected={selectAdjustmentCode === poCode}
                  onClick={() => handleRowClick(poCode)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Radio
                      checked={selectAdjustmentCode === poCode}
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
                        setSelectAdjustmentCode(poCode);
                        navigate("/adjustment/edit", {
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
                    {group.Adjustment_Date
                      ? dayjs(group.Adjustment_Date).format("YYYY-MM-DD")
                      : "-"}
                  </TableCell>

                  <TableCell>{group.Location_ID || "-"}</TableCell>
                  <TableCell>{group.items[0].Remarks || "-"}</TableCell>
                  <TableCell>{group.items[0].Created_By || "-"}</TableCell>
                  <TableCell>
                    {getStatusDisplay(group.items[0].Status).label === "-" ? (
                      "-"
                    ) : (
                      <Chip
                        label={getStatusDisplay(group.items[0].Status).label}
                        size="small"
                        sx={getStatusDisplay(group.items[0].Status).sx}
                      />
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
        Adjustment Items
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
                <TableRow key={item.Row_ID}>
                  <TableCell align="right">{item.Barcode}</TableCell>
                  <TableCell align="right">{item.Product_ID}</TableCell>
                  <TableCell align="right">{item.Description}</TableCell>
                  <TableCell align="right">{item.Adjustment_UM}</TableCell>
                  <TableCell align="right">
                    {parseFloat(item.Unit_Cost).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.Adjustment_QTY).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.Adjustment_Cost).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {selectAdjustmentCode
                    ? "No line items found"
                    : "Select a Adjustment to view details"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewAdjustment;
