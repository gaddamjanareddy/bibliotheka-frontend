import React, { useEffect, useState, useMemo } from "react";
import {
  Typography, Container, Table, TableContainer,
  TableBody, TableCell, TableHead, TableRow, Paper, CircularProgress,
  TextField, InputAdornment, Box, Avatar, Chip, Tooltip, Alert
} from "@mui/material";
import { Search, AdminPanelSettings, Person, SupervisorAccount } from "@mui/icons-material";
import axiosInstance from "../api/axios"
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const ManagementConsole = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  let loggedInUser = { id: null };
  if (token) {
    const decoded = jwtDecode(token);
    loggedInUser = { id: decoded.id };
  }

  // Check access permission
  if (role !== "admin" && role !== "super_admin") {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
         <Alert severity="error" sx={{ justifyContent: 'center' }}>Access Denied: Administrative privileges required.</Alert>
      </Container>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      setError("Failed to fetch user directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/users/${userId}/role`, 
        { role: newRole }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh data
    } catch (err) {
      console.error("Role update failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  return (
    <Box sx={{ bgcolor: "#FCF9F5", minHeight: "100vh", pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#2C1E12", py: 8, color: "white", mb: 6 }}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" gap={2} mb={1}>
             <AdminPanelSettings sx={{ color: "#D6C2A3", fontSize: 40 }} />
             <Typography variant="overline" color="#D6C2A3" letterSpacing={2}>System Administration</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontFamily: "Playfair Display", fontWeight: 700 }}>
            Management Console
          </Typography>
          <Typography sx={{ opacity: 0.7, maxWidth: 600, mt: 2 }}>
            Control user access, manage roles, and oversee system integrity.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'end', mb: 4, gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontFamily: "Playfair Display", fontWeight: 700, color: "#5B4636" }}>
                User Directory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length} registered members
              </Typography>
            </Box>

            <TextField
              placeholder="Search by name or email..."
              variant="outlined"
              size="small"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              sx={{ bgcolor: "white", minWidth: 300, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #E3D5C3", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#F5EFE6" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#5B4636" }}>Identity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#5B4636" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#5B4636" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#5B4636" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#5B4636", fontSize: 14 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                        <Box>
                          <Typography fontWeight={600} color="#2C1E12">{user.username}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.replace("_", " ").toUpperCase()} 
                        size="small"
                        icon={user.role.includes('admin') ? <AdminPanelSettings fontSize="small"/> : <Person fontSize="small"/>}
                        sx={{ 
                          fontWeight: 700, fontSize: '0.7rem',
                          bgcolor: user.role === 'super_admin' ? '#2C1E12' : user.role === 'admin' ? '#D6C2A3' : '#F5EFE6',
                          color: user.role === 'super_admin' ? 'white' : '#5B4636'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label="Active" color="success" variant="outlined" size="small" sx={{ borderRadius: '6px' }} />
                    </TableCell>
                    <TableCell align="right">
                      {(role === "super_admin" || (role === "admin" && user.role === "student")) && user._id !== loggedInUser.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #D6C2A3', background: 'white' }}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                          {role === "super_admin" && <option value="super_admin">Super Admin</option>}
                        </select>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Protected</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ManagementConsole;