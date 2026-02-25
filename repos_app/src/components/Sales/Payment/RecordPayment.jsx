import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
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
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import { fetchLocationMaster } from "../../API/api";

// memoized row component to prevent re-renders when unrelated props change
const InvoiceRow = React.memo(
  ({
    invoice,
    due,
    paymentValue,
    onPaymentChange,
    fmt,
    getLocationName,
    today,
    onPayInFull,
    invoiceError,
  }) => {
    return (
      <TableRow key={invoice.invoice_id}>
        <TableCell>
          {invoice.invoice_date
            ? new Date(invoice.invoice_date).toLocaleDateString("en-GB")
            : ""}
        </TableCell>
        <TableCell>{invoice.invoice_number}</TableCell>
        <TableCell>{getLocationName(invoice.location_id)}</TableCell>
        <TableCell align="right">
          {fmt(Number(invoice.total_amount) || 0)}
        </TableCell>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <TextField
              type="number"
              size="small"
              value={paymentValue || ""}
              onChange={(e) =>
                onPaymentChange(invoice.invoice_number, e.target.value)
              }
              inputProps={{
                step: "0.01",
                min: "0",
                max: due.toFixed(2),
              }}
              sx={{ width: 120 }}
            />
            {invoiceError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {invoiceError}
              </Typography>
            )}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onPayInFull(invoice.invoice_number, due);
              }}
              sx={{ cursor: "pointer", textDecoration: "none" }}
            >
              Pay in Full
            </Link>
          </Box>
        </TableCell>
      </TableRow>
    );
  },
);

InvoiceRow.displayName = "InvoiceRow";

