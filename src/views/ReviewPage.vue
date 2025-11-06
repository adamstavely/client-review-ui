<template>
  <div class="flex gap-4" style="min-height: calc(100vh - 200px);">
    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto space-y-4">
      <!-- Completed Review Message -->
      <div v-if="reviewCompleted" class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div class="p-8 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Review Completed</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">This review has been marked as completed by the designer.</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Comments and review information are preserved, but the review link is no longer active.</p>
        </div>
      </div>

      <!-- File Preview Section -->
      <div v-if="!reviewCompleted && (!passwordRequired || passwordValidated)" class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div class="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ metadata.filename }}</h2>
              <!-- Role switcher for demo/testing (remove in production) -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-400 dark:text-gray-500">Role:</span>
                <select 
                  v-model="currentUserRole" 
                  @change="switchRole(currentUserRole)"
                  class="text-xs border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2 shadow-sm compare-versions-btn"
              >
                <span class="material-symbols-outlined text-base">compare</span>
                {{ comparisonMode ? 'Single View' : 'Compare Versions' }}
              </button>
              <button
                v-if="previewUrl && !comparisonMode"
                @click="openInNewTab"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2 shadow-sm open-new-tab-btn"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <!-- Single View Mode -->
          <div v-if="!comparisonMode">
        <VersionSelector
          v-model="selectedVersion"
          :versions="metadata.versions"
          @update:modelValue="loadVersion"
        />
        <PreviewFrame 
          ref="previewFrameRef"
          :url="previewUrl" 
          :review-id="reviewId"
          :read-only="reviewCompleted"
          @annotation-added="handleAnnotationAdded"
          @annotation-updated="handleAnnotationUpdated"
          @annotation-deleted="handleAnnotationDeleted"
        />
          </div>
          
          <!-- Comparison Mode -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-6">
              <!-- Left Version -->
              <div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version 1</label>
                  <VersionSelector
                    v-model="leftVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadLeftVersion"
                  />
                </div>
                <div class="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
                  <PreviewFrame 
                    :url="leftPreviewUrl" 
                    :review-id="reviewId"
                    :read-only="reviewCompleted"
                  />
                </div>
              </div>
              
              <!-- Right Version -->
              <div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version 2</label>
                  <VersionSelector
                    v-model="rightVersion"
                    :versions="metadata.versions"
                    @update:modelValue="loadRightVersion"
                  />
                </div>
                <div class="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
                  <PreviewFrame 
                    :url="rightPreviewUrl" 
                    :review-id="reviewId"
                    :read-only="reviewCompleted"
                  />
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

    <!-- Right Sidebar -->
    <div v-if="passwordValidated || reviewCompleted" class="w-72 flex-shrink-0">
      <div class="space-y-4">
        <!-- Designer Tools Card -->
        <div v-if="isDesigner && !reviewCompleted" class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <div class="p-4">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">DESIGNER TOOLS</h3>
            </div>
            <div class="grid gap-2" :class="metadata.password ? 'grid-cols-4' : 'grid-cols-3'">
              <!-- Mark as Completed -->
              <v-tooltip text="Mark as Completed">
                <template #activator="{ props }">
                  <button
                    @click="handleMarkCompleted"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-800"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 dark:text-gray-300">Mark Completed</span>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Change Password -->
              <v-tooltip v-if="metadata.password" text="Change Password">
                <template #activator="{ props }">
                  <button
                    @click="handleChangePassword"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-800"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 dark:text-gray-300">Change Password</span>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Extend Expiration -->
              <v-tooltip text="Extend Expiration">
                <template #activator="{ props }">
                  <button
                    @click="handleExtendExpiration"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-800"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 dark:text-gray-300">Extend Expiration</span>
                  </button>
                </template>
              </v-tooltip>
              
              <!-- Upload New Version -->
              <v-tooltip text="Upload New Version">
                <template #activator="{ props }">
                  <button
                    @click="handleUploadNewVersion"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 transition-colors bg-white dark:bg-slate-800"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 dark:text-gray-300">Upload Version</span>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </div>
        </div>
        
        <WorkflowCard
          :workflow-state="metadata.workflowState"
          :current-user-role="currentUserRole"
          :designer="metadata.designer"
          :workflow-history="metadata.workflowHistory || []"
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
          :current-user-role="currentUserRole"
          @comment-added="handleCommentAdded"
          @comment-updated="handleCommentUpdated"
          @reply-added="handleReplyAdded"
          @emoji-reaction-toggled="handleEmojiReactionToggled"
          @emoji-reaction-toggled-reply="handleEmojiReactionToggledReply"
        />
      </div>
    </div>

    <!-- Version Upload Modal -->
    <VersionUploadModal
      v-model="showUploadModal"
      :review-id="reviewId"
      @version-uploaded="handleVersionUploaded"
    />

    <!-- Change Password Modal -->
    <PromptModal
      v-model="showPasswordModal"
      title="Change Password"
      label="Enter new password (leave empty to remove password)"
      placeholder="Enter new password or leave empty"
      type="password"
      :required="false"
      @submit="handlePasswordChanged"
    />

    <!-- Confirm Completion Modal -->
    <ConfirmModal
      v-model="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="Mark as Completed"
      confirm-color="success"
      @confirm="confirmMarkCompleted"
    />

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
import CommentsSidebar from '@/components/CommentsSidebar.vue';
import WorkflowCard from '@/components/WorkflowCard.vue';
import VersionUploadModal from '@/components/VersionUploadModal.vue';
import PromptModal from '@/components/PromptModal.vue';
import PasswordPrompt from '@/components/PasswordPrompt.vue';
import AlertModal from '@/components/AlertModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { mockAPI, isMockMode, mockReviews } from '@/mockData.js';

