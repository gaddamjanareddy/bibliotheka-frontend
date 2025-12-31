import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance  from "../api/axios"

// 1. Create the "Intercom" (The Context object)
const UserContext = createContext();

// 2. Create the "Broadcaster" (The Provider)
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // State for Wishlist IDs
  const [wishlistGoogleIds, setWishlistGoogleIds] = useState([]);
  // State for Library IDs
  const [libraryBookIds, setLibraryBookIds] = useState([])
  
  const [loading, setLoading] = useState(true);

  // Function to fetch User Data from Backend
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await axiosInstance.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);

      // --- LOGIC TO SYNC WISHLIST IDs ---
      if (res.data.wishlist && Array.isArray(res.data.wishlist)) {
        // Map the objects to get just the googleIds
        const wIds = res.data.wishlist.map(b => b?.googleId).filter(Boolean);
        setWishlistGoogleIds(wIds); 
      }
      // ----------------------------------

    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryIds = async () => {
    try {
        const token = localStorage.getItem("token");
        if(!token) return;

        const res = await axiosInstance.get("/books", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ids = res.data.flatMap(book => [book.googleId, book._id]).filter(id => id);
        setLibraryBookIds(ids);
    } catch (err) {
        console.error("Error syncing library IDs:", err);
    }
  }

  // Fetch user once when the app starts
  useEffect(() => {
    fetchUser();
    fetchLibraryIds();
  }, []);

  // 3. The "Value"
  return (
    <UserContext.Provider value={{ 
        user, 
        setUser, 
        fetchUser,
        
        libraryBookIds,
        setLibraryBookIds,
        fetchLibraryIds,
        
        // --- ADDED THIS LINE SO EXPLORE PAGE CAN SEE IT ---
        wishlistGoogleIds, 
        // -------------------------------------------------
        
        loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// 4. Create a "Shortcut"
export const useUser = () => useContext(UserContext);