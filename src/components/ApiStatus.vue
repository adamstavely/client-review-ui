<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" :color="statusColor">{{ statusIcon }}</v-icon>
      API Connection
    </v-card-title>
    <v-card-text>
      <div class="d-flex align-center justify-space-between">
        <div>
          <p class="text-subtitle-1 mb-1">{{ statusText }}</p>
          <p class="text-caption text-grey">
            {{ isMockMode ? 'Using mock data for testing' : `Connected to ${apiUrl}` }}
          </p>
        </div>
        <div class="d-flex align-center ga-2">
          <v-btn
            icon
            size="small"
            @click="checkApiStatus"
            :loading="checking"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-switch
            v-model="forceMockMode"
            label="Force Mock Mode"
            color="orange"
            @change="toggleMockMode"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { isMockMode } from '@/mockData.js';

const emit = defineEmits(['mode-changed']);

const checking = ref(false);
const mockMode = ref(true);
const forceMockMode = ref(false);

const apiUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');

const statusColor = computed(() => {
  if (checking.value) return 'orange';
  return mockMode.value ? 'orange' : 'green';
});

const statusIcon = computed(() => {
  if (checking.value) return 'mdi-loading';
  return mockMode.value ? 'mdi-test-tube' : 'mdi-check-circle';
});

const statusText = computed(() => {
  if (checking.value) return 'Checking API connection...';
  return mockMode.value ? 'Mock Mode Active' : 'API Connected';
});

const checkApiStatus = async () => {
  checking.value = true;
  try {
    mockMode.value = await isMockMode();
    emit('mode-changed', mockMode.value);
  } catch (error) {
    console.error('Failed to check API status:', error);
  } finally {
    checking.value = false;
  }
};

const toggleMockMode = () => {
  localStorage.setItem('forceMockMode', forceMockMode.value.toString());
  checkApiStatus();
};

onMounted(async () => {
  forceMockMode.value = localStorage.getItem('forceMockMode') === 'true';
  await checkApiStatus();
});
</script>
