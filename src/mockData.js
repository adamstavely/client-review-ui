// Mock data and API simulation for testing without backend

let mockReviews = [
  {
    id: 'review-1',
    filename: 'Website Design v2.pdf',
    password: null,
    designer: 'Sarah Johnson',
    completed: false,
    versions: [
      { id: 'v1', label: 'Version 1 - Initial Design', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Version 2 - Updated Layout', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v3', label: 'Version 3 - Final Design', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    comments: [
      {
        id: 'comment-1',
        text: 'The header looks great! I love the new typography.',
        type: 'approval',
        author: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        version: 'v3',
        resolved: false,
        replies: [
          {
            id: 'reply-1',
            text: 'Thanks! We spent a lot of time getting the font pairing just right.',
            author: 'Design Team',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'comment-2',
        text: 'Could we make the navigation menu more prominent? It feels a bit hidden.',
        type: 'suggestion',
        author: 'Mike Chen',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        version: 'v2',
        resolved: false,
        replies: []
      }
    ]
  },
  {
    id: 'review-2',
    filename: 'Mobile App Wireframes.sketch',
    password: 'design123',
    designer: 'Mike Chen',
    completed: false,
    versions: [
      { id: 'v1', label: 'Initial Wireframes', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Updated User Flow', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    comments: [
      {
        id: 'comment-3',
        text: 'The login flow is confusing. Users might get lost here.',
        type: 'bug',
        author: 'Alex Rodriguez',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        version: 'v1',
        resolved: true,
        replies: [
          {
            id: 'reply-2',
            text: 'Good catch! We\'ve simplified this in v2.',
            author: 'Design Team',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'review-3',
    filename: 'Brand Guidelines.ai',
    password: 'brand2024',
    designer: 'Alex Rodriguez',
    completed: false,
    versions: [
      { id: 'v1', label: 'Logo Concepts', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Color Palette', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v3', label: 'Typography Guide', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v4', label: 'Final Guidelines', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    extended: true,
    comments: [
      {
        id: 'comment-4',
        text: 'Perfect! This is exactly what we were looking for. Approved for final production.',
        type: 'approval',
        author: 'Jennifer Walsh',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        version: 'v4',
        resolved: true,
        replies: []
      }
    ]
  }
];

let mockAdminLinks = [
  {
    id: 'admin-1',
    filename: 'Website Design v2.pdf',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    hasPassword: false,
    designer: 'Sarah Johnson'
  },
  {
    id: 'admin-2', 
    filename: 'Mobile App Wireframes.sketch',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    hasPassword: true,
    designer: 'Mike Chen'
  },
  {
    id: 'admin-3',
    filename: 'Brand Guidelines.ai', 
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    extended: true,
    hasPassword: true,
    designer: 'Alex Rodriguez'
  }
];

export { mockReviews };

// Mock API functions
export const mockAPI = {
  // Upload simulation
  upload: async (filename, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
    
    const newReview = {
      id: `review-${Date.now()}`,
      filename: filename,
      password: password || null,
      designer: 'Designer', // In real app, this would come from auth
      versions: [
        { 
          id: 'v1', 
          label: 'Version 1', 
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
        }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      extended: false
    };
    
    mockReviews.push(newReview);
    mockAdminLinks.push({
      id: `admin-${newReview.id}`,
      filename: newReview.filename,
      expiresAt: newReview.expiresAt,
      extended: newReview.extended,
      hasPassword: !!newReview.password,
      designer: newReview.designer
    });
    
    return { uploadUrl: 'mock://upload', reviewId: newReview.id };
  },

  // Get review data
  getReview: async (reviewId, password = null) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    if (review.password && review.password !== password) {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      throw error;
    }
    
    return review;
  },

  // Get version URL
  getVersion: async (reviewId, versionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    const version = review.versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error('Version not found');
    }
    
    return { url: version.url };
  },

  // Admin functions
  getAdminLinks: async (showExpired = false) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let links = showExpired ? mockAdminLinks : mockAdminLinks.filter(link => {
      const now = new Date();
      return new Date(link.expiresAt) > now;
    });
    
    // Ensure password info and designer info are synced from reviews
    return links.map(link => {
      const review = mockReviews.find(r => r.filename === link.filename);
      return {
        ...link,
        hasPassword: review ? !!review.password : link.hasPassword || false,
        designer: review ? review.designer : link.designer || 'Unknown'
      };
    });
  },

  extendLink: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const link = mockAdminLinks.find(l => l.id === id);
    if (link) {
      link.extended = true;
      link.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  },

  overrideLink: async (id, days) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const link = mockAdminLinks.find(l => l.id === id);
    if (link) {
      link.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
  },

  deleteLink: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const linkIndex = mockAdminLinks.findIndex(l => l.id === id);
    if (linkIndex !== -1) {
      mockAdminLinks.splice(linkIndex, 1);
    }
  },

  batchDelete: async (ids) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    mockAdminLinks = mockAdminLinks.filter(link => !ids.includes(link.id));
  },

  resetPassword: async (id, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the corresponding review by admin link ID
    const adminLink = mockAdminLinks.find(l => l.id === id);
    if (adminLink) {
      const review = mockReviews.find(r => r.filename === adminLink.filename);
      if (review) {
        review.password = newPassword || null;
        adminLink.hasPassword = !!newPassword;
      }
    }
  },

  // Comment functions
  getComments: async (reviewId, versionId = null) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review || !review.comments) {
      return [];
    }
    
    let comments = review.comments;
    if (versionId) {
      comments = comments.filter(c => c.version === versionId);
    }
    
    return comments;
  },

  addComment: async (reviewId, comment) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review) {
      if (!review.comments) {
        review.comments = [];
      }
      review.comments.push(comment);
    }
    
    return comment;
  },

  addReply: async (reviewId, commentId, reply) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment) {
        if (!comment.replies) {
          comment.replies = [];
        }
        comment.replies.push(reply);
      }
    }
    
    return reply;
  },

  updateComment: async (reviewId, commentId, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment) {
        Object.assign(comment, updates);
      }
    }
  },

  // Version upload functions
  uploadVersion: async (reviewId, filename, label, notes, type) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Generate new version ID
    const versionNumber = review.versions.length + 1;
    const newVersion = {
      id: `v${versionNumber}`,
      label: label,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock URL
      filename: filename,
      notes: notes,
      type: type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Designer' // In real app, this would come from auth
    };
    
    review.versions.push(newVersion);
    
    return newVersion;
  }
};

// Check if we're in mock mode (when API is not available)
export const isMockMode = async () => {
  // Force mock mode if explicitly set
  if (localStorage.getItem('forceMockMode') === 'true') {
    return true;
  }
  
  // Check if user wants to use real API
  if (localStorage.getItem('useRealAPI') === 'true') {
    // Only try to ping API if user explicitly enabled it
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      if (response.ok) {
        return false; // API is available
      }
    } catch (error) {
      // CORS error or network error - use mock mode
      console.log('API not available or CORS error, using mock mode');
      return true;
    }
  }
  
  // Default to mock mode to avoid unnecessary API calls
  return true;
};
