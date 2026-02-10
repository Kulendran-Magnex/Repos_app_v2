import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DataGrid } from "@mui/x-data-grid";
import { fetchLocationMaster } from "../../API/api";

const InvoiceList = () => {
  const navigate = useNavigate();

  /* =======================
     STATE
  ======================== */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  /* =======================
     FETCH INVOICES
  ======================== */
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/invoices", {
        params: {
          location_id: location || null,
          from_date: fromDate || null,
          to_date: toDate || null,
        },
      });

      // DataGrid requires unique `id`
      let formatted = res.data.map((row, index) => ({
        id: index + 1,
        ...row,
      }));

      // Filter by invoice number if search term provided
      if (invoiceNumber.trim()) {
        formatted = formatted.filter((row) =>
          row.invoice_number
            ?.toLowerCase()
            .includes(invoiceNumber.toLowerCase()),
        );
      }

      console.log(formatted);
      setRows(formatted);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("Location:", locationList);
  /* =======================
     LOAD ON PAGE LOAD
  ======================== */
  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const data = await fetchLocationMaster();

        setLocationList(data);
      } catch (error) {
        console.error("Error fetching Location Master:", error);
      }
    };

    loadLocationData();
  }, []);

  /* =======================
     TABLE COLUMNS
  ======================== */
  const columns = [
    {
      field: "invoice_date",
      headerName: "Invoice Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return "";
        try {
          const date = new Date(params.value);
          if (isNaN(date.getTime())) return "";
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return "";
        }
      },
    },
    {
      field: "invoice_number",
      headerName: "Invoice No",
      width: 200,
      renderCell: (params) => (
        <span
          onClick={() =>
            navigate(`/invoice/preview/${params.value}`, {
              state: { invoice_number: params.value },
            })
          }
          style={{
            color: "#1976d2",
            cursor: "pointer",
          }}
        >
          {params.value}
        </span>
      ),
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
      minWidth: 100,
      maxWidth: 500,
    },

    {
      field: "amount",
      headerName: "Amount",
      width: 180,
      renderCell: (params) =>
        Number(params.value || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      field: "location_id",
      headerName: "Location",
      width: 150,
      renderCell: (params) => {
        const code = params.value;
        if (!code) return "";
        const loc = locationList.find(
          (l) => String(l.Location_ID) === String(code),
        );
        return loc ? loc.Location_Name : code;
      },
    },
    {
      field: "INV_Posted",
      headerName: "Status",
      width: 180,
      renderCell: (params) =>
        params.value === 1 ? (
          <Chip label="Paid" color="success" size="small" />
        ) : (
          <Chip label="Draft" color="warning" size="small" />
        ),
    },
  ];

  /* =======================
     RENDER
  ======================== */
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        padding={1}
        margin={4}
        sx={{ backgroundColor: "whitesmoke" }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5">All Invoices</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate("/invoice/create")}
            sx={{ mr: 1 }}
          >
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Box>
        <Button variant="outlined" color="primary">
          Print / Save PDF
        </Button>
      </Box>
      <Box p={1}>
        {/* =======================
          FILTER SECTION
      ======================== */}
        <Box
          display="flex"
          gap={2}
          mb={2}
          ml={3}
          flexWrap="wrap"
          alignItems="center"
        >
          <TextField
            label="Invoice Number"
            type="text"
            placeholder="Search invoice..."
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          />

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
            sx={{ minWidth: 140 }}
          >
            {locationList.map((i) => (
              <MenuItem key={i.Location_ID} value={i.Location_ID}>
                {i.Location_Name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={fetchInvoices}
            disabled={loading}
          >
            Search
          </Button>

          {invoiceNumber && (
            <Button
              variant="outlined"
              onClick={() => {
                setInvoiceNumber("");
                setRows([]);
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* =======================
          DATA GRID
      ======================== */}
        <Box display="flex" justifyContent="center">
          <Box
            sx={{ width: "100%", maxWidth: 1500, marginTop: 2, marginLeft: 1 }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              autoHeight
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeadersInner": {
                  backgroundColor: "#1976d2",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default InvoiceList;
