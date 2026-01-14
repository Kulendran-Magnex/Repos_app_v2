import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Menu,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NavButton from "./NavButton"; // Import the reusable button
import "./NavBar.css";

const CustomAppBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const location = useLocation();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isMasterActive =
    location.pathname.startsWith("/product") ||
    location.pathname.startsWith("/category") ||
    location.pathname.startsWith("/packingMaster") ||
    location.pathname.startsWith("/brandMaster");

  return (
    <AppBar
      position="static"
      style={{
        backgroundColor: "white",
        color: "black",
        padding: 0,
        height: "70px",
        marginBottom: 0,
      }}
    >
      <Toolbar sx={{ height: "70px", padding: "0 16px" }}>
        <Box sx={{ flexGrow: 1 }}>
          <NavButton to="/home" label="Dashboard" />
          <NavButton to="/contact-us" label="Reports" />

          {/* Master Button with Dropdown */}
          <Button
            color={isMasterActive ? "primary" : "inherit"}
            onClick={handleMenuClick}
            className="nav-button"
            endIcon={<ArrowDropDownIcon />}
          >
            Master
          </Button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/category" onClick={handleMenuClose}>
              Category
            </MenuItem>
            <MenuItem component={Link} to="/product" onClick={handleMenuClose}>
              Product
            </MenuItem>
            <MenuItem
              component={Link}
              to="/packingMaster"
              onClick={handleMenuClose}
            >
              Packing Master
            </MenuItem>
            <MenuItem
              component={Link}
              to="/brandMaster"
              onClick={handleMenuClose}
            >
              Brand Master
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
