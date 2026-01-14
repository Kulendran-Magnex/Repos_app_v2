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
import { fetchPackingMaster, deletePackingMaster } from "../../API/api";

const PackingMasterTable = ({ onEdit }) => {
  const [packingMaster, setPackingMaster] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPackingMaster();
        setPackingMaster(data);
      } catch (error) {
        console.error("Error fetching packing master:", error);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletePackingMaster(id);
      setPackingMaster((prevData) =>
        prevData.filter((item) => item.Pack_ID !== id)
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
        maxWidth: "97%",
        minWidth: 500, // Set a minimum width for the table
        maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
        overflowY: "auto", // Enable vertical scrolling if content exceeds max height
        overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
      }}
    >
      <Table aria-label="a dense table">
        <TableHead sx={{ backgroundColor: "steelblue" }}>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Pack ID</TableCell>
            <TableCell sx={{ color: "white" }}>Pack Description</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(packingMaster) && packingMaster.length > 0 ? (
            packingMaster.map((row) => (
              <TableRow key={row.Pack_ID}>
                <TableCell>{row.Pack_ID}</TableCell>
                <TableCell>{row.Pack_description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.Pack_ID)}>
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

export default PackingMasterTable;
