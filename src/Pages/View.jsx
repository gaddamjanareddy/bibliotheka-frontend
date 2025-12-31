import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../api/axios"
import Swal from "sweetalert2";
import {
  CardMedia,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Rating,
  Breadcrumbs,
  Link,
  Paper,
  Container,
  Grid,
} from "@mui/material";
import {
  Edit,
  Delete,
  Share,
  Print,
  Event,
  Class,
  Bookmark,
  CheckCircle,
  MenuBook,
  ArrowForwardIos,
  ArrowBack,
} from "@mui/icons-material";

// Components
import BookFormModal from "../Components/BookFormModal";

const ViewBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { book: initialBook } = location.state || {};

  const [book, setBook] = useState(initialBook);
  const [editBook, setEditBook] = useState(null);

  // Read More State
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // const API_URL = "http://localhost:5000/books";

  const fromLabel = location.state?.from || "Library";
  const fromPath = location.state?.path || "/MyBooks";

  const bookTitle = location.state?.book?.title || "Book Details";

  const handleBack = () => navigate(`/MyBooks${location.search}`);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      title: "Link Copied",
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.put(
        `/books/${book._id}`,
        { ...book, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBook(res.data.book);
      Swal.fire({
        title: `Status: ${newStatus}`,
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Archival Deletion",
      text: `Are you sure you want to remove "${book.title}" from your library?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C04732",
      confirmButtonText: "Confirm Delete",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        await axiosInstance.delete(`/books/${book._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted", "Book removed from archives.", "success");
        navigate("/mybooks");
      } catch (err) {
        Swal.fire("Error", "Server rejection on delete request.", "error");
      }
    }
  };

  if (!book) {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center bg-[#FCF9F5]">
        <MenuBook sx={{ fontSize: 80, color: "#CBBBA0", mb: 2 }} />
        <Typography variant="h5" sx={{ color: "#5B4636", mb: 3 }}>
          Record Not Found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/mybooks")}
          sx={{ bgcolor: "#5B4636" }}
        >
          Return to Library
        </Button>
      </Box>
    );
  }

  // --- LOGIC FOR DESCRIPTION READ MORE ---
  const description = book.description || "No synopsis available.";
  const MAX_CHARS = 350;
  const shouldTruncate = description.length > MAX_CHARS;

  return (
    <Box sx={{ bgcolor: "#FCF9F5", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 8, lg: 12 }, py: 6 }}>
        {/* --- TOP BAR --- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 6,
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: "#8B735B", fontWeight: 600, textTransform: "none" }}
          >
            Back
          </Button>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Copy Link">
              <IconButton onClick={copyToClipboard}>
                <Share sx={{ color: "#8B735B" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={() => window.print()}>
                <Print sx={{ color: "#8B735B" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "250px 1fr" },
            gap: { xs: 4, md: 8 }, // 64px gap on desktop
            alignItems: "start",
          }}
        >
          {/* --- LEFT SIDEBAR (STICKY) --- */}
          <Box sx={{ position: { md: "sticky" }, top: 50 }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                elevation={12}
                sx={{
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                  bgcolor: "#fff",
                  border: "10px solid white",
                  boxShadow: "0 20px 50px rgba(44, 30, 18, 0.2)",
                }}
              >
                <Box sx={{ position: "relative", pt: "150%" }}>
                  <CardMedia
                    component="img"
                    image={
                      book.coverUrl ||
                      "https://via.placeholder.com/400x600?text=No+Cover"
                    }
                    alt={book.title}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Paper>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography
                  variant="overline"
                  sx={{ color: "#8B735B", fontWeight: 700, letterSpacing: 2 }}
                >
                  PERSONAL RATING
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                  <Rating
                    value={4}
                    readOnly
                    size="large"
                    sx={{ color: "#B6772A", fontSize: "2rem" }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#CBBBA0", fontFamily: "monospace" }}
                >
                  ID: {book._id.slice(-6).toUpperCase()}
                </Typography>
              </Box>
            </motion.div>
          </Box>

          {/* --- RIGHT CONTENT --- */}
          {/* The `minWidth: 0` is CRITICAL. It prevents the container from expanding beyond the grid cell. */}
          <Box sx={{ minWidth: 0 }}>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Breadcrumbs
                separator={<ArrowForwardIos sx={{ fontSize: 10 }} />}
                aria-label="breadcrumb"
                sx={{ mb: 3 }}
              >
                {/* Step 1: Home */}
                <Link
                  underline="hover"
                  color="inherit"
                  onClick={() => navigate("/home")}
                  sx={{ cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Home
                </Link>

                {/* Step 2: Dynamic Source (Library or Wishlist) */}
                <Link
                  underline="hover"
                  color="inherit"
                  onClick={() => navigate(fromPath)}
                  sx={{ cursor: "pointer", fontSize: "0.9rem" }}
                >
                  {fromLabel}
                </Link>

                {/* Step 3: Dynamic Book Title */}
                <Typography
                  color="text.primary"
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    maxWidth: "200px", // Optional: prevents breadcrumb from being too long
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {bookTitle}
                </Typography>
              </Breadcrumbs>

              {/* TITLE SECTION */}
              <Box sx={{ mb: 6, borderBottom: "1px solid #E3D5C3", pb: 4 }}>
                <Tooltip
                  title={book.title.length > 50 ? book.title : ""}
                  placement="top-start"
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: "Playfair Display",
                      fontWeight: 800,
                      color: "#2C1E12",
                      lineHeight: 1.1,
                      mb: 2,
                      fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },

                      // --- SAFETY CLAMP ---
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      wordBreak: "break-word",
                    }}
                  >
                    {book.title}
                  </Typography>
                </Tooltip>

                <Typography
                  variant="h4"
                  sx={{
                    color: "#8B735B",
                    fontFamily: "Playfair Display",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  Authored by {book.author}
                </Typography>
              </Box>

              {/* METADATA GRID (Inner Grid) */}
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {[
                  { label: "Genre", value: book.genre, icon: <Class /> },
                  { label: "Released", value: book.year, icon: <Event /> },
                  {
                    label: "Status",
                    value: book.status,
                    icon: <Bookmark />,
                    isChip: true,
                  },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "#FFF",
                          borderRadius: "50%",
                          border: "1px solid #E3D5C3",
                          color: "#5B4636",
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "#8B735B",
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}
                        >
                          {item.label.toUpperCase()}
                        </Typography>
                        {item.isChip ? (
                          <Chip
                            label={item.value}
                            size="small"
                            color={
                              item.value === "completed"
                                ? "success"
                                : item.value === "reading"
                                ? "warning"
                                : "default"
                            }
                            sx={{
                              fontWeight: "800",
                              textTransform: "uppercase",
                              mt: 0.5,
                            }}
                          />
                        ) : (
                          <Typography
                            variant="h6"
                            sx={{ color: "#2C1E12", fontWeight: 600 }}
                          >
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* --- SYNOPSIS --- */}
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  bgcolor: "#FFF",
                  borderRadius: "24px",
                  mb: 6,
                  border: "1px solid #F0EAE0",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "Playfair Display",
                    fontWeight: 700,
                    mb: 3,
                    color: "#5B4636",
                  }}
                >
                  Synopsis & Notes
                </Typography>

                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    lineHeight: 1.8,
                    color: "#4A3A2E",
                    fontFamily: "Georgia, serif",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}
                >
                  {isDescExpanded
                    ? description
                    : description.slice(0, MAX_CHARS)}

                  {shouldTruncate && (
                    <Box
                      component="span"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      sx={{
                        color: "#B6772A",
                        fontWeight: "bold",
                        cursor: "pointer",
                        ml: 1,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {isDescExpanded ? " (Show Less)" : "... Read More"}
                    </Box>
                  )}
                </Typography>
              </Paper>

              {/* TAGS */}
              {book.tags?.length > 0 && (
                <Box sx={{ mb: 8 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "#8B735B", fontWeight: 700, letterSpacing: 1 }}
                  >
                    ARCHIVAL TAGS
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    sx={{ mt: 1 }}
                  >
                    {book.tags.map((tag, i) => (
                      <Chip
                        key={i}
                        label={`# ${tag}`}
                        variant="outlined"
                        sx={{
                          borderRadius: "8px",
                          borderColor: "#D6C2A3",
                          color: "#5B4636",
                          mb: 1,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* ACTION BAR */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#2C1E12",
                  borderRadius: "16px",
                  color: "white",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  alignItems: "center",
                  boxShadow: "0 15px 40px rgba(44, 30, 18, 0.3)",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditBook(book)}
                  sx={{
                    bgcolor: "#D6C2A3",
                    color: "#2C1E12",
                    "&:hover": { bgcolor: "#EFE1C7" },
                    fontWeight: 700,
                    px: 4,
                    py: 1.2,
                    borderRadius: "8px",
                  }}
                >
                  Edit Record
                </Button>

                {book.status !== "completed" && (
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => handleQuickStatusUpdate("completed")}
                    sx={{
                      color: "#D6C2A3",
                      borderColor: "#D6C2A3",
                      py: 1.2,
                      "&:hover": { borderColor: "white", color: "white" },
                    }}
                  >
                    Mark as Finished
                  </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />
                <Button
                  onClick={handleDelete}
                  color="error"
                  startIcon={<Delete />}
                  sx={{
                    opacity: 0.8,
                    "&:hover": { opacity: 1, bgcolor: "rgba(255,0,0,0.1)" },
                  }}
                >
                  Delete
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Box>

        <BookFormModal
          open={Boolean(editBook)}
          onClose={() => setEditBook(null)}
          mode="edit"
          book={editBook}
          onSuccess={(updated) => setBook(updated)}
        />
      </Container>
    </Box>
  );
};

export default ViewBook;
