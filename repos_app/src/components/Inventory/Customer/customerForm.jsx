import { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Typography } from "@mui/material";


export default function CustomerForm() {



  const [form, setForm] = useState({
    customer_code: "",
    customer_name:  "",
    phone_no: "",
    email:  "",
    address: "",
    credit_limit:  0,
    customer_type:  "",
    is_active: true
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
    <div className="form-grid">
      <input name="customer_code" value={form.customer_code} onChange={handleChange} placeholder="Customer Code" />
      <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Customer Name" />
      <input name="phone_no" value={form.phone_no} onChange={handleChange} placeholder="Phone No" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" />
      <input type="number" name="credit_limit" value={form.credit_limit} onChange={handleChange} />
      <select name="customer_type" value={form.customer_type} onChange={handleChange}>
        <option value="">-</option>
        <option value="CR">Credit</option>
        <option value="CS">Cash</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
        Active
      </label>

    
    </div>

    <form >
      <Typography variant="h6">Add New Packing Master</Typography>
      <TextField
        label="customer_name"
        value={form.customer_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="phone_no"
        value={form.phone_no}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
        <TextField
        label="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />

        <TextField
        label="address"
        value={form.address}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />

      <Button type="submit" variant="contained" color="primary">
        Add
      </Button>
    </form>
    </>
  );
}
