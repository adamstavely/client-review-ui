<template>
  <form @submit.prevent="submit" class="space-y-6">
    <!-- Drag and Drop File Upload Card -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select file
      </label>
      <div
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragenter.prevent="isDragging = true"
        class="relative border-2 border-dashed rounded-lg p-8 transition-colors"
        :class="isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : file 
            ? 'border-indigo-300 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'"
      >
        <input
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          class="hidden"
          required
        />
        
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-2">
            <span class="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer" @click="openFileDialog">
              Click to upload
            </span>
            <span class="text-gray-500"> or drag and drop</span>
          </p>
          
          <p class="text-xs text-gray-500 mb-4">
            PDF, AI, Sketch, Figma, or other design files
          </p>
          
          <!-- Selected File Preview -->
          <div v-if="file" class="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFile"
                class="text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <button
            type="button"
            @click="openFileDialog"
            class="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Choose File
          </button>
        </div>
      </div>
    </div>
    
    <!-- Password Input -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
        Optional Password
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Enter password (optional)"
        class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      />
    </div>
    
    <!-- Upload Button -->
    <button
      type="submit"
      :disabled="!file"
      class="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Upload
    </button>
  </form>

  <!-- Alert Modal -->
  <AlertModal
    v-model="showAlert"
    title="Upload Error"
    :message="alertMessage"
    type="error"
  />
</template>

<script setup>
import { ref } from 'vue';
import { mockAPI, isMockMode } from '@/mockData.js';
import AlertModal from '@/components/AlertModal.vue';

const emit = defineEmits(['uploaded']);

const file = ref(null);
const password = ref('');
const showAlert = ref(false);
const alertMessage = ref('');
const isDragging = ref(false);
const fileInput = ref(null);

const handleFileChange = (event) => {
  file.value = event.target.files[0];
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer.files;
  if (droppedFiles.length > 0) {
    file.value = droppedFiles[0];
  }
};

const removeFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const submit = async () => {
  if (!file.value) return;

  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Use mock API
      const { uploadUrl, reviewId } = await mockAPI.upload(file.value.name, password.value);
      emit('uploaded', `/review/${reviewId}`);
    } else {
      // Use real API
      const res = await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.value.name,
          password: password.value || null,
        }),
      });

      const { uploadUrl, reviewId } = await res.json();

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file.value,
        headers: { 'Content-Type': file.value.type },
      });

      emit('uploaded', `/review/${reviewId}`);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    alertMessage.value = 'Upload failed. Please try again.';
    showAlert.value = true;
  }
};
</script>
