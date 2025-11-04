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

      <!-- Right Column - Comments -->
      <div class="lg:col-span-1" v-if="passwordValidated">
        <CommentsSidebar
          :comments="comments"
          :version-id="selectedVersion"
          @comment-added="handleCommentAdded"
          @comment-updated="handleCommentUpdated"
          @reply-added="handleReplyAdded"
        />
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
