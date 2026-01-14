import React from "react";
import { IconButton } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const DotIcon = ({ position }) => (
  <IconButton
    sx={{
      position: "absolute",
      top: "50%",
      right: position || "-10px", // Allow customization of position
      transform: "translateY(-50%)",
      visibility: "hidden",
      "&:hover": {
        visibility: "visible", // Make the dot visible on hover
      },
    }}
  >
    <FiberManualRecordIcon fontSize="small" sx={{ color: "green" }} />{" "}
    {/* Green dot */}
  </IconButton>
);

export default DotIcon;
