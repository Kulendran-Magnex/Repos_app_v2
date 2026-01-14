import PropTypes from "prop-types";
import { TableCell, TextField } from "@mui/material";

const EditableNumberCell2 = ({
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
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     let val = e.target.value;
  //     if (val !== "") {
  //       let finalVal = Number(val);
  //       if (!isNaN(finalVal)) {
  //         if (fixed) {
  //           finalVal = Number(finalVal.toFixed(2));
  //         }
  //         onChange(index, field, finalVal);
  //       }
  //     }
  //     onEditEnd();
  //     e.target.blur();
  //   }
  // };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      let val = e.target.value;
      onChange(index, field, val);

      // if (val === "" || val === "-" || val === "." || val === "-.") {
      //   onChange(index, field, 0); // Fallback to 0
      // } else {
      //   let finalVal = Number(val);
      //   if (!isNaN(finalVal)) {
      //     if (fixed) {
      //       finalVal = Number(finalVal.toFixed(2));
      //     }
      //     onChange(index, field, finalVal);
      //   }
      // }

      onEditEnd();
      e.target.blur();
    }
  };

  // const handleChange = (e) => {
  //   let val = e.target.value;

  //   if (
  //     !allowLeadingZero &&
  //     val.length > 1 &&
  //     val.startsWith("0") &&
  //     !val.startsWith("0.")
  //   ) {
  //     val = val.replace(/^0+/, "");
  //   }

  //   if (val === "") {
  //     onChange(index, field, 0);
  //     return;
  //   }

  //   const numericVal = Number(val);
  //   if (!isNaN(numericVal)) {
  //     onChange(index, field, numericVal);
  //   }
  // };

  const handleChange = (e) => {
    let val = e.target.value;
    onChange(index, field, val);
    // // Allow temporary states like "-" or "." or "-."
    // if (val === "" || val === "-" || val === "." || val === "-.") {
    //   onChange(index, field, val); // Store as-is
    //   return;
    // }

    // const numericVal = Number(val);
    // if (!isNaN(numericVal)) {
    //   onChange(index, field, numericVal);
    // }
  };

  return (
    <TableCell onDoubleClick={onEditStart} sx={{ minWidth: 85, maxWidth: 100 }}>
      {isEditing ? (
        <TextField
          type="number"
          size="small"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onEditEnd}
          fullWidth
        />
      ) : (
        <span>{Number(value).toFixed(2)}</span>
      )}
    </TableCell>
  );
};

EditableNumberCell2.propTypes = {
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

export default EditableNumberCell2;
