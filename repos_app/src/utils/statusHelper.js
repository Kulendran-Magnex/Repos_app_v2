/**
 * Converts numeric status values to display objects with label and color styling
 * @param {number | string} status - Status value (0, 1, 2 or "O", "P", "D")
 * @returns {object} Object containing label and sx styling for Chip component
 */
export const getStatusDisplay = (status) => {
  // Convert to number if it's a string number
  const numStatus = Number(status);

  // Handle numeric status (0 = Open, 1 = Posted, 2 = Deleted)
  if (numStatus === 0 || status === "O") {
    return {
      label: "Open",
      sx: { backgroundColor: "#e6f4ea", color: "#2e7d32" },
    };
  } else if (numStatus === 1 || status === "P") {
    return {
      label: "Posted",
      sx: { backgroundColor: "#fff8e1", color: "#f9a825" },
    };
  } else if (numStatus === 2 || status === "D") {
    return {
      label: "Deleted",
      sx: { backgroundColor: "#fdecea", color: "#d32f2f" },
    };
  }

  return {
    label: "-",
    sx: {},
  };
};

/**
 * Checks if status is "Open" (0 or "O")
 */
export const isOpen = (status) => {
  const numStatus = Number(status);
  return numStatus === 0 || status === "O";
};

/**
 * Checks if status is "Deleted" (2 or "D")
 */
export const isDeleted = (status) => {
  const numStatus = Number(status);
  return numStatus === 2 || status === "D";
};

/**
 * Checks if status is "Posted" (1 or "P")
 */
export const isPosted = (status) => {
  const numStatus = Number(status);
  return numStatus === 1 || status === "P";
};
