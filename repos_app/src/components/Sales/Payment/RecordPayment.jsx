import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";

const RecordPayment = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const [paymentData, setPaymentData] = useState({
    Payment_Date: today,
    Location: "",
    Amount_Received: "",
    Bank_Charges: "",
    Payment_Mode: "Cash",
    Deposit_To: "",
    Reference: "",
  });

  const [invoicePayments, setInvoicePayments] = useState({});

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/customers");
        setCustomers(res.data || []);
      } catch (err) {
        console.error("Failed to load customers", err);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/locations");
        setLocations(res.data || []);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };

    fetchLocations();
  }, []);

  // Fetch unpaid invoices for selected customer
  useEffect(() => {
    if (selectedCustomer?.customer_id) {
      fetchUnpaidInvoices(selectedCustomer.customer_id);
    }
  }, [selectedCustomer]);

  const fetchUnpaidInvoices = async (customerId) => {
    try {
      setInvoicesLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/invoices/unpaid/${customerId}`,
      );

      const unpaid = (res.data || []).filter((invoice) => {
        const total = Number(invoice.total_amount) || 0;
        const paid = Number(invoice.payment_made) || 0;
        return total > paid;
      });

      setUnpaidInvoices(unpaid);

      // Initialize payment amounts
      const payments = {};
      unpaid.forEach((invoice) => {
        const balance =
          (Number(invoice.total_amount) || 0) -
          (Number(invoice.payment_made) || 0);
        payments[invoice.invoice_id] = balance.toFixed(2);
      });
      setInvoicePayments(payments);
    } catch (err) {
      console.error("Failed to load unpaid invoices", err);
      toast.error("Failed to load invoices");
      setUnpaidInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handlePaymentDataChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInvoicePaymentChange = (invoiceId, value) => {
    setInvoicePayments((prev) => ({
      ...prev,
      [invoiceId]: value,
    }));
  };

  const handleRecordPayment = async () => {
    try {
      if (!selectedCustomer) {
        toast.error("Please select a customer");
        return;
      }

      if (!paymentData.Payment_Date || !paymentData.Location) {
        toast.error("Please fill in Payment Date and Location");
        return;
      }

      const hasPayments = Object.values(invoicePayments).some(
        (amount) => Number(amount) > 0,
      );

      if (!hasPayments) {
        toast.error("Please enter payment amount for at least one invoice");
        return;
      }

      // Filter invoices with payments
      const paymentsToRecord = Object.entries(invoicePayments)
        .filter(([_, amount]) => Number(amount) > 0)
        .map(([invoiceId, amount]) => ({
          invoice_id: invoiceId,
          payment_amount: Number(amount),
        }));

      const payload = {
        customer_id: selectedCustomer.customer_id,
        payment_date: paymentData.Payment_Date,
        location: paymentData.Location,
        amount_received: Number(paymentData.Amount_Received) || 0,
        bank_charges: Number(paymentData.Bank_Charges) || 0,
        payment_mode: paymentData.Payment_Mode,
        deposit_to: paymentData.Deposit_To,
        reference: paymentData.Reference,
        payments: paymentsToRecord,
      };

      const res = await axios.post(
        "http://localhost:5000/api/payments/record",
        payload,
      );

      toast.success("Payment recorded successfully");

      // Refresh invoices
      await fetchUnpaidInvoices(selectedCustomer.customer_id);

      // Reset payment data
      setPaymentData({
        Payment_Date: today,
        Location: "",
        Amount_Received: "",
        Bank_Charges: "",
        Payment_Mode: "Cash",
        Deposit_To: "",
        Reference: "",
      });
    } catch (err) {
      console.error("Failed to record payment", err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <>
      <Toaster reverseOrder={false} />
      <PageHeader
        title="Record Payment"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sales", href: "#" },
          { label: "Record Payment", active: true },
        ]}
      />

      <Box p={2}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/invoices")}
          sx={{ mb: 2 }}
        >
          Back to Invoices
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Payment Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 2,
            }}
          >
            {/* Customer Selection */}
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.customer_name || ""}
              onChange={(event, newValue) => {
                setSelectedCustomer(newValue);
              }}
              value={selectedCustomer}
              loading={loading}
              renderInput={(params) => (
                <TextField {...params} label="Customer Name" required />
              )}
            />

            {/* Location */}
            <FormControl>
              <InputLabel>Location</InputLabel>
              <Select
                name="Location"
                value={paymentData.Location}
                onChange={handlePaymentDataChange}
                label="Location"
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.location_id} value={loc.location_id}>
                    {loc.location_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Amount Received */}
            <TextField
              label="Amount Received"
              name="Amount_Received"
              type="number"
              value={paymentData.Amount_Received}
              onChange={handlePaymentDataChange}
              inputProps={{ step: "0.01", min: "0" }}
            />

            {/* Bank Charges */}
            <TextField
              label="Bank Charges (if any)"
              name="Bank_Charges"
              type="number"
              value={paymentData.Bank_Charges}
              onChange={handlePaymentDataChange}
              inputProps={{ step: "0.01", min: "0" }}
            />

            {/* Payment Date */}
            <TextField
              label="Payment Date"
              name="Payment_Date"
              type="date"
              value={paymentData.Payment_Date}
              onChange={handlePaymentDataChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Payment Mode */}
            <FormControl>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="Payment_Mode"
                value={paymentData.Payment_Mode}
                onChange={handlePaymentDataChange}
                label="Payment Mode"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
            </FormControl>

            {/* Deposit To */}
            <TextField
              label="Deposit To"
              name="Deposit_To"
              value={paymentData.Deposit_To}
              onChange={handlePaymentDataChange}
            />

            {/* Reference */}
            <TextField
              label="Reference #"
              name="Reference"
              value={paymentData.Reference}
              onChange={handlePaymentDataChange}
            />
          </Box>
        </Paper>

        {/* Unpaid Invoices Table */}
        {selectedCustomer && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Unpaid Invoices
            </Typography>

            {invoicesLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : unpaidInvoices.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                No unpaid invoices found for this customer
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Invoice #
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Location
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Invoice Amount
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Amount Due
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Payment Received On
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Payment Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unpaidInvoices.map((invoice) => {
                      const total = Number(invoice.total_amount) || 0;
                      const paid = Number(invoice.payment_made) || 0;
                      const due = total - paid;

                      return (
                        <TableRow key={invoice.invoice_id}>
                          <TableCell>
                            {invoice.invoice_date
                              ? new Date(
                                  invoice.invoice_date,
                                ).toLocaleDateString("en-GB")
                              : ""}
                          </TableCell>
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.location_name}</TableCell>
                          <TableCell align="right">{fmt(total)}</TableCell>
                          <TableCell align="right">{fmt(due)}</TableCell>
                          <TableCell align="center">
                            <TextField
                              type="date"
                              size="small"
                              defaultValue={today}
                              inputProps={{ readOnly: true }}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={invoicePayments[invoice.invoice_id] || ""}
                              onChange={(e) =>
                                handleInvoicePaymentChange(
                                  invoice.invoice_id,
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                step: "0.01",
                                min: "0",
                                max: due.toFixed(2),
                              }}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Total Summary */}
            {unpaidInvoices.length > 0 && (
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                  Total Payment:{" "}
                  {fmt(
                    Object.values(invoicePayments).reduce(
                      (sum, amount) => sum + Number(amount || 0),
                      0,
                    ),
                  )}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Action Buttons */}
        {selectedCustomer && unpaidInvoices.length > 0 && (
          <Box display="flex" gap={2} sx={{ mt: 3, justifyContent: "center" }}>
            <Button variant="outlined" onClick={() => navigate("/invoices")}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleRecordPayment}
            >
              Save as Paid
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default RecordPayment;
