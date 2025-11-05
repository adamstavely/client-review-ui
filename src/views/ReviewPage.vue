<template>
  <div class="flex gap-6" style="min-height: calc(100vh - 200px);">
    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto space-y-6">
      <!-- Completed Review Message -->
      <div v-if="reviewCompleted" class="bg-white rounded-lg shadow-lg">
        <div class="p-8 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Review Completed</h2>
          <p class="text-gray-600 mb-4">This review has been marked as completed by the designer.</p>
          <p class="text-sm text-gray-500">Comments and review information are preserved, but the review link is no longer active.</p>
        </div>
      </div>

      <!-- File Preview Section -->
      <div v-if="!reviewCompleted && (!passwordRequired || passwordValidated)" class="bg-white rounded-lg shadow-lg">
        <div class="border-b border-gray-200 px-8 py-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ metadata.filename }}</h2>
              <!-- Role switcher for demo/testing (remove in production) -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-400">Role:</span>
                <select 
                  v-model="currentUserRole" 
                  @change="switchRole(currentUserRole)"
                  class="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                >
                  <option value="designer">Designer</option>
                  <option value="art_director">Art Director</option>
                  <option value="creative_director">Creative Director</option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="metadata.versions.length > 1"
                @click="toggleComparisonMode"
                :class="comparisonMode 
                  ? 'px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2'
                  : 'px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                {{ comparisonMode ? 'Single View' : 'Compare Versions' }}
              </button>
              <button
                v-if="previewUrl && !comparisonMode"
                @click="openInNewTab"
                class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
        <div class="p-8">
          <!-- Single View Mode -->
          <div v-if="!comparisonMode">
            <VersionSelector
              v-model="selectedVersion"
              :versions="metadata.versions"
              @update:modelValue="loadVersion"
            />
            <PreviewFrame :url="previewUrl" />
          </div>
          
          <!-- Comparison Mode -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-6">
              <!-- Left Version -->
              <div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Version 1</label>
                  <VersionSelector
                    v-model="leftVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadLeftVersion"
                  />
                </div>
                <div class="border-2 border-indigo-200 rounded-lg overflow-hidden">
                  <PreviewFrame :url="leftPreviewUrl" />
                </div>
              </div>
              
              <!-- Right Version -->
              <div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Version 2</label>
                  <VersionSelector
                    v-model="rightVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadRightVersion"
                  />
                </div>
                <div class="border-2 border-indigo-200 rounded-lg overflow-hidden">
                  <PreviewFrame :url="rightPreviewUrl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasswordPrompt
        v-model="passwordRequired"
        @submit="submitPassword"
      />
    </div>

    <!-- Comments Sidebar -->
    <div v-if="passwordValidated || reviewCompleted" class="w-96 flex-shrink-0">
      <div class="sticky top-8 max-h-[calc(100vh-120px)] overflow-y-auto">
        <WorkflowCard
          :workflow-state="metadata.workflowState"
          :current-user-role="currentUserRole"
          :designer="metadata.designer"
          @workflow-approve="handleApprove"
          @workflow-reject="handleReject"
          @workflow-move-to-client-review="handleMoveToClientReview"
          @workflow-move-to-art-director-review="handleMoveToArtDirectorReview"
          @workflow-resubmit="handleResubmitForReview"
        />
        
        <CommentsSidebar
          :comments="comments"
          :version-id="selectedVersion"
          :read-only="reviewCompleted"
          :workflow-history="metadata.workflowHistory || []"
          @comment-added="handleCommentAdded"
          @comment-updated="handleCommentUpdated"
          @reply-added="handleReplyAdded"
          @emoji-reaction-toggled="handleEmojiReactionToggled"
          @emoji-reaction-toggled-reply="handleEmojiReactionToggledReply"
        />
        
        <!-- Debug info (remove in production) -->
        <div v-if="false" class="mt-2 p-2 bg-gray-100 text-xs">
          Debug: workflowHistory length = {{ metadata.workflowHistory?.length || 0 }}
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <AlertModal
      v-model="showAlert"
      :title="alertTitle"
      :message="alertMessage"
      :type="alertType"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import VersionSelector from '@/components/VersionSelector.vue';
