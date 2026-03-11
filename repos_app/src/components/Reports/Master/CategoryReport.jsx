import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../../API/axios";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { parseJwt } from "../../../utils/clientDetailsHelper";

export default function CategoryReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // default both dates to today (selectors only)
  const todayStr = dayjs().format("YYYY-MM-DD");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [filtered, setFiltered] = useState(false); // whether user has applied date filter

  const token = localStorage.getItem("token");
  const clientName = token ? parseJwt(token)?.client_name : null;

  // Fetch data, optionally with date range if filtered=true
  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError("");
      let url = "http://localhost:5000/api/categorylvl1";

      const res = await api.get(url);
      //   setData(res.data || []);
      console.log("Fetched data:", res.data);
    } catch (err) {
      console.error("CategoryReport fetch error", err);
      setError("Unable to load category report");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount (all dates)
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setFiltered(true);
    fetchData(fromDate, toDate);
  };

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const currency = "LKR";

  // calculate date range from input
  const startDateDisplay = fromDate
    ? dayjs(fromDate).format("DD MMM YYYY")
    : "";
  const endDateDisplay = toDate ? dayjs(toDate).format("DD MMM YYYY") : "";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "left",
          m: 3,
          ml: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
          size="small"
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          size="small"
        >
          Search
        </Button>
        <Button variant="contained" disabled={loading} size="small">
          Print
        </Button>
      </Box>

      <Paper elevation={3} sx={{ margin: 2, height: "88vh" }}>
        <Box p={2}>
          {/* header section */}
          {/** show title and range when not loading */}
          <Box textAlign="center" mb={2}>
            <Typography variant="h6">{clientName}</Typography>
            <Typography variant="h5">Sales Summary</Typography>
          </Box>

          {!loading && !error && startDateDisplay && endDateDisplay && (
            <Typography variant="subtitle2" textAlign="center" sx={{ mb: 2 }}>
              From {startDateDisplay} To {endDateDisplay}
            </Typography>
          )}

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#1976d2" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Date
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Invoice Count
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Total Sales
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Total Sales with Tax
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Total Tax Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.INV_Date}>
                      <TableCell>
                        {dayjs(row.INV_Date).format("DD MMM YYYY")}
                      </TableCell>
                      <TableCell align="right">
                        {Number(row.count) || 0}
                      </TableCell>
                      <TableCell align="right">
                        {currency} {fmt(Number(row.sum) || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {currency} {fmt(Number(row.sum) || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {currency} {fmt(0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </>
  );
}
