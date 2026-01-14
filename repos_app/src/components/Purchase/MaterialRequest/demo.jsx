import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  TextField,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid"; // For generating unique ids for new rows

const EditableTable = () => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    id: uuidv4(),
    name: "",
    age: "",
    email: "",
  });

  const handleAddRow = () => {
    setRows([...rows, newRow]);
    setNewRow({
      id: uuidv4(),
      name: "",
      age: "",
      email: "",
    });
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    setNewRow({
      ...newRow,
      [field]: value,
    });
  };

  const handleInputChange = (e, rowId, field) => {
    const value = e.target.value;
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={handleAddRow}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    value={row.name}
                    onChange={(e) => handleInputChange(e, row.id, "name")}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.age}
                    onChange={(e) => handleInputChange(e, row.id, "age")}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.email}
                    onChange={(e) => handleInputChange(e, row.id, "email")}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteRow(row.id)}
                    color="secondary"
                  >
                    <AddIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Input fields for new row */}
            <TableRow>
              <TableCell>
                <TextField
                  value={newRow.name}
                  onChange={(e) => handleChange(e, "name")}
                  fullWidth
                  placeholder="Enter Name"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newRow.age}
                  onChange={(e) => handleChange(e, "age")}
                  fullWidth
                  placeholder="Enter Age"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newRow.email}
                  onChange={(e) => handleChange(e, "email")}
                  fullWidth
                  placeholder="Enter Email"
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EditableTable;
