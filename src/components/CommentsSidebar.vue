<template>
  <v-card class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
    <v-card-title class="d-flex align-center pa-0">
      <v-tabs v-model="activeTab" bg-color="transparent" class="w-100">
        <v-tab value="comments" class="text-left">
          <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comments ({{ validComments.length }})
        </v-tab>
        <v-tab value="history" class="text-left">
          <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </v-tab>
      </v-tabs>
    </v-card-title>
    
    <v-divider />
    
    <!-- Comments Tab -->
    <v-window v-model="activeTab">
      <v-window-item value="comments">
        <v-card-text v-if="readOnly" class="text-center py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">This review is completed. Comments are view-only.</p>
        </v-card-text>
        
        <!-- Comments List -->
        <v-card-text v-if="validComments.length === 0" class="empty-state">
          <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">No comments yet. Be the first to add feedback!</p>
        </v-card-text>
        
        <v-list v-else class="pt-1 pb-2 px-2">
      <template v-for="(comment, index) in validComments" :key="comment.id">
        <v-list-item v-if="comment" class="comment-item">
          <div class="d-flex align-start w-100">
            <!-- Avatar aligned with name -->
            <v-avatar color="primary" size="32" class="mr-3" style="margin-top: 2px;">
              <span class="text-white font-weight-medium">{{ getInitials(comment.author) }}</span>
            </v-avatar>
            
            <!-- Comment content -->
            <div class="flex-grow-1" style="min-width: 0; width: 100%;">
              <!-- Header with name, chips, and actions -->
              <div class="d-flex align-center mb-1" style="width: 100%;">
                <div class="d-flex align-center flex-wrap" style="flex: 1 1 0; min-width: 0; margin-right: 12px;">
                  <span class="font-weight-medium text-body-1 mr-2 text-gray-900 dark:text-gray-100" style="white-space: nowrap;">{{ comment.author }}</span>
                  <v-chip
                    v-if="comment.resolved"
                    color="success"
                    size="small"
                    class="mr-1"
                    style="flex-shrink: 0;"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Resolved
                  </v-chip>
                </div>
                
                <!-- Action buttons -->
                <div class="d-flex align-center ga-2" style="flex-shrink: 0;">
                  <!-- Emoji picker button -->
                  <v-menu v-if="!readOnly" v-model="emojiMenus[comment.id]" location="top">
                    <template #activator="{ props: menuProps }">
                      <v-tooltip text="Add reaction">
                        <template #activator="{ props: tooltipProps }">
                          <button
                            type="button"
                            v-bind="{ ...menuProps, ...tooltipProps }"
                            class="reaction-add-btn text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                            :disabled="readOnly"
                            :class="readOnly ? 'opacity-50 cursor-not-allowed' : ''"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </template>
                      </v-tooltip>
                    </template>
                    <v-card class="emoji-picker">
                      <v-card-text class="pa-2">
                        <div class="d-flex flex-wrap ga-1" style="width: 200px;">
                          <button
                            v-for="emoji in availableEmojis"
                            :key="emoji"
                            @click="addEmojiReaction(comment.id, emoji)"
                            class="emoji-btn"
                            type="button"
                          >
                            {{ emoji }}
                          </button>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                  
                  <v-tooltip text="Reply">
                    <template #activator="{ props }">
                      <button
                        type="button"
                        v-bind="props"
                        @click="toggleReply(comment.id)"
                        class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                        :disabled="readOnly"
                        :class="readOnly ? 'opacity-50 cursor-not-allowed' : ''"
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
                        :disabled="readOnly"
                        :class="readOnly 
                          ? 'opacity-50 cursor-not-allowed' 
                          : comment.resolved 
                            ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'"
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
              </div>
              
              <!-- Timestamp -->
              <div class="text-caption text-gray-500 dark:text-gray-400 mb-2" style="white-space: nowrap;">
                {{ formatTimestamp(comment.timestamp) }}
              </div>
              
              <!-- Comment text -->
              <div class="comment-content">
                <p class="text-body-1 mb-0 text-gray-900 dark:text-gray-100">{{ comment.text }}</p>
              </div>
          
              <!-- Emoji Reactions -->
              <div class="mt-3 d-flex align-center flex-wrap ga-2">
                <!-- Display existing reactions -->
                <template v-for="(reactionGroup, emoji) in getReactionGroups(comment)" :key="`${comment.id}-${emoji}-${reactionGroup.length}`">
                  <v-chip
                    :color="hasUserReacted(comment, emoji) ? 'primary' : 'default'"
                    size="small"
                    variant="flat"
                    class="reaction-chip"
                    @click="toggleEmojiReaction(comment.id, emoji)"
                    :disabled="readOnly"
                  >
                    <span class="mr-1">{{ emoji }}</span>
                    <span class="font-weight-medium">{{ reactionGroup.length }}</span>
                  </v-chip>
                </template>
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
              <div v-if="comment.replies && comment.replies.length > 0" class="reply-section">
                <div class="reply-header">Replies ({{ comment.replies.length }})</div>
                <template v-for="(reply, replyIndex) in comment.replies" :key="reply?.id || `reply-${comment.id}-${replyIndex}`">
                  <div v-if="reply" class="reply-item d-flex align-start">
                    <v-avatar size="24" color="grey-lighten-2" class="mr-2" style="margin-top: 2px;">
                      <span class="text-gray-700 dark:text-gray-300 font-weight-medium text-xs">{{ getInitials(reply.author) }}</span>
                    </v-avatar>
                    <div class="flex-grow-1 w-100">
                      <div class="d-flex align-start justify-space-between mb-1">
                        <div class="d-flex flex-column">
                          <span class="font-weight-medium text-body-2 text-gray-900 dark:text-gray-100" style="white-space: nowrap;">{{ reply.author }}</span>
                          <span class="text-caption text-gray-500 dark:text-gray-400" style="white-space: nowrap;">{{ formatTimestamp(reply.timestamp) }}</span>
                        </div>
                        
                        <!-- Reply action buttons -->
                        <div class="d-flex align-center ga-2" style="flex-shrink: 0;">
                          <!-- Emoji picker for reply -->
                          <v-menu v-if="!readOnly" v-model="emojiMenus[`reply-${reply.id}`]" location="top">
                            <template #activator="{ props: menuProps }">
                              <v-tooltip text="Add reaction">
                                <template #activator="{ props: tooltipProps }">
                                  <button
                                    type="button"
                                    v-bind="{ ...menuProps, ...tooltipProps }"
                                    class="reaction-add-btn text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                                    :disabled="readOnly"
                                    :class="readOnly ? 'opacity-50 cursor-not-allowed' : ''"
                                  >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                </template>
                              </v-tooltip>
                            </template>
                            <v-card class="emoji-picker">
                              <v-card-text class="pa-2">
                                <div class="d-flex flex-wrap ga-1" style="width: 200px;">
                                  <button
                                    v-for="emoji in availableEmojis"
                                    :key="emoji"
                                    @click="addEmojiReactionToReply(comment.id, reply.id, emoji)"
                                    class="emoji-btn"
                                    type="button"
                                  >
                                    {{ emoji }}
                                  </button>
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-menu>
                        </div>
                      </div>
                      
                      <p class="text-body-2 mb-0 mt-1 text-gray-900 dark:text-gray-100">{{ reply.text }}</p>
                      
                      <!-- Reply emoji reactions -->
                      <div v-if="reply.reactions && reply.reactions.length > 0" class="d-flex align-center flex-wrap ga-2 mt-1">
                        <template v-for="(reactionGroup, emoji) in getReactionGroups(reply)" :key="emoji">
                          <v-chip
                            :color="hasUserReacted(reply, emoji) ? 'primary' : 'default'"
                            size="small"
                            variant="flat"
                            class="reaction-chip"
                            @click="toggleEmojiReactionOnReply(comment.id, reply.id, emoji)"
                            :disabled="readOnly"
                          >
                            <span class="mr-1">{{ emoji }}</span>
                            <span class="font-weight-medium">{{ reactionGroup.length }}</span>
                          </v-chip>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </v-list-item>
      </template>
    </v-list>
    
    <v-divider v-if="!readOnly" />
    
    <!-- Add Comment Form -->
    <v-card-text v-if="!readOnly">
      <v-form @submit.prevent="submitComment">
        <v-textarea
          v-model="newComment"
          label="Write your comment..."
          rows="3"
          variant="outlined"
          class="mb-3"
        />
        <div class="d-flex justify-end">
          <v-btn 
            type="submit" 
            color="primary" 
            :loading="submitting"
          >
            Add Comment
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
      </v-window-item>
      
      <!-- History Tab -->
      <v-window-item value="history">
        <v-card-text>
          <div v-if="!sortedHistory || sortedHistory.length === 0" class="empty-state">
            <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400">No history available</p>
          </div>
          
          <v-timeline v-else density="compact" class="pa-0">
            <v-timeline-item
              v-for="(entry, index) in sortedHistory"
              :key="`history-${index}-${entry.timestamp}`"
              :dot-color="getHistoryColor(entry.action)"
              size="small"
            >
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
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  versionId: String,
  readOnly: {
    type: Boolean,
    default: false
  },
  workflowHistory: {
    type: Array,
    default: () => []
  }
});

