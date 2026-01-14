import PropTypes from "prop-types";
import { TableCell, TextField } from "@mui/material";

const EditableNumberCell = ({
  value,
  index,
  field,
  isEditing,
  onEditStart,
  onEditEnd,
  onChange,
  fixed = true,
  allowLeadingZero = false,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      let val = e.target.value;
      if (val !== "") {
        let finalVal = Number(val);
        if (!isNaN(finalVal)) {
          if (fixed) {
            finalVal = Number(finalVal.toFixed(2));
          }
          onChange(index, field, finalVal);
        }
      }
      onEditEnd();
      e.target.blur();
    }
  };

  const handleChange = (e) => {
    let val = e.target.value;

    if (
      !allowLeadingZero &&
      val.length > 1 &&
      val.startsWith("0") &&
      !val.startsWith("0.")
    ) {
      val = val.replace(/^0+/, "");
    }

    if (val === "") {
      onChange(index, field, 0);
      return;
    }

    const numericVal = Number(val);
    if (!isNaN(numericVal) && numericVal >= 0) {
      onChange(index, field, numericVal);
    }
  };

  return (
    <TableCell onDoubleClick={onEditStart} sx={{ minWidth: 85, maxWidth: 100 }}>
      {isEditing ? (
        <TextField
          type="number"
          size="small"
          value={value !== undefined && value !== null ? value : ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onEditEnd}
          fullWidth
          inputProps={{ min: 0, step: "0.01" }}
          slotProps={{ input: { inputMode: "decimal" } }}
        />
      ) : (
        <span>{Number(value || 0).toFixed(2)}</span>
      )}
    </TableCell>
  );
};

EditableNumberCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  index: PropTypes.number.isRequired,
  field: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEditStart: PropTypes.func.isRequired,
  onEditEnd: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  fixed: PropTypes.bool,
  allowLeadingZero: PropTypes.bool,
};

export default EditableNumberCell;
