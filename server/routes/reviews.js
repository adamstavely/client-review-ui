/**
 * Review Management Routes
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ReviewStore, CommentStore } from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /review/:id
 * Get review details by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check password if review is password-protected
    if (review.password && review.password !== password) {
      return res.status(401).json({ error: 'Unauthorized - incorrect password' });
    }

    // Check sharing settings
    if (review.sharingMode === 'restricted' && req.user) {
      if (!review.approvedEmails.includes(req.user.email)) {
        return res.status(403).json({ error: 'Access denied - not in approved emails list' });
      }
    }

    // Get comments for this review
    const reviewComments = CommentStore.findByReviewId(id);

    res.json({
      ...review,
      comments: reviewComments
    });
  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /review/:id/version/:versionId
 * Get version URL by version ID
 */
router.get('/:id/version/:versionId', authenticate, async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const version = review.versions.find(v => v.id === versionId);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ url: version.url });
  } catch (error) {
    console.error('Error getting version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/complete
 * Mark review as complete and deactivate the link
 */
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can mark as complete
    if (review.designerEmail !== req.user.email && req.user.role !== 'creative_director') {
      return res.status(403).json({ error: 'Only the designer or creative director can mark review as complete' });
    }

    // Update review
    const updated = ReviewStore.update(id, {
      completed: true,
      expiresAt: new Date().toISOString(), // Deactivate immediately
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'completed',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error completing review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/sharing
 * Update sharing settings for a review
 */
router.post('/:id/sharing', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { sharingMode, approvedEmails } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can update sharing settings
    if (review.designerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Only the designer can update sharing settings' });
    }

    if (!['anyone', 'restricted'].includes(sharingMode)) {
      return res.status(400).json({ error: 'Invalid sharingMode. Must be "anyone" or "restricted"' });
    }

    // Update review
    const updated = ReviewStore.update(id, {
      sharingMode,
      approvedEmails: approvedEmails || [],
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'sharing_changed',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating sharing settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

