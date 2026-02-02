import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Button,
  Chip
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

const InvoiceList = () => {
  /* =======================
     STATE
  ======================== */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =======================
     FETCH INVOICES
  ======================== */
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/api/invoices", {
        params: {
          location_id: location || null,
          from_date: fromDate || null,
          to_date: toDate || null,
        },
      });

      // DataGrid requires unique `id`
      const formatted = res.data.map((row, index) => ({
        id: index + 1,
        ...row,
      }));

      setRows(formatted);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     LOAD ON PAGE LOAD
  ======================== */
  useEffect(() => {
    fetchInvoices();
  }, []);

  /* =======================
     TABLE COLUMNS
  ======================== */
  const columns = [
    {
      field: "invoice_date",
      headerName: "Invoice Date",
      width: 130,
      valueFormatter: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString()
          : "",
    },
    {
      field: "invoice_number",
      headerName: "Invoice No",
      width: 160,
    },
    {
      field: "po_order",
      headerName: "PO No",
      width: 140,
    },
    {
      field: "customer_name",
      headerName: "Customer",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "invoice_status",
      headerName: "Status",
      width: 120,
      renderCell: (params) =>
        params.value === 1 ? (
          <Chip label="Posted" color="success" size="small" />
        ) : (
          <Chip label="Draft" color="warning" size="small" />
        ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      type: "number",
      valueFormatter: (params) =>
        Number(params.value || 0).toFixed(2),
    },
    {
      field: "location_id",
      headerName: "Location",
      width: 120,
    },
  ];

  /* =======================
     RENDER
  ======================== */
  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Invoice List
      </Typography>

      {/* =======================
          FILTER SECTION
      ======================== */}
      <Box
        display="flex"
        gap={2}
        mb={2}
        flexWrap="wrap"
        alignItems="center"
      >
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />

        <TextField
          label="Location"
          select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          size="small"
          style={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="LOC01">LOC01</MenuItem>
          <MenuItem value="LOC02">LOC02</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={fetchInvoices}
          disabled={loading}
        >
          Search
        </Button>
      </Box>

      {/* =======================
          DATA GRID
      ======================== */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export default InvoiceList;
