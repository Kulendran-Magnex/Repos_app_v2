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
const SupplierMasterTable = ({ onEdit }) => {
  const [open, setOpen] = useState(false);
  const [supplierMaster, setSupplierMaster] = useState({
    SupplierCode: "",
    SupplierName: "",
    SupplierAddress: "",
    SupplierPhone: "",
    SupplierFax: "",
    SupplierEmail: "",
    SupplierContact: "",
    SupplierMobile: "",
    Supplier_P_Terms: "",
    Supplier_C_Date: "",
    Supplier_A_Code: "",
    CreditPeriod: "",
    Active: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSupplierMaster(); // Fetch data, which is an array of rows
        console.log(data); // Check the structure of the data
        if (data && Array.isArray(data)) {
          // Map each item in the data array to the frontend state structure
          const mappedData = data.map((supplier) => ({
            SupplierCode: supplier.Supplier_Code,
            SupplierName: supplier.Supplier_Name,
            SupplierAddress: supplier.Supplier_Address,
            SupplierPhone: supplier.Supplier_Phone,
            SupplierFax: supplier.Supplier_Fax,
            SupplierEmail: supplier.Supplier_Email,
            SupplierContact: supplier.Supplier_Contact,
            SupplierMobile: supplier.Supplier_Mobile,
            Supplier_P_Terms: supplier.Supplier_Payment_Terms,
            Supplier_C_Date: supplier.Supplier_Creation_Date, // Handle null as needed
            Supplier_A_Code: supplier.Supplier_Account_Code,
            CreditPeriod: supplier.Credit_Period,
            Active: supplier.Active === 1, // Convert backend 0/1 to boolean
          }));

          console.log(mappedData);
          // Set the state with the mapped data
          setSupplierMaster(mappedData);
        }
      } catch (error) {
        console.error("Error fetching Supplier Master:", error);
      }
    };

    loadData();
  }, []); // Empty dependency array to run once on mount

  const handleDelete = async (id) => {
    try {
      await deleteSupplierMaster(id);
      setSupplierMaster((prevData) =>
        prevData.filter((item) => item.SupplierCode !== id)
      );
    } catch (error) {
      console.error("Error deleting vendor master:", error);
    }
  };

  const handleOnClick = () => {
    navigate("/addSupplier");
  };

  const handleEdit = (supplier) => {
    console.log(supplier);
    navigate("/editSupplier", {
      state: { currentsupplier: supplier },
    });
  };

  return (
    <>
      <Box margin={2}>
        <Button variant="outlined" onClick={handleOnClick}>
          Add Supplier Master
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          margin: 2,
          minWidth: 500, // Set a minimum width for the table
          maxWidth: "97%",
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
              <TableCell sx={{ color: "white" }}>Supplier Name</TableCell>
              <TableCell sx={{ color: "white" }}>Supplier Address</TableCell>
              <TableCell sx={{ color: "white" }}>Supplier Phone</TableCell>
              <TableCell sx={{ color: "white" }}>Supplier Email</TableCell>
              <TableCell sx={{ color: "white" }}>Supplier Contact</TableCell>
              <TableCell sx={{ color: "white" }}>Supplier Mobile</TableCell>
              <TableCell sx={{ color: "white" }}>Creation Date</TableCell>
              <TableCell sx={{ color: "white" }}>Credit Limit</TableCell>
              <TableCell sx={{ color: "white" }}>Active</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(supplierMaster) && supplierMaster.length > 0 ? (
              supplierMaster.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.SupplierName}</TableCell>
                  <TableCell>{row.SupplierAddress}</TableCell>
                  <TableCell>{row.SupplierPhone}</TableCell>
                  <TableCell>{row.SupplierEmail}</TableCell>
                  <TableCell>{row.SupplierContact}</TableCell>
                  <TableCell>{row.SupplierMobile}</TableCell>
                  <TableCell>
                    {/* {new Date(row.Supplier_C_Date).toLocaleDateString()} */}
                    {row.Supplier_C_Date
                      ? new Date(row.Supplier_C_Date)
                          .toISOString()
                          .split("T")[0]
                      : " "}
                  </TableCell>
                  <TableCell>{row.CreditPeriod}</TableCell>
                  <TableCell> {row.Active ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.SupplierCode)}>
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

export default SupplierMasterTable;
