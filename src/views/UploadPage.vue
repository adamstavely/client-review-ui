<template>
  <div class="space-y-6">
    <!-- Upload Card -->
    <div class="bg-white rounded-lg shadow-lg">
      <div class="border-b border-gray-200 px-8 py-6">
        <h2 class="text-2xl font-bold text-gray-900">Upload Design</h2>
        <p class="text-sm text-gray-600 mt-1">Upload Adobe files for client review</p>
      </div>
      <div class="p-8">
        <FileUpload @uploaded="handleUpload" />
        <div
          v-if="resultUrl"
          class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div class="flex items-start">
            <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-green-800">Upload successful!</p>
              <a :href="resultUrl" target="_blank" class="text-sm text-green-600 hover:text-green-800 underline mt-1 block">{{ resultUrl }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Links Card -->
    <div class="bg-white rounded-lg shadow-lg">
      <div class="border-b border-gray-200 px-8 py-6">
        <h2 class="text-2xl font-bold text-gray-900">Demo Review Links</h2>
        <p class="text-sm text-gray-600 mt-1">Test the review functionality with these demo links</p>
      </div>
      <div class="p-8">
        <div class="space-y-4">
          <div
            v-for="link in demoLinks"
            :key="link.id"
            @click="handleCardClick(link, $event)"
            class="flex items-center justify-between p-4 border rounded-lg transition-colors"
            :class="link.completed 
              ? 'border-gray-300 bg-gray-50 opacity-75 cursor-not-allowed' 
              : 'border-gray-200 hover:bg-gray-50 cursor-pointer'"
          >
            <div class="flex items-center gap-4 flex-1">
              <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-gray-900">{{ link.filename }}</h3>
                <p class="text-sm text-gray-600 mt-0.5">{{ getDescription(link) }}</p>
                <p class="text-xs mt-1">
                  <span v-if="link.completed" class="text-green-600 font-medium">✓ Completed</span>
                  <template v-else-if="isExpired(link.expiresAt)">
                    <span class="text-red-600 font-medium">Expired: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                  <template v-else-if="isExpiringSoon(link.expiresAt)">
                    <span class="text-orange-500 font-medium">Expires: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                  <template v-else>
                    <span class="text-gray-500">Expires: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="isDesigner(link) && !link.completed"
                @click.stop="handleMarkCompleted(link)"
                class="ml-4 px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Completed
              </button>
              <button
                v-if="isDesigner(link) && !link.completed"
                @click.stop="handleChangePassword(link)"
                class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </button>
              <button
                v-if="isDesigner(link) && !link.completed"
                @click.stop="handleExtendExpiration(link)"
                class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Extend Expiration
              </button>
              <button
                v-if="isDesigner(link) && !link.completed"
                @click.stop="handleUploadNewVersion(link)"
                class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload New Version
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Version Upload Modal -->
    <VersionUploadModal
      v-model="showUploadModal"
      :review-id="selectedReviewId"
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
import FileUpload from '@/components/FileUpload.vue';
import VersionUploadModal from '@/components/VersionUploadModal.vue';
import PromptModal from '@/components/PromptModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import AlertModal from '@/components/AlertModal.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews } from '@/mockData.js';

const $router = useRouter();

const resultUrl = ref('');
const showUploadModal = ref(false);
const selectedReviewId = ref(null);
const showPasswordModal = ref(false);
const showConfirmModal = ref(false);
const selectedLink = ref(null);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('success');

const handleUpload = (url) => {
  resultUrl.value = url;
};

// Demo links for testing
const demoLinks = ref([
  {
    id: 'demo-1',
    filename: 'Website Design v2.pdf',
    description: '3 versions available | No password required',
    url: '/review/review-1',
    reviewId: 'review-1',
    icon: 'mdi-file-pdf-box',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    designer: 'Sarah Johnson',
    password: null,
    completed: false
  },
  {
    id: 'demo-2',
    filename: 'Mobile App Wireframes.sketch',
    description: '2 versions available | Password: design123',
    url: '/review/review-2',
    reviewId: 'review-2',
    icon: 'mdi-file-image',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    designer: 'Mike Chen',
    password: 'design123',
    completed: false
  },
  {
    id: 'demo-3',
    filename: 'Brand Guidelines.ai',
    description: '4 versions available | Password: brand2024',
    url: '/review/review-3',
    reviewId: 'review-3',
    icon: 'mdi-palette',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    designer: 'Alex Rodriguez',
    password: 'brand2024',
    completed: false
  }
]);

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');

// Check if current user is the designer for a given link
const isDesigner = (link) => {
  return currentUser.value === link.designer;
};

