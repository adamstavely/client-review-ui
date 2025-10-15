<template>
  <v-form @submit.prevent="submit">
    <v-file-input
      v-model="file"
      label="Select file"
      outlined
      class="mb-4"
      required
    />
    <v-text-field
      v-model="password"
      label="Optional Password"
      type="password"
      outlined
      class="mb-4"
    />
    <v-btn type="submit" color="orange" block>Upload</v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { mockAPI, isMockMode } from '@/mockData.js';

const emit = defineEmits(['uploaded']);

const file = ref(null);
const password = ref('');

const submit = async () => {
  if (!file.value) return;

  try {
    if (isMockMode()) {
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
    alert('Upload failed. Please try again.');
  }
};
</script>
