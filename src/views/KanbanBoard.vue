<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-lg">
      <div class="border-b border-gray-200 px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900">Kanban Board</h2>
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
    </div>

    <!-- Kanban Board -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style="min-height: calc(100vh - 300px);">
      <!-- Client Review Column -->
      <div class="flex flex-col">
        <div class="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-200 bg-blue-50">
            <h3 class="font-semibold text-gray-900">Client Review</h3>
            <p class="text-xs text-gray-500 mt-1">{{ getColumnCount('client_review') }} items</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="review in getColumnItems('client_review')"
              :key="review.id"
              @click="goToReview(review.id)"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 truncate flex-1">{{ review.filename }}</h4>
                <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                  {{ getStatusLabel(review.workflowState) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>{{ review.designer }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ formatDate(review.expiresAt) }}</span>
                <span v-if="review.password" class="text-gray-400">
                  <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="getColumnItems('client_review').length === 0" class="text-center py-8 text-gray-400 text-sm">
              No items
            </div>
          </div>
        </div>
      </div>

      <!-- Art/Creative Review Column -->
      <div class="flex flex-col">
        <div class="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-200 bg-purple-50">
            <h3 class="font-semibold text-gray-900">Art/Creative Review</h3>
            <p class="text-xs text-gray-500 mt-1">{{ getColumnCount('art_creative_review') }} items</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="review in getColumnItems('art_creative_review')"
              :key="review.id"
              @click="goToReview(review.id)"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 truncate flex-1">{{ review.filename }}</h4>
                <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                  {{ getStatusLabel(review.workflowState) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>{{ review.designer }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ formatDate(review.expiresAt) }}</span>
                <span v-if="review.password" class="text-gray-400">
                  <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="getColumnItems('art_creative_review').length === 0" class="text-center py-8 text-gray-400 text-sm">
              No items
            </div>
          </div>
        </div>
      </div>

      <!-- Changes Requested Column -->
      <div class="flex flex-col">
        <div class="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-200 bg-orange-50">
            <h3 class="font-semibold text-gray-900">Changes Requested</h3>
            <p class="text-xs text-gray-500 mt-1">{{ getColumnCount('changes_requested') }} items</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="review in getColumnItems('changes_requested')"
              :key="review.id"
              @click="goToReview(review.id)"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 truncate flex-1">{{ review.filename }}</h4>
                <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getStatusBadgeClass(review.workflowState)">
                  {{ getStatusLabel(review.workflowState) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>{{ review.designer }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ formatDate(review.expiresAt) }}</span>
                <span v-if="review.password" class="text-gray-400">
                  <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="getColumnItems('changes_requested').length === 0" class="text-center py-8 text-gray-400 text-sm">
              No items
            </div>
          </div>
        </div>
      </div>

      <!-- Approved Column -->
      <div class="flex flex-col">
        <div class="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-200 bg-green-50">
            <h3 class="font-semibold text-gray-900">Approved</h3>
            <p class="text-xs text-gray-500 mt-1">{{ getColumnCount('approved') }} items</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="review in getColumnItems('approved')"
              :key="review.id"
              @click="goToReview(review.id)"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h4 class="font-medium text-gray-900 mb-2 truncate">{{ review.filename }}</h4>
              <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>{{ review.designer }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ formatDate(review.expiresAt) }}</span>
                <span v-if="review.password" class="text-gray-400">
                  <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            <div v-if="getColumnItems('approved').length === 0" class="text-center py-8 text-gray-400 text-sm">
              No items
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
  if (columnGroup === 'client_review') {
    return filteredReviews.value.filter(review => 
      ['client_review', 'client_approved'].includes(review.workflowState)
    );
  } else if (columnGroup === 'art_creative_review') {
    return filteredReviews.value.filter(review => 
      ['art_director_review', 'creative_director_review'].includes(review.workflowState)
    );
  } else if (columnGroup === 'changes_requested') {
    return filteredReviews.value.filter(review => 
      ['ad_changes_requested', 'cd_changes_requested'].includes(review.workflowState)
    );
  } else if (columnGroup === 'approved') {
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
    return 'bg-blue-100 text-blue-800';
  } else if (workflowState === 'client_approved') {
    return 'bg-light-blue-100 text-light-blue-800';
  } else if (workflowState === 'art_director_review') {
    return 'bg-purple-100 text-purple-800';
  } else if (workflowState === 'creative_director_review') {
    return 'bg-indigo-100 text-indigo-800';
  } else if (workflowState === 'ad_changes_requested') {
    return 'bg-orange-100 text-orange-800';
  } else if (workflowState === 'cd_changes_requested') {
    return 'bg-orange-100 text-orange-800';
  }
  return 'bg-gray-100 text-gray-800';
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

