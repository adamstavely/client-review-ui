<template>
  <div class="space-y-6">
    <ApiStatus @mode-changed="handleApiModeChanged" />
    
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
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">{{ link.filename }}</h3>
                <p class="text-sm text-gray-600 mt-0.5">{{ link.description }}</p>
              </div>
            </div>
            <button
              @click="$router.push(link.url)"
              class="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              View Review
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue';
import ApiStatus from '@/components/ApiStatus.vue';
import { ref } from 'vue';

const resultUrl = ref('');

const handleUpload = (url) => {
  resultUrl.value = url;
};

const handleApiModeChanged = (isMockMode) => {
  console.log('API mode changed:', isMockMode ? 'Mock' : 'Real API');
};

// Demo links for testing
const demoLinks = ref([
  {
    id: 'demo-1',
    filename: 'Website Design v2.pdf',
    description: 'No password required - 3 versions available',
    url: '/review/review-1',
    icon: 'mdi-file-pdf-box'
  },
  {
    id: 'demo-2',
    filename: 'Mobile App Wireframes.sketch',
    description: 'Password: design123 - 2 versions available',
    url: '/review/review-2',
    icon: 'mdi-file-image'
  },
  {
    id: 'demo-3',
    filename: 'Brand Guidelines.ai',
    description: 'Password: brand2024 - 4 versions available (expired)',
    url: '/review/review-3',
    icon: 'mdi-palette'
  }
]);
</script>
