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
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchTaxMaster, deleteTaxMaster } from "../../../API/api";

const TaxMasterTable = ({ onEdit }) => {
  const [taxMaster, setTaxMaster] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTaxMaster();
        setTaxMaster(data);
      } catch (error) {
        console.error("Error fetching Tax master:", error);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTaxMaster(id);
      setTaxMaster((prevData) =>
        prevData.filter((item) => item.Tax_Code !== id)
      );
    } catch (error) {
      console.error("Error deleting Tax master:", error);
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          margin: 2,
          minWidth: 500, // Set a minimum width for the table
          maxWidth: "100%",
          maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
          overflowY: "auto", // Enable vertical scrolling if content exceeds max height
          overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "steelblue" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Tax Code</TableCell>
              <TableCell sx={{ color: "white" }}>Tax Name</TableCell>
              <TableCell sx={{ color: "white" }}>Tax Rate</TableCell>
              <TableCell sx={{ color: "white" }}>Formula</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(taxMaster) && taxMaster.length > 0 ? (
              taxMaster.map((row) => (
                <TableRow key={row.Tax_Code}>
                  <TableCell>{row.Tax_Code}</TableCell>
                  <TableCell>{row.Tax_Name}</TableCell>
                  <TableCell>{row.Tax_Rate}</TableCell>
                  <TableCell>{row.Formula}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => onEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row.Tax_Code)}
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
    </>
  );
};

export default TaxMasterTable;
