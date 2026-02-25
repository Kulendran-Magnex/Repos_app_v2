import { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Typography,
  Avatar,
  Tooltip,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AuthContext } from "../../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BuildIcon from "@mui/icons-material/Build";

// Updated master menus with new route structure
const masterMenus = [
  { to: "/category", icon: <CategoryIcon />, label: "Category" },
  { to: "/product", icon: <InventoryIcon />, label: "Product" },
  { to: "/packingMaster", icon: <AssignmentIcon />, label: "Packing Master" },
  { to: "/brandMaster", icon: <LocalOfferIcon />, label: "Brand Master" },
  { to: "/taxSetup", icon: <AssessmentIcon />, label: "Tax Setup" },
  { to: "/ccPage", icon: <CreditCardIcon />, label: "Credit Card Master" },
  {
    to: "/currencyMaster",
    icon: <MonetizationOnIcon />,
    label: "Currency Master",
  },
];

// Updated purchase menus with new route structure
const purchaseMenus = [
  {
    to: "/material-request/view",
    icon: <AssignmentIcon />,
    label: "Material Request",
  },
  {
    to: "/purchase-order/view",
    icon: <ShoppingCartIcon />,
    label: "Purchase Order",
  },
  { to: "/grn/view", icon: <InventoryIcon />, label: "GRN" },
  {
    to: "/purchase-return/view",
    icon: <AssignmentIcon />,
    label: "Purchase Return",
  },
];

const inventoryMenus = [
  { to: "/adjustment/view", icon: <BuildIcon />, label: "Adjustment" },
  { to: "/transfer/view", icon: <SwapHorizIcon />, label: "Transfer" },
];

const salesMenus = [
  { to: "/customers", icon: <PeopleIcon />, label: "Customer" },
  { to: "/invoice/view", icon: <ReceiptIcon />, label: "Invoice" },
  { to: "/payment/record", icon: <CreditCardIcon />, label: "Payment" },
];

