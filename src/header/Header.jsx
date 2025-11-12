import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/SLAMR_logo.png";
import { ThemeToggle } from "../theme/ThemeToggle.jsx";
import { useTheme } from "@mui/material/styles";

const Header = ({ onNavigate, currentView }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const menuItems = [
    { label: "Home", value: "home" },
    { label: "Process Pallets", value: "pallets" },
    { label: "Process Special FAB", value: "specialFab" },
    { label: "Truck Assignment", value: "trucks" },
  ];

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuClick = (view) => {
    onNavigate(view);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#020617", boxShadow: "none" }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{
              mr: 2,
              "&:focus": {
                outline: "none",
                backgroundColor: "transparent",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              left: "49%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="SLAMR Logo"
              style={{ height: 40, marginRight: 10 }}
            />
            <Typography variant="h6" component="div">
              SLAMR
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: "100%",
            color: "white",
            backgroundColor: "#0206175e",
          }}
          role="presentation"
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuClick(item.value)}
                  selected={currentView === item.value}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.selected.main,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    },
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }} />

          {/* Theme Toggle Section - separate from menu items */}
          <Box
            sx={{
              px: 2,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent drawer from closing
          >
            <Typography variant="body2">Theme</Typography>
            <ThemeToggle />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
