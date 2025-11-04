<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-lg">
      <div class="border-b border-gray-200 px-8 py-6">
        <div class="flex items-center gap-3">
          <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        </div>
        <p class="text-sm text-gray-600 mt-1">Manage design links and batch operations</p>
      </div>
      <div class="p-8">
        <v-data-table
          :items="links"
          :headers="headers"
          item-value="id"
          show-select
          v-model="selectedIds"
          color="primary"
        >
          <template #item.expiresAt="{ item }">
            {{ formatDate(item.expiresAt) }}
          </template>
          <template #item.hasPassword="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="item.hasPassword"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Protected
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Public
              </span>
            </div>
          </template>
          <template #item.extended="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="item.extended"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                Yes
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                No
              </span>
            </div>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-tooltip text="Copy review URL">
                <template #activator="{ props }">
                  <button
                    @click="copyReviewUrl(item)"
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Extend expiration by 7 days">
                <template #activator="{ props }">
                  <button
                    @click="extend(item.id)"
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Override expiration date">
                <template #activator="{ props }">
                  <button
                    @click="openOverrideDialog(item.id)"
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Reset password">
                <template #activator="{ props }">
                  <button
                    @click="openPasswordDialog(item.id)"
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete this link">
                <template #activator="{ props }">
                  <button
                    @click="openDeleteConfirm(item.id)"
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <div class="mt-6">
          <v-tooltip text="Delete all selected links">
            <template #activator="{ props }">
              <button
                class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                :disabled="!selectedIds.length"
                @click="openBatchDeleteConfirm"
                v-bind="props"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DatePickerModal
      v-model="showOverrideDialog"
      title="Override Expiration Date"
      label="Select new expiration date"
      :min-date="minDate"
      required
      @submit="handleOverrideSubmit"
    />

    <PromptModal
      v-model="showPasswordDialog"
      title="Reset Password"
      label="Enter new password (leave empty to remove password)"
      placeholder="Enter password"
      type="password"
      :required="false"
      @submit="handlePasswordSubmit"
      @cancel="pendingPasswordId = null"
    />

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Delete Link"
      message="Are you sure you want to delete this link?"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteConfirm"
    />

    <ConfirmModal
      v-model="showBatchDeleteConfirm"
      title="Delete Selected Links"
      message="Are you sure you want to delete all selected links?"
      confirm-text="Delete All"
      confirm-color="red"
      @confirm="handleBatchDeleteConfirm"
    />

    <AlertModal
      v-model="showAlert"
      :title="alertTitle"
      :message="alertMessage"
      :type="alertType"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { mockAPI, isMockMode } from '@/mockData.js';
import PromptModal from '@/components/PromptModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import AlertModal from '@/components/AlertModal.vue';
import DatePickerModal from '@/components/DatePickerModal.vue';

const links = ref([]);
const selectedIds = ref([]);

// Modal states
const showOverrideDialog = ref(false);
const showPasswordDialog = ref(false);
const showDeleteConfirm = ref(false);
const showBatchDeleteConfirm = ref(false);
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('info');

// Pending actions
const pendingOverrideId = ref(null);
const pendingPasswordId = ref(null);
const pendingDeleteId = ref(null);

const headers = [
  { title: 'Filename', key: 'filename' },
  { title: 'Designer', key: 'designer' },
  { title: 'Password', key: 'hasPassword', sortable: false, align: 'center' },
  { title: 'Expires', key: 'expiresAt' },
  { title: 'Extended', key: 'extended', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const loadLinks = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      const res = await mockAPI.getAdminLinks(true); // Always load all links
      links.value = res;
    } else {
      const res = await axios.get('/admin', {
        params: { expired: true }, // Always load all links
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
      links.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load links:', error);
  }
};

const extend = async (id) => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.extendLink(id);
    } else {
      await axios.post(`/admin/${id}/extend`, {}, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    loadLinks();
  } catch (error) {
    console.error('Failed to extend link:', error);
    showAlertMessage('Error', 'Failed to extend link expiration', 'error');
  }
};

const openOverrideDialog = (id) => {
  pendingOverrideId.value = id;
  showOverrideDialog.value = true;
};

const handleOverrideSubmit = async (date) => {
  if (!date || !pendingOverrideId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Calculate days from today to selected date
      const today = new Date();
      const selectedDate = new Date(date);
      const diffTime = selectedDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      await mockAPI.overrideLink(pendingOverrideId.value, diffDays);
    } else {
      await axios.post(`/admin/${pendingOverrideId.value}/override`, { expirationDate: date }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    pendingOverrideId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to override link:', error);
    showAlertMessage('Error', 'Failed to override expiration date', 'error');
  }
};

const openPasswordDialog = (id) => {
  pendingPasswordId.value = id;
  showPasswordDialog.value = true;
};

const handlePasswordSubmit = async (newPassword) => {
  if (!pendingPasswordId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.resetPassword(pendingPasswordId.value, newPassword || '');
    } else {
      await axios.post(`/admin/${pendingPasswordId.value}/reset-password`, { password: newPassword || null }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    showAlertMessage('Success', 'Password updated successfully!', 'success');
    pendingPasswordId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to reset password:', error);
    showAlertMessage('Error', 'Failed to update password. Please try again.', 'error');
  }
};

const openDeleteConfirm = (id) => {
  pendingDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (!pendingDeleteId.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.deleteLink(pendingDeleteId.value);
    } else {
      await axios.delete(`/admin/${pendingDeleteId.value}`, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    pendingDeleteId.value = null;
    loadLinks();
  } catch (error) {
    console.error('Failed to delete link:', error);
    showAlertMessage('Error', 'Failed to delete link', 'error');
  }
};

const openBatchDeleteConfirm = () => {
  if (!selectedIds.value.length) return;
  showBatchDeleteConfirm.value = true;
};

const handleBatchDeleteConfirm = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.batchDelete(selectedIds.value);
    } else {
      await axios.post('/admin/batch-delete', { ids: selectedIds.value }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    selectedIds.value = [];
    loadLinks();
  } catch (error) {
    console.error('Failed to batch delete:', error);
    showAlertMessage('Error', 'Failed to delete selected links', 'error');
  }
};

const copyReviewUrl = async (item) => {
  try {
    // Extract review ID from admin link ID
    // Admin links have IDs like "admin-1" or "admin-review-123"
    // Reviews have IDs like "review-1" or "review-123"
    let reviewId;
    
    if (item.id.includes('review-')) {
      // Extract review ID: admin-review-123 -> review-123
      const match = item.id.match(/review-[^/]+/);
      reviewId = match ? match[0] : item.id.replace('admin-', 'review-');
    } else if (item.id.startsWith('admin-')) {
      // Legacy format: admin-1 -> review-1
      const num = item.id.replace('admin-', '');
      reviewId = `review-${num}`;
    } else if (item.reviewId) {
      // Use reviewId field if available (from real API)
      reviewId = item.reviewId;
    } else {
      // Fallback: assume it's already a review ID
      reviewId = item.id;
    }
    
    // Generate the full URL
    const reviewUrl = `${window.location.origin}/review/${reviewId}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(reviewUrl);
    
    showAlertMessage('Success', 'Review URL copied to clipboard!', 'success');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    showAlertMessage('Error', 'Failed to copy URL to clipboard', 'error');
  }
};

const showAlertMessage = (title, message, type = 'info') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date, return as-is
    
    // Extract date components using UTC to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    // If it's already a formatted string, try to parse it differently
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      const [y, m, d] = dateOnly.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    }
    return dateString;
  }
};

onMounted(loadLinks);
</script>
