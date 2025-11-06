/**
 * Workflow Management Routes
 */

import express from 'express';
import { ReviewStore } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /review/:id/workflow/approve
 * Approve a workflow stage
 */
router.post('/:id/workflow/approve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Validate stage
    const validStages = ['client_review', 'art_director_review', 'creative_director_review'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    // Verify user has permission for this stage
    if (stage === 'client_review' && req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can approve client review' });
    }
    if (stage === 'art_director_review' && req.user.role !== 'art_director') {
      return res.status(403).json({ error: 'Only art directors can approve art director review' });
    }
    if (stage === 'creative_director_review' && req.user.role !== 'creative_director') {
      return res.status(403).json({ error: 'Only creative directors can approve creative director review' });
    }

    let newState = review.workflowState;
    let historyEntry = {
      stage: review.workflowState,
      action: 'approved',
      user: req.user.name || req.user.email,
      timestamp: new Date().toISOString()
    };

    // Apply workflow logic
    if (stage === 'client_review' && review.workflowState === 'client_review') {
      newState = 'client_approved';
    } else if (stage === 'art_director_review' && review.workflowState === 'art_director_review') {
      newState = 'art_director_approved';
      // Auto-advance to creative director review
      const updated = ReviewStore.update(id, {
        workflowState: 'art_director_approved',
        workflowHistory: [...review.workflowHistory, historyEntry]
      });

      // Immediately transition to creative director review
      const finalUpdated = ReviewStore.update(id, {
        workflowState: 'creative_director_review',
        workflowHistory: [
          ...updated.workflowHistory,
          {
            stage: 'art_director_approved',
            action: 'moved_to_review',
            user: 'System',
            timestamp: new Date().toISOString()
          }
        ]
      });

      return res.json(finalUpdated);
    } else if (stage === 'creative_director_review' && review.workflowState === 'creative_director_review') {
      newState = 'approved';
    } else {
      return res.status(400).json({ error: 'Invalid workflow state transition' });
    }

    const updated = ReviewStore.update(id, {
      workflowState: newState,
      workflowHistory: [...review.workflowHistory, historyEntry]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error approving workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/workflow/reject
 * Reject a workflow stage (request changes)
 */
router.post('/:id/workflow/reject', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, reason } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Validate stage
    const validStages = ['client_review', 'art_director_review', 'creative_director_review'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    // Verify user has permission for this stage
    if (stage === 'art_director_review' && req.user.role !== 'art_director') {
      return res.status(403).json({ error: 'Only art directors can reject art director review' });
    }
    if (stage === 'creative_director_review' && req.user.role !== 'creative_director') {
      return res.status(403).json({ error: 'Only creative directors can reject creative director review' });
    }

    let newState = review.workflowState;
    let historyEntry = {
      stage: review.workflowState,
      action: 'rejected',
      user: req.user.name || req.user.email,
      timestamp: new Date().toISOString(),
      reason: reason || null
    };

    // Apply workflow logic
    if (stage === 'client_review') {
      // Client rejection keeps it in client_review
      newState = 'client_review';
    } else if (stage === 'art_director_review' && review.workflowState === 'art_director_review') {
      newState = 'ad_changes_requested';
    } else if (stage === 'creative_director_review' && review.workflowState === 'creative_director_review') {
      newState = 'cd_changes_requested';
    } else {
      return res.status(400).json({ error: 'Invalid workflow state transition' });
    }

    const updated = ReviewStore.update(id, {
      workflowState: newState,
      workflowHistory: [...review.workflowHistory, historyEntry]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error rejecting workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/workflow/move-to-client-review
 * Move review from draft to client review
 */
router.post('/:id/workflow/move-to-client-review', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can move to client review
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can move review to client review' });
    }

    if (review.workflowState !== 'draft') {
      return res.status(400).json({ error: 'Can only move from draft to client review' });
    }

    const updated = ReviewStore.update(id, {
      workflowState: 'client_review',
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: 'draft',
          action: 'moved_to_review',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error moving to client review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/workflow/move-to-art-director-review
 * Move review from client approved to art director review
 */
router.post('/:id/workflow/move-to-art-director-review', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can request art director review
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can request art director review' });
    }

    if (review.workflowState !== 'client_approved') {
      return res.status(400).json({ error: 'Can only move from client_approved to art director review' });
    }

    const updated = ReviewStore.update(id, {
      workflowState: 'art_director_review',
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: 'client_approved',
          action: 'moved_to_review',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error moving to art director review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /review/:id/workflow/resubmit
 * Resubmit review after changes requested
 */
router.post('/:id/workflow/resubmit', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStage } = req.body;

    const review = ReviewStore.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only designer can resubmit
    if (review.designerEmail !== req.user.email && req.user.role !== 'designer') {
      return res.status(403).json({ error: 'Only the designer can resubmit review' });
    }

    let newState = review.workflowState;
    
    if (review.workflowState === 'ad_changes_requested') {
      newState = 'art_director_review';
    } else if (review.workflowState === 'cd_changes_requested') {
      newState = 'creative_director_review';
    } else {
      return res.status(400).json({ error: 'Can only resubmit from changes_requested states' });
    }

    const updated = ReviewStore.update(id, {
      workflowState: newState,
      workflowHistory: [
        ...review.workflowHistory,
        {
          stage: review.workflowState,
          action: 'resubmitted',
          user: req.user.name || req.user.email,
          timestamp: new Date().toISOString()
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error resubmitting workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

