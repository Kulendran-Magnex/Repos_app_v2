import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Tabs,
  Tab,
  Tooltip,
  FormControl,
  Select,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

const settings = ["Profile", "Logout"];
const pages = ["Dashboard", "Masters", "Customers", "Sales RTN"];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard"); // Track selected item
  const [value, setValue] = useState(0); // Active Tab Index

  // Load selected item from localStorage on mount
  useEffect(() => {
    const savedItem = localStorage.getItem("selectedItem");
    if (savedItem) {
      setSelectedItem(savedItem);
    }
  }, []);

  // Load active tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setValue(parseInt(savedTab, 10)); // Set the active tab index
    }
  }, []);

  const toggleNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const toggleUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const closeNavMenu = () => setAnchorElNav(null);
  const closeUserMenu = () => setAnchorElUser(null);
  const toggleMenuCollapse = () => setOpenMenu(!openMenu);

  const handleTabChange = (event, newIndex) => {
    setValue(newIndex);
    localStorage.setItem("activeTab", newIndex); // Save active tab index to localStorage
  };

  const handleListItemClick = (item) => {
    setSelectedItem(item); // Set selected item
    localStorage.setItem("selectedItem", item); // Save to localStorage
    closeNavMenu(); // Close menu on click
  };

  const handleDropdownChange = (event) => {
    setSelectedItem(event.target.value); // Update selected item from dropdown
    localStorage.setItem("selectedItem", event.target.value); // Save to localStorage
  };

  // Content rendering based on selected item
  const renderContent = () => {
    if (selectedItem === "Dashboard") {
      return <div>Dashboard Content</div>;
    }
    if (selectedItem === "Masters") {
      return <div>Masters Content</div>;
    }
    if (selectedItem === "Sales") {
      return <div>Sales Content</div>;
    }
    if (selectedItem === "Purchase") {
      return <div>Purchase</div>;
    }
    if (selectedItem === "Customers") {
      return <div>Customers Content</div>;
    }
    if (selectedItem === "Sales RTN") {
      return <div>Sales RTN Content</div>;
    }
    return <div>Please select an item</div>;
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "Menu" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton onClick={toggleNavMenu} size="large" color="black">
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={closeNavMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <List sx={{ width: 225 }}>
                  {pages.map((item, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleListItemClick(item)}
                      sx={{
                        backgroundColor:
                          selectedItem === item ? "lightblue" : "transparent",
                      }}
                    >
                      <ListItemText primary={item} />
                    </ListItemButton>
                  ))}
                  <ListItemButton onClick={toggleMenuCollapse}>
                    <ListItemText primary="Sales" />
                    {openMenu ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openMenu}>
                    <List component="div" disablePadding>
                      {["Customers", "Sales", "Sales RTN"].map(
                        (item, index) => (
                          <ListItemButton
                            key={index}
                            sx={{
                              pl: 4,
                              backgroundColor:
                                selectedItem === item
                                  ? "lightblue"
                                  : "transparent",
                            }}
                            onClick={() => handleListItemClick(item)}
                          >
                            <ListItemText primary={item} />
                          </ListItemButton>
                        )
                      )}
                    </List>
                  </Collapse>
                </List>
              </Menu>
            </Box>

            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              Magnex
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="tabs with dropdown"
                sx={{
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                {["Dashboard", "Masters", "Purchase"].map((label, index) => (
                  <Tab
                    key={index}
                    label={label}
                    onClick={() => handleListItemClick(label)}
                  />
                ))}
                <Tab
                  label={
                    <FormControl variant="outlined" fullWidth>
                      <Select
                        value="Sales"
                        displayEmpty
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "& .MuiInput-underline:before": { display: "none" },
                          fontSize: "0.9rem",
                        }}
                        onChange={handleDropdownChange}
                      >
                        <MenuItem value="Sales">Sales</MenuItem>
                        <MenuItem value="Customers">Customers</MenuItem>
                        <MenuItem value="Sales RTN">Sales RTN</MenuItem>
                      </Select>
                    </FormControl>
                  }
                />
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={toggleUserMenu}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={closeUserMenu}
                sx={{ mt: "45px" }}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={closeUserMenu}>
                    <Typography sx={{ textAlign: "center" }}>
                      {setting}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Display content based on selected item */}
      <Box sx={{ padding: "20px" }}>{renderContent()}</Box>
    </>
  );
};

export default Navbar;
