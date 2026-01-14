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
import toast, { Toaster } from "react-hot-toast";
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

const ViewMaterialRequest = () => {
  const [data, setData] = useState([]);
  const [selectedMRCode, setSelectedMRCode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/MR_Header")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching MR data:", err);
        setLoading(false);
      });
  }, []);

  // Fetch line items when MR Code is selected
  useEffect(() => {
    if (!selectedMRCode) {
      setSelectedItems([]);
      return;
    }

    axios
      .get(`http://localhost:5000/api/mr_Tran/${selectedMRCode}`)
      .then((res) => {
        setSelectedItems(res.data);
      })
      .catch((err) => {
        console.error("Error fetching MR line items:", err);
        setSelectedItems([]);
      });
  }, [selectedMRCode]);

  const groupedData = groupByMRCode(data);

  const filteredMRList = Object.entries(groupedData).filter(([code, group]) => {
    const matchesCode =
      searchCode === "" ||
      code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesDate =
      searchDate === "" ||
      (group.MR_Date &&
        dayjs(group.MR_Date).format("YYYY-MM-DD") === searchDate);
    return matchesCode && matchesDate;
  });

  const handleRowClick = (mrCode) => {
    setSelectedMRCode((prev) => (prev === mrCode ? null : mrCode));
  };

  const handleDelete = () => {
    if (!selectedMRCode) return;

    if (
      !window.confirm(`Are you sure you want to delete MR ${selectedMRCode}?`)
    ) {
      return;
    }

    axios
      .delete(`http://localhost:5000/api/mr_Tran/${selectedMRCode}`)
      .then(() => {
        setData((prevData) =>
          prevData.filter((item) => item.MR_Code !== selectedMRCode)
        );
        setSelectedMRCode(null);
        setSelectedItems([]);
        toast.success("Material Request Deleted");
      })
      .catch((err) => {
        console.error("Error deleting MR:", err);
        toast.error("Failed to delete the selected MR.");
      });
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
        <Typography variant="h6">Material Requests</Typography>
        <Button
          variant="contained"
          sx={{ marginLeft: 2 }}
          onClick={() => navigate("/material-request/add")}
        >
          Add
        </Button>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 2 }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Search MR Code"
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

        {selectedMRCode && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            size="small"
          >
            Delete Material Request
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
                <strong>MR Code</strong>
              </TableCell>
              <TableCell>
                <strong>MR Date</strong>
              </TableCell>
              <TableCell>
                <strong>Location ID</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMRList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredMRList.map(([mrCode, group]) => (
                <TableRow
                  key={mrCode}
                  hover
                  selected={selectedMRCode === mrCode}
                  onClick={() => handleRowClick(mrCode)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Radio
                      checked={selectedMRCode === mrCode}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent row click
                        handleRowClick(mrCode);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMRCode(mrCode);
                        navigate("/material-request/edit", {
                          state: { currentItemID: mrCode },
                        });
                      }}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell>{mrCode}</TableCell>
                  <TableCell>
                    {group.MR_Date
                      ? dayjs(group.MR_Date).format("YYYY-MM-DD")
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
        MR Line Items
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "steelblue", height: 50 }}>
            <TableRow>
              <TableCell>
                <strong>Product ID</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>UOM</strong>
              </TableCell>
              <TableCell>
                <strong>QTY</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <TableRow key={item.MR_Line_No}>
                  <TableCell>{item.Product_ID}</TableCell>
                  <TableCell>{item.Description}</TableCell>
                  <TableCell>{item.Product_UM}</TableCell>
                  <TableCell>{item.MR_Qty}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {selectedMRCode
                    ? "No line items found"
                    : "Select an MR to view details"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewMaterialRequest;
