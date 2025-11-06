/**
 * Admin Routes
 */

import express from 'express';
import { ReviewStore } from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('creative_director')); // Or add 'admin' role

/**
 * GET /admin/reviews
 * Get all reviews for admin dashboard
 */
router.get('/reviews', async (req, res) => {
  try {
    const { showExpired } = req.query;

    let reviews = ReviewStore.findAll();

    if (showExpired !== 'true') {
      const now = new Date();
      reviews = reviews.filter(review => new Date(review.expiresAt) > now);
    }

    // Format for admin dashboard (summary view)
    const summaries = reviews.map(review => ({
      id: review.id,
      filename: review.filename,
      designer: review.designer,
      designerEmail: review.designerEmail,
      workflowState: review.workflowState,
      expiresAt: review.expiresAt,
      extended: review.extended,
      completed: review.completed,
      createdAt: review.createdAt
    }));

    res.json(summaries);
  } catch (error) {
    console.error('Error getting admin reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/reviews/:id/extend
 * Extend review expiration (admin action)
 */
router.post('/reviews/:id/extend', async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.query;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const extensionDays = parseInt(days) || 7;
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
    console.error('Error extending review (admin):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/reviews/:id/reactivate
 * Reactivate an expired review link
 */
router.post('/reviews/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Reactivate for 7 days

    const updated = ReviewStore.update(id, {
      expiresAt: expiresAt.toISOString(),
      extended: false,
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'extended',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString(),
          days: 7
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error reactivating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /admin/reviews/:id
 * Delete a review (admin action)
 */
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    ReviewStore.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

