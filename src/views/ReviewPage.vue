<template>
  <v-container class="pa-4" max-width="1200px">
    <v-row>
      <!-- Left Column - File Preview -->
      <v-col cols="12" lg="8">
        <v-card v-if="!passwordRequired || passwordValidated">
          <v-card-title class="text-h6">{{ metadata.filename }}</v-card-title>
          <v-card-text>
            <VersionSelector
              v-model="selectedVersion"
              :versions="metadata.versions"
              @update:modelValue="loadVersion"
            />
            <PreviewFrame :url="previewUrl" />
          </v-card-text>
        </v-card>

        <PasswordPrompt
          v-model="passwordRequired"
          @submit="submitPassword"
        />
      </v-col>

      <!-- Right Column - Comments & Designer Tools -->
      <v-col cols="12" lg="4" v-if="passwordValidated">
        <DesignerModeToggle @mode-changed="handleModeChanged" />
        
        <!-- Designer Mode: Version Upload -->
        <VersionUpload
          v-if="isDesignerMode"
          :review-id="reviewId"
          @version-uploaded="handleVersionUploaded"
        />
        
        <!-- Client Mode: Comments -->
        <template v-if="!isDesignerMode">
          <CommentBox
            :version-id="selectedVersion"
            @comment-added="handleCommentAdded"
          />
          
          <CommentList
            :comments="comments"
            :version-id="selectedVersion"
            @comment-updated="handleCommentUpdated"
            @reply-added="handleReplyAdded"
          />
        </template>
        
        <!-- Designer Mode: Comments (Read-only) -->
        <template v-else>
          <v-card class="mt-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-comment-multiple</v-icon>
              Client Comments ({{ comments.length }})
            </v-card-title>
            <v-card-text v-if="comments.length === 0" class="text-center py-4">
              <v-icon size="32" color="grey-lighten-1">mdi-comment-outline</v-icon>
              <p class="text-grey mt-2">No comments from clients yet.</p>
            </v-card-text>
            <v-list v-else>
              <template v-for="comment in comments" :key="comment.id">
                <v-list-item>
                  <template #prepend>
                    <v-avatar :color="getCommentColor(comment.type)" size="32">
                      <v-icon color="white">mdi-account</v-icon>
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
                      <v-icon start>mdi-check</v-icon>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import VersionSelector from '@/components/VersionSelector.vue';
import PreviewFrame from '@/components/PreviewFrame.vue';
import PasswordPrompt from '@/components/PasswordPrompt.vue';
import CommentBox from '@/components/CommentBox.vue';
import CommentList from '@/components/CommentList.vue';
import DesignerModeToggle from '@/components/DesignerModeToggle.vue';
import VersionUpload from '@/components/VersionUpload.vue';
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
    alert('Invalid password');
  }
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