// Get description based on user role
const getDescription = (link) => {
  // Extract version count from the link's stored description
  const versionMatch = link.description.match(/^(\d+)\s+versions/);
  const versionCount = versionMatch ? versionMatch[1] : '0';
  
  // Check if password exists
  const hasPassword = link.password !== null && link.password !== undefined;
  
  if (hasPassword) {
    if (isDesigner(link)) {
      // Designer sees the actual password
      return `${versionCount} versions available | Password: ${link.password}`;
    } else {
      // Client only sees that password is required
      return `${versionCount} versions available | Password required`;
    }
  } else {
    return `${versionCount} versions available | No password required`;
  }
};

// Handle card click - navigate to review page
const handleCardClick = (link, event) => {
  // Don't navigate if clicking on a button
  if (event.target.closest('button')) {
    return;
  }
  // Don't navigate if review is completed
  if (link.completed) {
    return;
  }
  $router.push(link.url);
};

// Handle change password - open password modal
const handleChangePassword = (link) => {
  selectedLink.value = link;
  showPasswordModal.value = true;
};

// Handle password changed from modal
const handlePasswordChanged = async (newPassword) => {
  if (!selectedLink.value) return;
  
  try {
    const useMockMode = await isMockMode();
    
    // Update password (empty string means remove password)
    const passwordValue = newPassword.trim() || null;
    
    if (useMockMode) {
      // Update mock data - find review by reviewId
      const review = mockReviews.find(r => r.id === selectedLink.value.reviewId);
      if (review) {
        review.password = passwordValue;
      }
      
      // Update demo link
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].password = passwordValue;
        // Update description
        const versionCount = demoLinks.value[linkIndex].description.split(' ')[0];
        demoLinks.value[linkIndex].description = passwordValue 
          ? `${versionCount} versions available | Password: ${passwordValue}`
          : `${versionCount} versions available | No password required`;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].password = passwordValue;
        // Update description
        const versionCount = demoLinks.value[linkIndex].description.split(' ')[0];
        demoLinks.value[linkIndex].description = passwordValue 
          ? `${versionCount} versions available | Password: ${passwordValue}`
          : `${versionCount} versions available | No password required`;
      }
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

// Handle mark as completed - show confirmation modal
const handleMarkCompleted = (link) => {
  selectedLink.value = link;
  confirmModalTitle.value = 'Mark Review as Completed';
  confirmModalMessage.value = `Are you sure you want to mark "${link.filename}" as completed? The review link will be disabled, but comments and information will be preserved.`;
  showConfirmModal.value = true;
};

// Confirm mark as completed
const confirmMarkCompleted = async () => {
  if (!selectedLink.value) return;
  
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data - mark review as completed
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].completed = true;
      }
      
      // Also update mock reviews
      const review = mockReviews.find(r => r.id === selectedLink.value.reviewId);
      if (review) {
        review.completed = true;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].completed = true;
      }
    }
    
    showAlertMessage('Success', 'Review marked as completed. The link is now disabled.', 'success');
  } catch (error) {
    console.error('Failed to mark review as completed:', error);
    showAlertMessage('Error', 'Failed to mark review as completed. Please try again.', 'error');
  }
};

// Handle extend expiration - extend by 30 days
const handleExtendExpiration = async (link) => {
  try {
    const useMockMode = await isMockMode();
    
    // Calculate new expiration date: 30 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    newExpiresAt.setHours(23, 59, 59, 999); // Set to end of day
    const newExpiresAtISO = newExpiresAt.toISOString();
    
    if (useMockMode) {
      // Update mock data - find the link by reviewId
      const linkIndex = demoLinks.value.findIndex(l => l.id === link.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].expiresAt = newExpiresAtISO;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === link.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].expiresAt = newExpiresAtISO;
      }
    }
    
    showAlertMessage('Success', 'Expiration date extended by 30 days!', 'success');
  } catch (error) {
    console.error('Failed to extend expiration:', error);
    showAlertMessage('Error', 'Failed to extend expiration date. Please try again.', 'error');
  }
};

// Handle upload new version - open modal
const handleUploadNewVersion = (link) => {
  selectedReviewId.value = link.reviewId;
  showUploadModal.value = true;
};

// Handle version uploaded successfully
const handleVersionUploaded = () => {
  // Modal will close automatically, but we could show a success message here
  showUploadModal.value = false;
};

const showAlertMessage = (title, message, type = 'success') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      const [y, m, d] = dateOnly.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    }
    return dateString;
  }
};

const isExpired = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date < new Date();
};

const isExpiringSoon = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  // Not expired and expires within 7 days
  return date >= now && date <= sevenDaysFromNow;
};
</script>