const activeTab = ref('comments');

const emit = defineEmits(['comment-added', 'comment-updated', 'reply-added', 'emoji-reaction-toggled', 'emoji-reaction-toggled-reply']);

// Filter out any null/undefined comments to prevent rendering errors
const validComments = computed(() => {
  return (props.comments || []).filter(comment => comment && comment.id);
});

const newComment = ref('');
const submitting = ref(false);
const replyingTo = ref(null);
const replyText = ref('');
const currentUser = ref('Current User'); // In real app, this would come from auth
const emojiMenus = ref({}); // Track open emoji menus per comment

// Available emoji reactions
const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '✅', '🎉', '🔥', '👏', '💯'];

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
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

// Watch for workflowHistory changes
watch(() => props.workflowHistory, (newVal) => {
  console.log('WorkflowHistory prop changed:', newVal);
}, { immediate: true, deep: true });

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

// Get user initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    // First letter of first name + first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Single name - use first two letters if available
  return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name[0].toUpperCase();
};

// Group reactions by emoji
const getReactionGroups = (comment) => {
  if (!comment.reactions || !comment.reactions.length) return {};
  
  const groups = {};
  comment.reactions.forEach(reaction => {
    const emoji = reaction.emoji || '👍'; // Default to thumbs up for old reactions
    if (!groups[emoji]) {
      groups[emoji] = [];
    }
    groups[emoji].push(reaction);
  });
  
  return groups;
};

