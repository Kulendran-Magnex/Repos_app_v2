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
import { fetchBrandMaster, deleteBrandMaster } from "../../API/api";

const BrandMasterTable = ({ onEdit }) => {
  const [brandMaster, setBrandMaster] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBrandMaster();
        setBrandMaster(data);
      } catch (error) {
        console.error("Error fetching brand master:", error);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteBrandMaster(id);
      setBrandMaster((prevData) =>
        prevData.filter((item) => item.Brand_Code !== id)
      );
    } catch (error) {
      console.error("Error deleting packing master:", error);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        margin: 2,
        minWidth: 500, // Set a minimum width for the table
        maxWidth: "97%",
        maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
        overflowY: "auto", // Enable vertical scrolling if content exceeds max height
        overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "steelblue" }}>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Brand Code</TableCell>
            <TableCell sx={{ color: "white" }}>Brand Name</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(brandMaster) && brandMaster.length > 0 ? (
            brandMaster.map((row) => (
              <TableRow key={row.Brand_Code}>
                <TableCell>{row.Brand_Code}</TableCell>
                <TableCell>{row.Brand_Name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.Brand_Code)}>
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

export default BrandMasterTable;
