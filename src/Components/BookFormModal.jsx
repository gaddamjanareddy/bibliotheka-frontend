import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Divider,
  Typography,
  Grid,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AutoFixHigh, Search, Close, CloudUpload } from "@mui/icons-material";
import UploadBox from "./UploadBox";
import Swal from "sweetalert2";
import axios from "axios";
import axiosInstance from "../api/axios"

const emptyForm = {
  title: "",
  author: "",
  description: "",
  coverUrl: "",
  year: "",
  genre: "",
  status: "unread",
  tags: [],
  file: null,
};

const BookFormModal = ({
  open,
  onClose,
  mode = "add",
  book = null,
  onSuccess,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isbn, setIsbn] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && book) {
        setForm({
          title: book.title || "",
          author: book.author || "",
          description: book.description || "",
          coverUrl: book.coverUrl || "",
          year: book.year || "",
          genre: book.genre || "",
          status: book.status || "unread",
          tags: Array.isArray(book.tags) ? book.tags : [],
          file: null,
        });
      } else {
        setForm(emptyForm);
        setIsbn("");
      }
    }
  }, [open, mode, book]);

  // ADVANCED FEATURE: Auto-fill via Google Books API
  const handleISBNSearch = async () => {
    if (!isbn) return;
    setFetching(true);
    try {
      const res = await axiosInstance.get(`/google-books/isbn/${isbn}`);
      if (res.data.totalItems > 0) {
        const info = res.data.items[0].volumeInfo;
        setForm((prev) => ({
          ...prev,
          title: info.title || "Untitled",
          author: info.authors ? info.authors.join(", ") : "Unknown",
          description: info.description || prev.description,
          coverUrl: info.imageLinks?.thumbnail || prev.coverUrl,
          year: info.publishedDate
            ? info.publishedDate.split("-")[0]
            : prev.year,
          genre: info.categories ? info.categories[0] : prev.genre,
        }));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Data Handled!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire("Not Found", "No book found with this ISBN.", "info");
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let coverUrl = form.coverUrl;

      if (form.file) {
        const fd = new FormData();
        fd.append("cover", form.file);
        const uploadRes = await axiosInstance.post(
          "/books/upload-image",
          fd,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        coverUrl = uploadRes.data.url;
      }

      const payload = { ...form, coverUrl };
      delete payload.file;

      if (mode === "edit") {
        await axiosInstance.put(`/books/${book._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axiosInstance.post("/books/add", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Swal.fire({
        icon: "success",
        title: mode === "edit" ? "Book Updated" : "Book Added",
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Submission failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="body">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#5B4636",
          color: "white",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontFamily: "Playfair Display", fontWeight: 700 }}
        >
          {mode === "edit" ? "Edit Volume Details" : "Catalog New Book"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, bgcolor: "#FCF9F5" }}>
        {mode === "add" && (
          <Box
            sx={{
              mt: 2,
              mb: 4,
              p: 2,
              border: "1px dashed #CBBBA0",
              borderRadius: "12px",
              bgcolor: "white",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#8B735B" }}
            >
              MAGIC AUTO-FILL (ISBN)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter 10 or 13 digit ISBN..."
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleISBNSearch}
                disabled={fetching}
                startIcon={
                  fetching ? <CircularProgress size={20} /> : <AutoFixHigh />
                }
                sx={{ bgcolor: "#8B735B", "&:hover": { bgcolor: "#5B4636" } }}
              >
                Fetch
              </Button>
            </Box>
          </Box>
        )}

        <Grid container spacing={3} sx={{ pt: 4 }}>
          {/* Left Side: Basic Info */}
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="Book Title"
              name="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Author(s)"
              name="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Genre"
                name="genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
              <TextField
                fullWidth
                select
                label="Reading Status"
                name="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="reading">Reading</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Box>
          </Grid>

          {/* Right Side: Visuals & Tags */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Book Cover
            </Typography>
            <UploadBox
              file={form.file}
              setFile={(file) => setForm({ ...form, file })}
            />

            <TextField
              fullWidth
              size="small"
              label="Or Image URL"
              name="coverUrl"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              sx={{ mt: 2, mb: 2 }}
            />

            <TextField
              fullWidth
              label="Release Year"
              name="year"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Tags (Comma Separated)"
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value.split(",").map((t) => t.trim()),
                })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, bgcolor: "#FCF9F5", borderTop: "1px solid #E3D5C3" }}
      >
        <Button onClick={onClose} disabled={loading} sx={{ color: "#8B735B" }}>
          Discard
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ bgcolor: "#5B4636", px: 6, py: 1, borderRadius: "10px" }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === "edit" ? (
            "Update Volume"
          ) : (
            "Save to Library"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookFormModal;