// Check if current user has reacted with specific emoji
const hasUserReacted = (comment, emoji) => {
  if (!comment.reactions || !comment.reactions.length) return false;
  return comment.reactions.some(r => 
    (r.user === currentUser.value || r.userEmail === currentUser.value) && 
    (r.emoji || '👍') === emoji
  );
};

// Add emoji reaction
const addEmojiReaction = (commentId, emoji) => {
  if (props.readOnly) return;
  // Close the menu
  emojiMenus.value[commentId] = false;
  emit('emoji-reaction-toggled', commentId, emoji);
};

// Toggle emoji reaction (click on existing reaction chip)
const toggleEmojiReaction = (commentId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled', commentId, emoji);
};

// Add emoji reaction to reply
const addEmojiReactionToReply = (commentId, replyId, emoji) => {
  if (props.readOnly) return;
  emojiMenus.value[`reply-${replyId}`] = false;
  emit('emoji-reaction-toggled-reply', commentId, replyId, emoji);
};

// Toggle emoji reaction on reply
const toggleEmojiReactionOnReply = (commentId, replyId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled-reply', commentId, replyId, emoji);
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  submitting.value = true;
  
  try {
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newComment.value.trim(),
      author: 'Current User', // In real app, this would come from auth
      timestamp: new Date().toISOString(),
      version: props.versionId || null,
      resolved: false,
      replies: [],
      reactions: []
    };
    
    emit('comment-added', comment);
    
    // Reset form
    newComment.value = '';
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    submitting.value = false;
  }
};

const toggleReply = (commentId) => {
  if (props.readOnly) return;
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
  if (props.readOnly) return;
  if (!replyText.value.trim()) return;
  
  const reply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: replyText.value.trim(),
    author: 'Current User',
    timestamp: new Date().toISOString()
  };
  
  emit('reply-added', commentId, reply);
  replyText.value = '';
  replyingTo.value = null;
};

const toggleResolved = (commentId) => {
  if (props.readOnly) return;
  emit('comment-updated', commentId, 'toggle-resolved');
};
</script>

