import { useState } from "react";


import CustomerForm from "./CustomerForm"
import CustomerList from "./CustomerList"
import {
  Box,
  useMediaQuery,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";





export default function CustomerPage() {

      const [refreshData, setRefreshData] = useState(false);

        const handleFormSubmit = () => {
    setRefreshData((prev) => !prev); // Refresh the table after adding data
  };



  const isMobile = useMediaQuery("(max-width:700px)");
    return(
        <>
        <Box sx={{ minHeight: "90vh", backgroundColor: "whitesmoke" }}>
      <Typography marginLeft={5} paddingTop={3} fontSize={25}>
       Customer Master
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row", // Stack vertically on mobile, horizontally on larger screens
          gap: 3,
          margin: 5,
          justifyContent: "space-between",
        }}
      >
        {/* Mobile version - Add button */}
        {isMobile && (
          <Box sx={{ marginTop: 2, maxWidth: 200 }}>
            <Button
              variant="contained"
              color="primary"
            
              fullWidth
            >
              Add New
            </Button>
          </Box>
        )}

        {/* Only show the form on larger screens */}
        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              padding: 3,
              height: 600,
              minWidth: 250,
              maxWidth: 500,
              backgroundColor: "white",
            }}
          >
            <CustomerForm onFormSubmit={handleFormSubmit}  />
          </Box>
        )}

        {/* Table */}
        <Box sx={{ flex: 1.4, overflowX: "auto", backgroundColor: "white" }}>
          <CustomerList  key={refreshData} />
        </Box>
      </Box>
      </Box>
        
        </>
    )
}