import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const InvoicePreview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const invoiceNumber = location.state?.invoice_number;

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/invoices/${id}`);
        setInvoice(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to load invoice details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/invoices/${id}/pdf`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const handleRecordPayment = async () => {
    try {
      const amount = Number(paymentAmount);
      if (amount <= 0) {
        alert("Please enter a valid payment amount");
        return;
      }
      // TODO: Replace with actual payment API endpoint
      await axios.post(`http://localhost:5000/api/invoices/${id}/payment`, {
        payment_amount: amount,
      });
      alert("Payment recorded successfully");
      setOpenPaymentDialog(false);
      setPaymentAmount("");
      // Refresh invoice data
      const res = await axios.get(`http://localhost:5000/api/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Failed to record payment", err);
      alert("Failed to record payment");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box p={2}>
        <Typography variant="h6" color="error">
          Invoice not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/invoices")}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  const items = invoice.items || [];
  // ensure numeric calculations (items may contain string values)
  const subTotal = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const taxAmount = Number(invoice.tax_amount) || 0;
  const total = subTotal + taxAmount;
  const paymentMade = Number(invoice.paid_amount) || 0;
  const balanceDue = total - paymentMade;

  // Check if payment is overdue
  const isOverdue =
    invoice.due_date &&
    new Date(invoice.due_date) < new Date() &&
    balanceDue > 0 &&
    invoice.INV_Posted === 0;

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Box p={2}>
      {/* Action toolbar (outside invoice) */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/invoices")}
          >
            Back to Invoices
          </Button>
          {invoice?.INV_Posted !== 1 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() =>
                navigate("/invoice/edit", {
                  state: { invoice_id: invoiceNumber },
                })
              }
            >
              Edit Invoice
            </Button>
          )}
          <Button variant="outlined" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button variant="outlined">Print</Button>
          <Button variant="outlined">Send Email</Button>
        </Box>
      </Box>

      {/* Payment Status Banner */}
      {invoice?.INV_Posted !== 1 && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              variant="contained"
              onClick={() => setOpenPaymentDialog(true)}
              sx={{
                backgroundColor: "#2196F3",
                color: "white",
                position: "relative",
                right: 50,
                top: 12,
              }}
            >
              Record Payment
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>Payment is pending</AlertTitle>
          <Typography variant="body2">
            Payment is pending. Send a payment reminder or record payment.{" "}
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", position: "relative" }}>
        {/* Overdue Ribbon */}
        {isOverdue && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 150,
              height: 150,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: -35,
                width: 200,
                backgroundColor: "#FF9800",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "0.75rem",
                padding: "5px 40px",
                transform: "rotate(-45deg)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              OVERDUE
            </Box>
          </Box>
        )}
        {/* Header */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {invoice.company_name || "Company Name"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.company_location || "Location"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.company_country || "Country"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.company_email || "email@company.com"}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mb={1}
            >
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                INVOICE
              </Typography>
              <Chip
                label={invoice.INV_Posted === 1 ? "Paid" : "Draft"}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  backgroundColor:
                    invoice.INV_Posted === 1 ? "#4caf50" : "#000000",
                  color: "#ffffff",
                }}
              />
            </Box>
            <Typography variant="h6" color="textSecondary">
              # {invoiceNumber || invoice.invoice_number}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Balance Due
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {(invoice.currency || "LKR") + " " + fmt(balanceDue)}
            </Typography>
          </Grid>
        </Grid>

        {/* Invoice Details */}
        <Grid container spacing={4} mb={4}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
              Bill To
            </Typography>
            <Typography variant="body2">{invoice.customer_name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.customer_address}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Box display="flex" gap={2} alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Invoice Date:
                </Typography>
                <Typography variant="body2">
                  {invoice.invoice_date
                    ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
                    : ""}
                </Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Terms:
                </Typography>
                <Typography variant="body2">
                  {invoice.payment_terms || "Due on Receipt"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Items Table */}
        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#333" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  #
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Item & Description
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Qty
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Rate
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {item.product_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.quantity || 0).toFixed(2)} {item.unit}
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.rate || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.amount || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Grid container spacing={2} mb={3} justifyContent="flex-end">
          <Grid item xs={6} sm={4}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Sub Total</Typography>
              <Typography variant="body2">{fmt(subTotal)}</Typography>
            </Box>
            {invoice.tax_amount > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Tax</Typography>
                <Typography variant="body2">
                  {fmt(invoice.tax_amount)}
                </Typography>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              mb={1}
              sx={{ borderTop: "2px solid #333", pt: 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {(invoice.currency || "LKR") + " " + fmt(total)}
              </Typography>
            </Box>
            {paymentMade > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Payment Made</Typography>
                <Typography variant="body2" sx={{ color: "red" }}>
                  ({fmt(paymentMade)})
                </Typography>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{
                backgroundColor: "#f0f0f0",
                p: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Balance Due
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {(invoice.currency || "LKR") + " " + fmt(balanceDue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Notes */}
        {invoice.notes && (
          <Box mt={4} pt={2} sx={{ borderTop: "1px solid #ddd" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
              Notes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.notes}
            </Typography>
          </Box>
        )}

        {/* (Action toolbar moved to top outside the invoice) */}
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Invoice Amount: <strong>{fmt(total)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Balance Due: <strong>{fmt(balanceDue)}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
            color="success"
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicePreview;
