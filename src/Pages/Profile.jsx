import React, { useState, useEffect } from "react";
import {
  Avatar, Button, Box, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, Typography, MenuItem, IconButton, 
  Paper, Divider, Grid, Tooltip, Zoom,
  Chip
} from "@mui/material";
import {
  ArrowBack, Logout, Edit, Mail, Badge, 
  VerifiedUser, CalendarMonth, AutoStories, Favorite
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance  from "../api/axios"
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext"; // Using our central state

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, fetchUser } = useUser(); // Hook into global user state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    username: "",
    email: "",
    role: "",
  });

  if (!user) return (
    <Box className="h-screen flex items-center justify-center bg-[#FCF9F5]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <AutoStories sx={{ fontSize: 40, color: "#5B4636" }} />
      </motion.div>
    </Box>
  );

  const handleEditProfile = () => {
    setUpdatedData({ username: user.username, email: user.email, role: user.role });
    setUpdateDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.put("/users/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data); // Update global state
      setUpdateDialogOpen(false);
      Swal.fire({ icon: 'success', title: 'Identity Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Sign Out?",
      text: "We hope to see you back in the library soon!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5B4636",
      confirmButtonText: "Logout"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/login");
      }
    });
  };

  return (
    <Box className="min-h-screen bg-[#FCF9F5] flex items-center justify-center p-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "32px",
            border: "1px solid #E3D5C3",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(91, 70, 54, 0.1)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: "550px"
          }}
        >
          {/* LEFT PANEL: Branding & Visuals */}
          <Box 
            sx={{ 
              width: { xs: "100%", md: "40%" },
              background: "linear-gradient(135deg, #5B4636 0%, #3E2F21 100%)",
              p: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              color: "white"
            }}
          >
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ position: "absolute", top: 20, left: 20, color: "rgba(255,255,255,0.6)" }}
            >
              <ArrowBack />
            </IconButton>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Avatar
                sx={{
                  width: 140, height: 140,
                  bgcolor: "#D6C2A3", color: "#5B4636",
                  fontSize: 54, fontWeight: 800,
                  border: "6px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                  mb: 3
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </motion.div>

            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Playfair Display' }}>
              {user.username}
            </Typography>
            <Chip 
              label={user.role} 
              size="small" 
              sx={{ bgcolor: "rgba(214, 194, 163, 0.2)", color: "#D6C2A3", mt: 1, fontWeight: 700, px: 2 }} 
            />

            <Box sx={{ mt: 6, width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <Favorite sx={{ color: '#D6C2A3', mb: 1 }} />
                    <Typography variant="h6" fontWeight={800}>{user.wishlist?.length || 0}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Saved Books</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <CalendarMonth sx={{ color: '#D6C2A3', mb: 1 }} />
                    <Typography variant="h6" fontWeight={800}>Active</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Membership</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* RIGHT PANEL: Details & Actions */}
          <Box sx={{ flex: 1, p: { xs: 4, md: 8 }, bgcolor: "white" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#2C1E12" }}>
                Account Settings
              </Typography>
              <Tooltip title="Sign Out">
                <IconButton onClick={handleLogout} sx={{ color: '#d32f2f', bgcolor: '#FEF2F2' }}>
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#8B735B", fontWeight: 700, textTransform: 'uppercase' }}>Full Name</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Badge sx={{ color: '#5B4636' }} />
                  <Typography variant="body1" fontWeight={600}>{user.username}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#8B735B", fontWeight: 700, textTransform: 'uppercase' }}>Email Address</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Mail sx={{ color: '#5B4636' }} />
                  <Typography variant="body1" fontWeight={600}>{user.email}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#8B735B", fontWeight: 700, textTransform: 'uppercase' }}>User Permissions</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <VerifiedUser sx={{ color: '#5B4636' }} />
                  <Typography variant="body1" fontWeight={600} className="capitalize">{user.role}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 6, borderColor: '#F5EFE6' }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                sx={{
                  bgcolor: "#5B4636",
                  color: "white",
                  px: 4, py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: '0 10px 20px rgba(91, 70, 54, 0.2)',
                  "&:hover": { bgcolor: "#3E2F21" }
                }}
              >
                Edit Identity
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "#8B735B",
                  borderColor: "#E3D5C3",
                  borderRadius: "12px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": { borderColor: "#5B4636", bgcolor: "#FCF9F5" }
                }}
              >
                Privacy
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* LUXURY DIALOG */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={() => setUpdateDialogOpen(false)} 
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: "24px", p: 2, border: '1px solid #E3D5C3' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#2C1E12" }}>Refine Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Public Username"
              fullWidth
              value={updatedData.username}
              onChange={(e) => setUpdatedData({...updatedData, username: e.target.value})}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Contact Email"
              fullWidth
              value={updatedData.email}
              onChange={(e) => setUpdatedData({...updatedData, email: e.target.value})}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUpdateDialogOpen(false)} sx={{ color: '#8B735B' }}>Discard</Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            sx={{ bgcolor: '#5B4636', borderRadius: '10px', px: 4 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
