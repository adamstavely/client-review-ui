<template>
  <v-container class="pa-4" max-width="960px">
    <v-card v-if="!passwordRequired || passwordValidated">
      <v-card-title class="text-h6">{{ metadata.filename }}</v-card-title>
      <v-card-text>
        <VersionSelector
          v-model="selectedVersion"
          :versions="metadata.versions"
          @update:modelValue="loadVersion"
        />
        <PreviewFrame :url="previewUrl" />
      </v-card-text>
    </v-card>

    <PasswordPrompt
      v-model="passwordRequired"
      @submit="submitPassword"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import VersionSelector from '@/components/VersionSelector.vue';
import PreviewFrame from '@/components/PreviewFrame.vue';
import PasswordPrompt from '@/components/PasswordPrompt.vue';

const route = useRoute();
const reviewId = route.params.id;

const metadata = ref({ filename: '', versions: [] });
const selectedVersion = ref('');
const previewUrl = ref('');
const password = ref('');
const passwordRequired = ref(false);
const passwordValidated = ref(false);

const loadVersion = async () => {
  const res = await axios.get(`/review/${reviewId}/version/${selectedVersion.value}`);
  previewUrl.value = res.data.url;
};

const submitPassword = async (input) => {
  try {
    const res = await axios.get(`/review/${reviewId}`, {
      params: { password: input },
    });
    metadata.value = res.data;
    selectedVersion.value = res.data.versions[0].id;
    passwordValidated.value = true;
    loadVersion();
  } catch {
    alert('Invalid password');
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/review/${reviewId}`);
    metadata.value = res.data;
    selectedVersion.value = res.data.versions[0].id;
    passwordValidated.value = true;
    loadVersion();
  } catch (err) {
    if (err.response?.status === 401) {
      passwordRequired.value = true;
    }
  }
});
</script>
