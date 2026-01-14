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
  Chip,
  TablePagination,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import api from "../../API/axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GRNReport from "./GRNReport";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { fetchGRNHeaderbyID,fetchGRNTranbyID } from "../../API/api";

const groupByPOCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.GRN_Code]) {
      grouped[item.GRN_Code] = {
        GRN_Date: item.GRN_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }
    grouped[item.GRN_Code].items.push(item);
  });
  return grouped;
};

const ViewGRN = () => {
  const [data, setData] = useState([]);
  const [selectGRNCode, setSelectGRNCode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  // Responsive hooks (must be unconditional)
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  // shared style vars
  const tableHeadBg = "#63b1f1ff";

  // Normalize status from various possible shapes and ensure it's an uppercase trimmed string or null
  const getStatus = (item) => {
    if (!item) return null;
    const raw = item.GRN_Status ?? item.Status ?? item.status ?? null;
    return raw !== null && raw !== undefined ? String(raw).trim().toUpperCase() : null;
  };

  useEffect(() => {
    api
      .get("/api/GRN_Header")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching GRN data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectGRNCode) {
      setSelectedItems([]);
      return;
    }

    api
      .get(`/api/GRN/Tran/${selectGRNCode}`)
      .then((res) => {
        setSelectedItems(res.data);
      })
      .catch((err) => {
        console.error("Error fetching GRN line items:", err);
        setSelectedItems([]);
      });
  }, [selectGRNCode]);

  // If data updates and the currently selected GRN becomes Deleted, clear selection
  useEffect(() => {
    if (!selectGRNCode) return;
    const selected = data.find((d) => d.GRN_Code === selectGRNCode);
    if (getStatus(selected) === "D") {
      setSelectGRNCode(null);
      setSelectedItems([]);
    }
  }, [data, selectGRNCode]);

  const groupedData = groupByPOCode(data);

  const filteredPOList = Object.entries(groupedData).filter(([code, group]) => {
    const firstItem = group.items[0];
    const matchesCode =
      searchCode === "" ||
      code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesDate =
      searchDate === "" ||
      (firstItem.GRN_Date &&
        dayjs(firstItem.GRN_Date).format("YYYY-MM-DD") === searchDate);
    return matchesCode && matchesDate;
  });

  const handleRowClick = (poCode, status) => {
    // Do not allow selecting a deleted GRN
    if (status === "D") return;
    setSelectGRNCode((prev) => (prev === poCode ? null : poCode));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedData = [...filteredPOList].sort((a, b) => {
    const aStatus = getStatus(a[1].items[0]);
    const bStatus = getStatus(b[1].items[0]);

    if (aStatus === "O" && bStatus !== "O") return -1; // 'O' first
    if (aStatus !== "O" && bStatus === "O") return 1;
    return 0; // keep relative order
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const selectedStatus = selectGRNCode
    ? getStatus(data.find((d) => d.GRN_Code === selectGRNCode))
    : null; 

  const handleDelete = () => {
    if (!selectGRNCode) return;
    const sel = data.find((d) => d.GRN_Code === selectGRNCode);
    if (getStatus(sel) === "D") {
      toast.error("Cannot delete a GRN that is already deleted.");
      return;
    }

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
          Delete GRN {selectGRNCode}?
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
                  .delete(`http://localhost:5000/api/GRN/${selectGRNCode}`)
                  .then(() => {
                    setData((prevData) =>
                      prevData.filter((item) => item.GRN_Code !== selectGRNCode)
                    );
                    setSelectGRNCode(null);
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
    if (!selectGRNCode || selectedItems.length === 0) {
      toast.error("Please select a GRN to print.");
      return;
    }

    const seletedGRN = data.find((d) => d.GRN_Code === selectGRNCode);
    const printWindow = window.open("", "_blank");

    const poDetailsHtml = GRNReport({
      selectGRNCode,
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
          <Typography variant="h5">Good Receive Notice</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate("/grn/add")}
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
            label="Search GRN Code"
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

        {selectGRNCode && selectedStatus !== "D" && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            size="small"
          >
            Delete GRN
          </Button>
        )} 
      </Box>

      {/* Selection list: table on desktop, transposed columns on small screens */}
      {!isSmall ? (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: tableHeadBg, height: 50 }}>
              <TableRow>
                <TableCell  />
                <TableCell  />
                <TableCell >
                  <strong>GRN Code</strong>
                </TableCell>
                <TableCell >
                  <strong>GRN Date</strong>
                </TableCell>
                <TableCell >
                  <strong>Supplier</strong>
                </TableCell>
                <TableCell >
                  <strong>Location ID</strong>
                </TableCell>
                <TableCell >
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPOList.length === 0 ? (
                <TableRow >
                  <TableCell colSpan={6} >
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map(([poCode, group]) => (
                  <TableRow
                    key={poCode}
                    hover
                    selected={selectGRNCode === poCode}
                    onClick={() => handleRowClick(poCode, getStatus(group.items[0]))}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      {getStatus(group.items[0]) !== "D" ? (
                        <Radio
                          checked={selectGRNCode === poCode}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(poCode, getStatus(group.items[0]));
                          }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell >
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
                          setSelectGRNCode(poCode);
                          navigate("/grn/edit", {
                            state: { currentItemID: poCode },
                          });
                        }}
                        variant="outlined"
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell>{poCode}</TableCell>
                    <TableCell>
                      {group.GRN_Date
                        ? dayjs(group.GRN_Date).format("YYYY-MM-DD")
                        : "-"}
                    </TableCell>
                    <TableCell>{group.items[0].Supplier_Name || "-"}</TableCell>
                    <TableCell>{group.Location_ID || "-"}</TableCell>
                    <TableCell>
                      {getStatus(group.items[0]) === "O" ? (
                        <Chip
                          label="Open"
                          size="small"
                          sx={{ backgroundColor: "#e6f4ea", color: "#2e7d32" }}
                        />
                      ) : getStatus(group.items[0]) === "D" ? (
                        <Chip
                          label="Deleted"
                          size="small"
                          sx={{ backgroundColor: "#fdecea", color: "#d32f2f" }}
                        />
                      ) : getStatus(group.items[0]) === "P" ? (
                        <Chip
                          label="Posted"
                          size="small"
                          sx={{ backgroundColor: "#fff8e1", color: "#f9a825" }}
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
      ) : (
        <Paper sx={{ mb: 2, p: 1 }}>
          {paginatedData.length === 0 ? (
            <Box p={2} textAlign="center">No records found</Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
              <Box sx={{ minWidth: 110, bgcolor: tableHeadBg, pr: 1, position: 'sticky', top: 0, zIndex: 3, boxShadow: 'inset -6px 0 8px -6px rgba(0,0,0,0.08)' }}>
                {["Action","GRN Code","GRN Date","Supplier","Location","Status"].map((lbl) => (
                  <Box key={lbl} sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lbl}</Box>
                ))}
              </Box>

              <Box sx={{ overflowX: 'auto', flex: 1 }}>
                <Box sx={{ display: 'flex' }}>
                  {paginatedData.map(([poCode, group]) => (
                    <Box key={poCode} sx={{ minWidth: 220, borderLeft: '1px solid #eee' }}>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getStatus(group.items[0]) !== 'D' ? (
                          <>
                          <Radio checked={selectGRNCode === poCode} onClick={(e) => { e.stopPropagation(); handleRowClick(poCode, getStatus(group.items[0])); }} />
                           <Button variant="outlined" sx={{ textTransform: 'none', borderColor: '#1976d2', color: '#1976d2', fontWeight: 500, padding: '4px 12px', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); setSelectGRNCode(poCode); navigate('/grn/edit', { state: { currentItemID: poCode } }); }}>View</Button>
                           </>
                        ) : '-'}
                      </Box>

                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{poCode}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{group.GRN_Date ? dayjs(group.GRN_Date).format('YYYY-MM-DD') : '-'}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{group.items[0].Supplier_Name || '-'}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{group.Location_ID || '-'}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getStatus(group.items[0]) === 'O' ? (
                          <Chip label="Open" size="small" sx={{ backgroundColor: '#e6f4ea', color: '#2e7d32' }} />
                        ) : getStatus(group.items[0]) === 'D' ? (
                          <Chip label="Deleted" size="small" sx={{ backgroundColor: '#fdecea', color: '#d32f2f' }} />
                        ) : getStatus(group.items[0]) === 'P' ? (
                          <Chip label="Posted" size="small" sx={{ backgroundColor: '#fff8e1', color: '#f9a825' }} />
                        ) : ('-')}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      )}

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
      <Typography variant="h6" gutterBottom sx={{ textAlign: isSmall ? 'center' : 'left' }}>
        GRN Items
      </Typography>
      {/* Responsive detail view: desktop uses table, mobile shows transposed columns that scroll horizontally */}
      {!isSmall ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: tableHeadBg, height: 50 }}>
              <TableRow>
                <TableCell align="center">
                  <strong>Barcode</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Product ID</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Description</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>UOM</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Unit Price</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>QTY</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <TableRow key={item.GRN_Line_No}>
                  <TableCell align="right">{item.Barcode || "-"}</TableCell>
                  <TableCell align="right">{item.Product_ID || "-"}</TableCell>
                  <TableCell align="right">{item.Description || "-"}</TableCell>
                  <TableCell align="right">{item.Product_UM || "-"}</TableCell>
                  <TableCell align="right">
                    {item.Unit_Price ? parseFloat(item.Unit_Price).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {item.GRN_Qty ? parseFloat(item.GRN_Qty).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {item.Total_Amount ? parseFloat(item.Total_Amount).toFixed(2) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {selectGRNCode
                      ? "No line items found"
                      : "Select a GRN to view details"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Small screen: render transposed view where left column is labels (fixed) and right side is horizontally scrollable values (each item as a vertical column)
        <Paper sx={{ mt: 1, p: 1 }}>
          {selectedItems.length === 0 ? (
            <Box p={2} textAlign="center">
              {selectGRNCode ? "No line items found" : "Select a GRN to view details"}
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "stretch", justifyContent: 'center' }}>
              {/* Labels column (sticky) */}
<Box sx={{ minWidth: 110, bgcolor: tableHeadBg, pr: 1, position: 'sticky', top: 0, zIndex: 3, boxShadow: 'inset -6px 0 8px -6px rgba(0,0,0,0.08)' }}>
                {[
                  "Barcode",
                  "Product ID",
                  "Description",
                  "UOM",
                  "Unit Price",
                  "QTY",
                  "Total",
                ].map((lbl) => (
                  <Box key={lbl} sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {lbl}
                  </Box>
                ))}
              </Box>

              {/* Scrollable values area where each selected item becomes a column */}
              <Box sx={{ overflowX: "auto", flex: 1 }}>
                <Box sx={{ display: "flex" }}>
                  {selectedItems.map((item, idx) => (
                    <Box key={item.GRN_Line_No} sx={{ minWidth: 220, borderLeft: "1px solid #eee" }}>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Barcode || "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Product_ID || "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Description || "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Product_UM || "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Unit_Price ? parseFloat(item.Unit_Price).toFixed(2) : "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.GRN_Qty ? parseFloat(item.GRN_Qty).toFixed(2) : "-"}</Box>
                      <Box sx={{ py: 1.25, minHeight: 48, borderBottom: "1px solid #eee", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.Total_Amount ? parseFloat(item.Total_Amount).toFixed(2) : "-"}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ViewGRN;
