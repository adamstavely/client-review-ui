<template>
  <div class="space-y-6">
    <!-- Kanban Board Container -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Kanban Board</h2>
          </div>
          
          <!-- Filters (for Creative Director) -->
          <div v-if="currentUserRole === 'creative_director'" class="flex items-center gap-4">
            <v-select
              v-model="selectedTeamFilter"
              :items="teamFilterOptions"
              label="Filter by Team"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 200px;"
              clearable
            />
            <v-checkbox
              v-model="showOnlyAssigned"
              label="Only Assigned to Me"
              density="compact"
              hide-details
            />
          </div>
        </div>
      </div>

      <!-- Kanban Board Columns -->
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style="min-height: calc(100vh - 400px);">
          <!-- In Work Column -->
          <div class="flex flex-col">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
              <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-indigo-600/10 dark:bg-indigo-600/20">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">In Work</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ getColumnCount('in_work') }} items</p>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <div
                  v-for="review in getColumnItems('in_work')"
                  :key="review.id"
                  @click="goToReview(review.id)"
                  class="bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-gray-300 dark:border-slate-500 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate mb-2">{{ review.filename }}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <span>{{ review.designer }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs mt-auto">
                    <span class="text-gray-500 dark:text-gray-400">{{ formatDate(review.expiresAt) }}</span>
                    <div class="flex items-center gap-2">
                      <span v-if="review.password" class="text-gray-400 dark:text-gray-500">
                        <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                        {{ getStatusLabel(review.workflowState) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="getColumnItems('in_work').length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No items
                </div>
              </div>
            </div>
          </div>

          <!-- In Review Column -->
          <div class="flex flex-col">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
              <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-indigo-600/10 dark:bg-indigo-600/20">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">In Review</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ getColumnCount('in_review') }} items</p>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <div
                  v-for="review in getColumnItems('in_review')"
                  :key="review.id"
                  @click="goToReview(review.id)"
                  class="bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-gray-300 dark:border-slate-500 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate mb-2">{{ review.filename }}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <span>{{ review.designer }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs mt-auto">
                    <span class="text-gray-500 dark:text-gray-400">{{ formatDate(review.expiresAt) }}</span>
                    <div class="flex items-center gap-2">
                      <span v-if="review.password" class="text-gray-400 dark:text-gray-500">
                        <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                        {{ getStatusLabel(review.workflowState) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="getColumnItems('in_review').length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No items
                </div>
              </div>
            </div>
          </div>

          <!-- Approved & Closed Column -->
          <div class="flex flex-col">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
              <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-indigo-600/10 dark:bg-indigo-600/20">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">Approved & Closed</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ getColumnCount('approved_closed') }} items</p>
              </div>
              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <div
                  v-for="review in getColumnItems('approved_closed')"
                  :key="review.id"
                  @click="goToReview(review.id)"
                  class="bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-gray-300 dark:border-slate-500 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2 truncate">{{ review.filename }}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <span>{{ review.designer }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs mt-auto">
                    <span class="text-gray-500 dark:text-gray-400">{{ formatDate(review.expiresAt) }}</span>
                    <div class="flex items-center gap-2">
                      <span v-if="review.password" class="text-gray-400 dark:text-gray-500">
                        <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                        {{ getStatusLabel(review.workflowState) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="getColumnItems('approved_closed').length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No items
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews, getCurrentUser, getFilteredReviews } from '@/mockData.js';

const router = useRouter();

const reviews = ref([]);
const teams = ref([]);
const currentUser = computed(() => getCurrentUser());
const currentUserRole = computed(() => currentUser.value.role);
const currentUserEmail = computed(() => currentUser.value.email);
const currentUserTeamId = computed(() => currentUser.value.teamId);

// Filters for Creative Director
const selectedTeamFilter = ref(null);
const showOnlyAssigned = ref(false);

// Load reviews and teams
const loadData = async () => {
  try {
    const useMockMode = await isMockMode();
    
    // Load reviews
    if (useMockMode) {
      reviews.value = getFilteredReviews(
        currentUserRole.value,
        currentUserEmail.value,
        currentUserTeamId.value
      );
    } else {
      // In real app, would call API endpoint
      const res = await fetch('/api/reviews');
      reviews.value = await res.json();
    }
    
    // Load teams for filter dropdown
    if (currentUserRole.value === 'creative_director') {
      if (useMockMode) {
        teams.value = await mockAPI.getTeams();
      } else {
        const res = await fetch('/api/teams');
        teams.value = await res.json();
      }
    }
  } catch (error) {
    console.error('Failed to load kanban data:', error);
  }
};

// Team filter options
const teamFilterOptions = computed(() => {
  if (teams.value.length === 0) return [];
  return [
    { title: 'All Teams', value: null },
    ...teams.value.map(team => ({ title: team.name, value: team.id }))
  ];
});

// Filter reviews based on Creative Director filters
const filteredReviews = computed(() => {
  let filtered = reviews.value;
  
  if (currentUserRole.value === 'creative_director') {
    // Apply team filter
    if (selectedTeamFilter.value) {
      filtered = filtered.filter(review => review.teamId === selectedTeamFilter.value);
    }
    
    // Apply "assigned to me" filter
    if (showOnlyAssigned.value) {
      // For now, assume assigned means created by or in user's team
      // In real app, there would be an "assignedTo" field
      filtered = filtered.filter(review => 
        review.designerEmail === currentUserEmail.value ||
        review.designer === currentUser.value.name
      );
    }
  }
  
  return filtered;
});

// Get items for a specific column (grouped by higher-level status)
const getColumnItems = (columnGroup) => {
  if (columnGroup === 'in_work') {
    // In Work: includes draft, ad_changes_requested, cd_changes_requested
    return filteredReviews.value.filter(review => 
      ['draft', 'ad_changes_requested', 'cd_changes_requested'].includes(review.workflowState)
    );
  } else if (columnGroup === 'in_review') {
    // In Review: includes client_review, client_approved, art_director_review, and creative_director_review
    return filteredReviews.value.filter(review => 
      ['client_review', 'client_approved', 'art_director_review', 'creative_director_review'].includes(review.workflowState)
    );
  } else if (columnGroup === 'approved_closed') {
    // Approved & Closed: includes approved state
    return filteredReviews.value.filter(review => review.workflowState === 'approved');
  }
  return [];
};

// Get count for a column
const getColumnCount = (columnGroup) => {
  return getColumnItems(columnGroup).length;
};

// Get status label for badge
const getStatusLabel = (workflowState) => {
  const labels = {
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'AD Review',
    'creative_director_review': 'CD Review',
    'ad_changes_requested': 'AD Changes',
    'cd_changes_requested': 'CD Changes'
  };
  return labels[workflowState] || workflowState;
};

// Get status badge color class
const getStatusBadgeClass = (workflowState) => {
  if (workflowState === 'client_review') {
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
  } else if (workflowState === 'client_approved') {
    return 'bg-light-blue-100 dark:bg-light-blue-900/30 text-light-blue-800 dark:text-light-blue-300 border border-light-blue-200 dark:border-light-blue-700';
  } else if (workflowState === 'art_director_review') {
    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700';
  } else if (workflowState === 'creative_director_review') {
    return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700';
  } else if (workflowState === 'ad_changes_requested') {
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
  } else if (workflowState === 'cd_changes_requested') {
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600';
};

// Navigate to review
const goToReview = (reviewId) => {
  router.push(`/review/${reviewId}`);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    return dateString;
  }
};

onMounted(loadData);
</script>

<style scoped>
/* Ensure columns have equal height and scroll independently */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Ensure grid columns take full height */
.grid > div {
  min-height: calc(100vh - 300px);
}
</style>

