import React, { useEffect, useState } from "react";
import { Form, useNavigate } from "react-router-dom";
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
  Dialog,
  TablePagination,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { fetchGRNHeaderbyID } from "../../API/api";
import api from "../../API/axios";

const groupByMRCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.MR_Code]) {
      grouped[item.MR_Code] = {
        MR_Date: item.MR_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }
    grouped[item.MR_Code].items.push(item);
  });
  return grouped;
};

const groupByGRNCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.GRN_Code]) {
      grouped[item.GRN_Code] = {
        PO_Date: item.GRN_Date,
        Location_ID: item.Location_ID,
        Invoice_No: item.Invoice_No,
        items: [],
      };
    }
    grouped[item.GRN_Code].items.push(item);
  });

  return grouped;
};

export default function GRNSearchDialog({
  open,
  onClose,
  handleSupplierChange,
  onConfirmGRNSelection,
  supplierCode,
}) {
  const [data, setData] = useState([]);
  const [selectGRNCode, setSelectGRNCode] = useState(null);
  const [selectedGRNHeadData, setSelectedGRNHeaderData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (supplierCode) {
      console.log("Supplier Code:", supplierCode);
      api
        .get(`/api/GRN_HeaderBySupplier/${supplierCode}`)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching PO data:", err);
          setLoading(false);
        });
    }  else {
      api
        .get("/api/GRN_Header")
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching PO data:", err);
          setLoading(false);
        });
    }
  }, [supplierCode]);

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
        console.error("Error fetching PO line items:", err);
        setSelectedItems([]);
      });
  }, [selectGRNCode]);

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

  const groupedData = groupByGRNCode(data);

  const filteredGRNList = Object.entries(groupedData).filter(
    ([code, group]) => {
      const matchesCode =
        searchCode === "" ||
        code.toLowerCase().includes(searchCode.toLowerCase());
      const matchesDate =
        searchDate === "" ||
        (group.PO_Date &&
          dayjs(group.PO_Date).format("YYYY-MM-DD") === searchDate);
      return matchesCode && matchesDate;
    }
  );

  const handleRowClick = (poCode, group) => {
    console.log("Clicked PO Code:", poCode);
    setSelectGRNCode((prev) => (prev === poCode ? null : poCode));
    setSelectedGRNHeaderData(group);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const sortedData = [...filteredGRNList].sort((a, b) => {
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

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          width: "100%",
          margin: "0 auto",
        },
      }}
    >
      <Box sx={{ padding: 4 }}>
        <Box display="flex">
          <Typography variant="h6">GRN Search</Typography>
          {selectGRNCode && (
            <Button
              variant="contained"
              sx={{ marginLeft: 2 }}
              onClick={() => {
                onConfirmGRNSelection(items, selectedGRNHeadData);
                setSelectGRNCode(null);
                setItems([]);
                setSelectedItems([]);
              }}
            >
              Select
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Search PO Code"
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
        </Box>

        {/* Master Table */}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "steelblue", height: 50 }}>
              <TableRow>
                <TableCell />

                <TableCell>
                  <strong>GRN Code</strong>
                </TableCell>
                <TableCell>
                  <strong>GRN Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Supplier</strong>
                </TableCell>
                <TableCell>
                  <strong>Invoice No</strong>
                </TableCell>
                <TableCell>
                  <strong>GRN Amount</strong>
                </TableCell>
                <TableCell>
                  <strong>Location ID</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGRNList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map(([poCode, group]) => (
                  <TableRow
                    key={poCode}
                    hover
                    selected={selectGRNCode === poCode}
                    onClick={() => handleRowClick(poCode, group)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Radio
                        checked={selectGRNCode === poCode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(poCode, group);
                        }}
                      />
                    </TableCell>

                    <TableCell>{poCode}</TableCell>
                    <TableCell>
                      {group.PO_Date
                        ? dayjs(group.PO_Date).format("YYYY-MM-DD")
                        : "-"}
                    </TableCell>
                    <TableCell>{group.items[0].Supplier_Name || "-"}</TableCell>
                    <TableCell>{group.items[0].Invoice_No || "-"}</TableCell>
                    <TableCell>
                      {parseFloat(group.items[0].GRN_Amount).toFixed(2) || "-"}
                    </TableCell>
                    <TableCell>{group.Location_ID || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredGRNList.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />

        {/* Detail Table */}
        <Typography variant="h6" gutterBottom>
          GRN Items
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "steelblue", height: 50 }}>
              <TableRow>
                <TableCell></TableCell>
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
                  <TableRow key={item.GRN_Line_No}>
                    <TableCell>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={items.some(
                                (i) => i.GRN_Line_No === item.GRN_Line_No
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setItems((prev) => [...prev, item]);
                                } else {
                                  setItems((prev) =>
                                    prev.filter(
                                      (i) => i.GRN_Line_No !== item.GRN_Line_No
                                    )
                                  );
                                }
                              }}
                            />
                          }
                          label=""
                        />
                      </FormGroup>
                    </TableCell>

                    <TableCell align="right">{item.Barcode}</TableCell>
                    <TableCell align="right">{item.Product_ID}</TableCell>
                    <TableCell align="right">{item.Description}</TableCell>
                    <TableCell align="right">{item.Product_UM}</TableCell>
                    <TableCell align="right">
                      {parseFloat(item.Unit_Price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(item.GRN_Qty).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(item.Total_Amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {selectGRNCode
                      ? "No line items found"
                      : "Select a PO to view details"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Dialog>
  );
}
