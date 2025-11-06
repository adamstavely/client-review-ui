/**
 * Upload & Creation Routes
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReviewStore } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = express.Router();

/**
 * POST /upload
 * Create a new review from file upload
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { filename, password, bypassClientReview, sharingMode, approvedEmails } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const reviewId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

    const review = {
      id: reviewId,
      filename,
      password: password || null,
      designer: req.user.name || req.user.email,
      designerEmail: req.user.email,
      teamId: req.user.teamId || null,
      workflowState: bypassClientReview ? 'art_director_review' : 'draft',
      workflowHistory: [
        {
          stage: bypassClientReview ? 'art_director_review' : 'draft',
          action: bypassClientReview ? 'bypassed_client_review' : 'uploaded',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ],
      versions: [],
      expiresAt: expiresAt.toISOString(),
      extended: false,
      completed: false,
      sharingMode: sharingMode || 'anyone',
      approvedEmails: approvedEmails || [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ReviewStore.create(review);

    // Generate presigned URL for S3 upload (mock for now)
    // In production, this would generate a real S3 presigned URL
    const uploadUrl = `/api/upload/${reviewId}`;

    res.json({
      uploadUrl,
      reviewId
    });
  } catch (error) {
    console.error('Error creating review from upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /upload/:reviewId
 * Handle file upload to presigned URL
 */
router.put('/:reviewId', upload.single('file'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const review = ReviewStore.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Add version to review
    const version = {
      id: uuidv4(),
      label: 'Version 1',
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      uploadedAt: new Date().toISOString(),
      uploadedBy: review.designerEmail
    };

    const updated = ReviewStore.update(reviewId, {
      versions: [...review.versions, version],
      filename: file.originalname
    });

    res.json({ success: true, review: updated });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/create-from-url
 * Create a new review from external URL
 */
router.post('/create-from-url', authenticate, async (req, res) => {
  try {
    const { url, password, bypassClientReview, sharingMode, approvedEmails } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const reviewId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

    const review = {
      id: reviewId,
      filename: url,
      password: password || null,
      designer: req.user.name || req.user.email,
      designerEmail: req.user.email,
      teamId: req.user.teamId || null,
      workflowState: bypassClientReview ? 'art_director_review' : 'draft',
      workflowHistory: [
        {
          stage: bypassClientReview ? 'art_director_review' : 'draft',
          action: bypassClientReview ? 'bypassed_client_review' : 'created_from_url',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ],
      versions: [
        {
          id: uuidv4(),
          label: 'Version 1',
          url: url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user.email
        }
      ],
      expiresAt: expiresAt.toISOString(),
      extended: false,
      completed: false,
      sharingMode: sharingMode || 'anyone',
      approvedEmails: approvedEmails || [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ReviewStore.create(review);

    res.json({ reviewId });
  } catch (error) {
    console.error('Error creating review from URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

