<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - File Preview -->
      <div class="lg:col-span-2">
        <div v-if="!passwordRequired || passwordValidated" class="bg-white rounded-lg shadow-lg">
          <div class="border-b border-gray-200 px-8 py-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ metadata.filename }}</h2>
          </div>
          <div class="p-8">
            <VersionSelector
              v-model="selectedVersion"
              :versions="metadata.versions"
              @update:modelValue="loadVersion"
            />
            <PreviewFrame :url="previewUrl" />
          </div>
        </div>

        <PasswordPrompt
          v-model="passwordRequired"
          @submit="submitPassword"
        />
      </div>

      <!-- Right Column - Comments & Designer Tools -->
      <div class="lg:col-span-1" v-if="passwordValidated">
        <DesignerModeToggle @mode-changed="handleModeChanged" />
        
        <!-- Designer Mode: Version Upload -->
        <VersionUpload
          v-if="isDesignerMode"
          :review-id="reviewId"
          @version-uploaded="handleVersionUploaded"
        />
        
        <!-- Client Mode: Unified Comments Sidebar -->
        <CommentsSidebar
          v-if="!isDesignerMode"
          :comments="comments"
          :version-id="selectedVersion"
          @comment-added="handleCommentAdded"
          @comment-updated="handleCommentUpdated"
          @reply-added="handleReplyAdded"
        />
        
        <!-- Designer Mode: Comments (Read-only) -->
        <template v-else>
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center">
              <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Client Comments ({{ comments.length }})
            </v-card-title>
            <v-card-text v-if="comments.length === 0" class="text-center py-4">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-gray-500 mt-2">No comments from clients yet.</p>
            </v-card-text>
            <v-list v-else>
              <template v-for="comment in comments" :key="comment.id">
                <v-list-item>
                  <template #prepend>
                    <v-avatar :color="getCommentColor(comment.type)" size="32">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="d-flex align-center">
                    <span class="font-weight-medium">{{ comment.author }}</span>
                    <v-chip
                      :color="getCommentColor(comment.type)"
                      size="small"
                      class="ml-2"
                    >
                      {{ getCommentTypeLabel(comment.type) }}
                    </v-chip>
                    <v-chip
                      v-if="comment.resolved"
                      color="success"
                      size="small"
                      class="ml-2"
                    >
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Resolved
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatTimestamp(comment.timestamp) }}
                  </v-list-item-subtitle>
                  <div class="comment-content mt-1">
                    <p class="text-body-2">{{ comment.text }}</p>
                  </div>
                </v-list-item>
                <v-divider v-if="comment !== comments[comments.length - 1]" />
              </template>
            </v-list>
          </v-card>
        </template>
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
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import VersionSelector from '@/components/VersionSelector.vue';
import PreviewFrame from '@/components/PreviewFrame.vue';
import PasswordPrompt from '@/components/PasswordPrompt.vue';
import CommentsSidebar from '@/components/CommentsSidebar.vue';
import DesignerModeToggle from '@/components/DesignerModeToggle.vue';
import VersionUpload from '@/components/VersionUpload.vue';
import AlertModal from '@/components/AlertModal.vue';
import { mockAPI, isMockMode } from '@/mockData.js';

const route = useRoute();
const reviewId = route.params.id;

const metadata = ref({ filename: '', versions: [] });
const selectedVersion = ref('');
const previewUrl = ref('');
const password = ref('');
const passwordRequired = ref(false);
const passwordValidated = ref(false);
const comments = ref([]);
const isDesignerMode = ref(false);

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

const loadComments = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getComments(reviewId, selectedVersion.value);
      comments.value = res;
    } else {
      const res = await axios.get(`/review/${reviewId}/comments`, {
        params: { version: selectedVersion.value }
      });
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

const handleModeChanged = (mode) => {
  isDesignerMode.value = mode;
};

const handleVersionUploaded = async (newVersion) => {
  // Refresh the metadata to get the new version
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = res;
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = res.data;
    }
    
    // Auto-select the new version
    selectedVersion.value = newVersion.id;
    await loadVersion();
  } catch (error) {
    console.error('Failed to refresh after version upload:', error);
  }
};

// Helper functions for designer mode comment display
const getCommentColor = (type) => {
  const colors = {
    general: 'blue',
    bug: 'red',
    suggestion: 'orange',
    approval: 'green',
    changes: 'amber'
  };
  return colors[type] || 'blue';
};

const getCommentTypeLabel = (type) => {
  const labels = {
    general: 'General',
    bug: 'Bug',
    suggestion: 'Suggestion',
    approval: 'Approved',
    changes: 'Changes'
  };
  return labels[type] || 'General';
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

onMounted(async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = res;
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = res.data;
      selectedVersion.value = res.data.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    }
  } catch (err) {
    if (err.response?.status === 401) {
      passwordRequired.value = true;
    }
  }
});
</script>
