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
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

const ViewPurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [selectPOCode, setSelectPOCode] = useState(null);
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

  const handleRowClick = (poCode) => {
    setSelectPOCode((prev) => (prev === poCode ? null : poCode));
  };

  const handleDelete = () => {
    if (!selectPOCode) return;

    if (
      !window.confirm(`Are you sure you want to delete PO ${selectPOCode}?`)
    ) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/purchaseOrder/${selectPOCode}`)
      .then(() => {
        setData((prevData) =>
          prevData.filter((item) => item.PO_Code !== selectPOCode)
        );
        setSelectPOCode(null);
        setSelectedItems([]);
        toast.success("Purchase Order Deleted");
      })
      .catch((err) => {
        console.error("Error deleting PO:", err);
        toast.error("Failed to delete the selected PO.");
      });
  };

  const handlePrintWindow = () => {
    if (!selectPOCode || selectedItems.length === 0) {
      toast.error("Please select a Purchase Order to print.");
      return;
    }

    const selectedPO = data.find((d) => d.PO_Code === selectPOCode);
    const printWindow = window.open("", "_blank", "width=800,height=600");

    const poDetailsHtml = `
      <html>
        <head>
          <title>Purchase Order - ${selectPOCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: right; }
            th { background-color: #eee; }
            td.left { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Purchase Order - ${selectPOCode}</h2>
          <p><strong>PO Date:</strong> ${dayjs(selectedPO?.PO_Date).format(
            "YYYY-MM-DD"
          )}</p>
          <p><strong>Location:</strong> ${selectedPO?.Location_ID}</p>
          <p><strong>Supplier:</strong> ${selectedPO?.Supplier_Name || "-"}</p>

          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Product ID</th>
                <th class="left">Description</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.Barcode}</td>
                  <td>${item.Product_ID}</td>
                  <td class="left">${item.Description}</td>
                  <td>${item.Product_UM}</td>
                  <td>${parseFloat(item.Unit_Price).toFixed(2)}</td>
                  <td>${parseFloat(item.PO_Qty).toFixed(2)}</td>
                  <td>${parseFloat(item.Total_Amount).toFixed(2)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

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
      <Box display="flex">
        <Typography variant="h6">Purchase Order</Typography>
        <Button
          variant="contained"
          sx={{ marginLeft: 2 }}
          onClick={() => navigate("/purchase-order/add")}
        >
          Add
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={2} mr={4} gap={2}>
        <Button variant="outlined" color="primary" onClick={handlePrintWindow}>
          Print / Save PDF
        </Button>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 2 }}
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

        {selectPOCode && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            size="small"
          >
            Delete Purchase Order
          </Button>
        )}
      </Box>

      {/* Master Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "steelblue", height: 50 }}>
            <TableRow>
              <TableCell />
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
                  onClick={() => handleRowClick(poCode)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Radio
                      checked={selectPOCode === poCode}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(poCode);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectPOCode(poCode);
                        navigate("/purchase-order/edit", {
                          state: { currentItemID: poCode },
                        });
                      }}
                      variant="outlined"
                    >
                      Edit
                    </Button>
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
  );
};

export default ViewPurchaseOrder;
