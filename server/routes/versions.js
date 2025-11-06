/**
 * Version Management Routes
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { ReviewStore } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = express.Router();

/**
 * POST /review/:id/versions
 * Upload a new version for a review
 */
router.post('/:id/versions', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { label, notes, type } = req.body;
    const file = req.file;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can upload versions
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can upload versions' });
    }

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const version = {
      id: uuidv4(),
      label: label || `Version ${review.versions.length + 1}`,
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      notes: notes || null,
      type: type || null,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.email
    };

    const updated = ReviewStore.update(id, {
      versions: [...review.versions, version],
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'version_uploaded',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString(),
          versionLabel: version.label
        }
      ]
    });

    res.json(version);
  } catch (error) {
    console.error('Error uploading version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

