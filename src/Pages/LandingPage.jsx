import React, { useEffect } from "react";
import { Box, Button, Container, Typography, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AutoStories, Security, Speed, EmojiEvents } from "@mui/icons-material";

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Optional: If you want to auto-redirect logged-in users to Home immediately
  // useEffect(() => {
  //   if (token) navigate("/home");
  // }, [token, navigate]);

  const features = [
    { icon: <AutoStories fontSize="large" />, title: "Digital Catalog", desc: "Organize your physical and digital books in one seamless interface." },
    { icon: <Speed fontSize="large" />, title: "Smart Insights", desc: "Track reading velocity and genre distribution with beautiful analytics." },
    { icon: <Security fontSize="large" />, title: "Secure Cloud", desc: "Your library data is encrypted and accessible from anywhere." },
  ];

  return (
    <Box sx={{ bgcolor: "#FCF9F5", minHeight: "100vh", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
      
      {/* Navbar Placeholder for Landing */}
      <Box sx={{ py: 3, px: { xs: 2, md: 4 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontFamily: "Playfair Display", fontWeight: 700, color: "#5B4636" }}>
          BIBLIOTHECA
        </Typography>
        <Box>
          {token ? (
             <Button 
             onClick={() => navigate("/home")} 
             variant="contained" 
             sx={{ bgcolor: "#5B4636", borderRadius: "20px", px: 3, "&:hover": { bgcolor: "#3E2F21" } }}
           >
             Go to Dashboard
           </Button>
          ) : (
            <>
              <Button onClick={() => navigate("/login")} sx={{ color: "#5B4636", mr: 2 }}>Sign In</Button>
              <Button 
                onClick={() => navigate("/signup")} 
                variant="contained" 
                sx={{ bgcolor: "#5B4636", borderRadius: "20px", px: 3, "&:hover": { bgcolor: "#3E2F21" } }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Hero Section - Added generous bottom margin (mb: 15) to prevent overlap */}
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 8 }, mb: { xs: 10, md: 20 }, flexGrow: 1 }}>
        <Grid container spacing={8} alignItems="center">
          
          {/* Left Text */}
          <Grid item xs={12} md={6} sx={{ zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="overline" sx={{ letterSpacing: 3, color: "#8B735B", fontWeight: 600 }}>
                THE ULTIMATE BOOK MANAGER
              </Typography>
              <Typography variant="h1" sx={{ 
                fontFamily: "Playfair Display", 
                fontWeight: 800, 
                color: "#2C1E12", 
                fontSize: { xs: "3rem", md: "5rem" },
                lineHeight: 1.1,
                mb: 3
              }}>
                Curate Your <br />
                <span style={{ color: "#D6C2A3" }}>Intellect.</span>
              </Typography>
              <Typography variant="h6" sx={{ color: "#5B4636", opacity: 0.8, mb: 5, maxWidth: 500, lineHeight: 1.6 }}>
                Stop losing track of your lending history and reading goals. Join thousands of bibliophiles managing their personal libraries with precision.
              </Typography>
              
              <Box className="flex gap-3" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button 
                  onClick={() => navigate(token ? "/home" : "/signup")}
                  variant="contained" 
                  size="large"
                  sx={{ bgcolor: "#5B4636", borderRadius: "10px", py: 1.5, px: 4, fontSize: "1.1rem" }}
                >
                  {token ? "Enter Library" : "Start Cataloging"}
                </Button>
                {!token && (
                  <Button 
                    onClick={() => navigate("/login")}
                    variant="outlined" 
                    size="large"
                    sx={{ borderColor: "#5B4636", color: "#5B4636", borderRadius: "10px", py: 1.5, px: 4 }}
                  >
                    View Demo
                  </Button>
                )}
              </Box>
            </motion.div>
          </Grid>

          {/* Right Graphic */}
          <Grid item xs={12} md={6}>
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ duration: 0.8, delay: 0.2 }}
               style={{ position: "relative", display: "flex", justifyContent: "center" }}
             >
                <Box sx={{ 
                  width: { xs: "100%", md: "400px" }, height: 500, 
                  bgcolor: "#D6C2A3", 
                  borderRadius: "200px 200px 20px 20px",
                  position: "relative",
                  boxShadow: "0 20px 40px rgba(91, 70, 54, 0.2)"
                }}>
                  {/* Decorative Box 1 */}
                  <Box sx={{ 
                    position: "absolute", top: 40, left: { xs: -10, md: -40 }, 
                    width: 180, height: 240, 
                    bgcolor: "#5B4636", borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }} />
                  {/* Decorative Box 2 */}
                  <Box sx={{ 
                    position: "absolute", bottom: 60, right: { xs: -10, md: -20 }, 
                    width: 220, height: 280, 
                    bgcolor: "#FFF", borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <EmojiEvents sx={{ fontSize: 80, color: "#D6C2A3" }} />
                  </Box>
                </Box>
             </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: "#5B4636", py: 12, color: "white", mt: "auto" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontFamily: "Playfair Display", mb: 8 }}>
            Crafted for Collectors
          </Typography>
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, height: '100%', 
                    bgcolor: "rgba(255,255,255,0.05)", 
                    color: "white",
                    backdropFilter: "blur(10px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "0.3s",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)", transform: "translateY(-5px)" }
                  }}
                >
                  <Box sx={{ color: "#D6C2A3", mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h5" sx={{ mb: 2, fontFamily: "Playfair Display" }}>{f.title}</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.7 }}>{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;