import PreviewFrame from '@/components/PreviewFrame.vue';
import PasswordPrompt from '@/components/PasswordPrompt.vue';
import CommentsSidebar from '@/components/CommentsSidebar.vue';
import WorkflowCard from '@/components/WorkflowCard.vue';
import AlertModal from '@/components/AlertModal.vue';
import { mockAPI, isMockMode } from '@/mockData.js';

const route = useRoute();
const reviewId = route.params.id;

const metadata = ref({ filename: '', versions: [], workflowState: 'draft', workflowHistory: [] });
const selectedVersion = ref('');
const previewUrl = ref('');
const password = ref('');
const passwordRequired = ref(false);
const passwordValidated = ref(false);
const comments = ref([]);
const reviewCompleted = ref(false);
const currentUser = ref('Current User'); // In real app, this would come from auth
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer'); // 'designer', 'client', 'art_director', 'creative_director'

// Role switcher for demo/testing (remove in production)
const switchRole = (role) => {
  currentUserRole.value = role;
  localStorage.setItem('userRole', role);
};

// Comparison mode state
const comparisonMode = ref(false);
const leftVersion = ref('');
const rightVersion = ref('');
const leftPreviewUrl = ref('');
const rightPreviewUrl = ref('');

// Alert modal state
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('error');

const loadVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, selectedVersion.value);
      previewUrl.value = res.url;
      await loadComments();
    } else {
      const res = await axios.get(`/review/${reviewId}/version/${selectedVersion.value}`);
      previewUrl.value = res.data.url;
      await loadComments();
    }
  } catch (error) {
    console.error('Failed to load version:', error);
  }
};

const loadLeftVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, leftVersion.value);
      leftPreviewUrl.value = res.url;
    } else {
      const res = await axios.get(`/review/${reviewId}/version/${leftVersion.value}`);
      leftPreviewUrl.value = res.data.url;
    }
  } catch (error) {
    console.error('Failed to load left version:', error);
  }
};

const loadRightVersion = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getVersion(reviewId, rightVersion.value);
      rightPreviewUrl.value = res.url;
    } else {
      const res = await axios.get(`/review/${reviewId}/version/${rightVersion.value}`);
      rightPreviewUrl.value = res.data.url;
    }
  } catch (error) {
    console.error('Failed to load right version:', error);
  }
};

const toggleComparisonMode = () => {
  comparisonMode.value = !comparisonMode.value;
  
  if (comparisonMode.value && metadata.value.versions.length >= 2) {
    // Initialize comparison with first two versions
    leftVersion.value = metadata.value.versions[0].id;
    rightVersion.value = metadata.value.versions.length > 1 ? metadata.value.versions[1].id : metadata.value.versions[0].id;
    loadLeftVersion();
    loadRightVersion();
  }
};

const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank');
  }
};

const loadComments = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Load all comments for the review (not filtered by version)
      // This allows seeing all comments across versions
      const res = await mockAPI.getComments(reviewId);
      // Create new object references to ensure Vue reactivity detects nested changes
      comments.value = res.map(comment => ({
        ...comment,
        reactions: comment.reactions ? [...comment.reactions] : [],
        replies: comment.replies ? comment.replies.map(reply => ({
          ...reply,
          reactions: reply.reactions ? [...reply.reactions] : []
        })) : []
      }));
    } else {
      // Load all comments for the review
      const res = await axios.get(`/review/${reviewId}/comments`);
      comments.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
    comments.value = [];
  }
};

const submitPassword = async (input) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId, input);
      metadata.value = res;
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    } else {
      const res = await axios.get(`/review/${reviewId}`, {
        params: { password: input },
      });
      metadata.value = res.data;
      selectedVersion.value = res.data.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    }
  } catch {
    showAlertMessage('Error', 'Invalid password', 'error');
  }
};

