import React, { useState } from "react";
import axiosInstance from "../api/axios"
import { TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { fetchUser, fetchLibraryIds } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const res = await axiosInstance.post("/auth/login", formData);
      
      if (!res.data.token) {
        setError("No token received");
        return;
      }
      
      // 1. Save Token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      await fetchUser(); 
      await fetchLibraryIds();

      // 2. Notify App.jsx that auth state changed
      window.dispatchEvent(new Event("authChange"));

      // 3. Success Message
      Swal.fire({
        title: "Welcome Back",
        text: "Entering your library...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: '#FCF9F5',
        confirmButtonColor: '#5B4636'
      });
      
      // 4. Redirect
      navigate("/home");

    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EFE6] to-[#E3D5C3] px-4">
      <Card
        elevation={6}
        sx={{
          width: 380,
          borderRadius: "16px",
          border: "1px solid #CBBBA0",
          backgroundColor: "#FFFDF9",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <div className="text-center mb-6">
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#5B4636", fontFamily: "Playfair Display, serif" }}>
              BIBLIOTHECA
            </Typography>
            <Typography variant="body2" sx={{ color: "#7B6A55", mt: 1 }}>
              Sign in to manage your collection
            </Typography>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 3, py: 1.2,
              borderRadius: "12px",
              backgroundColor: "#5B4636",
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": { backgroundColor: "#4A3A2E" },
            }}
          >
            Enter Library
          </Button>

          <Typography align="center" sx={{ mt: 3, fontSize: "0.85rem", color: "#7B6A55" }}>
            New Reader?{" "}
            <span onClick={() => navigate("/signup")} className="cursor-pointer font-medium text-[#5B4636] hover:underline">
              Create Account
            </span>
          </Typography>
          <Typography align="center" sx={{ mt: 1, fontSize: "0.85rem" }}>
            <span onClick={() => navigate("/")} className="cursor-pointer text-gray-400 hover:text-gray-600">
              Back to Home
            </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;