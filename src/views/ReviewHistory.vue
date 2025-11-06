<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
        <div class="flex items-center gap-3">
          <svg class="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Review History</h1>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">View your completed and archived review requests</p>
      </div>
      
      <div class="p-8">
        <div v-if="completedReviews.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-2">No completed reviews yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Completed reviews will appear here for reference</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="link in completedReviews"
            :key="link.id"
            @click="handleCardClick(link, $event)"
            class="flex items-start justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ link.filename }}</h3>
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <v-chip
                    :color="getWorkflowColor(link.completed ? 'completed' : (link.workflowState || 'approved'))"
                    size="small"
                    class="font-medium"
                  >
                    {{ getWorkflowLabel(link.completed ? 'completed' : (link.workflowState || 'approved')) }}
                  </v-chip>
                  <span class="text-xs text-gray-500 dark:text-gray-400">|</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ getVersionCount(link) }}</span>
                  <span v-if="link.password" class="text-xs text-gray-500 dark:text-gray-400">|</span>
                  <span v-if="link.password" class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password required
                  </span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap flex-shrink-0">✓ Completed</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">|</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">Completed: {{ formatDate(link.completedAt) }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click.stop="handleViewReview(link)"
                class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                View Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews, getCurrentUser, getFilteredReviews } from '@/mockData.js';

const $router = useRouter();

// Get current user info
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');
const currentUserEmail = ref(localStorage.getItem('currentUserEmail') || 'sarah@example.com');
const currentUserTeamId = ref(localStorage.getItem('currentUserTeamId') || 'team-1');

const getStoredRole = () => {
  const storedRole = localStorage.getItem('userRole');
  const storedEmail = localStorage.getItem('currentUserEmail') || 'sarah@example.com';
  const storedName = localStorage.getItem('currentDesigner') || 'Sarah Johnson';
  
  if (storedEmail === 'sarah@example.com' || storedName === 'Sarah Johnson') {
    return 'designer';
  }
  
  return storedRole || 'designer';
};

const currentUserRole = ref(getStoredRole());

// Load completed reviews
const completedReviews = ref([]);

const loadCompletedReviews = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Get all reviews and filter for completed ones
      let allReviews = [];
      
      if (currentUserRole.value === 'creative_director') {
        // Creative Director sees all completed reviews
        allReviews = mockReviews.filter(r => r.completed);
      } else if (currentUserRole.value === 'art_director') {
        // Art Director sees completed reviews in their team
        allReviews = mockReviews.filter(r => r.completed && r.teamId === currentUserTeamId.value);
      } else if (currentUserRole.value === 'designer') {
        // Designer sees only their own completed reviews
        allReviews = mockReviews.filter(r => 
          r.completed && 
          (r.designerEmail === currentUserEmail.value || r.designer === currentUser.value)
        );
      }
      
      // Convert reviews to link format
      completedReviews.value = allReviews.map(review => {
        // Find completion date from workflow history
        const completedEntry = review.workflowHistory?.find(h => h.action === 'completed');
        const completedAt = completedEntry?.timestamp || review.expiresAt;
        
        return {
          id: review.id,
          reviewId: review.id,
          filename: review.filename,
          description: `${review.versions.length} versions available`,
          url: `/review/${review.id}`,
          expiresAt: review.expiresAt,
          completedAt: completedAt,
          designer: review.designer,
          password: review.password,
          completed: true,
          workflowState: review.workflowState
        };
      }).sort((a, b) => {
        // Sort by completion date, most recent first
        return new Date(b.completedAt) - new Date(a.completedAt);
      });
    } else {
      // In real app, would call API endpoint
      // const res = await fetch('/api/reviews/completed');
      // completedReviews.value = await res.json();
    }
  } catch (error) {
    console.error('Failed to load completed reviews:', error);
    completedReviews.value = [];
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get workflow color
const getWorkflowColor = (state) => {
  const colors = {
    'draft': 'gray',
    'client_review': 'blue',
    'client_approved': 'light-blue',
    'art_director_review': 'purple',
    'art_director_approved': 'purple',
    'ad_changes_requested': 'orange',
    'creative_director_review': 'indigo',
    'cd_changes_requested': 'orange',
    'approved': 'green',
    'completed': 'green'
  };
  return colors[state] || 'gray';
};

// Get workflow label
const getWorkflowLabel = (state) => {
  const labels = {
    'draft': 'Draft',
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'Art Director Review',
    'art_director_approved': 'Art Director Approved',
    'ad_changes_requested': 'AD Changes Requested',
    'creative_director_review': 'Creative Director Review',
    'cd_changes_requested': 'CD Changes Requested',
    'approved': 'Approved',
    'completed': 'Completed'
  };
  return labels[state] || 'Unknown';
};

// Get version count text
const getVersionCount = (link) => {
  const review = mockReviews.find(r => r.id === link.reviewId);
  if (review) {
    return `${review.versions.length} version${review.versions.length !== 1 ? 's' : ''}`;
  }
  return '0 versions';
};

// Handle card click
const handleCardClick = (link, event) => {
  // Don't navigate if clicking on a button
  if (event.target.closest('button')) {
    return;
  }
  $router.push(`/review/${link.reviewId}`);
};

// Handle view review button
const handleViewReview = (link) => {
  $router.push(`/review/${link.reviewId}`);
};

onMounted(() => {
  loadCompletedReviews();
});
</script>

<style scoped>
/* Additional styles if needed */
</style>

