import { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Paper, Grid } from "@mui/material";
import { createCustomer } from "../../API/api";;

export default function CustomerForm() {



  const [form, setForm] = useState({
    customer_code: "",
    customer_name:  "",
    phone_no: "",
    email:  "",
    address: "",
    credit_limit:  0,
    current_balance: 0,
    customer_type:  "",
    is_active: true
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmt = () => {
    console.log("date:", form);

    try{
            const response = createCustomer(form);
            console.log("Customer created:", response);

    }catch(err){
      console.error("Error creating customer:", err);
    }
  }

  return (
    <>
    

      <Box sx={{ height: '100%',display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0 }}>
        <Paper sx={{ width: '100%', maxWidth: 700, p: 1 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Add New Customer
          </Typography>

          <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Customer Name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone No"
                  name="phone_no"
                  value={form.phone_no}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

  <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    name="customer_type"
                    value={form.customer_type}
                    label="Customer Type"
                    onChange={handleChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250,
                          overflow: "auto",
                        },
                      },
                    }}
                  >
                    <MenuItem value="CR">Credit</MenuItem>
                    <MenuItem value="CU">Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
       

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Current Balance"
                  name="current_balance"
                  value={form.current_balance}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                />
              </Grid>
                     <Grid item xs={12} sm={6}>
                <TextField
                  label="Credit Limit"
                  name="credit_limit"
                  value={form.credit_limit}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                />
              </Grid>

            
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" sx={{ mr: 1 }}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleSubmt}>
                Add
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
