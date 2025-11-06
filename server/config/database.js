/**
 * Database Models and Storage
 * 
 * Currently using in-memory storage.
 * Can be easily replaced with a real database (PostgreSQL, MongoDB, etc.)
 */

// In-memory data stores
let reviews = new Map();
let comments = new Map();
let teams = new Map();
let users = new Map();

// Initialize default data
const initializeDefaultData = () => {
  // Default users
  const defaultUsers = [
    { id: '1', email: 'sarah.johnson@example.com', name: 'Sarah Johnson', role: 'designer' },
    { id: '2', email: 'john.doe@example.com', name: 'John Doe', role: 'client' },
    { id: '3', email: 'art.director@example.com', name: 'Art Director', role: 'art_director' },
    { id: '4', email: 'creative.director@example.com', name: 'Creative Director', role: 'creative_director' }
  ];

  defaultUsers.forEach(user => {
    users.set(user.id, user);
    users.set(user.email, user); // Also index by email
  });

  // Default teams
  const defaultTeams = [
    {
      id: 'team-1',
      name: 'Design Team Alpha',
      description: 'Primary design team',
      members: [
        { email: 'sarah.johnson@example.com', name: 'Sarah Johnson', role: 'Designer' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  defaultTeams.forEach(team => {
    teams.set(team.id, team);
  });
};

// Review model functions
export const ReviewStore = {
  create: (review) => {
    reviews.set(review.id, review);
    return review;
  },

  findById: (id) => {
    return reviews.get(id);
  },

  findAll: () => {
    return Array.from(reviews.values());
  },

  update: (id, updates) => {
    const review = reviews.get(id);
    if (!review) return null;
    
    const updated = { ...review, ...updates, updatedAt: new Date().toISOString() };
    reviews.set(id, updated);
    return updated;
  },

  delete: (id) => {
    return reviews.delete(id);
  },

  findByDesignerEmail: (email) => {
    return Array.from(reviews.values()).filter(r => r.designerEmail === email);
  },

  findByTeamId: (teamId) => {
    return Array.from(reviews.values()).filter(r => r.teamId === teamId);
  }
};

// Comment model functions
export const CommentStore = {
  create: (comment) => {
    comments.set(comment.id, comment);
    return comment;
  },

  findById: (id) => {
    return comments.get(id);
  },

  findByReviewId: (reviewId, versionId = null) => {
    let commentList = Array.from(comments.values()).filter(c => c.reviewId === reviewId);
    if (versionId) {
      commentList = commentList.filter(c => c.version === versionId);
    }
    return commentList;
  },

  update: (id, updates) => {
    const comment = comments.get(id);
    if (!comment) return null;
    
    const updated = { ...comment, ...updates };
    comments.set(id, updated);
    return updated;
  },

  delete: (id) => {
    return comments.delete(id);
  }
};

// Team model functions
export const TeamStore = {
  create: (team) => {
    teams.set(team.id, team);
    return team;
  },

  findById: (id) => {
    return teams.get(id);
  },

  findAll: () => {
    return Array.from(teams.values());
  },

  update: (id, updates) => {
    const team = teams.get(id);
    if (!team) return null;
    
    const updated = { ...team, ...updates, updatedAt: new Date().toISOString() };
    teams.set(id, updated);
    return updated;
  },

  delete: (id) => {
    return teams.delete(id);
  }
};

// User model functions
export const UserStore = {
  findById: (id) => {
    return users.get(id);
  },

  findByEmail: (email) => {
    return users.get(email);
  }
};

// Initialize on module load
initializeDefaultData();

// Export initialized flag for testing
export const isInitialized = true;

