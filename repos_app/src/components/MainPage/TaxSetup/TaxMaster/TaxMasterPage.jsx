import { useState } from "react";
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
  Divider,
  Paper,
  Stack,
} from "@mui/material";

import TaxMasterTable from "./TaxMasterTable";
import TaxMasterForm from "./TaxMasterForm";
import { updateTaxMaster, addTaxMaster } from "../../../API/api";
import SwitchLeftIcon from "@mui/icons-material/SwitchLeft";

const defaultData = {
  Tax_Code: "",
  Tax_Name: "",
  Tax_Rate: "",
  Formula: "",
};
const TAX_SECTION_HEIGHT = 480;

const TaxMasterPage = ({ setEnable }) => {
  const [refreshData, setRefreshData] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [tax, setTax] = useState(defaultData);
  const isMobile = useMediaQuery("(max-width:700px)");

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev);
  };

  const handleEdit = (item) => {
    setTax(item);
    setOpen(true);
  };

  const handleSave = async () => {
    if (tax) {
      try {
        await updateTaxMaster(
          tax.Tax_Code,
          tax.Tax_Name,
          tax.Tax_Rate,
          tax.Formula
        );
        setOpen(false);
        setRefreshData((prev) => !prev);
      } catch (error) {
        console.error("Error saving packing master:", error);
      }
    }
  };

  const handleOpen = () => {
    setTax(defaultData);
    setOpenAddModal(true);
  };

  const handleAddNew = async () => {
    if (!tax.Tax_Name || !tax.Tax_Rate) {
      alert("Please enter Tax Name and Tax Rate And Formula");
      return;
    }
    try {
      await addTaxMaster(tax.Tax_Name, tax.Tax_Rate, tax.Formula);
      setOpenAddModal(false);
      setTax(defaultData);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error adding new Tax master:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "90vh", backgroundColor: "#f5f7fa", p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography fontWeight={700} fontSize={28} color="primary">
            Tax Master
          </Typography>
          <Box flex={1} />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SwitchLeftIcon />}
            onClick={() => setEnable(false)}
            sx={{ minWidth: 140, fontWeight: 600 }}
          >
            Tax Group
          </Button>
        </Stack>
      </Paper>

      {isMobile ? (
        <Stack spacing={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, fontSize: 16, borderRadius: 2 }}
          >
            Add New
          </Button>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Tax List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: TAX_SECTION_HEIGHT, overflowY: "auto" }}>
              <TaxMasterTable onEdit={handleEdit} key={refreshData} />
            </Box>
          </Paper>
        </Stack>
      ) : (
        <Stack direction="row" spacing={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minWidth: 340,
              height: TAX_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Add New Tax
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TaxMasterForm onFormSubmit={handleFormSubmit} />
            </Box>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              flex: 1,
              height: TAX_SECTION_HEIGHT,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Tax List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <TaxMasterTable onEdit={handleEdit} key={refreshData} />
            </Box>
          </Paper>
        </Stack>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Edit Tax Master
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Tax Name"
              fullWidth
              variant="outlined"
              value={tax.Tax_Name}
              onChange={(e) => setTax({ ...tax, Tax_Name: e.target.value })}
            />
            <TextField
              label="Tax Rate"
              fullWidth
              variant="outlined"
              type="number"
              value={tax.Tax_Rate}
              onChange={(e) => setTax({ ...tax, Tax_Rate: e.target.value })}
            />
            <TextField
              label="Formula"
              fullWidth
              variant="outlined"
              value={tax.Formula}
              onChange={(e) => setTax({ ...tax, Formula: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Add New Tax Master
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Tax Name"
              fullWidth
              variant="outlined"
              value={tax.Tax_Name}
              onChange={(e) => setTax({ ...tax, Tax_Name: e.target.value })}
            />
            <TextField
              label="Tax Rate"
              fullWidth
              variant="outlined"
              type="number"
              value={tax.Tax_Rate}
              onChange={(e) => setTax({ ...tax, Tax_Rate: e.target.value })}
            />
            <TextField
              label="Formula"
              fullWidth
              variant="outlined"
              value={tax.Formula}
              onChange={(e) => setTax({ ...tax, Formula: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenAddModal(false)}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleAddNew} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxMasterPage;