InvoiceRow.propTypes = {
  invoice: PropTypes.shape({
    invoice_id: PropTypes.number,
    invoice_date: PropTypes.string,
    invoice_number: PropTypes.string.isRequired,
    location_id: PropTypes.number,
    total_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  due: PropTypes.number.isRequired,
  paymentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPaymentChange: PropTypes.func.isRequired,
  fmt: PropTypes.func.isRequired,
  getLocationName: PropTypes.func.isRequired,
  today: PropTypes.string.isRequired,
  onPayInFull: PropTypes.func.isRequired,
  invoiceError: PropTypes.string,
};

InvoiceRow.displayName = "InvoiceRow";

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
    Paid_Amount: 0,
  });

  const [invoicePayments, setInvoicePayments] = useState({});
  const [invoiceErrors, setInvoiceErrors] = useState({});
  const [openAutoFillDialog, setOpenAutoFillDialog] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [lastAmountReceived, setLastAmountReceived] = useState("");
  const [amountError, setAmountError] = useState("");

  // memoized formatter and lookup functions to prevent new references each render

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/customers");
        console.log("Customers:", res.data);
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
        const res = await fetchLocationMaster();
        console.log("Locations:", res);
        setLocations(res || []);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };

    fetchLocations();
  }, []);

  // Fetch unpaid invoices for selected customer
  useEffect(() => {
    if (selectedCustomer?.Customer_Code) {
      setLastAmountReceived(""); // Reset tracking when customer changes
      fetchUnpaidInvoices(selectedCustomer.Customer_Code);
    }
  }, [selectedCustomer]);

  const fetchUnpaidInvoices = async (customerId) => {
    try {
      console.log("customerID", customerId);
      setInvoicesLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/invoices/unpaid/${customerId}`,
      );
      console.log("Unpaid Invoices:", res.data);
      const unpaid = (res.data || []).filter((invoice) => {
        const total = Number(invoice.total_amount) || 0;
        const paid = Number(invoice.paid_amount) || 0;
        return total > paid;
      });

      setUnpaidInvoices(unpaid);

      // Initialize payment amounts to zero (user will enter via Amount_Received or manually)
      const payments = {};
      unpaid.forEach((invoice) => {
        payments[invoice.invoice_number] = "0.00";
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

  console.log("unpaidInvoices", unpaidInvoices);

  const filteredInvoices = useMemo(() => {
    return paymentData.Location
      ? unpaidInvoices.filter((inv) => inv.location_id === paymentData.Location)
      : unpaidInvoices;
  }, [paymentData.Location, unpaidInvoices]);

  // total due across filtered invoices
  const totalDueAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => {
      const total = Number(invoice.total_amount) || 0;
      const paid = Number(invoice.paid_amount) || 0;
      const due = total - paid;
      return sum + (due > 0 ? due : 0);
    }, 0);
  }, [filteredInvoices]);

  const autoFillPayments = useCallback(
    (amountReceived) => {
      if (!amountReceived || Number(amountReceived) <= 0) {
        setInvoicePayments({});
        return;
      }

      let remainingAmount = Number(amountReceived);
      const newPayments = {};

      // Sort by due amount and distribute payment
      filteredInvoices.forEach((invoice) => {
        const total = Number(invoice.total_amount) || 0;
        const paid = Number(invoice.paid_amount) || 0;
        const due = total - paid;

        if (remainingAmount > 0 && due > 0) {
          const paymentAmount = Math.min(remainingAmount, due);
          newPayments[invoice.invoice_number] = paymentAmount.toFixed(2);
          remainingAmount -= paymentAmount;
        } else {
          newPayments[invoice.invoice_number] = "0.00";
        }
      });

      setInvoicePayments(newPayments);
    },
    [filteredInvoices],
  );

  const handlePaymentDataChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Validate Amount_Received: cannot exceed total due
      if (name === "Amount_Received") {
        const numeric = value === "" ? "" : Number(value);
        if (numeric !== "" && Number(numeric) > Number(totalDueAmount)) {
          const formatted = Number(totalDueAmount || 0).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          );
          setAmountError(
            `Amount Received cannot exceed total due (${formatted})`,
          );
          // cap the value to totalDueAmount
          setPaymentData((prev) => ({
            ...prev,
            [name]: totalDueAmount.toFixed(2),
          }));
          return;
        } else {
          setAmountError("");
        }
      }

      setPaymentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [totalDueAmount],
  );

  const handleAmountReceivedBlur = useCallback(() => {
    // Trigger dialog only when user finishes entering amount (on blur/pointer out)
    const amount = Number(paymentData.Amount_Received);
    if (amount > 0 && !lastAmountReceived && selectedCustomer) {
      setPendingAmount(amount);
      setOpenAutoFillDialog(true);
      setLastAmountReceived(paymentData.Amount_Received);
    }
  }, [paymentData.Amount_Received, lastAmountReceived, selectedCustomer]);

  const handleInvoicePaymentChange = useCallback(
    (invoiceId, value) => {
      const invoice = filteredInvoices.find(
        (inv) => inv.invoice_number === invoiceId,
      );
      const total = Number(invoice?.total_amount) || 0;
      const paid = Number(invoice?.paid_amount) || 0;
      const due = total - paid;

      const numeric = value === "" ? "" : Number(value);
      if (numeric !== "" && Number(numeric) > due) {
        // cap to due and set error
        setInvoicePayments((prev) => ({
          ...prev,
          [invoiceId]: due.toFixed(2),
        }));
        const formattedDue = Number(due || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setInvoiceErrors((prev) => ({
          ...prev,
          [invoiceId]: `Amount cannot exceed due (${formattedDue})`,
        }));
        return;
      }

      // clear error and set value
      setInvoiceErrors((prev) => ({ ...prev, [invoiceId]: "" }));
      setInvoicePayments((prev) => ({
        ...prev,
        [invoiceId]: value,
      }));
    },
    [filteredInvoices],
  );

  const handlePayInFull = useCallback((invoiceNumber, dueAmount) => {
    setInvoicePayments((prev) => ({
      ...prev,
      [invoiceNumber]: dueAmount.toFixed(2),
    }));
    setInvoiceErrors((prev) => ({ ...prev, [invoiceNumber]: "" }));
  }, []);

  // const handleRecordPayment = useCallback(async () => {
  //   try {
  //     if (!selectedCustomer) {
  //       toast.error("Please select a customer");
  //       return;
  //     }

  //     const hasPayments = Object.values(invoicePayments).some(
  //       (amount) => Number(amount) > 0,
  //     );

  //     if (!hasPayments) {
  //       toast.error("Please enter payment amount for at least one invoice");
  //       return;
  //     }

  //     console.log("Invoice Paymrnt", invoicePayments);

  //     const paymentsToRecord = filteredInvoices
  //       .filter(
  //         (invoice) => Number(invoicePayments[invoice.invoice_number]) > 0,
  //       )
  //       .flatMap((invoice) => ({
  //         // invoice-level fields added inside item
  //         invoice_number: invoice.invoice_number,
  //         currency: invoice.currency,
  //         customer_code: invoice.customer_code,
  //         customer_name: invoice.customer_name,
  //         invoice_date: invoice.invoice_date,
  //         invoice_status: invoice.invoice_status,
  //         location_id: invoice.location_id,
  //         paid_amount: invoice.paid_amount,
  //         po_date: invoice.po_date,
  //         po_order: invoice.po_order,
  //         invoice_tax_amount: invoice.tax_amount,
  //         total_amount: invoice.total_amount,
  //         payment_date: paymentData.Payment_Date,
  //         reference: paymentData.Reference,
  //         payment_mode: paymentData.Payment_Mode,

  //         // new payment
  //         payment_amount: Number(invoicePayments[invoice.invoice_number]),
  //       }));

  //     const payload = {
  //       paymentsToRecord,
  //       paymentData,
  //     };

  //     console.log("Payload:", payload);

  //     await axios.post("http://localhost:5000/api/recordPayment", payload);
  //     await axios.put("http://localhost:5000/api/recordPayment", payload);

  //     toast.success("Payment recorded successfully");

  //     // Refresh invoices
  //     await fetchUnpaidInvoices(selectedCustomer.Customer_Code);

  //     // // Reset payment data
  //     setPaymentData({
  //       Payment_Date: today,
  //       Location: "",
  //       Amount_Received: "",
  //       Bank_Charges: "",
  //       Payment_Mode: "Cash",
  //       Deposit_To: "",
  //       Reference: "",
  //     });

  //     setInvoicePayments({});
  //     setLastAmountReceived("");
  //     setSelectedCustomer(null);
  //   } catch (err) {
  //     console.error("Failed to record payment", err);
  //     toast.error(err.response?.data?.message || "Failed to record payment");
  //   }
  // }, [selectedCustomer, invoicePayments, today]);

  const handleRecordPayment = useCallback(async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    try {
      // 🔹 Build payments in ONE loop
      const paymentsToRecord = [];

      for (const invoice of filteredInvoices) {
        const amount = Number(invoicePayments[invoice.invoice_number]);

        if (amount > 0) {
          paymentsToRecord.push({
            invoice_number: invoice.invoice_number,
            payment_amount: amount,
            invoice_tax_amount: invoice.tax_amount,
            total_amount: invoice.total_amount,
            paid_amount: invoice.paid_amount,
            location_id: invoice.location_id,
          });
        }
      }

      if (paymentsToRecord.length === 0) {
        toast.error("Please enter payment amount for at least one invoice");
        return;
      }

      const payload = {
        customer_code: selectedCustomer.Customer_Code,
        customer_name: selectedCustomer.Customer_Name,
        payment_date: paymentData.Payment_Date,
        payment_mode: paymentData.Payment_Mode,
        reference: paymentData.Reference,
        location_id: paymentData.Location,

        paymentsToRecord,
      };

      console.log("Payload:", payload);

      // 🔹 Only ONE API call (backend should handle insert + update)
      await axios.post(
        "http://localhost:5000/api/ProcessRecordPayment",
        payload,
      );

      toast.success("Payment recorded successfully");

      await fetchUnpaidInvoices(selectedCustomer.Customer_Code);

      // 🔹 Reset states
      setPaymentData((prev) => ({
        ...prev,
        Payment_Date: today,
        Location: "",
        Amount_Received: "",
        Bank_Charges: "",
        Payment_Mode: "Cash",
        Deposit_To: "",
        Reference: "",
      }));

      setInvoicePayments({});
      setLastAmountReceived("");
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Failed to record payment", err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  }, [
    selectedCustomer,
    filteredInvoices,
    invoicePayments,
    paymentData,
    today,
    fetchUnpaidInvoices,
  ]);

  const fmt = useCallback(
    (n) =>
      Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  console.log("filteredInvoice", filteredInvoices);
  const getLocationName = useCallback(
    (locationId) => {
      const location = locations.find((loc) => loc.Location_ID === locationId);
      return location ? location.Location_Name : locationId;
    },
    [locations],
  );

  const hasValidationError =
    Boolean(amountError) ||
    Object.values(invoiceErrors || {}).some((v) => Boolean(v && v.length));

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
              getOptionLabel={(option) => option.Customer_Name || ""}
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
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.Location_Name || ""}
              value={
                locations.find(
                  (loc) => loc.Location_ID === paymentData.Location,
                ) || null
              }
              onChange={(event, newValue) => {
                setPaymentData((prev) => ({
                  ...prev,
                  Location: newValue ? newValue.Location_ID : "",
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Location" />
              )}
            />

            {/* Amount Received
            <TextField
              label="Amount Received"
              name="Amount_Received"
              type="number"
              value={paymentData.Amount_Received}
              onChange={handlePaymentDataChange}
              onBlur={handleAmountReceivedBlur}
              inputProps={{ step: "0.01", min: "0" }}
            />
            {amountError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {amountError}
              </Typography>
            )} */}

            <TextField
              label="Amount Received"
              name="Amount_Received"
              type="number"
              value={paymentData.Amount_Received}
              onChange={handlePaymentDataChange}
              onBlur={handleAmountReceivedBlur}
              inputProps={{ step: "0.01", min: "0" }}
              error={Boolean(amountError)}
              helperText={amountError}
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
            ) : filteredInvoices.length === 0 ? (
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
                    {filteredInvoices.map((invoice) => {
                      const total = Number(invoice.total_amount) || 0;
                      const paid = Number(invoice.paid_amount) || 0;
                      const due = total - paid;
                      return (
                        <InvoiceRow
                          key={invoice.invoice_id}
                          invoice={invoice}
                          due={due}
                          paymentValue={invoicePayments[invoice.invoice_number]}
                          onPaymentChange={handleInvoicePaymentChange}
                          fmt={fmt}
                          getLocationName={getLocationName}
                          today={today}
                          onPayInFull={handlePayInFull}
                          invoiceError={invoiceErrors[invoice.invoice_number]}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Total Summary */}
            {filteredInvoices.length > 0 && (
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

        {/* Auto-Fill Dialog */}
        <Dialog
          open={openAutoFillDialog}
          onClose={() => setOpenAutoFillDialog(false)}
        >
          <DialogTitle>Auto-Fill Payment Amounts</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Would you like this amount ({fmt(pendingAmount)}) to be reflected
              in the Payment field?
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: "block" }}
            >
              The amount will be distributed across unpaid invoices in order.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenAutoFillDialog(false);
                // Don't fill, just close
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                autoFillPayments(pendingAmount);
                setOpenAutoFillDialog(false);
              }}
              variant="contained"
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Buttons */}
        {selectedCustomer && filteredInvoices.length > 0 && (
          <Box display="flex" gap={2} sx={{ mt: 3, justifyContent: "center" }}>
            <Button variant="outlined" onClick={() => navigate("/invoices")}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleRecordPayment}
              // disabled={hasValidationError}
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
