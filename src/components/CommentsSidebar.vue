<template>
  <v-card class="bg-white rounded-lg shadow-lg">
    <v-card-title class="d-flex align-center">
      <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Comments ({{ comments.length }})
    </v-card-title>
    
    <v-divider />
    
    <!-- Add Comment Form -->
    <v-card-text>
      <v-form @submit.prevent="submitComment">
        <v-textarea
          v-model="newComment"
          label="Write your comment..."
          rows="3"
          variant="outlined"
          class="mb-3"
          :rules="[v => !!v || 'Comment is required']"
          required
        />
        <v-select
          v-model="commentType"
          :items="commentTypes"
          label="Comment Type"
          variant="outlined"
          color="primary"
          class="mb-3"
        />
        <div class="d-flex justify-end">
          <v-btn 
            type="submit" 
            color="primary" 
            :disabled="!newComment.trim()"
            :loading="submitting"
          >
            Add Comment
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
    
    <v-divider />
    
    <!-- Comments List -->
    <v-card-text v-if="comments.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="text-gray-500 mt-2">No comments yet. Be the first to add feedback!</p>
    </v-card-text>
    
    <v-list v-else class="py-0">
      <template v-for="comment in comments" :key="comment.id">
        <v-list-item class="comment-item">
          <template #prepend>
            <v-avatar :color="getCommentColor(comment.type)" size="32">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </v-avatar>
          </template>
          
          <v-list-item-title class="d-flex align-center flex-wrap">
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
          
          <v-list-item-subtitle class="mt-1">
            {{ formatTimestamp(comment.timestamp) }}
          </v-list-item-subtitle>
          
          <template #append>
            <div class="d-flex align-center ga-2">
              <v-tooltip text="Reply">
                <template #activator="{ props }">
                  <button
                    type="button"
                    v-bind="props"
                    @click="toggleReply(comment.id)"
                    class="text-gray-500 hover:text-indigo-600 transition-colors p-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              
              <v-tooltip text="Mark as resolved">
                <template #activator="{ props }">
                  <button
                    type="button"
                    v-bind="props"
                    @click="toggleResolved(comment.id)"
                    class="transition-colors p-1"
                    :class="comment.resolved ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-indigo-600'"
                  >
                    <svg v-if="comment.resolved" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </template>
          
          <div class="comment-content mt-2">
            <p class="text-body-1">{{ comment.text }}</p>
          </div>
          
          <!-- Reply Form -->
          <v-expand-transition>
            <div v-if="replyingTo === comment.id" class="mt-3">
              <v-textarea
                v-model="replyText"
                label="Write a reply..."
                rows="2"
                variant="outlined"
                class="mb-2"
              />
              <div class="d-flex justify-end ga-2">
                <v-btn
                  variant="text"
                  @click="cancelReply"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="primary"
                  @click="submitReply(comment.id)"
                  :disabled="!replyText.trim()"
                >
                  Reply
                </v-btn>
              </div>
            </div>
          </v-expand-transition>
          
          <!-- Replies -->
          <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-8">
            <v-divider class="mb-2" />
            <div class="text-caption text-gray-500 mb-2">Replies:</div>
            <template v-for="reply in comment.replies" :key="reply.id">
              <v-list-item class="reply-item">
                <template #prepend>
                  <v-avatar size="24" color="grey-lighten-2">
                    <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="d-flex align-center">
                  <span class="font-weight-medium">{{ reply.author }}</span>
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  {{ formatTimestamp(reply.timestamp) }}
                </v-list-item-subtitle>
                
                <div class="reply-content mt-1">
                  <p class="text-body-2">{{ reply.text }}</p>
                </div>
              </v-list-item>
            </template>
          </div>
        </v-list-item>
        
        <v-divider v-if="comment !== comments[comments.length - 1]" />
      </template>
    </v-list>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  versionId: String
});

const emit = defineEmits(['comment-added', 'comment-updated', 'reply-added']);

const newComment = ref('');
const commentType = ref('general');
const submitting = ref(false);
const replyingTo = ref(null);
const replyText = ref('');

const commentTypes = [
  { title: 'General Feedback', value: 'general' },
  { title: 'Bug Report', value: 'bug' },
  { title: 'Design Suggestion', value: 'suggestion' },
  { title: 'Approval', value: 'approval' },
  { title: 'Request Changes', value: 'changes' }
];

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

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  submitting.value = true;
  
  try {
    const comment = {
      id: Date.now().toString(),
      text: newComment.value.trim(),
      type: commentType.value,
      author: 'Current User', // In real app, this would come from auth
      timestamp: new Date().toISOString(),
      version: props.versionId,
      resolved: false,
      replies: []
    };
    
    emit('comment-added', comment);
    
    // Reset form
    newComment.value = '';
    commentType.value = 'general';
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    submitting.value = false;
  }
};

const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null;
    replyText.value = '';
  } else {
    replyingTo.value = commentId;
    replyText.value = '';
  }
};

const cancelReply = () => {
  replyingTo.value = null;
  replyText.value = '';
};

const submitReply = (commentId) => {
  if (!replyText.value.trim()) return;
  
  const reply = {
    id: Date.now().toString(),
    text: replyText.value.trim(),
    author: 'Current User',
    timestamp: new Date().toISOString()
  };
  
  emit('reply-added', commentId, reply);
  replyText.value = '';
  replyingTo.value = null;
};

const toggleResolved = (commentId) => {
  emit('comment-updated', commentId, 'toggle-resolved');
};
</script>

<style scoped>
.comment-item {
  align-items: flex-start !important;
}

.reply-item {
  align-items: flex-start !important;
}

.comment-content {
  width: 100%;
}
</style>

