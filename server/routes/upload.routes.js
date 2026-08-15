const express = require('express');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/upload
 * Protected endpoint for uploading images (photo, thumbnail, gallery)
 */
router.post('/upload', requireAuth, (req, res) => {
  const uploader = upload.single('file');

  uploader(req, res, function (err) {
    if (err) {
      console.error('File upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Relative path for web serving
    const relativeUrl = `uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: relativeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

module.exports = router;