const reportMenus = [
  { to: "/sales-summary", icon: <AssessmentIcon />, label: "Sales Summary" },
  {
    to: "/inventory-report",
    icon: <InventoryIcon />,
    label: "Inventory Report",
  },
];

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [purchaseList, setPurchaseList] = useState(null);
  const [inventoryList, setInventoryList] = useState(null);
  const [salesList, setSalesList] = useState(null);
  const [reportList, setReportList] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSubMenu, setDrawerSubMenu] = useState(null); // "master" or "purchase"
  const [userMenu, setUserMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { setAuthToken } = auth || {};
  const isMobile = useMediaQuery("(max-width:900px)");

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handlePurchaseClick = (event) => setPurchaseList(event.currentTarget);
  const handleInventoryClick = (event) => setInventoryList(event.currentTarget);
  const handleInventoryClose = () => setInventoryList(null);
  const handleSalesClick = (event) => setSalesList(event.currentTarget);
  const handleSalesClose = () => setSalesList(null);
  const handleMenuClose = () => setAnchorEl(null);
  const handlePurchaseClose = () => setPurchaseList(null);
  const handleUserClick = (event) => setUserMenu(event.currentTarget);
  const handleUserClose = () => setUserMenu(null);
  const handleReportsClick = (event) => setReportList(event.currentTarget);
  const handleReportsClose = () => setReportList(null);
  const handleLogout = () => {
    if (setAuthToken) setAuthToken(null);
    navigate("/login");
    setUserMenu(null);
  };

  // Highlight if any master menu is active
  const isMasterActive = masterMenus.some((menu) =>
    location.pathname.startsWith(menu.to),
  );
  // Highlight if any purchase menu or its add/edit subroutes are active
  const isPurchaseActive =
    purchaseMenus.some((menu) =>
      location.pathname.startsWith(menu.to.replace("/view", "/add")),
    ) ||
    purchaseMenus.some((menu) =>
      location.pathname.startsWith(menu.to.replace("/view", "/edit")),
    ) ||
    purchaseMenus.some((menu) => location.pathname.startsWith(menu.to));

  const isInventoryActive = inventoryMenus.some(
    (menu) =>
      inventoryMenus.some((menu) =>
        location.pathname.startsWith(menu.to.replace("/view", "/add")),
      ) ||
      inventoryMenus.some((menu) =>
        location.pathname.startsWith(menu.to.replace("/view", "/edit")),
      ) ||
      location.pathname.startsWith(menu.to),
  );

  const isSalesActive = salesMenus.some(
    (menu) =>
      salesMenus.some((menu) =>
        location.pathname.startsWith(menu.to.replace("/view", "/add")),
      ) ||
      salesMenus.some((menu) =>
        location.pathname.startsWith(menu.to.replace("/view", "/edit")),
      ) ||
      location.pathname.startsWith(menu.to),
  );

  // Helper to render menu items for dropdowns
  const renderMenuItems = (menus, closeHandler) =>
    menus.map((menu) => (
      <MenuItem
        key={menu.to}
        component={Link}
        to={menu.to}
        onClick={closeHandler}
        selected={
          location.pathname === menu.to ||
          location.pathname.startsWith(menu.to.replace("/view", "/add")) ||
          location.pathname.startsWith(menu.to.replace("/view", "/edit"))
        }
        sx={{
          fontWeight:
            location.pathname === menu.to ||
            location.pathname.startsWith(menu.to.replace("/view", "/add")) ||
            location.pathname.startsWith(menu.to.replace("/view", "/edit"))
              ? "bold"
              : "normal",
          background:
            location.pathname === menu.to ||
            location.pathname.startsWith(menu.to.replace("/view", "/add")) ||
            location.pathname.startsWith(menu.to.replace("/view", "/edit"))
              ? "rgba(33,150,243,0.15)"
              : "inherit",
          color:
            location.pathname === menu.to ||
            location.pathname.startsWith(menu.to.replace("/view", "/add")) ||
            location.pathname.startsWith(menu.to.replace("/view", "/edit"))
              ? "#1976d2"
              : "inherit",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {menu.icon}
          <Box sx={{ ml: 1 }}>{menu.label}</Box>
        </Box>
      </MenuItem>
    ));

  // Drawer menu for mobile
  const renderDrawerMenu = () => (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <List>
        <ListItem
          button
          component={Link}
          to="/home"
          selected={location.pathname === "/home"}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() =>
            setDrawerSubMenu(drawerSubMenu === "master" ? null : "master")
          }
        >
          <ListItemIcon>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText primary="Master" />
          <ArrowDropDownIcon
            sx={{
              transform: drawerSubMenu === "master" ? "rotate(180deg)" : "none",
            }}
          />
        </ListItem>
        {drawerSubMenu === "master" &&
          masterMenus.map((menu) => (
            <ListItem
              key={menu.to}
              button
              component={Link}
              to={menu.to}
              selected={location.pathname.startsWith(menu.to)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        <Divider />
        <ListItem
          button
          onClick={() =>
            setDrawerSubMenu(drawerSubMenu === "purchase" ? null : "purchase")
          }
        >
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Purchase" />
          <ArrowDropDownIcon
            sx={{
              transform:
                drawerSubMenu === "purchase" ? "rotate(180deg)" : "none",
            }}
          />
        </ListItem>
        {drawerSubMenu === "purchase" &&
          purchaseMenus.map((menu) => (
            <ListItem
              key={menu.to}
              button
              component={Link}
              to={menu.to}
              selected={
                location.pathname.startsWith(
                  menu.to.replace("/view", "/add"),
                ) ||
                location.pathname.startsWith(
                  menu.to.replace("/view", "/edit"),
                ) ||
                location.pathname.startsWith(menu.to)
              }
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        <Divider />

        <ListItem button onClick={handleReportsClick}>
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
        <Menu
          anchorEl={reportList}
          open={Boolean(reportList)}
          onClose={handleReportsClose}
        >
          {reportMenus.map((menu) => (
            <MenuItem
              key={menu.to}
              component={Link}
              to={menu.to}
              selected={location.pathname === menu.to}
            >
              {menu.icon}
              <Box sx={{ ml: 1 }}>{menu.label}</Box>
            </MenuItem>
          ))}
        </Menu>
        <ListItem
          button
          component={Link}
          to="/contact-us"
          selected={location.pathname === "/contact-us"}
        >
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </Box>
  );

  const renderSalesMenu = () => (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <List>
        <ListItem
          button
          component={Link}
          to="/home"
          selected={location.pathname === "/home"}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() =>
            setDrawerSubMenu(drawerSubMenu === "master" ? null : "master")
          }
        >
          <ListItemIcon>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText primary="Master" />
          <ArrowDropDownIcon
            sx={{
              transform: drawerSubMenu === "master" ? "rotate(180deg)" : "none",
            }}
          />
        </ListItem>
        {drawerSubMenu === "master" &&
          masterMenus.map((menu) => (
            <ListItem
              key={menu.to}
              button
              component={Link}
              to={menu.to}
              selected={location.pathname.startsWith(menu.to)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        <Divider />
        <ListItem
          button
          onClick={() =>
            setDrawerSubMenu(drawerSubMenu === "purchase" ? null : "purchase")
          }
        >
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Purchase" />
          <ArrowDropDownIcon
            sx={{
              transform:
                drawerSubMenu === "purchase" ? "rotate(180deg)" : "none",
            }}
          />
        </ListItem>
        {drawerSubMenu === "purchase" &&
          purchaseMenus.map((menu) => (
            <ListItem
              key={menu.to}
              button
              component={Link}
              to={menu.to}
              selected={
                location.pathname.startsWith(
                  menu.to.replace("/view", "/add"),
                ) ||
                location.pathname.startsWith(
                  menu.to.replace("/view", "/edit"),
                ) ||
                location.pathname.startsWith(menu.to)
              }
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        <Divider />
        <ListItem
          button
          component={Link}
          to="/contact-us"
          selected={location.pathname === "/contact-us"}
        >
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={3}
      sx={{
        background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
        color: "white",
        borderRadius: 2,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.10)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "70px",
          px: 2,
          display: "flex",
        }}
      >
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {renderDrawerMenu()}
            </Drawer>
            <Box sx={{ flexGrow: 1, textAlign: "center" }}>
              <Typography sx={{ fontWeight: "bold" }}>Repos App</Typography>
            </Box>

            <Box sx={{ position: "absolute", right: 8, top: 12 }}>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserClick}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "white",
                      color: "#1976d2",
                    }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userMenu}
                open={Boolean(userMenu)}
                onClose={handleUserClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleUserClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              {/* Home Button */}
              <Button
                component={Link}
                to="/home"
                startIcon={<HomeIcon />}
                sx={{
                  color: location.pathname === "/home" ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom:
                    location.pathname === "/home"
                      ? "3px solid #fff"
                      : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Dashboard
              </Button>

              {/* Master Button */}
              <Button
                onClick={handleMenuClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<MenuBookIcon />}
                sx={{
                  color: isMasterActive ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom: isMasterActive
                    ? "3px solid #fff"
                    : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Master
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {renderMenuItems(masterMenus, handleMenuClose)}
              </Menu>

              {/* Purchase Button */}
              <Button
                onClick={handlePurchaseClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  color: isPurchaseActive ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom: isPurchaseActive
                    ? "3px solid #fff"
                    : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Purchase
              </Button>
              <Menu
                anchorEl={purchaseList}
                open={Boolean(purchaseList)}
                onClose={handlePurchaseClose}
              >
                {renderMenuItems(purchaseMenus, handlePurchaseClose)}
              </Menu>

              {/* Reports Button */}

              <Button
                onClick={handleInventoryClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<MenuBookIcon />}
                sx={{
                  color: isInventoryActive ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom: isInventoryActive
                    ? "3px solid #fff"
                    : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Inventory
              </Button>
              <Menu
                anchorEl={inventoryList}
                open={Boolean(inventoryList)}
                onClose={handleInventoryClose}
              >
                {renderMenuItems(inventoryMenus, handleInventoryClose)}
              </Menu>

              <Button
                onClick={handleSalesClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<MenuBookIcon />}
                sx={{
                  color: isSalesActive ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom: isSalesActive
                    ? "3px solid #fff"
                    : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Sales
              </Button>
              <Menu
                anchorEl={salesList}
                open={Boolean(salesList)}
                onClose={handleSalesClose}
              >
                {renderMenuItems(salesMenus, handleSalesClose)}
              </Menu>

              <Button
                onClick={handleReportsClick}
                endIcon={<ArrowDropDownIcon />}
                startIcon={<MenuBookIcon />}
                sx={{
                  color:
                    location.pathname === "/contact-us" ? "#fff" : "#e3f2fd",
                  fontWeight: "bold",
                  borderBottom:
                    location.pathname === "/contact-us"
                      ? "3px solid #fff"
                      : "3px solid transparent",
                  borderRadius: 0,
                  mx: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderBottom: "3px solid #fff",
                  },
                }}
              >
                Reports
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserClick}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "white",
                      color: "#1976d2",
                    }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userMenu}
                open={Boolean(userMenu)}
                onClose={handleUserClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleUserClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
