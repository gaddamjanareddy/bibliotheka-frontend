import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import axiosInstance from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Skeleton,
  Chip,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Search,
  LibraryAddCheck,
  Add,
  Public,
  TrendingUp,
  FiberNew,
  AutoAwesome,
  Close,
} from "@mui/icons-material";
import { useUser } from "../context/UserContext";

// const API_URL = "http://localhost:5000/books";

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // const { libraryBookIds, fetchLibraryIds } = useUser();
  const { libraryBookIds, wishlistGoogleIds, fetchLibraryIds, fetchUser } =
    useUser();

  // --- 1. STATES ---
  const [activeTab, setActiveTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState(""); // Visual input
  const [searchQuery, setSearchQuery] = useState(""); // Actual API trigger
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- 2. INITIAL HYDRATION (URL -> State) ---
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    if (params.q) {
      setSearchQuery(params.q);
      setSearchInput(params.q);
    }
    if (params.genre) setSelectedCategory(params.genre);
    if (params.tab) setActiveTab(Number(params.tab));

    setIsHydrated(true);
  }, []);

  // --- 3. SYNC STATE -> URL ---
  useEffect(() => {
    if (!isHydrated) return;
    const params = {
      ...(searchQuery && { q: searchQuery }),
      ...(selectedCategory !== "All" && { genre: selectedCategory }),
      ...(activeTab !== 0 && { tab: activeTab }),
    };
    setSearchParams(params);
  }, [searchQuery, selectedCategory, activeTab, isHydrated]);

  // --- 4. SEARCH DEBOUNCE ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- 5. RESET ON FILTER CHANGE ---
  useEffect(() => {
    if (!isHydrated) return;
    setPage(0);
    setBooks([]); // Clear list immediately when filters change
    setHasMore(true);
  }, [activeTab, searchQuery, selectedCategory]);

  // --- 6. DATA NORMALIZATION ---
  const normalizeData = (item, source) => {
    const fallbackId = `temp-${Math.random().toString(36).substr(2, 9)}`;
    if (source === "google") {
      const info = item.volumeInfo;
      return {
        id: item.id || fallbackId,
        title: info.title || "Untitled",
        author: info.authors ? info.authors.join(", ") : "Unknown Author",
        coverUrl:
          info.imageLinks?.thumbnail?.replace("http:", "https:") ||
          "https://via.placeholder.com/300x400?text=No+Cover",
        genre: info.categories ? info.categories[0] : "General",
      };
    }
    return { ...item, id: item._id || item.id || fallbackId };
  };

  // --- 7. THE MASTER FETCH FUNCTION ---
  const fetchDiscovery = async () => {
    if (!isHydrated) return;

    // Set loading states
    if (page === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      let results = [];
      let serverHasMore = false;

      if (activeTab === 1) {
        // COMMUNITY TAB
        const res = await axiosInstance.get(`/books/explore`, {
          params: { genre: selectedCategory, q: searchQuery, page: page },
        });
        results = res.data.books.map((b) => ({
          ...b,
          id: b._id, // Ensure the main ID is set to the MongoDB ID
          googleId: b.googleId, // Ensure this field passes through
        }));
        // results = res.data.books;
        serverHasMore = res.data.hasMore;
      } else {
        // GOOGLE TABS
        let q =
          searchQuery.trim() ||
          (activeTab === 0 ? "best sellers 2025" : "new releases 2025");
        if (selectedCategory !== "All") q += ` subject:${selectedCategory}`;

        const startIndex = page * 15;
        const res = await axiosInstance.get("/google-books/search", {
          params: { q, startIndex },
        });
        if (res.data.items) {
          results = res.data.items.map((item) => normalizeData(item, "google"));
          serverHasMore = res.data.items.length === 15;
        }
      }

      setBooks((prev) => (page === 0 ? results : [...prev, ...results]));
      setHasMore(serverHasMore);
    } catch (err) {
      setError("Failed to fetch books.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger fetch when any main dependency changes
  useEffect(() => {
    fetchDiscovery();
  }, [page, searchQuery, selectedCategory, activeTab, isHydrated]);

  // --- 8. HANDLERS ---
  const loadMore = () => setPage((prev) => prev + 1);

  const handleAddToLibrary = async (book) => {
    // const isInLibrary = libraryBookIds.includes(book.id) || (book.googleId && libraryBookIds.includes(book.googleId));
    const identifierToCheck = book.googleId || book.id;
    const isInLibrary = libraryBookIds.includes(identifierToCheck);
    if (isInLibrary) {
      const result = await Swal.fire({
        title: "Already in Library",
        text: `"${book.title}" is already in your collection. Add it again?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#5B4636",
        confirmButtonText: "Yes",
      });
      if (!result.isConfirmed) return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/books/add`,
        {
          title: book.title,
          author: book.author,
          genre: book.genre,
          coverUrl: book.coverUrl,
          status: "unread",
          googleId: book.googleId || book.id,
          // googleId: book.googleId || book.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchLibraryIds();
      Swal.fire({
        icon: "success",
        title: "Added!",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", "Failed to add", "error");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 bg-[#FCF9F5] min-h-screen">
      
      <div className="relative overflow-hidden rounded-[32px] bg-[#5B4636] p-12 mb-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <Typography
            variant="h2"
            sx={{ fontFamily: "Playfair Display", fontWeight: 700, mb: 2 }}
          >
            Discovery Portal
          </Typography>

          <div className="sticky top-14 z-15  mt-8">
            {/* 1. Search Icon Wrapper */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none flex items-center">
              <Search />
            </div>

            <input
              className="w-full pl-12 pr-12 py-5 bg-white text-gray-900 rounded-2xl outline-none shadow-lg"
              placeholder="Search books..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {/* 2. Close Icon Wrapper */}
            {/* We apply positioning to this div, not the IconButton */}
            {searchInput && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center">
                <IconButton onClick={() => setSearchInput("")}>
                  <Close />
                </IconButton>
              </div>
            )}
          </div>
        </div>
        <AutoAwesome
          className="absolute top-10 right-10 text-white/10"
          sx={{ fontSize: 200 }}
        />
      </div>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: "#E3D5C3", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#5B4636" } }}
        >
          <Tab icon={<TrendingUp />} iconPosition="start" label="Trending" />
          <Tab icon={<Public />} iconPosition="start" label="Community" />
          <Tab icon={<FiberNew />} iconPosition="start" label="New" />
        </Tabs>
      </Box>

      {/* CHIPS */}
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
        {["All", "Fiction", "History", "Science", "Mystery", "Fantasy"].map(
          (cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                px: 2,
                py: 2.5,
                borderRadius: "12px",
                bgcolor: selectedCategory === cat ? "#5B4636" : "white",
                color: selectedCategory === cat ? "white" : "#5B4636",
                border: "1px solid #E3D5C3",
              }}
            />
          )
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {loading && page === 0 ? (
          [...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={400}
              sx={{ borderRadius: "24px" }}
            />
          ))
        ) : (
          <AnimatePresence>
            {books.map((book, index) => {
              const identifier = book.googleId || book._id || book.id;

              const isInLibrary = libraryBookIds.includes(identifier);
              const isInWishlist = wishlistGoogleIds.includes(identifier);

              return (
                <motion.div
                  key={`${book.id}-${index}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="group relative h-full flex flex-col border-none shadow-none bg-transparent">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[24px] shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <CardMedia
                        component="img"
                        image={book.coverUrl}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button
                          variant="contained"
                          onClick={() => handleAddToLibrary(book)}
                          sx={{
                            // --- Background Color Logic ---
                            // Priority: Library (Green) > Wishlist (Orange) > Default (White)
                            bgcolor: isInLibrary
                              ? "#2e7d32" // Green
                              : isInWishlist
                              ? "#ed6c02" // Orange/Amber
                              : "white", // White

                            // --- Text Color Logic ---
                            color:
                              isInLibrary || isInWishlist ? "white" : "#5B4636",

                            // --- Shape & Font ---
                            borderRadius: "12px",
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow:
                              isInLibrary || isInWishlist
                                ? "0 4px 6px rgba(0,0,0,0.1)"
                                : "none",

                            // --- Hover States ---
                            "&:hover": {
                              bgcolor: isInLibrary
                                ? "#1b5e20" // Darker Green
                                : isInWishlist
                                ? "#e65100" // Darker Orange
                                : "#F5EFE6", // Light Beige for "Add Book"
                              transform: "translateY(-1px)",
                              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                            },

                            // Smooth transition for hover effects
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          {/* --- Text Label Logic --- */}
                          {isInLibrary
                            ? "In Library"
                            : isInWishlist
                            ? "In Wishlist"
                            : "Add Book"}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="px-1 pt-4">
                      <Typography
                        variant="caption"
                        className="text-[#B6772A] font-bold uppercase"
                      >
                        {book.genre}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#2C1E12",
                          lineHeight: 1.2,
                          height: "2.8rem",
                        }}
                        className="line-clamp-2"
                      >
                        {book.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        className="truncate"
                      >
                        by {book.author}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* LOAD MORE */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-12 mb-10">
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loadingMore}
            sx={{
              borderColor: "#5B4636",
              color: "#5B4636",
              px: 6,
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { borderColor: "#3E2F21", bgcolor: "#F5EFE6" },
            }}
          >
            {loadingMore ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
