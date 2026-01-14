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

import CreditCardMasterForm from "./CreditCardMasterForm";
import CreditCardMasterTable from "./CreditCardMasterTable";
import { updateCreditCardMaster, addCreditCardMaster } from "../../API/api";

const CARD_HEIGHT = 400;

const CreditCardMasterPage = () => {
  const [refreshData, setRefreshData] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [editCCName, setEditCCName] = useState("");
  const [newCCName, setNewCCName] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const isMobile = useMediaQuery("(max-width:700px)");

  const handleFormSubmit = () => {
    setRefreshData((prev) => !prev);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditCCName(item.CC_Name);
    setOpen(true);
  };

  const handleSave = async () => {
    if (selectedItem) {
      try {
        await updateCreditCardMaster(selectedItem.CC_Code, editCCName);
        setOpen(false);
        setRefreshData((prev) => !prev);
      } catch (error) {
        console.error("Error saving brand master:", error);
      }
    }
  };

  const handleAddNew = async () => {
    if (!newCCName) {
      alert("Please enter Credit Card Name");
      return;
    }
    try {
      await addCreditCardMaster(newCCName);
      setOpenAddModal(false);
      setNewCCName("");
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error adding new Credit Card:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "89vh", backgroundColor: "#f5f7fa", p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography fontWeight={700} fontSize={28} color="primary">
          Credit Card Master
        </Typography>
      </Paper>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={3}
        sx={{ mx: isMobile ? 0 : 5 }}
      >
        {isMobile && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddModal(true)}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, fontSize: 16, borderRadius: 2 }}
          >
            Add New
          </Button>
        )}
        {!isMobile && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minWidth: 280,
              maxWidth: 400,
              height: CARD_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Typography fontWeight={600} fontSize={20} mb={2}>
              Add New Credit Card
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CreditCardMasterForm onFormSubmit={handleFormSubmit} />
            </Box>
          </Paper>
        )}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            flex: 1,
            height: CARD_HEIGHT,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography fontWeight={600} fontSize={20} mb={2}>
            Credit Card List
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <CreditCardMasterTable onEdit={handleEdit} key={refreshData} />
          </Box>
        </Paper>
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Edit Credit Card Master
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Credit Card Name"
              fullWidth
              variant="outlined"
              value={editCCName}
              onChange={(e) => setEditCCName(e.target.value)}
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

      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Add New Credit Card
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Credit Card Name"
              fullWidth
              variant="outlined"
              value={newCCName}
              onChange={(e) => setNewCCName(e.target.value)}
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

export default CreditCardMasterPage;