<style scoped>
.comment-item {
  align-items: flex-start !important;
  padding: 12px 16px !important;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.comment-item > .d-flex {
  width: 100%;
  box-sizing: border-box;
}

.comment-item .flex-grow-1 {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.comment-item .v-avatar {
  flex-shrink: 0;
  align-self: flex-start;
}

.comment-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .comment-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.comment-item:first-child {
  margin-top: 0;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.reply-item {
  padding: 8px 12px !important;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: rgba(0, 0, 0, 0.01);
  transition: background-color 0.2s;
}

.dark .reply-item {
  background-color: rgba(255, 255, 255, 0.02);
}

.reply-item > .flex-grow-1 {
  min-width: 0;
}

.reply-item .d-flex.justify-space-between {
  width: 100%;
}

.reply-item .v-avatar {
  flex-shrink: 0;
  align-self: flex-start;
}

.reply-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dark .reply-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.reply-item:last-child {
  margin-bottom: 0;
}

.comment-content {
  width: 100%;
  margin-top: 8px;
  line-height: 1.6;
}

.comment-content p {
  margin: 0;
  word-wrap: break-word;
}

.reaction-chip {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .reaction-chip {
  border-color: rgba(255, 255, 255, 0.2);
}

.reaction-chip:hover:not(:disabled) {
  transform: scale(1.05);
  border-color: rgba(0, 0, 0, 0.2);
}

.dark .reaction-chip:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.3);
}

.reaction-chip:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.reaction-add-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.reaction-add-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .reaction-add-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.emoji-picker {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.dark .emoji-picker {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  background-color: #1e293b !important; /* slate-800 */
}

.emoji-btn {
  width: 32px;
  height: 32px;
  font-size: 18px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background-color: rgba(99, 102, 241, 0.1);
  transform: scale(1.2);
}

.dark .emoji-btn:hover {
  background-color: rgba(129, 140, 248, 0.2);
}

/* Improve spacing and visual hierarchy */
:deep(.v-list-item__prepend) {
  padding-right: 12px;
}

:deep(.v-list-item__append) {
  padding-left: 12px;
}

:deep(.v-list-item) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: auto;
  width: 100%;
}

:deep(.v-list-item__content) {
  width: 100%;
  padding: 0;
}

:deep(.v-list-item-title) {
  font-size: 15px;
  line-height: 1.4;
}

:deep(.v-list-item-subtitle) {
  font-size: 13px;
  opacity: 0.7;
  margin-top: 4px;
}

/* Better divider styling */
:deep(.v-divider) {
  margin: 0 !important;
  opacity: 0.3;
}

/* Improve reply section styling */
.reply-section {
  margin-top: 16px;
  padding-left: 12px;
  border-left: 2px solid rgba(99, 102, 241, 0.2);
}

.dark .reply-section {
  border-left-color: rgba(129, 140, 248, 0.3);
}

.reply-header {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .reply-header {
  color: #94a3b8; /* slate-400 */
}

/* Improve form styling */
:deep(.v-textarea) {
  margin-bottom: 12px;
}

/* Dark mode textarea styling - lighter blue background */
.dark :deep(.v-textarea .v-field__input) {
  background-color: #334155 !important; /* slate-700 - lighter blue */
}

.dark :deep(.v-textarea .v-field) {
  background-color: #334155 !important; /* slate-700 - lighter blue */
}

/* Lighter blue outline for textarea */
html.dark :deep(.v-textarea .v-field__outline) {
  color: #c7d2fe !important; /* indigo-200 - even lighter blue */
  border-color: #c7d2fe !important;
}

html.dark :deep(.v-textarea .v-field__outline__start),
html.dark :deep(.v-textarea .v-field__outline__notch),
html.dark :deep(.v-textarea .v-field__outline__end) {
  border-color: #c7d2fe !important; /* indigo-200 - even lighter blue */
  color: #c7d2fe !important;
}

html.dark :deep(.v-textarea .v-field--focused .v-field__outline),
html.dark :deep(.v-textarea .v-field--focused .v-field__outline__start),
html.dark :deep(.v-textarea .v-field--focused .v-field__outline__notch),
html.dark :deep(.v-textarea .v-field--focused .v-field__outline__end) {
  border-color: #c7d2fe !important; /* indigo-200 - even lighter blue */
  color: #c7d2fe !important;
}

/* Also target the field element directly */
html.dark :deep(.v-textarea .v-field) {
  border-color: #c7d2fe !important;
}

html.dark :deep(.v-textarea .v-field--focused) {
  border-color: #c7d2fe !important;
}

.dark :deep(.v-textarea .v-field__input) {
  color: #f1f5f9 !important; /* slate-100 - light text */
}

/* Lighter blue label color in all states */
.dark :deep(.v-textarea label),
.dark :deep(.v-textarea .v-field-label),
.dark :deep(.v-textarea .v-field-label--floating),
.dark :deep(.v-textarea .v-field-label--active),
.dark :deep(.v-textarea .v-field-label--floating-active) {
  color: #c7d2fe !important; /* indigo-200 - lighter blue */
}

html.dark :deep(.v-textarea label),
html.dark :deep(.v-textarea .v-field-label),
html.dark :deep(.v-textarea .v-field-label--floating),
html.dark :deep(.v-textarea .v-field-label--active),
html.dark :deep(.v-textarea .v-field-label--floating-active) {
  color: #c7d2fe !important; /* indigo-200 - lighter blue */
}

html.dark :deep(.v-textarea .v-field--focused .v-field-label),
html.dark :deep(.v-textarea .v-field--focused label),
html.dark :deep(.v-textarea .v-field--focused .v-field-label--floating),
html.dark :deep(.v-textarea .v-field--focused .v-field-label--active) {
  color: #c7d2fe !important; /* indigo-200 - lighter blue */
}

:deep(.v-select) {
  margin-bottom: 12px;
}

/* Better chip styling */
:deep(.v-chip) {
  font-size: 12px;
  height: 24px;
  font-weight: 500;
}

/* Improve card header */
:deep(.v-card-title) {
  padding: 20px 24px 12px 24px !important;
  font-size: 18px;
  font-weight: 600;
}

:deep(.v-card-text) {
  padding: 20px 24px;
}
:deep(.v-avatar) {
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.v-avatar span) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>

