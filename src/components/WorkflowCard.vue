<template>
  <v-card class="bg-white dark:bg-slate-800 rounded-lg shadow-lg mb-4" elevation="0">
    <v-card-title class="d-flex align-center pa-0">
      <div class="d-flex align-center w-100" style="padding: 12px 16px;">
        <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">Workflow</span>
      </div>
    </v-card-title>
    
    <v-divider />
    
    <v-card-text class="pa-4">
      <!-- Workflow Status Badge -->
      <div class="mb-3">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Status:</span>
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
      <div v-if="canApproveWorkflow" class="mb-3">
        <div class="d-flex flex-column ga-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ getWorkflowActionText() }}</span>
          <div class="d-flex align-center flex-wrap ga-2">
            <button
              @click="handleApprove"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              @click="handleReject"
              class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-indigo-600 dark:border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors d-flex align-center ga-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        </div>
      </div>
      
        <!-- Designer: Move to Client Review -->
        <div v-if="isDesigner && workflowState === 'draft'" class="mb-3">
          <button
            @click="handleMoveToClientReview"
            class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Send to Client Review
          </button>
        </div>
        
        <!-- Designer: Request Art Director Review (after client approval) -->
        <div v-if="isDesigner && workflowState === 'client_approved'" class="mb-3">
          <button
            @click="handleMoveToArtDirectorReview"
            class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request Art Director Review
          </button>
        </div>
        
        <!-- Designer: Resubmit after changes requested -->
      <div v-if="isDesigner && (workflowState === 'ad_changes_requested' || workflowState === 'cd_changes_requested')" class="mb-3">
        <button
          @click="handleResubmitForReview"
          class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors d-flex align-center ga-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Resubmit for Review
        </button>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

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
  }
});

const emit = defineEmits([
  'workflow-approve',
  'workflow-reject',
  'workflow-move-to-client-review',
  'workflow-move-to-art-director-review',
  'workflow-resubmit'
]);

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
</script>

