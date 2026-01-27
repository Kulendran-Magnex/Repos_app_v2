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
  Box,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchSupplierMaster, deleteSupplierMaster } from "../../API/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerList({ onSelect }) {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);

//   useEffect(() => {
//     axios.get("localhost:5000/api/customers").then(res => setRows(res.data));

//   }, []);

    useEffect(() => {
    axios
      .get("http://localhost:5000/api/customers")
      .then((res) => {
        setRows(res.data);
        console.log(res.data);
       
      })
      .catch((err) => {
        console.error("Error fetching GRN data:", err);
       
      });
  }, []);
  console.log(rows);
  return (
        <>
      <Box margin={2}>
        <Button variant="outlined" >
          Add Customer
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          margin: 2,
          minWidth: 500, // Set a minimum width for the table
          maxWidth: "85%",
          maxHeight: 700, // Optional: Set a max height for the table to enable vertical scrolling
          overflowY: "auto", // Enable vertical scrolling if content exceeds max height
          overflowX: "auto", // Enable horizontal scrolling if content exceeds minWidth
          "@media (max-width:600px)": {
            fontSize: "0.5rem", // Smaller font size for mobile
            padding: "5px", // Reduced padding on small screens
          },
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "steelblue" }}>
            <TableRow>
            
              <TableCell sx={{ color: "white" }}>Customer Name</TableCell>
              <TableCell sx={{ color: "white" }}>Phone No</TableCell>
              <TableCell sx={{ color: "white" }}>Email</TableCell>
              <TableCell sx={{ color: "white" }}>Type</TableCell>
              <TableCell sx={{ color: "white" }}>Address</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(rows) && rows.length > 0 ? (
              rows.map((row, index) => (
                <TableRow key={index}>
                 
                  <TableCell>{row.Customer_Name}</TableCell>
                  <TableCell>{row.Phone_No}</TableCell>
                  <TableCell>{row.Email}</TableCell>
                   <TableCell>{row.Customer_Type}</TableCell>
                   <TableCell>{row.Address}</TableCell>
                 
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
}
