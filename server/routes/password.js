/**
 * Password & Expiration Management Routes
 */

import express from 'express';
import { ReviewStore } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /review/:id/password
 * Update or remove password for a review
 */
router.post('/:id/password', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can update password
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can update password' });
    }

    const action = password ? 'password_set' : 'password_removed';

    const updated = ReviewStore.update(id, {
      password: password || null,
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action,
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/extend
 * Extend review expiration
 */
router.post('/:id/extend', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can extend expiration
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can extend expiration' });
    }

    const extensionDays = days || 30; // Default 30 days
    const expiresAt = new Date(review.expiresAt);
    expiresAt.setDate(expiresAt.getDate() + extensionDays);

    const updated = ReviewStore.update(id, {
      expiresAt: expiresAt.toISOString(),
      extended: true,
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'extended',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString(),
          days: extensionDays
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error extending expiration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

