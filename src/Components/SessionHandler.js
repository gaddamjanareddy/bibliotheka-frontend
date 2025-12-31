// SessionHandler.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const SessionHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");

      // If no token, and we are not on login/signup page, redirect to landing
      if (!token) {
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/");
        }
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if already expired
        if (decoded.exp < currentTime) {
          handleLogout();
        } else {
          // Set a timer to auto-logout when the token expires
          const timeLeft = (decoded.exp - currentTime) * 1000; // Convert to milliseconds
          
          const timer = setTimeout(() => {
            handleLogout();
          }, timeLeft);

          // Cleanup timer on unmount
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      
      Swal.fire({
        title: "Session Expired",
        text: "Please login again",
        icon: "warning",
        confirmButtonColor: "#5B4636"
      }).then(() => {
        navigate("/login");
      });
    };

    // Run check immediately
    const cleanup = checkSession();
    return cleanup;

  }, [navigate, location.pathname]); // Re-run if path changes

  return null; // This component renders nothing visually
};

export default SessionHandler;