const showAlertMessage = (title, message, type = 'error') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

// Comment handling functions
const handleCommentAdded = async (comment) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.addComment(reviewId, comment);
    } else {
      await axios.post(`/review/${reviewId}/comments`, comment);
    }
    await loadComments();
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};

const handleCommentUpdated = async (commentId, action) => {
  try {
    if (action === 'toggle-resolved') {
      const comment = comments.value.find(c => c.id === commentId);
      if (comment) {
        const updates = { resolved: !comment.resolved };
        
        const useMockMode = await isMockMode();
        if (useMockMode) {
          await mockAPI.updateComment(reviewId, commentId, updates);
        } else {
          await axios.patch(`/review/${reviewId}/comments/${commentId}`, updates);
        }
        await loadComments();
      }
    }
  } catch (error) {
    console.error('Failed to update comment:', error);
  }
};

const handleReplyAdded = async (commentId, reply) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.addReply(reviewId, commentId, reply);
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/replies`, reply);
    }
    await loadComments();
  } catch (error) {
    console.error('Failed to add reply:', error);
  }
};

const handleEmojiReactionToggled = async (commentId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReaction(reviewId, commentId, emoji);
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/reactions/toggle`, { emoji });
    }
    await loadComments();
  } catch (error) {
    console.error('Failed to toggle emoji reaction:', error);
  }
};

