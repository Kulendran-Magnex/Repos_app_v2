import React, { useState } from "react";
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
  FormControl,
  Select,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Tabs,
  Tab,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

const dropdownTab = (
  <FormControl variant="outlined" fullWidth>
    <Select
      displayEmpty
      defaultValue=""
      sx={{
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiInput-underline:before": { display: "none" },
        fontSize: "0.9rem",
      }}
    >
      <MenuItem value="">Sales</MenuItem>
      <MenuItem value="option1">Sales</MenuItem>
      <MenuItem value="option2">Customers</MenuItem>
      <MenuItem value="option3">Sales RTN</MenuItem>
    </Select>
  </FormControl>
);

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null); // Track selected item

  const toggleNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const toggleUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const closeNavMenu = () => setAnchorElNav(null);
  const closeUserMenu = () => setAnchorElUser(null);
  const toggleMenuCollapse = () => setOpenMenu(!openMenu);
  const handleTabChange = (event, newIndex) => setTabIndex(newIndex);

  const handleListItemClick = (item) => {
    setSelectedItem(item); // Set selected item on click
    closeNavMenu(); // Optionally close the menu on item click
  };

  return (
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
                {["Dashboard", "Masters"].map((item, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => handleListItemClick(item)} // Set item on click
                    sx={{
                      backgroundColor:
                        selectedItem === item ? "lightblue" : "transparent", // Change color when selected
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
                    {["Customer", "Sales", "SalesRTN"].map((item, index) => (
                      <ListItemButton
                        key={index}
                        sx={{
                          pl: 4,
                          backgroundColor:
                            selectedItem === item ? "lightblue" : "transparent", // Change color when selected
                        }}
                        onClick={() => handleListItemClick(item)} // Set item on click
                      >
                        <ListItemText primary={item} />
                      </ListItemButton>
                    ))}
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
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="tabs with dropdown"
              sx={{
                display: "flex",
                flexGrow: 1,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {["Dashboard", "Masters", "Purchase", "Sales"].map(
                (label, index) => (
                  <Tab key={index} label={label} />
                )
              )}
              <Tab label={dropdownTab} />
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
  );
};

export default ResponsiveAppBar;
