import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  Fade,
  ListItemIcon,
} from "@mui/material";
import {
  LocalLibrary,
  AddCircleOutline,
  Dashboard,
  Book,
  Logout,
  AccountCircle,
  BarChart,
  Explore as ExploreIcon,
  Favorite,
  Star,
  Person,
  AdminPanelSettings,
  Notifications,
  Search,
} from "@mui/icons-material";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import BookFormModal from "./BookFormModal";
import ListItemText from "@mui/material/ListItemText";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [anchorEl, setAnchorEl] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { user } = useUser();
  const wishlistCount = user?.wishlist?.length || 0;

  // 1. Updated mainLinks: Included Dashboard, Library, and Explore
  const mainLinks = [
    { name: "Dashboard", path: "/home", icon: <Dashboard /> },
    { name: "My Library", path: "/MyBooks", icon: <Book /> },
    { name: "Explore", path: "/explore", icon: <ExploreIcon /> },
  ];

  // 2. Removed "Wishlist" from here as it's now a primary navbar action
  const libraryTools = [
    { name: "Insights", path: "/analytics", icon: <BarChart /> },
  ];

  const handleLogout = () => {
    setAnchorEl(null);
    Swal.fire({
      title: "Logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5B4636",
      confirmButtonText: "Sign Out",
    }).then((r) => {
      if (r.isConfirmed) {
        localStorage.clear();
        window.dispatchEvent(new Event("authChange"));
        navigate("/");
      }
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return {
          color: "#B6772A",
          icon: <Star sx={{ fontSize: 12 }} />,
          label: "Super Admin",
        };
      case "admin":
        return {
          color: "#5B4636",
          icon: <AdminPanelSettings sx={{ fontSize: 12 }} />,
          label: "Admin",
        };
      default:
        return {
          color: "#8B735B",
          icon: <Person sx={{ fontSize: 12 }} />,
          label: "Student",
        };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  if (!token) return null;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#5B4636",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 6 } }}>
          {/* BRANDING & MAIN LINKS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Box
              onClick={() => navigate("/home")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
            >
              <Avatar sx={{ bgcolor: "#D6C2A3", width: 32, height: 32 }}>
                <LocalLibrary sx={{ color: "#5B4636", fontSize: 18 }} />
              </Avatar>
              <Typography
                sx={{
                  fontFamily: "Playfair Display",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  display: { xs: "none", lg: "block" },
                }}
              >
                BIBLIOTHECA
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: { sm: 1 }, fontSize: { sm: "0.475rem" }, alignItems: { sm: "center" }}}>
              {mainLinks.map((link) => (
                <Button
                  key={link.name}
                  startIcon={link.icon}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: location.pathname
                      .toLowerCase()
                      .includes(link.path.toLowerCase())
                      ? "#D6C2A3"
                      : "white",
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* RIGHT SIDE TOOLS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Search Library">
              <IconButton
                sx={{ color: "white" }}
                onClick={() => navigate("/MyBooks")}
              >
                <Search />
              </IconButton>
            </Tooltip>

            {/* 3. WISHLIST */}
            <Tooltip title="My Wishlist">
              <IconButton
                onClick={() => navigate("/wishlist")}
                sx={{ color: "white" }}
              >
                {/* The Badge handles the little red circle for you */}
                <Badge badgeContent={wishlistCount} color="error">
                  <Favorite />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, bgcolor: "rgba(255,255,255,0.2)" }}
            />

            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                display: { xs: "none", sm: "flex" },
                bgcolor: "#D6C2A3",
                color: "#5B4636",
                fontWeight: 700,
                borderRadius: "8px",
                "&:hover": { bgcolor: "#EFE1C7" },
              }}
            >
              Add Book
            </Button>

            {/* USER PROFILE */}
            <Tooltip title={`${user?.username} (${roleBadge.label})`}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0, ml: 1 }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    /* This is the Role "Badge" - it shows a small icon over the avatar */
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        bgcolor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        border: `1.5px solid ${roleBadge.color}`,
                      }}
                    >
                      <Box sx={{ color: roleBadge.color, display: "flex" }}>
                        {roleBadge.icon}
                      </Box>
                    </Box>
                  }
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      border: "2px solid #D6C2A3",
                      bgcolor: roleBadge.color, // Color changes based on role for a professional look
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "white",
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* PROFILE HUB MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            width: 240,
            mt: 1.5,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Account Operations
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Access your advanced tools
          </Typography>
        </Box>

        <Divider />

        {/* 5. Wishlist is no longer here, only Insights/other tools remain */}
        {libraryTools.map((item) => (
          <MenuItem
            key={item.name}
            onClick={() => {
              navigate(item.path);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </MenuItem>
        ))}

        <Divider />

        {(role === "admin" || role === "super_admin") && (
          <MenuItem
            onClick={() => {
              navigate("/console");
              setAnchorEl(null);
            }}
            sx={{ color: "#B6772A" }}
          >
            <ListItemIcon>
              <AdminPanelSettings color="warning" />
            </ListItemIcon>
            <b>Management Console</b>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            navigate("/profile");
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          My Profile
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout color="error" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      <BookFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        mode="add"
        onSuccess={() => {
          if (location.pathname === "/MyBooks") window.location.reload();
          else navigate("/MyBooks");
        }}
      />
    </>
  );
};

export default Navbar;
