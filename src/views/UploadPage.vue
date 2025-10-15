<template>
  <v-container class="pa-4" max-width="800px">
    <ApiStatus @mode-changed="handleApiModeChanged" />
    
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

    <!-- Demo Links for Testing -->
    <v-card class="mt-6">
      <v-card-title>Demo Review Links</v-card-title>
      <v-card-text>
        <p class="text-subtitle-1 mb-4">Test the review functionality with these demo links:</p>
        <v-list>
          <v-list-item
            v-for="link in demoLinks"
            :key="link.id"
            :title="link.filename"
            :subtitle="link.description"
            :prepend-icon="link.icon"
          >
            <template #append>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="$router.push(link.url)"
              >
                View Review
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
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
