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
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-4 flex-1">
              <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-gray-900">{{ link.filename }}</h3>
                <p class="text-sm text-gray-600 mt-0.5">{{ link.description }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Expires: {{ formatDate(link.expiresAt) }}
                  <span v-if="isExpired(link.expiresAt)" class="ml-2 text-red-600 font-medium">(Expired)</span>
                </p>
              </div>
            </div>
            <button
              v-if="isDesigner(link)"
              @click.stop="handleUploadNewVersion(link)"
              class="ml-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
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

    <!-- Version Upload Modal -->
    <VersionUploadModal
      v-model="showUploadModal"
      :review-id="selectedReviewId"
      @version-uploaded="handleVersionUploaded"
    />
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue';
import VersionUploadModal from '@/components/VersionUploadModal.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const $router = useRouter();

const resultUrl = ref('');
const showUploadModal = ref(false);
const selectedReviewId = ref(null);

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
    designer: 'Sarah Johnson'
  },
  {
    id: 'demo-2',
    filename: 'Mobile App Wireframes.sketch',
    description: '2 versions available | Password: design123',
    url: '/review/review-2',
    reviewId: 'review-2',
    icon: 'mdi-file-image',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    designer: 'Mike Chen'
  },
  {
    id: 'demo-3',
    filename: 'Brand Guidelines.ai',
    description: '4 versions available | Password: brand2024',
    url: '/review/review-3',
    reviewId: 'review-3',
    icon: 'mdi-palette',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    designer: 'Alex Rodriguez'
  }
]);

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');

// Check if current user is the designer for a given link
const isDesigner = (link) => {
  return currentUser.value === link.designer;
};

// Handle card click - navigate to review page
const handleCardClick = (link, event) => {
  // Don't navigate if clicking on the upload button
  if (event.target.closest('button')) {
    return;
  }
  $router.push(link.url);
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
</script>
