<template>
  <v-card class="bg-white dark:bg-slate-800 rounded-lg shadow-lg mb-4" elevation="0">
    <v-card-title class="d-flex align-center justify-space-between px-4 py-3">
      <div class="d-flex align-center">
        <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">Workflow</span>
      </div>
      <button
        @click="showHistoryModal = true"
        class="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 transition-colors d-flex align-center ga-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        View History
      </button>
    </v-card-title>
    
    <v-divider />
    
    <v-card-text class="px-4 py-4">
      <!-- Workflow Status -->
      <div class="mb-4">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-300">Status:</span>
          <v-chip
            :color="getWorkflowColor(workflowState)"
            size="small"
            class="font-medium"
          >
            {{ getWorkflowLabel(workflowState) }}
          </v-chip>
        </div>
      </div>
      
      <!-- Workflow Actions -->
      <div v-if="canApproveWorkflow" class="mb-0">
        <div class="d-flex flex-column ga-3">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">{{ getWorkflowActionText() }}</span>
          <div class="d-flex align-center justify-center flex-wrap ga-2">
            <button
              @click="handleApprove"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-2"
            >
              <span class="material-symbols-outlined" style="font-size: 18px;">approval</span>
              Approve
            </button>
            <button
              @click="handleReject"
              class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-indigo-600 dark:border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors d-flex align-center ga-2"
            >
              <span class="material-symbols-outlined" style="font-size: 18px;">source_notes</span>
              Rework
            </button>
          </div>
        </div>
      </div>
      
      <!-- Designer Actions -->
      <div v-else-if="isDesigner" class="mb-0">
        <!-- Move to Client Review -->
        <div v-if="workflowState === 'draft'">
          <button
            @click="handleMoveToClientReview"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Send to Client Review
          </button>
        </div>
        
        <!-- Request Art Director Review -->
        <div v-else-if="workflowState === 'client_approved'">
          <button
            @click="handleMoveToArtDirectorReview"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request Art Director Review
          </button>
        </div>
        
        <!-- Resubmit for Review -->
        <div v-else-if="workflowState === 'ad_changes_requested' || workflowState === 'cd_changes_requested'">
          <button
            @click="handleResubmitForReview"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Resubmit for Review
          </button>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- History Modal -->
  <v-dialog :model-value="showHistoryModal" @update:model-value="showHistoryModal = $event" max-width="600">
    <v-card class="bg-white dark:bg-slate-800">
      <v-card-title class="d-flex align-center justify-space-between bg-white dark:bg-slate-800 px-6 pt-6 pb-4">
        <div class="d-flex align-center">
          <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100">Review History</span>
        </div>
        <button @click.stop="showHistoryModal = false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </v-card-title>
      <v-divider />
      <v-card-text class="px-6 py-4">
        <div v-if="!sortedHistory || sortedHistory.length === 0" class="empty-state text-center py-8">
          <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">No history available</p>
        </div>
        
        <v-timeline v-else density="compact" class="pa-0 workflow-history-timeline">
          <v-timeline-item
            v-for="(entry, index) in sortedHistory"
            :key="`history-${index}-${entry.timestamp}`"
            size="small"
          >
            <template v-if="entry.action === 'uploaded' || entry.action === 'created_from_url'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <svg class="w-4 h-4" :class="getHistoryIconColor(entry.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </template>
            <template v-else-if="entry.action === 'version_uploaded'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">difference</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'approved'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">approval</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'completed'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">done_all</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'rejected'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">source_notes</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'moved_to_review'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">graph_1</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'password_set' || entry.action === 'password_removed'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">lock</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'extended' || entry.action === 'expiration_extended'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span v-if="!entry.days || entry.days <= 7" class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">schedule</span>
                <span v-else class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">calendar_today</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'resubmitted'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">refresh</span>
              </div>
            </template>
            <template v-else-if="entry.action === 'sharing_changed'" #icon>
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getHistoryIconBg(entry.action)">
                <span class="material-symbols-outlined w-4 h-4" :class="getHistoryIconColor(entry.action)" style="font-size: 16px;">share</span>
              </div>
            </template>
            <div class="d-flex align-start">
              <div class="flex-grow-1">
                <div class="mb-1">
                  <span class="font-weight-medium text-body-2">{{ getHistoryLabel(entry.stage, entry.action) }}</span>
                </div>
                <div class="text-caption text-gray-600 dark:text-gray-300 mb-1">
                  <span class="font-weight-medium">{{ entry.user }}</span>
                  <span v-if="entry.versionLabel" class="text-gray-500 dark:text-gray-400 ml-2">({{ entry.versionLabel }})</span>
                </div>
                <div class="text-caption text-gray-500 dark:text-gray-400">
                  {{ formatTimestamp(entry.timestamp) }}
                </div>
                <div v-if="entry.reason" class="text-caption text-gray-600 dark:text-gray-300 mt-1 italic">
                  Reason: {{ entry.reason }}
                </div>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  workflowState: {
    type: String,
    default: 'draft'
  },
  currentUserRole: {
    type: String,
    default: 'client'
  },
  designer: {
    type: String,
    default: ''
  },
  workflowHistory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'workflow-approve',
  'workflow-reject',
  'workflow-move-to-client-review',
  'workflow-move-to-art-director-review',
  'workflow-resubmit'
]);

const showHistoryModal = ref(false);

// Workflow helper functions
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
    'approved': 'Approved & Released'
  };
  return labels[state] || state;
};

