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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const InvoicePreview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

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
        { responseType: "blob" }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = Number(invoice.tax_amount) || 0;
  const total = subTotal + taxAmount;
  const paymentMade = Number(invoice.payment_made) || 0;
  const balanceDue = total - paymentMade;

  const fmt = (n) => Number(n || 0).toLocaleString("en-US", {
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
          <Button variant="outlined" color="primary" onClick={()=> navigate(`/invoice/edit`)}>Edit</Button>
          <Button variant="outlined" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button variant="outlined">Print</Button>
          <Button variant="outlined">Send Email</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
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
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              INVOICE
            </Typography>
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
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Invoice Date:</Typography>
                <Typography variant="body2">
                  {invoice.invoice_date
                    ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
                    : ""}
                </Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Terms:</Typography>
                <Typography variant="body2">{invoice.payment_terms || "Due on Receipt"}</Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Due Date:</Typography>
                <Typography variant="body2">
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString("en-GB")
                    : ""}
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
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Item & Description
                </TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                  Rate
                </TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
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
                <Typography variant="body2">{fmt(invoice.tax_amount)}</Typography>
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
    </Box>
  );
};

export default InvoicePreview;
