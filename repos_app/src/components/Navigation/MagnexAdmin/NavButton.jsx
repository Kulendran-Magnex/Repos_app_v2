import { Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import "./NavBar.css"; // Import styles

const NavButton = ({ to, label, isDropdown = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to);

  return (
    <Button
      color={isActive ? "primary" : "inherit"}
      component={Link}
      to={to}
      className="nav-button"
      startIcon={
        <FiberManualRecordIcon
          className="dot-icon"
          style={{
            opacity: isActive ? 1 : 0,
            color: isActive ? "#4dabf5" : "grey",
          }}
        />
      }
      endIcon={isDropdown}
    >
      {label}
    </Button>
  );
};

export default NavButton;
