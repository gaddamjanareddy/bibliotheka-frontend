import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../api/axios"
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Tooltip,
  LinearProgress,
  Checkbox,
  IconButton,
  Skeleton,
  Divider,
  Badge,
  Chip,
  Menu,
} from "@mui/material";
import {
  ViewModule,
  ViewList,
  Download,
  Delete,
  Add,
  FilterList,
  Search,
  Close,
  MoreVert,
  Star,
  AutoStories,
  DoneAll,
  BookmarkBorder,
  Edit,
  FavoriteBorder,
  Favorite,
} from "@mui/icons-material";

// Components
import BookFormModal from "../Components/BookFormModal";
import FilterBadge from "../Components/FilterBadge";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";

// --- Utility: Debounce ---
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const MyBooks = ({ booksList, setBooksList }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchUser } = useUser(); 

  // --- States ---
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeBook, setActiveBook] = useState(null);

  // Filters
  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created_desc");
  const [tags, setTags] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [viewMode, setViewMode] = useState("grid");

  // Selection & Meta
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [stats, setStats] = useState({ unread: 0, reading: 0, completed: 0 });
  const [overallTotal, setOverallTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  // --- API Calls ---
  const applyFilters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/books/filter`,
        { search: searchQuery, genre, status, sort, tags },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        }
      );
      setBooks(res.data.books || []);
      setTotalPages(res.data.totalPages);
      setOverallTotal(res.data.overallTotal);
      setFilteredTotal(res.data.filteredTotal);
      setStats(res.data.stats);
    } catch (err) {
      setError("Failed to fetch library data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axiosInstance.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data); // This fills your 'user' state
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchUserProfile();
    // Hydrate state from URL
    const p = Object.fromEntries([...searchParams]);
    if (p.genre) setGenre(p.genre);
    if (p.status) setStatus(p.status);
    if (p.sort) setSort(p.sort);
    if (p.search) {
      setSearchQuery(p.search);
      setSearchInput(p.search);
    }
    if (p.page) setPage(Number(p.page));
    if (p.view) setViewMode(p.view);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) applyFilters();
  }, [searchQuery, genre, status, sort, tags, page, limit, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    const params = {
      ...(genre !== "all" && { genre }),
      ...(status !== "all" && { status }),
      ...(sort !== "created_desc" && { sort }),
      ...(searchQuery && { search: searchQuery }),
      ...(page > 1 && { page }),
      ...(viewMode !== "grid" && { view: viewMode }),
    };
    setSearchParams(params);
  }, [genre, status, sort, searchQuery, page, viewMode, isHydrated]);

  const handleMenuOpen = (event, book) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveBook(null);
  };

  const handleMenuEdit = () => {
    setEditBook(activeBook);
    handleMenuClose();
  };

  const handleMenuDelete = async () => {
    handleMenuClose();

    if (!activeBook) return;

    const result = await Swal.fire({
      title: "Delete this book?",
      text: `Permanently remove "${activeBook.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C04732",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`/books/${activeBook._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // SUCCESS: Update the UI
        Swal.fire("Deleted!", "The book has been removed.", "success");

        // Refresh the list to remove the deleted book
        applyFilters();
      } catch (err) {
        Swal.fire("Error", "Failed to delete book.", "error");
      }
    }
  };

  // 1. Single Toggle Logic (The "Light Switch")
  const handleToggleWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(
        `/users/wishlist/toggle/${bookId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUser(); 
      // 1. Check the 'wishlist' array from the response to see if the book is in it
      // This tells us if it was 'added' or 'removed'
      const isNowInWishlist = response.data.wishlist.includes(bookId);

      if (isNowInWishlist) {
        toast.success("Added to Wishlist! ❤️");
      } else {
        toast.success("Removed from Wishlist");
      }

      // 2. IMPORTANT: Update your local 'user' state immediately
      // This is better than fetchUserProfile() because we already have the new data!
      setUser((prevUser) => ({
        ...prevUser,
        wishlist: response.data.wishlist,
      }));
    } catch (err) {
      // 3. Log the actual error in the console so you can see what went wrong
      console.error("Wishlist Error:", err);
      toast.error("Something went wrong");
    }
  };

  // 2. Bulk Add Logic (The "Grocery Bag")
  const handleBulkWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/users/wishlist/bulk`,
        { bookIds: selectedBooks }, // Sending the bag of IDs
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUser(); 
      fetchUserProfile();
      toast.success(`${selectedBooks.length} books added to Wishlist!`);
      setSelectedBooks([]); // Empty the bag (clear checkboxes)
    } catch (err) {
      toast.error("Bulk add failed");
    }
  };

  // --- Handlers ---
  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${selectedBooks.length} books?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C04732",
      confirmButtonText: "Yes, delete them",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        await axiosInstance.delete(`/books/bulk-delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids: selectedBooks },
        });

        setSelectedBooks([]);
        applyFilters();
        Swal.fire("Deleted!", "Your books have been removed.", "success");
      } catch (err) {
        console.error("Delete failed", err);
        Swal.fire(
          "Error",
          err.response?.data?.error || "Failed to delete books.",
          "error"
        );
      }
    }
  };
  const handleView = (book) => {
    navigate(`/book-details/${book._id}?${searchParams.toString()}`, {
      state: { from: "Library", path: "/MyBooks", book: book },
    });
  };

  const exportToCSV = async () => {
    Swal.fire({
      title: "Generating CSV...",
      text: "The server is preparing your file.",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    try {
      const token = localStorage.getItem("token");

      // 1. Request the file from the backend
      const res = await axiosInstance.post(
        `/books/export`,
        { search: searchQuery, genre, status, sort, tags },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", 
        }
      );

      // 2. Create a download link for the Blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      // Name the file
      const date = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `Library_Export_${date}.csv`);

      // 3. Trigger Download
      document.body.appendChild(link);
      link.click();

      // 4. Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Free up memory

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Download Started",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Export failed", err);
      Swal.fire("Error", "Failed to download export file.", "error");
    }
  };

  const toggleSelectBook = (id) => {
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const debouncedSearch = useCallback(
    debounce((v) => setSearchQuery(v), 500),
    []
  );

  // --- Render Helpers ---
  const StatusIcon = ({ type }) => {
    if (type === "completed")
      return <DoneAll fontSize="small" className="text-green-600" />;
    if (type === "reading")
      return <AutoStories fontSize="small" className="text-orange-500" />;
    return <BookmarkBorder fontSize="small" className="text-gray-400" />;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 bg-[#FCF9F5] min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Playfair Display",
              fontWeight: 700,
              color: "#2C1E12",
            }}
          >
            Library Collection
          </Typography>
          <Typography variant="body1" className="text-[#8B735B]">
            Manage {overallTotal} volumes in your personal digital archives
          </Typography>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              color: "#5B4636",
              borderColor: "#CBBBA0",
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              bgcolor: "#5B4636",
              "&:hover": { bgcolor: "#3E2F21" },
            }}
          >
            Add Book
          </Button>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Library",
            value: overallTotal,
            color: "#5B4636",
            icon: <ViewModule />,
          },
          {
            label: "Currently Reading",
            value: stats.reading,
            color: "#B6772A",
            icon: <AutoStories />,
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "#445D48",
            icon: <DoneAll />,
          },
          {
            label: "Unread",
            value: stats.unread,
            color: "#7B6A55",
            icon: <BookmarkBorder />,
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-white p-5 rounded-2xl border border-[#E3D5C3] shadow-sm flex items-center gap-4"
          >
            <div
              className={`p-3 rounded-xl`}
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <Typography
                variant="caption"
                className="uppercase tracking-widest text-gray-500 font-bold"
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#2C1E12" }}
              >
                {stat.value}
              </Typography>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER BAR - GLASSMORPHISM EFFECT */}
      <div className="sticky top-14 z-15 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#CBBBA0] shadow-lg mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-[#F5EFE6] border-none rounded-xl focus:ring-2 focus:ring-[#5B4636] transition-all"
              placeholder="Search by title, author, or ISBN..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-wrap">
            <Select
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ borderRadius: "10px", minWidth: "120px" }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
              <MenuItem value="reading">Reading</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
            <Select
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              sx={{ borderRadius: "10px", minWidth: "120px" }}
            >
              <MenuItem value="all">All Genres</MenuItem>
              <MenuItem value="fiction">Fiction</MenuItem>
              <MenuItem value="sci-fi">Sci-Fi</MenuItem>
              <MenuItem value="biography">Biography</MenuItem>
            </Select>

            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="created_desc">Recently Added</MenuItem>
              <MenuItem value="title_asc">Title A-Z</MenuItem>
            </Select>
            </div>
            <Divider orientation="vertical" flexItem />

            <div className="flex bg-[#F5EFE6] p-1 rounded-xl">
              <IconButton
                onClick={() => setViewMode("grid")}
                color={viewMode === "grid" ? "primary" : "default"}
              >
                <ViewModule />
              </IconButton>
              <IconButton
                onClick={() => setViewMode("list")}
                color={viewMode === "list" ? "primary" : "default"}
              >
                <ViewList />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Bulk Action Strip */}

        <AnimatePresence>
          {selectedBooks.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-between bg-[#5B4636] text-white px-4 py-2 rounded-xl"
            >
              <Typography variant="body2">
                {selectedBooks.length} books selected
              </Typography>
              <div className="flex gap-2">
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<FavoriteBorder />}
                  onClick={handleBulkWishlist}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Wishlist
                </Button>
                <div className="w-[1px] h-6 bg-white/20 mx-1" />
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                >
                  Delete
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setSelectedBooks([])}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={400}
              sx={{ borderRadius: "20px" }}
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-60">
          <AutoStories sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5">
            No books found matching your criteria
          </Typography>
          <Button onClick={() => setSearchQuery("")} sx={{ mt: 2 }}>
            Clear all filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        //   {books.map((book) => (
        //     <motion.div
        //       key={book._id}
        //       layout
        //       initial={{ opacity: 0, y: 20 }}
        //       animate={{ opacity: 1, y: 0 }}
        //     >
        //       <div className="group relative bg-white border border-[#E3D5C3] rounded-[24px] h-[520px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">

        //         {/* --- IMAGE HEADER SECTION --- */}
        //         <div className="relative h-64 shrink-0 overflow-hidden">
        //           <img
        //             src={book.coverUrl || "https://via.placeholder.com/300x400?text=No+Cover"}
        //             alt={book.title}
        //             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        //           />

        //           {/* Top Left: Selection Checkbox */}
        //           <div className="absolute top-3 left-3 z-10">
        //             <Checkbox
        //               checked={selectedBooks.includes(book._id)}
        //               onChange={() => toggleSelectBook(book._id)}
        //               sx={{
        //                 color: "white",
        //                 bgcolor: "rgba(0,0,0,0.2)",
        //                 backdropFilter: "blur(4px)",
        //                 borderRadius: "8px",
        //                 "&.Mui-checked": { color: "#5B4636", bgcolor: "white" },
        //               }}
        //             />
        //           </div>

        //           {/* Top Right: Status & Heart (Glassmorphism) */}
        //           <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
        //             <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
        //               <StatusIcon type={book.status} />
        //               <span className="text-[10px] font-bold uppercase text-[#5B4636]">{book.status}</span>
        //             </div>

        //             <IconButton
        //               size="small"
        //               onClick={(e) => {
        //                 e.stopPropagation();
        //                 handleToggleWishlist(book._id);
        //               }}
        //               sx={{
        //                 bgcolor: "white/90",
        //                 backdropFilter: "blur(4px)",
        //                 color: user?.wishlist?.includes(book._id) ? "#d32f2f" : "#8B735B",
        //                 "&:hover": { bgcolor: "white", color: "#d32f2f" },
        //               }}
        //             >
        //               {user?.wishlist?.includes(book._id) ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
        //             </IconButton>
        //           </div>
        //         </div>

        //         {/* --- CONTENT SECTION --- */}
        //         <div className="p-5 flex flex-col flex-grow min-w-0">

        //           {/* Genre & Year Row */}
        //           <div className="flex justify-between items-center mb-1">
        //             <span className="text-[10px] font-bold text-[#B6772A] uppercase tracking-widest">
        //               {book.genre || "General"}
        //             </span >
        //             <span className="text-[10px] text-[#8B735B] font-medium">
        //               {book.year || "2024"}
        //             </span>
        //           </div>

        //           {/* Title & Author */}
        //           <h3 className="text-[#2C1E12] font-bold text-lg line-clamp-1 group-hover:text-[#B6772A] transition-colors">
        //             {book.title}
        //           </h3>
        //           <p className="text-[#8B735B] text-xs italic mb-2 truncate">by {book.author}</p>

        //           {/* ADVANCED: Rating Stars */}
        //           <div className="flex items-center gap-1 mb-3">
        //             {[...Array(5)].map((_, i) => (
        //               <Star
        //                 key={i}
        //                 sx={{
        //                   fontSize: 14,
        //                   color: i < (book.rating || 4) ? "#B6772A" : "#EDE4D8"
        //                 }}
        //               />
        //             ))}
        //             <span className="text-[10px] font-bold text-[#2C1E12] ml-1">{book.rating || "4.0"}</span>
        //           </div>

        //           {/* Tags (Minimalist style) */}
        //           <div className="flex flex-wrap gap-1 mb-4">
        //             {book.tags?.slice(0, 2).map((tag) => (
        //               <span key={tag} className="text-[9px] font-bold bg-[#F5EFE6] text-[#5B4636] px-2 py-0.5 rounded-full border border-[#E3D5C3]">
        //                 #{tag}
        //               </span>
        //             ))}
        //           </div>

        //           {/* PROGRESS SECTION (Conditional) */}
        //           <div className="min-h-[45px]"> {/* Reserves space so cards don't jump */}
        //             {book.status === "reading" && (
        //               <div className="mb-2">
        //                 <div className="flex justify-between text-[10px] mb-1 font-bold text-[#5B4636]">
        //                   <span>Reading Progress</span>
        //                   <span>{book.progress || 65}%</span>
        //                 </div>
        //                 <LinearProgress
        //                   variant="determinate"
        //                   value={book.progress || 65}
        //                   sx={{
        //                     height: 6,
        //                     borderRadius: 3,
        //                     bgcolor: "#EDE4D8",
        //                     "& .MuiLinearProgress-bar": { bgcolor: "#B6772A" },
        //                   }}
        //                 />
        //               </div>
        //             )}
        //           </div>

        //           {/* FOOTER ACTIONS - Pinned to bottom */}
        //           <div className="mt-auto pt-4 flex gap-2">
        //             <Button
        //               fullWidth
        //               variant="contained"
        //               size="small"
        //               onClick={() => handleView(book)}
        //               sx={{
        //                 bgcolor: "#5B4636",
        //                 textTransform: "none",
        //                 borderRadius: "10px",
        //                 fontWeight: 700,
        //                 boxShadow: "none",
        //                 "&:hover": { bgcolor: "#3E2F21", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
        //               }}
        //             >
        //               Details
        //             </Button>
        //             <IconButton
        //               size="small"
        //               onClick={(e) => handleMenuOpen(e, book)}
        //               sx={{
        //                 border: "1px solid #E3D5C3",
        //                 borderRadius: "10px",
        //                 "&:hover": { bgcolor: "#F5EFE6" }
        //               }}
        //             >
        //               <MoreVert fontSize="small" />
        //             </IconButton>
        //           </div>
        //         </div>
        //       </div>
        //     </motion.div>
        //   ))}
        // </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <motion.div
              key={book._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="group relative bg-white border border-[#E3D5C3] rounded-[24px] h-[460px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                {/* --- 1. IMAGE SECTION (Fixed Height: 240px) --- */}
                <div className="relative h-[240px] shrink-0 overflow-hidden bg-[#F5EFE6]">
                  <img
                    src={
                      book.coverUrl ||
                      "https://via.placeholder.com/300x400?text=No+Cover"
                    }
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* PROGRESS BAR OVERLAY (Netflix Style) */}
                  {book.status === "reading" && (
                    <div className="absolute bottom-0 left-0 w-full z-20">
                      <LinearProgress
                        variant="determinate"
                        value={book.progress || 65}
                        sx={{
                          height: 6,
                          bgcolor: "rgba(0,0,0,0.2)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#B6772A",
                            borderRadius: "0 4px 4px 0",
                          },
                        }}
                      />
                    </div>
                  )}

                  {/* TOP OVERLAYS */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedBooks.includes(book._id)}
                      onChange={() => toggleSelectBook(book._id)}
                      sx={{
                        color: "white",
                        bgcolor: "rgba(0,0,0,0.2)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "8px",
                        "&.Mui-checked": { color: "#5B4636", bgcolor: "white" },
                      }}
                    />
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
                      <StatusIcon type={book.status} />
                      <span className="text-[10px] font-bold uppercase text-[#5B4636]">
                        {book.status}{" "}
                        {book.status === "reading" &&
                          `• ${book.progress || 65}%`}
                      </span>
                    </div>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(book._id);
                      }}
                      sx={{
                        bgcolor: "white/90",
                        backdropFilter: "blur(4px)",
                        
                        color: user?.wishlist?.includes(book._id)
                          ? "#d32f2f"
                          : "#8B735B",
                        "&:hover": { bgcolor: "white", color: "#d32f2f" },
                      }}
                    >
                      {user?.wishlist?.includes(book._id) ? (
                        <Favorite fontSize="small" />
                      ) : (
                        <FavoriteBorder fontSize="small" />
                      )}
                    </IconButton>
                  </div>
                </div>

                {/* --- 2. CONTENT SECTION (No more empty gaps) --- */}
                <div className="p-5 flex flex-col flex-1 min-w-0">
                  {/* Genre & Year Row */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#B6772A] uppercase tracking-widest truncate max-w-[70%]">
                      {book.genre || "General"}
                    </span>
                    <span className="text-[10px] text-[#8B735B] font-medium">
                      {book.year || "2024"}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h3 className="text-[#2C1E12] font-bold text-lg truncate mb-0.5 group-hover:text-[#B6772A] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[#8B735B] text-xs italic mb-2 truncate">
                    by {book.author}
                  </p>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        sx={{
                          fontSize: 13,
                          color: i < (book.rating || 4) ? "#B6772A" : "#EDE4D8",
                        }}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-[#2C1E12] ml-1">
                      {book.rating || "4.0"}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {book.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-bold bg-[#F5EFE6] text-[#5B4636] px-2 py-0.5 rounded-full border border-[#E3D5C3]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* --- 3. FOOTER ACTIONS (Pinned to bottom) --- */}
                  <div className="mt-auto pt-3 flex gap-2">
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleView(book)}
                      sx={{
                        bgcolor: "#5B4636",
                        textTransform: "none",
                        borderRadius: "10px",
                        fontWeight: 700,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#3E2F21",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      Details
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, book)}
                      sx={{
                        border: "1px solid #E3D5C3",
                        borderRadius: "10px",
                        "&:hover": { bgcolor: "#F5EFE6" },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* LIST VIEW IMPROVED */
        <div className="space-y-3">
          {books.map((book) => (
            <div
              key={book._id}
              className="bg-white p-4 rounded-2xl border border-[#E3D5C3] flex items-center gap-6 hover:shadow-md transition-shadow"
            >
              <Checkbox
                checked={selectedBooks.includes(book._id)}
                onChange={() => toggleSelectBook(book._id)}
              />
              <img
                src={book.coverUrl}
                alt=""
                className="w-16 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Typography variant="h6" sx={{ color: "#2C1E12" }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {book.author} • {book.genre}
                </Typography>
              </div>
              <div className="hidden md:block">
                <Chip label={book.status} size="small" variant="outlined" />
              </div>
              <div className="flex gap-2">
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={() => handleView(book)}
                  sx={{
                    bgcolor: "#5B4636",
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, book)}
                  sx={{ border: "1px solid #E3D5C3" }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER / PAGINATION */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#E3D5C3] pt-8">
        <Typography variant="body2" color="textSecondary">
          Showing <b>{(page - 1) * limit + 1}</b> to{" "}
          <b>{Math.min(page * limit, filteredTotal)}</b> of {filteredTotal}{" "}
          books
        </Typography>

        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            variant="outlined"
            sx={{ borderRadius: "10px" }}
          >
            Prev
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <IconButton
              key={i}
              onClick={() => setPage(i + 1)}
              sx={{
                bgcolor: page === i + 1 ? "#5B4636" : "transparent",
                color: page === i + 1 ? "white" : "#5B4636",
                "&:hover": { bgcolor: page === i + 1 ? "#3E2F21" : "#F5EFE6" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {i + 1}
              </Typography>
            </IconButton>
          ))}
          <Button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            variant="outlined"
            sx={{ borderRadius: "10px" }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <BookFormModal
        open={addModalOpen}
        handleClose={() => setAddModalOpen(false)}
        handleAddBook={(b) => {
          setBooks([b, ...books]);
          setAddModalOpen(false);
        }}
      />
      <BookFormModal
        open={Boolean(editBook)}
        onClose={() => setEditBook(null)}
        mode="edit"
        book={editBook}
        onSuccess={applyFilters}
      />

      {/* --- ACTION MENU (Popover) --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ zIndex: 99999 }}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: "12px", minWidth: "150px" },
        }}
      >
        <MenuItem onClick={handleMenuEdit} sx={{ gap: 2, color: "#5B4636" }}>
          <Edit fontSize="small" /> Edit
        </MenuItem>
        <MenuItem onClick={handleMenuDelete} sx={{ gap: 2, color: "#C04732" }}>
          <Delete fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MyBooks;
