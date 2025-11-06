/**
 * Teams Management Routes
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TeamStore } from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All team routes require authentication
router.use(authenticate);

/**
 * GET /teams
 * Get all teams
 */
router.get('/', async (req, res) => {
  try {
    const teams = TeamStore.findAll();
    res.json(teams);
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /teams
 * Create a new team
 */
router.post('/', requireRole('creative_director'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = {
      id: uuidv4(),
      name,
      description: description || null,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = TeamStore.create(team);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /teams/:id
 * Get team details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /teams/:id
 * Update team details
 */
router.patch('/:id', requireRole('creative_director'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const updated = TeamStore.update(id, updates);

    res.json(updated);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /teams/:id
 * Delete a team
 */
router.delete('/:id', requireRole('creative_director'), async (req, res) => {
  try {
    const { id } = req.params;

    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    TeamStore.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /teams/:id/members
 * Add a member to a team
 */
router.post('/:id/members', requireRole('creative_director'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!['Designer', 'Art Director'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "Designer" or "Art Director"' });
    }

    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if member already exists
    if (team.members.some(m => m.email === email)) {
      return res.status(400).json({ error: 'Member already exists in team' });
    }

    const member = {
      email,
      name: name || email,
      role
    };

    const updated = TeamStore.update(id, {
      members: [...team.members, member]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /teams/:id/members/:email
 * Update member role
 */
router.patch('/:id/members/:email', requireRole('creative_director'), async (req, res) => {
  try {
    const { id, email } = req.params;
    const { role } = req.body;

    if (!['Designer', 'Art Director'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "Designer" or "Art Director"' });
    }

    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const memberIndex = team.members.findIndex(m => m.email === email);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMembers = [...team.members];
    updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], role };

    const updated = TeamStore.update(id, {
      members: updatedMembers
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /teams/:id/members/:email
 * Remove a member from a team
 */
router.delete('/:id/members/:email', requireRole('creative_director'), async (req, res) => {
  try {
    const { id, email } = req.params;

    const team = TeamStore.findById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const memberIndex = team.members.findIndex(m => m.email === email);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMembers = [...team.members];
    updatedMembers.splice(memberIndex, 1);

    const updated = TeamStore.update(id, {
      members: updatedMembers
    });

    res.json(updated);
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