const getWorkflowColor = (state) => {
  const colors = {
    'draft': 'grey',
    'client_review': 'blue',
    'client_approved': 'light-blue',
    'art_director_review': 'purple',
    'art_director_approved': 'deep-purple',
    'ad_changes_requested': 'orange',
    'creative_director_review': 'indigo',
    'cd_changes_requested': 'orange',
    'approved': 'green'
  };
  return colors[state] || 'grey';
};

const isDesigner = computed(() => {
  return props.currentUserRole === 'designer';
});

const canApproveWorkflow = computed(() => {
  const state = props.workflowState;
  const role = props.currentUserRole;
  
  if (state === 'client_review' && role === 'client') return true;
  if (state === 'art_director_review' && role === 'art_director') return true;
  if (state === 'creative_director_review' && role === 'creative_director') return true;
  
  return false;
});

const getWorkflowActionText = () => {
  const state = props.workflowState;
  if (state === 'client_review') return 'Client Approval';
  if (state === 'art_director_review') return 'Approve for Creative Director Review';
  if (state === 'creative_director_review') return 'Approve and Release';
  return '';
};

// Workflow action handlers
const handleApprove = () => {
  emit('workflow-approve');
};

const handleReject = () => {
  emit('workflow-reject');
};

const handleMoveToClientReview = () => {
  emit('workflow-move-to-client-review');
};

const handleMoveToArtDirectorReview = () => {
  emit('workflow-move-to-art-director-review');
};

const handleResubmitForReview = () => {
  emit('workflow-resubmit');
};

// History helper functions
const sortedHistory = computed(() => {
  if (!props.workflowHistory || !Array.isArray(props.workflowHistory) || props.workflowHistory.length === 0) {
    return [];
  }
  // Sort by timestamp, newest first
  const sorted = [...props.workflowHistory].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA; // Newest first
  });
  return sorted;
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
};

const getHistoryLabel = (stage, action) => {
  const stageLabels = {
    'draft': 'Draft',
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'Art Director Review',
    'art_director_approved': 'Art Director Approved',
    'ad_changes_requested': 'AD Changes Requested',
    'creative_director_review': 'Creative Director Review',
    'cd_changes_requested': 'CD Changes Requested',
    'approved': 'Approved & Released'
  };
  
  const actionLabels = {
    'uploaded': 'Uploaded',
    'created_from_url': 'Created from URL',
    'moved_to_review': 'Moved to Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'resubmitted': 'Resubmitted',
    'version_uploaded': 'Version Uploaded',
    'extended': 'Expiration Extended',
    'expiration_extended': 'Expiration Extended',
    'password_set': 'Password Set',
    'password_removed': 'Password Removed',
    'sharing_changed': 'Sharing Changed',
    'completed': 'Completed'
  };
  
  const stageLabel = stageLabels[stage] || stage;
  const actionLabel = actionLabels[action] || action;
  
  // For version uploads, include version label if available
  if (action === 'version_uploaded') {
    return actionLabel;
  }
  
  return `${stageLabel} - ${actionLabel}`;
};

// Get history icon background color class (matching activity card)
const getHistoryIconBg = (action) => {
  if (action === 'uploaded' || action === 'created_from_url') return 'bg-indigo-100 dark:bg-indigo-900/30';
  if (action === 'version_uploaded') return 'bg-purple-100 dark:bg-purple-900/30';
  if (action === 'approved') return 'bg-green-100 dark:bg-green-900/30';
  if (action === 'completed') return 'bg-green-100 dark:bg-green-900/30';
  if (action === 'rejected') return 'bg-orange-100 dark:bg-orange-900/30';
  if (action === 'moved_to_review') return 'bg-indigo-100 dark:bg-indigo-900/30';
  if (action === 'password_set' || action === 'password_removed') return 'bg-red-50 dark:bg-red-900/20';
  if (action === 'extended' || action === 'expiration_extended') return 'bg-teal-100 dark:bg-teal-900/30';
  if (action === 'resubmitted') return 'bg-blue-100 dark:bg-blue-900/30';
  if (action === 'sharing_changed') return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-gray-100 dark:bg-gray-700';
};

// Get history icon color class (matching activity card)
const getHistoryIconColor = (action) => {
  if (action === 'uploaded' || action === 'created_from_url') return 'text-indigo-600 dark:text-indigo-400';
  if (action === 'version_uploaded') return 'text-purple-600 dark:text-purple-400';
  if (action === 'approved') return 'text-green-600 dark:text-green-400';
  if (action === 'completed') return 'text-green-600 dark:text-green-400';
  if (action === 'rejected') return 'text-orange-600 dark:text-orange-400';
  if (action === 'moved_to_review') return 'text-indigo-600 dark:text-indigo-400';
  if (action === 'password_set' || action === 'password_removed') return 'text-red-600 dark:text-red-400';
  if (action === 'extended' || action === 'expiration_extended') return 'text-teal-600 dark:text-teal-400';
  if (action === 'resubmitted') return 'text-blue-600 dark:text-blue-400';
  if (action === 'sharing_changed') return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

const getHistoryColor = (action) => {
  const colors = {
    'uploaded': 'blue',
    'created_from_url': 'blue',
    'moved_to_review': 'indigo',
    'approved': 'green',
    'rejected': 'red',
    'resubmitted': 'orange',
    'version_uploaded': 'purple',
    'extended': 'teal',
    'expiration_extended': 'teal',
    'password_set': 'red',
    'password_removed': 'red',
    'sharing_changed': 'red',
    'completed': 'green'
  };
  return colors[action] || 'grey';
};
</script>

