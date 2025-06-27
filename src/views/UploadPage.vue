<template>
  <v-container class="pa-4" max-width="600px">
    <v-card>
      <v-card-title>Upload Design</v-card-title>
      <v-card-text>
        <FileUpload @uploaded="handleUpload" />
        <v-alert
          v-if="resultUrl"
          type="success"
          class="mt-6"
          border="start"
          prominent
        >
          Upload successful! <br />
          <a :href="resultUrl" target="_blank">{{ resultUrl }}</a>
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue';
import { ref } from 'vue';

const resultUrl = ref('');

const handleUpload = (url) => {
  resultUrl.value = url;
};
</script>