const route = useRoute();
const reviewId = route.params.id;

const previewFrameRef = ref(null);

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

// Designer tools modals state
const showUploadModal = ref(false);
const showPasswordModal = ref(false);
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');

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
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await axios.post(`/review/${reviewId}/comments`, comment);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};

const handleCommentUpdated = async (commentId, updates) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.updateComment(reviewId, commentId, updates);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await axios.patch(`/review/${reviewId}/comments/${commentId}`, updates);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
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
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/replies`, reply);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to add reply:', error);
  }
};

const handleEmojiReactionToggled = async (commentId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReaction(reviewId, commentId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/reactions`, { emoji });
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to toggle emoji reaction:', error);
  }
};

const handleEmojiReactionToggledReply = async (commentId, replyId, emoji) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.toggleEmojiReactionReply(reviewId, commentId, replyId, emoji);
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    } else {
      await axios.post(`/review/${reviewId}/comments/${commentId}/replies/${replyId}/reactions`, { emoji });
      await loadComments();
      // Refresh annotations in WebViewer to sync
      if (previewFrameRef.value) {
        await previewFrameRef.value.refreshAnnotations();
      }
    }
  } catch (error) {
    console.error('Failed to toggle emoji reaction on reply:', error);
  }
};

// Annotation handling functions (from WebViewer - syncs with backend)
const handleAnnotationAdded = async (comment) => {
  // Annotation already saved to backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

const handleAnnotationUpdated = async (comment) => {
  // Annotation already updated in backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

const handleAnnotationDeleted = async (comment) => {
  // Annotation already deleted from backend via PreviewFrame
  // Just reload comments to sync CommentsSidebar
  await loadComments();
};

// History helper functions (moved from CommentsSidebar)
const sortedHistory = computed(() => {
  if (!metadata.value.workflowHistory || !Array.isArray(metadata.value.workflowHistory) || metadata.value.workflowHistory.length === 0) {
    return [];
  }
  // Sort by timestamp, newest first
  const sorted = [...metadata.value.workflowHistory].sort((a, b) => {
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
    'password_set': 'Password Set',
    'password_removed': 'Password Removed'
  };
  
  const stageLabel = stageLabels[stage] || stage;
  const actionLabel = actionLabels[action] || action;
  
  // For version uploads, include version label if available
  if (action === 'version_uploaded') {
    return actionLabel;
  }
  
  return `${stageLabel} - ${actionLabel}`;
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
    'password_set': 'amber',
    'password_removed': 'orange'
  };
  return colors[action] || 'grey';
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

// Designer tools handler functions
const handleMarkCompleted = () => {
  confirmModalTitle.value = 'Mark Review as Completed';
  confirmModalMessage.value = `Are you sure you want to mark "${metadata.value.filename}" as completed? The review link will be disabled, but comments and information will be preserved.`;
  showConfirmModal.value = true;
};

const confirmMarkCompleted = async () => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data - mark review as completed
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.completed = true;
        reviewCompleted.value = true;
      }
    } else {
      // Use real API
      await axios.post(`/review/${reviewId}/complete`);
      reviewCompleted.value = true;
    }
    
    // Reload review data
    const useMock = await isMockMode();
    if (useMock) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res };
      reviewCompleted.value = res.completed || false;
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
      reviewCompleted.value = res.data.completed || false;
    }
    
    showAlertMessage('Success', 'Review marked as completed. The link is now disabled.', 'success');
  } catch (error) {
    console.error('Failed to mark review as completed:', error);
    showAlertMessage('Error', 'Failed to mark review as completed. Please try again.', 'error');
  }
};

