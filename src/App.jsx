// import React, { useState } from "react";
// import "./App.css";
// import Home from "./Pages/Home";
// import MyBooks from "./Pages/MyBooks";
// import Login from "./Pages/Login";
// import Signup from "./Pages/Signup";
// import ViewBook from "./Pages/View";
// import Profile from "./Pages/Profile";
// import Navbar from "./Components/Navbar";
// import BookFormModal from "./Components/BookFormModal";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { isTokenExpired } from "./utils/checkToken";

// const AppWrapper = () => {
//   return (
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   );
// };

// const App = () => {
//   const [BookFormModalOpen, setBookFormModalOpen] = useState(false);
//   const [booksList, setBooksList] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//   const noAuthPages = ["/login", "/signup"];

//   if (!noAuthPages.includes(location.pathname)) {
//     if (isTokenExpired()) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("role");
//       navigate("/login");
//     }
//   }
// }, [location.pathname]);


//   const handleAddBookToList = (book) => {
//     setBooksList((prev) => [book, ...prev]);
//   };

//   // Pages where Navbar should be hidden
//   const noNavbarPaths = ["/login", "/signup", "/Profile"];
//   const showNavbar = !noNavbarPaths.includes(location.pathname);

//   return (
//     <>
//       {showNavbar && (
//         <Navbar openAddBookModal={() => setBookFormModalOpen(true)} />
//       )}

//       <BookFormModal
//         open={BookFormModalOpen}
//         handleClose={() => setBookFormModalOpen(false)}
//         handleAddBook={handleAddBookToList}
//       />

//       <Routes>
//         <Route
//           path="/"
//           element={
//             <Home
//               booksList={booksList}
//               openAddBookModal={() => setBookFormModalOpen(true)}
//             />
//           }
//         />
//         <Route
//           path="/MyBooks"
//           element={<MyBooks booksList={booksList} setBooksList={setBooksList} />}
//         />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/book-details/:id" element={<ViewBook />} />
//         <Route path="/Profile" element={<Profile />} />
//       </Routes>
//     </>
//   );
// };

// export default AppWrapper;





// import React, { useEffect } from "react";
// import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
// import Navbar from "./Components/Navbar";
// import SessionHandler from "./Components/SessionHandler";

// // Existing Pages
// import Home from "./Pages/Home";
// import MyBooks from "./Pages/MyBooks";
// import Login from "./Pages/Login";
// import Signup from "./Pages/Signup";
// import ViewBook from "./Pages/View";
// import Profile from "./Pages/Profile";
// import Analytics from "./Pages/Analytics";
// import Wishlist from "./Pages/Wishlist";
// import Explore from "./Pages/Explore"


// const AdminPanel = () => <div className="p-20 text-center"><h1>Admin User Management</h1></div>;
// const Settings = () => <div className="p-20 text-center"><h1>Account Settings</h1></div>;

// const App = () => {
//   const location = useLocation();
//   const showNavbar = !["/login", "/signup"].includes(location.pathname);

//   return (
//     <>
//       {showNavbar && <Navbar />}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/MyBooks" element={<MyBooks />} />
//         <Route path="/book-details/:id" element={<ViewBook />} />
//         <Route path="/Profile" element={<Profile />} />
        
//         {/* New Advanced Routes */}
//         <Route path="/Analytics" element={<Analytics />} />
//         <Route path="/explore" element={<Explore />} />
//         <Route path="/wishlist" element={<Wishlist />} />
//         <Route path="/admin" element={<AdminPanel />} />
//         <Route path="/settings" element={<Settings />} />

//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//       </Routes>
//     </>
//   );
// };

// const AppWrapper = () => (
//   <BrowserRouter>
//   <SessionHandler />
//     <App />
//   </BrowserRouter>
// );

// export default AppWrapper;





import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import SessionHandler from "./Components/SessionHandler";
import { CircularProgress, Box } from "@mui/material";
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from "./Pages/LandingPage";
import Home from "./Pages/Home";
import ManagementConsole from "./Pages/ManagementConsole";
import Analytics from "./Pages/Analytics";
import MyBooks from "./Pages/MyBooks";
import ViewBook from "./Pages/View";
import Profile from "./Pages/Profile";
import Wishlist from "./Pages/Wishlist";
import Explore from "./Pages/Explore";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

// --- 1. REAL-WORLD LOADER COMPONENT ---
const FullScreenLoader = () => (
  <Box sx={{ 
    height: "100vh", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    bgcolor: "#FCF9F5" 
  }}>
    <CircularProgress sx={{ color: "#5B4636" }} />
  </Box>
);

// --- 2. PROTECTED ROUTE (Guard) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// --- 3. PUBLIC ROUTE (Guard) ---
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // --- 4. AUTH INITIALIZATION & LISTENER ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setHasToken(!!token);
      setIsAuthChecked(true);
    };

    checkAuth();

    // Listen for custom login/logout events to update UI instantly
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  if (!isAuthChecked) {
    return <FullScreenLoader />;
  }

  // Navbar Logic: Only show if logged in AND not on specific pages (optional logic)
  // For this architecture: Navbar usually shows inside the Protected Zone
  const showNavbar = hasToken && !["/login", "/signup", "/"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        containerStyle={{ zIndex: 99999 }} 
      />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* --- PROTECTED ROUTES --- */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/console" element={<ProtectedRoute><ManagementConsole /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/MyBooks" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
        <Route path="/book-details/:id" element={<ProtectedRoute><ViewBook /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <BrowserRouter>
    <SessionHandler />
    <AppContent />
  </BrowserRouter>
);

export default AppWrapper;