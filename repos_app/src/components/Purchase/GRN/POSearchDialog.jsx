import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

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

const groupByPOCode = (data) => {
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.PO_Code]) {
      grouped[item.PO_Code] = {
        PO_Date: item.PO_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }
    grouped[item.PO_Code].items.push(item);
  });
  return grouped;
};

export default function POSearchDialog({
  open,
  onClose,
  handleSupplierChange,
  onConfirmPOSelection,
}) {
  const [data, setData] = useState([]);
  const [selectPOCode, setSelectPOCode] = useState(null);
  const [selectedPOHeadData, setSelectedPOHeaderData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/PO_Header")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching PO data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectPOCode) {
      setSelectedItems([]);
      return;
    }

    axios
      .get(`http://localhost:5000/api/PO_Tran/${selectPOCode}`)
      .then((res) => {
        setSelectedItems(res.data);
      })
      .catch((err) => {
        console.error("Error fetching PO line items:", err);
        setSelectedItems([]);
      });
  }, [selectPOCode]);

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

  const groupedData = groupByPOCode(data);

  const filteredPOList = Object.entries(groupedData).filter(([code, group]) => {
    const matchesCode =
      searchCode === "" ||
      code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesDate =
      searchDate === "" ||
      (group.PO_Date &&
        dayjs(group.PO_Date).format("YYYY-MM-DD") === searchDate);
    return matchesCode && matchesDate;
  });

  const handleRowClick = (poCode, group) => {
    setSelectPOCode((prev) => (prev === poCode ? null : poCode));
    setSelectedPOHeaderData(group);
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
      <Box sx={{ padding: 4 }}>
        <Box display="flex">
          <Typography variant="h6">Purchase Order</Typography>
          {selectPOCode && (
            <Button
              variant="contained"
              sx={{ marginLeft: 2 }}
              onClick={() =>
                onConfirmPOSelection(selectedItems, selectedPOHeadData)
              }
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
                  <strong>PO Code</strong>
                </TableCell>
                <TableCell>
                  <strong>PO Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Supplier</strong>
                </TableCell>
                <TableCell>
                  <strong>Delivery Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Location ID</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPOList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOList.map(([poCode, group]) => (
                  <TableRow
                    key={poCode}
                    hover
                    selected={selectPOCode === poCode}
                    onClick={() => handleRowClick(poCode, group)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Radio
                        checked={selectPOCode === poCode}
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
                    <TableCell>
                      {group.items[0].PO_Delivery_Date
                        ? dayjs(group.items[0].PO_Delivery_Date).format(
                            "YYYY-MM-DD"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{group.Location_ID || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detail Table */}
        <Typography variant="h6" gutterBottom>
          Purchase Order Items
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "steelblue", height: 50 }}>
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
                  <TableRow key={item.PO_Line_No}>
                    <TableCell align="right">{item.Barcode}</TableCell>
                    <TableCell align="right">{item.Product_ID}</TableCell>
                    <TableCell align="right">{item.Description}</TableCell>
                    <TableCell align="right">{item.Product_UM}</TableCell>
                    <TableCell align="right">
                      {parseFloat(item.Unit_Price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(item.PO_Qty).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(item.Total_Amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {selectPOCode
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
