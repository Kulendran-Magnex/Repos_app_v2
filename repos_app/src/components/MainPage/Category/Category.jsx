import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Stack,
  useMediaQuery,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function CategoryScreen() {
  const [categoriesLvl1, setCategoriesLvl1] = useState([]);
  const [categoriesLvl2, setCategoriesLvl2] = useState([]);
  const [categoriesLvl3, setCategoriesLvl3] = useState([]);
  const [selectedLvl1, setSelectedLvl1] = useState(null);
  const [selectedLvl2, setSelectedLvl2] = useState(null);
  const [selectedLvl3, setSelectedLvl3] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItem, setNewItem] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const isMobile = useMediaQuery("(max-width:700px)");

  // Fetch Level 1 categories
  useEffect(() => {
    fetch("http://localhost:5000/api/categorylvl1")
      .then((response) => response.json())
      .then((data) => setCategoriesLvl1(data))
      .catch((error) => {
        setSnackbarMessage("Error fetching categories");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  }, []);

  // Fetch Level 2 categories
  const handleCategoryLvl2Click = (category) => {
    const categoryLvl1Id = category.id;
    fetch(`http://localhost:5000/api/categorylvl2/${categoryLvl1Id}`)
      .then((response) => response.json())
      .then((data) => {
        setCategoriesLvl2(data);
        setSelectedLvl1(category);
        setSelectedLvl2(null);
        setSelectedLvl3(null);
      })
      .catch((error) => {
        setSnackbarMessage("Error fetching subcategories");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Fetch Level 3 categories
  const handleCategoryLvl3Click = (category) => {
    const categoryLvl2Id = category.id;
    fetch(`http://localhost:5000/api/categorylvl3/${categoryLvl2Id}`)
      .then((response) => response.json())
      .then((data) => {
        setCategoriesLvl3(data);
        setSelectedLvl2(category);
        setSelectedLvl3(null);
      })
      .catch((error) => {
        setSnackbarMessage("Error fetching subsubcategories");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Add Category
  const handleAddCategory = () => {
    let url = "";
    let body = { name: newCategoryName };
    if (editingLevel === 1) {
      url = "http://localhost:5000/api/categorylvl1";
    } else if (editingLevel === 2) {
      url = "http://localhost:5000/api/categorylvl2";
      body = { name: newCategoryName, categoryLvl1Id: selectedLvl1.id };
    } else if (editingLevel === 3) {
      url = "http://localhost:5000/api/categorylvl3";
      body = { name: newCategoryName, categoryLvl2Id: selectedLvl2.id };
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((newCategory) => {
        if (editingLevel === 1) {
          setCategoriesLvl1((prev) => [...prev, newCategory]);
        } else if (editingLevel === 2) {
          setCategoriesLvl2((prev) => [...prev, newCategory]);
        } else if (editingLevel === 3) {
          setCategoriesLvl3((prev) => [...prev, newCategory]);
        }
        setSnackbarMessage("Category added successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsAdding(false);
        setNewCategoryName("");
      })
      .catch(() => {
        setSnackbarMessage("Error adding category");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Edit Category
  const handleEditCategory = (categoryId, level) => {
    setEditingCategoryId(categoryId);
    setEditingLevel(level);
    const category =
      level === 1
        ? categoriesLvl1.find((cat) => cat.id === categoryId)
        : level === 2
        ? categoriesLvl2.find((cat) => cat.id === categoryId)
        : categoriesLvl3.find((cat) => cat.id === categoryId);
    setNewItem(category);
    setIsEditing(true);
  };

  // Update Category
  const handleUpdateCategory = () => {
    let url = "";
    let body = { name: newItem.name };

    if (editingLevel === 1) {
      url = `http://localhost:5000/api/categorylvl1/${editingCategoryId}`;
    } else if (editingLevel === 2) {
      url = `http://localhost:5000/api/categorylvl2/${editingCategoryId}`;
      body = { name: newItem.name, categorylvl1_id: selectedLvl1.id };
    } else if (editingLevel === 3) {
      url = `http://localhost:5000/api/categorylvl3/${editingCategoryId}`;
      body = { name: newItem.name, categorylvl2_id: selectedLvl2.id };
    }

    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((updatedCategory) => {
        if (editingLevel === 1) {
          setCategoriesLvl1((prev) =>
            prev.map((category) =>
              category.id === editingCategoryId ? updatedCategory : category
            )
          );
        } else if (editingLevel === 2) {
          setCategoriesLvl2((prev) =>
            prev.map((category) =>
              category.id === editingCategoryId ? updatedCategory : category
            )
          );
        } else if (editingLevel === 3) {
          setCategoriesLvl3((prev) =>
            prev.map((category) =>
              category.id === editingCategoryId ? updatedCategory : category
            )
          );
        }
        setSnackbarMessage("Category updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsEditing(false);
      })
      .catch(() => {
        setSnackbarMessage("Error updating category");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Delete Category
  const handleDeleteCategory = (categoryId, level) => {
    const url =
      level === 1
        ? `http://localhost:5000/api/categorylvl1/${categoryId}`
        : level === 2
        ? `http://localhost:5000/api/categorylvl2/${categoryId}`
        : `http://localhost:5000/api/categorylvl3/${categoryId}`;

    fetch(url, {
      method: "DELETE",
    })
      .then(() => {
        if (level === 1) {
          setCategoriesLvl1((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );
        } else if (level === 2) {
          setCategoriesLvl2((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );
        } else if (level === 3) {
          setCategoriesLvl3((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );
        }
        setSnackbarMessage("Category deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Error deleting category");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleOpenAddDialog = (level) => {
    setEditingLevel(level);
    setIsAdding(true);
  };

  const handleCloseAddDialog = () => {
    setIsAdding(false);
    setNewCategoryName("");
  };

  const handleCloseEditDialog = () => {
    setIsEditing(false);
  };

  const handleChangeItem = (e) => {
    const { name, value } = e.target;
    setNewItem((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  // Breadcrumb Component
  const BreadcrumbNav = () => (
    <Breadcrumbs
      separator={<ChevronRightIcon fontSize="small" />}
      sx={{ mb: 2 }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={() => {
          setSelectedLvl1(null);
          setSelectedLvl2(null);
          setSelectedLvl3(null);
        }}
        sx={{
          cursor: "pointer",
          color: "primary.main",
          fontWeight: 600,
          fontSize: 14,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Categories
      </Link>
      {selectedLvl1 && (
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            setSelectedLvl2(null);
            setSelectedLvl3(null);
          }}
          sx={{
            cursor: "pointer",
            color: "primary.main",
            fontWeight: 600,
            fontSize: 14,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {selectedLvl1.name}
        </Link>
      )}
      {selectedLvl2 && (
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 600, fontSize: 14 }}
        >
          {selectedLvl2.name}
        </Typography>
      )}
    </Breadcrumbs>
  );

  // Category Table Component
  const CategoryTable = ({ data, level, onView, onEdit, onDelete }) => (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: "70vh",
        overflowY: "auto",
        pr: 1, // so scrollbar doesn’t overlap table
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f5f7fa",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#63b1f1",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#42a5f5",
          },
        },
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#63b1f1" }}>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                backgroundColor: "#63b1f1",
                padding: "16px",
              }}
            >
              Category Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                backgroundColor: "#63b1f1",
                padding: "16px",
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((category, index) => (
              <TableRow
                key={category.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    transition: "background-color 0.3s ease",
                  },
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    padding: "16px",
                    color: "#333",
                  }}
                >
                  {category.name}
                </TableCell>
                <TableCell sx={{ padding: "8px" }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {level < 3 && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onView(category)}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: "#42a5f5",
                          "&:hover": { backgroundColor: "#1976d2" },
                        }}
                      >
                        View
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => onEdit(category.id, level)}
                      title="Edit"
                      sx={{
                        color: "#42a5f5",
                        "&:hover": {
                          backgroundColor: "rgba(66, 165, 245, 0.1)",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(category.id, level)}
                      title="Delete"
                      sx={{
                        color: "#ef5350",
                        "&:hover": {
                          backgroundColor: "rgba(239, 83, 80, 0.1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">
                  No categories found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa", p: 2 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "#fff",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {(selectedLvl1 || selectedLvl2) && (
            <IconButton
              onClick={() => {
                if (selectedLvl2) setSelectedLvl2(null);
                else setSelectedLvl1(null);
              }}
              sx={{
                bgcolor: "#fff",
                color: "#667eea",
                "&:hover": { bgcolor: "#f0f0f0" },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          )}
          <Typography
            fontWeight={700}
            fontSize={28}
            color="#1976d2"
            letterSpacing={0.5}
          >
            Category Master
          </Typography>
        </Stack>
      </Paper>

      {/* Left Side Panel with Breadcrumbs and Add Button */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          px: isMobile ? 0 : 2,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <Box
          sx={{
            minWidth: isMobile ? "auto" : 220,
            flexShrink: 0,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "rgba(99, 177, 241, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(99, 177, 241, 0.2)",
            }}
          >
            <BreadcrumbNav />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
              onClick={() =>
                handleOpenAddDialog(selectedLvl2 ? 3 : selectedLvl1 ? 2 : 1)
              }
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "10px 16px",
                fontSize: 13,
              }}
            >
              {selectedLvl2
                ? "Add Level 3"
                : selectedLvl1
                ? "Add Level 2"
                : "Add Level 1"}
            </Button>
          </Paper>
        </Box>

        {/* Center Table */}
        <Box sx={{ flex: 1, maxWidth: 800 }}>
          {/* Level 1 */}
          {!selectedLvl1 && (
            <CategoryTable
              data={categoriesLvl1}
              level={1}
              onView={handleCategoryLvl2Click}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}

          {/* Level 2 */}
          {selectedLvl1 && !selectedLvl2 && (
            <CategoryTable
              data={categoriesLvl2}
              level={2}
              onView={handleCategoryLvl3Click}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}

          {/* Level 3 */}
          {selectedLvl2 && (
            <CategoryTable
              data={categoriesLvl3}
              level={3}
              onView={() => {}}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Add Dialog */}
      <Dialog
        open={isAdding}
        onClose={handleCloseAddDialog}
        fullWidh
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Add New Category Level {editingLevel}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAddDialog}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCategory}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Edit Category Level {editingLevel}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            name="name"
            variant="outlined"
            value={newItem.name || ""}
            onChange={handleChangeItem}
            fullWidth
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCategory}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CategoryScreen;
