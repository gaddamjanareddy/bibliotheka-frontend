import React, { useState } from "react";
import axiosInstance from "../api/axios"
import { TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student", 
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const { username,email, password, role } = formData;
      await axiosInstance.post("/auth/signup", {
        username,
        email,
        password,
        role,
      });
      Swal.fire({
        title: "Signup Successful!",
        text: "You can now log in with your credentials.",
        icon: "success"
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || Swal.fire({
        title: "Signup Failed",
        text: "Please check your details and try again.",
        icon: "error"
      }))
    }
  };

  // return (
  //   <div className="flex justify-center items-center min-h-screen bg-gray-100">
  //     <Card className="w-96 shadow-lg">
  //       <CardContent className="p-6 flex flex-col gap-4">
  //         <Typography variant="h5" align="center" gutterBottom>
  //           Signup
  //         </Typography>
  //         {error && <p className="text-red-500 text-sm">{error}</p>}

  //         <TextField
  //           label="Username"
  //           name="username"
  //           value={formData.username}
  //           onChange={handleChange}
  //           fullWidth
  //         />
  //         <TextField
  //           label="Email"
  //           name="email"
  //           value={formData.email}
  //           onChange={handleChange}
  //           fullWidth
  //         />
  //         <TextField
  //           label="Password"
  //           name="password"
  //           type="password"
  //           value={formData.password}
  //           onChange={handleChange}
  //           fullWidth
  //         />

  //         <Button
  //           variant="contained"
  //           color="primary"
  //           fullWidth
  //           onClick={handleSubmit}
  //         >
  //           Signup
  //         </Button>

  //         <Typography align="center" className="text-sm text-gray-600">
  //           Already have an account?{" "}
  //           <span
  //             onClick={() => navigate("/login")}
  //             className="text-blue-600 cursor-pointer"
  //           >
  //             Login
  //           </span>
  //         </Typography>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );

  

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EFE6] to-[#E3D5C3] px-4">
    <Card
      elevation={6}
      sx={{
        width: 400,
        borderRadius: "16px",
        border: "1px solid #CBBBA0",
        backgroundColor: "#FFFDF9",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <div className="text-center mb-6">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#5B4636",
              fontFamily: "Playfair Display, serif",
            }}
          >
            Create Account
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#7B6A55", mt: 1 }}
          >
            Start managing your personal book collection
          </Typography>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Username */}
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {/* Email */}
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {/* Password */}
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {/* Signup Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 3,
            py: 1.2,
            borderRadius: "12px",
            backgroundColor: "#5B4636",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#4A3A2E",
            },
          }}
        >
          Sign Up
        </Button>

        {/* Footer */}
        <Typography
          align="center"
          sx={{ mt: 3, fontSize: "0.85rem", color: "#7B6A55" }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer font-medium text-[#5B4636] hover:underline"
          >
            Login
          </span>
        </Typography>
      </CardContent>
    </Card>
  </div>
);

};

export default Signup;
