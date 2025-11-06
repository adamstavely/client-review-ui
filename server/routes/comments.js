/**
 * Comments Routes
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CommentStore, ReviewStore } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /review/:id/comments
 * Get all comments for a review
 */
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { versionId } = req.query;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comments = CommentStore.findByReviewId(id, versionId);

    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/comments
 * Add a new comment
 */
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, version, type, resolved } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = {
      id: uuidv4(),
      reviewId: id,
      text,
      author: req.user.name || req.user.email,
      authorRole: req.user.role || 'client',
      timestamp: new Date().toISOString(),
      version: version || null,
      type: type || null,
      resolved: resolved || false,
      reactions: [],
      replies: []
    };

    const created = CommentStore.create(comment);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /review/:id/comments/:commentId
 * Update a comment
 */
router.patch('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const updates = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comment = CommentStore.findById(commentId);

    if (!comment || comment.reviewId !== id) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author or designer can update
    if (comment.author !== req.user.email && review.designerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    const updated = CommentStore.update(commentId, updates);

    res.json(updated);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/comments/:commentId/replies
 * Add a reply to a comment
 */
router.post('/:id/comments/:commentId/replies', authenticate, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comment = CommentStore.findById(commentId);

    if (!comment || comment.reviewId !== id) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const reply = {
      id: uuidv4(),
      text,
      author: req.user.name || req.user.email,
      authorRole: req.user.role || 'client',
      timestamp: new Date().toISOString(),
      reactions: []
    };

    const updated = CommentStore.update(commentId, {
      replies: [...(comment.replies || []), reply]
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/comments/:commentId/reactions
 * Toggle emoji reaction on a comment
 */
router.post('/:id/comments/:commentId/reactions', authenticate, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { emoji } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comment = CommentStore.findById(commentId);

    if (!comment || comment.reviewId !== id) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const userEmail = req.user.email;
    const reactions = comment.reactions || [];

    // Check if user already has this emoji reaction
    const existingIndex = reactions.findIndex(
      r => r.user === userEmail && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      // Remove reaction
      reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      reactions.push({
        user: userEmail,
        emoji,
        timestamp: new Date().toISOString()
      });
    }

    const updated = CommentStore.update(commentId, { reactions });

    res.json(updated);
  } catch (error) {
    console.error('Error updating comment reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/comments/:commentId/replies/:replyId/reactions
 * Toggle emoji reaction on a reply
 */
router.post('/:id/comments/:commentId/replies/:replyId/reactions', authenticate, async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { emoji } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const comment = CommentStore.findById(commentId);

    if (!comment || comment.reviewId !== id) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies?.find(r => r.id === replyId);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const userEmail = req.user.email;
    const reactions = reply.reactions || [];

    // Check if user already has this emoji reaction
    const existingIndex = reactions.findIndex(
      r => r.user === userEmail && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      // Remove reaction
      reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      reactions.push({
        user: userEmail,
        emoji,
        timestamp: new Date().toISOString()
      });
    }

    // Update reply in comment
    const updatedReplies = comment.replies.map(r => 
      r.id === replyId ? { ...r, reactions } : r
    );

    const updated = CommentStore.update(commentId, { replies: updatedReplies });

    res.json(reply);
  } catch (error) {
    console.error('Error updating reply reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

