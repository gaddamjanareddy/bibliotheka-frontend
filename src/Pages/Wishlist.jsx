import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Divider,
  Button,
  IconButton,
  Checkbox,
  Breadcrumbs,
  Chip,
  Paper,
  Link,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Favorite,
  Delete,
  ArrowBack,
  AutoStories,
  DoneAll,
  BookmarkBorder,
  Close,
  HeartBroken,
  Search,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axios"
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "../context/UserContext";

const WishlistPage = () => {
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWishes, setSelectedWishes] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchUser } = useUser();

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/users/wishlist/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistBooks(res.data);
    } catch (err) {
      toast.error("Could not load your wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const filteredWishes = wishlistBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedWishes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleView = (book) => {
    navigate(`/book-details/${book._id}?${searchParams.toString()}`, {
      state: { from: "Wishlist", path: "/wishlist", book: book },
    });
  };

  const handleRemove = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/users/wishlist/toggle/${bookId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchUser();
      toast.success("Removed from wishlist");
      setWishlistBooks(wishlistBooks.filter((book) => book._id !== bookId));
    } catch (err) {
      toast.error("Failed to remove book");
    }
  };

  const handleBulkRemove = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/users/wishlist/bulk-remove`,
        { bookIds: selectedWishes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUser();
      toast.success(`${selectedWishes.length} books removed`);
      setWishlistBooks((prev) =>
        prev.filter((b) => !selectedWishes.includes(b._id))
      );
      setSelectedWishes([]);
    } catch (err) {
      toast.error("Bulk remove failed");
    }
  };

  const StatusIcon = ({ type }) => {
    if (type === "completed")
      return <DoneAll fontSize="small" sx={{ color: "#2e7d32" }} />;
    if (type === "reading")
      return <AutoStories fontSize="small" sx={{ color: "#ed6c02" }} />;
    return <BookmarkBorder fontSize="small" sx={{ color: "#757575" }} />;
  };

  return (
    <Box sx={{ bgcolor: "#FCF9F5", minHeight: "100vh", pb: 10, pt: 4 }}>
      {/* FLOATING BULK BAR */}
      <AnimatePresence>
        {selectedWishes.length > 0 && (
          <Box
            component={motion.div}
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            sx={{
              position: "fixed",
              bottom: 30,
              left: "50%",
              zIndex: 1000,
              width: "auto",
              minWidth: "400px",
            }}
          >
            <Paper
              elevation={10}
              sx={{
                bgcolor: "#5B4636",
                color: "white",
                px: 3,
                py: 1.5,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: 3,
                border: "1px solid #8B735B",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedWishes.length} Selected
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<HeartBroken />}
                  onClick={handleBulkRemove}
                  sx={{
                    bgcolor: "#E3D5C3",
                    color: "#5B4636",
                    "&:hover": { bgcolor: "#D2C1A8" },
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "10px",
                  }}
                >
                  Remove from Wishlist
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setSelectedWishes([])}
                  sx={{ color: "white/70" }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>

      <Container maxWidth="lg">
        {/* HEADER */}

        <Box sx={{ mb: 6 }}>
  {/* 1. BREADCRUMBS (Keeps the navigation clear) */}
  <Breadcrumbs
    separator={<span className="text-[#8B735B] opacity-50">•</span>}
    sx={{ mb: 2, "& .MuiBreadcrumbs-ol": { alignItems: "center" } }}
  >
    <Link
      onClick={() => navigate("/home")}
      sx={{
        color: "#8B735B",
        textDecoration: "none",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: 500,
        "&:hover": { color: "#5B4636" },
      }}
    >
      Home
    </Link>
    <Link
      onClick={() => navigate("/MyBooks")}
      sx={{
        color: "#8B735B",
        textDecoration: "none",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: 500,
        "&:hover": { color: "#5B4636" },
      }}
    >
      Library
    </Link>
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#5B4636" }}>
      Wishlist
    </Typography>
  </Breadcrumbs>

  {/* 2. MAIN HEADER ROW */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 3,
    }}
  >
    <Box sx={{ flex: 1, minWidth: "300px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Box
          sx={{
            bgcolor: "#5B4636",
            color: "white",
            p: 1,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Favorite fontSize="small" />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#2C1E12",
            fontFamily: "Playfair Display",
          }}
        >
          My Wishlist
        </Typography>

        {/* SUBTLE COUNT CHIP (Simplified) */}
        <Chip
          label={`${wishlistBooks.length} Books`}
          size="small"
          sx={{
            bgcolor: "#F5EFE6",
            color: "#5B4636",
            fontWeight: 700,
            fontSize: "0.75rem",
            border: "1px solid #E3D5C3",
          }}
        />
      </Box>

      <Typography variant="body1" sx={{ color: "#8B735B", maxWidth: 500, fontWeight: 500 }}>
        Your personal sanctuary for future reading adventures.
      </Typography>
    </Box>

    {/* 3. SEARCH BAR (Right Aligned) */}
     <Box sx={{ 
      position: 'relative', 
      minWidth: { xs: '100%', sm: '380px' }
    }}>
      <TextField
        placeholder="Search your saved books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '56px',
            paddingLeft: '16px',
            borderRadius: '100px', // Full Pill shape
            bgcolor: 'white',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            border: '1px solid #E3D5C3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            '& fieldset': { border: 'none' },
            '&:hover': {
              boxShadow: '0 8px 20px rgba(91, 70, 54, 0.08)',
              transform: 'translateY(-2px)'
            },
            '&.Mui-focused': {
              boxShadow: '0 12px 24px rgba(91, 70, 54, 0.12)',
              transform: 'translateY(-2px)'
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#5B4636", fontSize: 24, mr: 1 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={() => setSearchQuery("")} size="small">
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  </Box>
</Box>

        <Divider sx={{ mb: 6, borderColor: "#E3D5C3" }} />

        {loading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#5B4636" }} />
          </Box>
        ) : wishlistBooks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12, opacity: 0.6 }}>
            <Favorite sx={{ fontSize: 100, mb: 2, color: "#E3D5C3" }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#5B4636" }}>
              Your wishlist is empty
            </Typography>
            <Button
              onClick={() => navigate("/MyBooks")}
              sx={{
                mt: 2,
                color: "#8B735B",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Find your next adventure →
            </Button>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {wishlistBooks.map((book) => (
              <div
                key={book._id}
                className="relative flex flex-col bg-white rounded-[24px] border border-[#E3D5C3] overflow-hidden h-[380px] w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
              >
                {/* 1. SELECTION OVERLAYS (Keeping your MUI components for functionality) */}
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedWishes.includes(book._id)}
                    onChange={() => toggleSelect(book._id)}
                    sx={{
                      color: "white",
                      bgcolor: "rgba(0,0,0,0.2)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "8px",
                      "&.Mui-checked": { color: "#5B4636", bgcolor: "white" },
                    }}
                  />
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <IconButton
                    onClick={() => handleRemove(book._id)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(4px)",
                      color: "#d32f2f",
                      "&:hover": { bgcolor: "#d32f2f", color: "white" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>

                {/* 2. IMAGE SECTION - Fixed Height */}
                <div className="h-[180px] w-full shrink-0 overflow-hidden">
                  <img
                    src={
                      book.coverUrl ||
                      "https://via.placeholder.com/300x400?text=No+Cover"
                    }
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* 3. CONTENT AREA - Flex layout with min-w-0 for truncation */}
                <div className="p-5 flex flex-col flex-1 min-w-0">
                  {/* Genre & Status Row */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1 bg-[#F5EFE6] px-2 py-1 rounded-md">
                      <StatusIcon type={book.status} />
                      <span className="text-[10px] font-bold uppercase text-[#5B4636] leading-none">
                        {book.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B735B]">
                      {book.genre || "General"}
                    </span>
                  </div>

                  {/* TITLE - TWO LINE CLAMP (Dots after 2 lines) */}
                  <h3 className="text-[#2C1E12] font-extrabold text-lg leading-snug line-clamp-1 mb-1 min-h-[1.5rem]">
                    {book.title}
                  </h3>

                  {/* AUTHOR - SINGLE LINE TRUNCATE (Dots after 1 line) */}
                  <p className="text-[#8B735B] italic text-sm truncate mb-2">
                    by {book.author}
                  </p>

                  {/* 4. BUTTON - PINNED TO BOTTOM */}
                  <button
                    onClick={() => handleView(book)}
                    className="mt-auto w-full bg-[#5B4636] text-white py-3 rounded-xl font-bold text-sm transition-all hover:bg-[#3E2F21] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <AutoStories fontSize="small" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Box>
  );
};

export default WishlistPage;
