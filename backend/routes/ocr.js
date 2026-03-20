const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Multer setup: use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Extract text from PDF or Image
// @route   POST /api/ocr/extract
// @access  Protected
router.post("/extract", protect, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Create Form Data to send to Python service
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Forward to NLP Service
    const response = await axios.post(`${process.env.NLP_SERVICE_URL}/extract-text`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("OCR Error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Failed to extract text from document", 
      error: error.response?.data?.detail || error.message 
    });
  }
});

module.exports = router;
