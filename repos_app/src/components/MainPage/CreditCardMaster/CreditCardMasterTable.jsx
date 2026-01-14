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
import { fetchCreditCardMaster, deleteCreditCardMaster } from "../../API/api";

const CreditCardMasterTable = ({ onEdit }) => {
  const [ccMaster, setCCMaster] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCreditCardMaster();
        setCCMaster(data);
      } catch (error) {
        console.error("Error fetching credit card master:", error);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCreditCardMaster(id);
      console.log("entered!");
      setCCMaster((prevData) => prevData.filter((item) => item.CC_Code !== id));
    } catch (error) {
      console.error("Error deleting credit card master:", error);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        margin: 2,
        minWidth: 500, // Set a minimum width for the table
        maxWidth: "90%",
        maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
        overflowY: "auto", // Enable vertical scrolling if content exceeds max height
        overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "steelblue" }}>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Credit Card Name</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(ccMaster) && ccMaster.length > 0 ? (
            ccMaster.map((row) => (
              <TableRow key={row.Brand_Code}>
                <TableCell>{row.CC_Name}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(row.CC_Code)}
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

export default CreditCardMasterTable;
