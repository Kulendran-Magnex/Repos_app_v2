import { useState } from "react";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
} from "@mui/material";

function CategoryLevel1() {
  const [categories, setCategories] = useState([
    { id: 1, categoryCode: "C001", categoryName: "Electronics" },
    { id: 2, categoryCode: "C002", categoryName: "Clothing" },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    categoryCode: "",
    categoryName: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Open dialog for adding or editing a category
  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData(category);
    } else {
      setEditMode(false);
      setFormData({ id: null, categoryCode: "", categoryName: "" });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add or update category
  const handleSaveCategory = () => {
    if (editMode) {
      // Update category
      setCategories(
        categories.map((category) =>
          category.id === formData.id ? formData : category
        )
      );
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        categoryCode: formData.categoryCode,
        categoryName: formData.categoryName,
      };
      setCategories([...categories, newCategory]);
    }
    handleCloseDialog();
  };

  // Delete category
  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <Box sx={{ padding: 5, border: 1 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
      >
        Add Category
      </Button>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Box sx={{ width: "75%", margin: 5 }}>
          <TableContainer component={Paper} style={{ marginTop: 20 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category Code</TableCell>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.categoryCode}</TableCell>
                    <TableCell>{category.categoryName}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenDialog(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteCategory(category.id)}
                        style={{ marginLeft: 10 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Dialog for adding or editing category */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Code"
            name="categoryCode"
            value={formData.categoryCode}
            onChange={handleInputChange}
            fullWidth
            style={{ marginBottom: 10 }}
          />
          <TextField
            label="Category Name"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleInputChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveCategory} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CategoryLevel1;
