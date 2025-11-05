<template>
  <div class="space-y-6">
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
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">{{ metadata.filename }}</h2>
          <button
            v-if="previewUrl"
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

    <!-- Comments Section -->
    <div v-if="passwordValidated || reviewCompleted">
      <CommentsSidebar
        :comments="comments"
        :version-id="selectedVersion"
        :read-only="reviewCompleted"
        @comment-added="handleCommentAdded"
        @comment-updated="handleCommentUpdated"
        @reply-added="handleReplyAdded"
      />
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
const reviewCompleted = ref(false);

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

// Update document title when metadata changes
watch(() => metadata.value.filename, (newFilename) => {
  if (newFilename) {
    document.title = `${newFilename} - Client Review`;
  } else {
    document.title = 'Client Review';
  }
});

onMounted(async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getReview(reviewId);
      metadata.value = res;
      reviewCompleted.value = res.completed || false;
      
      if (reviewCompleted.value) {
        // Still load comments but don't show preview
        await loadComments();
        return;
      }
      
      selectedVersion.value = res.versions[0].id;
      passwordValidated.value = true;
      loadVersion();
    } else {
      const res = await axios.get(`/review/${reviewId}`);
      metadata.value = res.data;
      reviewCompleted.value = res.data.completed || false;
      
      if (reviewCompleted.value) {
        // Still load comments but don't show preview
        await loadComments();
        return;
      }
      
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