const handleEmojiReactionToggledReply = async (commentId, replyId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReactionOnReply(reviewId, commentId, replyId, emoji);
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/replies/${replyId}/reactions/toggle`, { emoji });
    }
    await loadComments();
  } catch (error) {
    console.error('Failed to toggle emoji reaction on reply:', error);
  }
};

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
  return currentUserRole.value === 'designer' || metadata.value.designer === currentUser.value;
});

const canApproveWorkflow = computed(() => {
  const state = metadata.value.workflowState;
  const role = currentUserRole.value;
  
  if (state === 'client_review' && role === 'client') return true;
  if (state === 'art_director_review' && role === 'art_director') return true;
  if (state === 'creative_director_review' && role === 'creative_director') return true;
  
  return false;
});

const getWorkflowActionText = () => {
  const state = metadata.value.workflowState;
  if (state === 'client_review') return 'Client Approval';
  if (state === 'art_director_review') return 'Approve for Creative Director Review';
  if (state === 'creative_director_review') return 'Approve and Release';
  return '';
};

const handleApprove = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    
    if (useMockMode) {
      await mockAPI.approveWorkflowStage(reviewId, state, currentUser.value);
    } else {
      await axios.post(`/review/${reviewId}/workflow/approve`, { stage: state });
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    showAlertMessage('Success', 'Workflow stage approved successfully', 'success');
  } catch (error) {
    console.error('Failed to approve workflow stage:', error);
    showAlertMessage('Error', 'Failed to approve workflow stage', 'error');
  }
};

const handleReject = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    
    if (useMockMode) {
      await mockAPI.rejectWorkflowStage(reviewId, state, currentUser.value);
    } else {
      await axios.post(`/review/${reviewId}/workflow/reject`, { stage: state });
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    const rejectionMessage = state === 'art_director_review' 
      ? 'Art Director changes requested.' 
      : state === 'creative_director_review'
      ? 'Creative Director changes requested.'
      : 'Workflow stage rejected. Sent back to client review.';
    showAlertMessage('Success', rejectionMessage, 'success');
  } catch (error) {
    console.error('Failed to reject workflow stage:', error);
    showAlertMessage('Error', 'Failed to reject workflow stage', 'error');
  }
};

const handleMoveToClientReview = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      await mockAPI.moveToClientReview(reviewId);
    } else {
      await axios.post(`/review/${reviewId}/workflow/move-to-client-review`);
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    showAlertMessage('Success', 'Review sent to client for approval', 'success');
  } catch (error) {
    console.error('Failed to move to client review:', error);
    showAlertMessage('Error', 'Failed to send to client review', 'error');
  }
};

const handleMoveToArtDirectorReview = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      await mockAPI.moveToArtDirectorReview(reviewId);
    } else {
      await axios.post(`/review/${reviewId}/workflow/move-to-art-director-review`);
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    showAlertMessage('Success', 'Review sent to Art Director for approval', 'success');
  } catch (error) {
    console.error('Failed to move to Art Director review:', error);
    showAlertMessage('Error', 'Failed to send to Art Director review', 'error');
  }
};

const handleResubmitForReview = async () => {
  try {
    const useMockMode = await isMockMode();
    const state = metadata.value.workflowState;
    
    if (useMockMode) {
      await mockAPI.resubmitForReview(reviewId, state);
    } else {
      await axios.post(`/review/${reviewId}/workflow/resubmit`, { targetStage: state });
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res }; // Create new object reference for reactivity
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    const targetStage = state === 'ad_changes_requested' ? 'Art Director' : 'Creative Director';
    showAlertMessage('Success', `Review resubmitted for ${targetStage} review`, 'success');
  } catch (error) {
    console.error('Failed to resubmit for review:', error);
    showAlertMessage('Error', 'Failed to resubmit for review', 'error');
  }
};

// Track when a review is viewed (for clients)
const trackReviewView = (reviewId) => {
  if (currentUserRole.value !== 'client') return;
  
  try {
    const stored = localStorage.getItem('recentlyViewedLinks');
    const viewedIds = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (to move to front)
    const index = viewedIds.indexOf(reviewId);
    if (index > -1) {
      viewedIds.splice(index, 1);
    }
    
    // Add to front
    viewedIds.unshift(reviewId);
    
    // Keep only last 20
    const trimmed = viewedIds.slice(0, 20);
    
    localStorage.setItem('recentlyViewedLinks', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to track review view:', error);
  }
};

// Update document title when metadata changes
watch(() => metadata.value.filename, (newFilename) => {
  if (newFilename) {
    document.title = `${newFilename} - Design Review`;
  } else {
    document.title = 'Design Review';
  }
});

onMounted(async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      console.log('Loaded review:', res);
      console.log('WorkflowHistory:', res.workflowHistory);
      metadata.value = { ...res }; // Create new object reference for reactivity
      reviewCompleted.value = res.completed || false;
      
      // Track view for clients
      if (currentUserRole.value === 'client') {
        trackReviewView(reviewId);
      }
      
      if (reviewCompleted.value) {
        // Still load comments but don't show preview
        await loadComments();
        return;
      }
      
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
      
      // Initialize comparison versions if switching to comparison mode
      if (comparisonMode.value && res.versions.length >= 2) {
        leftVersion.value = res.versions[0].id;
        rightVersion.value = res.versions.length > 1 ? res.versions[1].id : res.versions[0].id;
      }
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      console.log('Loaded review:', res.data);
      console.log('WorkflowHistory:', res.data.workflowHistory);
      metadata.value = { ...res.data };
      reviewCompleted.value = res.data.completed || false;
      
      // Track view for clients
      if (currentUserRole.value === 'client') {
        trackReviewView(reviewId);
      }
      
      if (reviewCompleted.value) {
        // Still load comments but don't show preview
        await loadComments();
        return;
      }
      
      selectedVersion.value = res.data.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
      
      // Initialize comparison versions if switching to comparison mode
      if (comparisonMode.value && res.data.versions.length >= 2) {
        leftVersion.value = res.data.versions[0].id;
        rightVersion.value = res.data.versions.length > 1 ? res.data.versions[1].id : res.data.versions[0].id;
      }
    }
  } catch (err) {
    if (err.response?.status === 401) {
      passwordRequired.value = true;
    }
  }
});
</script>