const handleChangePassword = () => {
  showPasswordModal.value = true;
};

const handlePasswordChanged = async (passwordValue) => {
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.password = passwordValue;
        
        // Add history entry for any password change
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: passwordValue ? 'password_set' : 'password_removed',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString()
        });
        
        // Reload review data to get updated history
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      // Use real API
      await axios.post(`/review/${reviewId}/password`, { password: passwordValue });
      
      // Reload review data
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    const message = passwordValue 
      ? 'Password updated successfully!'
      : 'Password removed successfully!';
    showAlertMessage('Success', message, 'success');
  } catch (error) {
    console.error('Failed to change password:', error);
    showAlertMessage('Error', 'Failed to change password. Please try again.', 'error');
  }
};

const handleExtendExpiration = async () => {
  try {
    const useMockMode = await isMockMode();
    
    // Calculate new expiration date: 30 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    newExpiresAt.setHours(23, 59, 59, 999); // Set to end of day
    const newExpiresAtISO = newExpiresAt.toISOString();
    
    if (useMockMode) {
      // Update mock data
      const review = mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.expiresAt = newExpiresAtISO;
        
        // Add history entry
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'extended',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString(),
          days: 30
        });
        
        // Reload review data to get updated history
        const res = await mockAPI.getReview(reviewId);
        metadata.value = { ...res };
      }
    } else {
      // Use real API
      await axios.post(`/review/${reviewId}/extend-expiration`, { days: 30 });
      
      // Reload review data
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
    }
    
    showAlertMessage('Success', 'Expiration date extended by 30 days!', 'success');
  } catch (error) {
    console.error('Failed to extend expiration:', error);
    showAlertMessage('Error', 'Failed to extend expiration date. Please try again.', 'error');
  }
};

const handleUploadNewVersion = () => {
  showUploadModal.value = true;
};

const handleVersionUploaded = async () => {
  // Reload review data to get new version
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = { ...res };
      // Auto-select the new version
      if (res.versions && res.versions.length > 0) {
        selectedVersion.value = res.versions[res.versions.length - 1].id;
        await loadVersion();
      }
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = { ...res.data };
      if (res.data.versions && res.data.versions.length > 0) {
        selectedVersion.value = res.data.versions[res.data.versions.length - 1].id;
        await loadVersion();
      }
    }
    showAlertMessage('Success', 'New version uploaded successfully!', 'success');
  } catch (error) {
    console.error('Failed to reload review after version upload:', error);
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
        // Comments are loaded automatically by WebViewer when document loads
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
        // Comments are loaded automatically by WebViewer when document loads
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
