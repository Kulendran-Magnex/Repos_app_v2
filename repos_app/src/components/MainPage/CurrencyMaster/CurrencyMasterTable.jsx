import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchCurrencyMaster, deleteCurrencyMaster } from "../../API/api";

const CurrencyMasterTable = ({ onEdit }) => {
  const [currencyMaster, setCurrencyMaster] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCurrencyMaster();
        setCurrencyMaster(data);
      } catch (error) {
        console.error("Error fetching currency master:", error);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCurrencyMaster(id);
      setCurrencyMaster((prevData) =>
        prevData.filter((item) => item.Currency_Code !== id)
      );
    } catch (error) {
      console.error("Error deleting currency master:", error);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        margin: 2,
        minWidth: 800, // Set a minimum width for the table
        maxWidth: "90%",
        maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
        overflowY: "auto", // Enable vertical scrolling if content exceeds max height
        overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "steelblue" }}>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Currency Name</TableCell>
            <TableCell sx={{ color: "white" }}>Currency Rate</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(currencyMaster) && currencyMaster.length > 0 ? (
            currencyMaster.map((row) => (
              <TableRow key={row.Currency_Code}>
                <TableCell>{row.Currency_Name}</TableCell>
                <TableCell>{row.Currency_Rate}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(row.Currency_Code)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3}>No data available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CurrencyMasterTable;
