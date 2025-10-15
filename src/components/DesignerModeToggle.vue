<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-account-tie</v-icon>
      Designer Tools
    </v-card-title>
    <v-card-text>
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-switch
            v-model="isDesignerMode"
            label="Designer Mode"
            color="primary"
            @change="toggleDesignerMode"
          />
          <p class="text-caption text-grey mt-1">
            {{ isDesignerMode ? 'Upload new versions and manage design files' : 'View as client - add comments and feedback' }}
          </p>
        </div>
        <v-chip
          :color="isDesignerMode ? 'primary' : 'grey'"
          variant="outlined"
        >
          {{ isDesignerMode ? 'Designer' : 'Client' }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['mode-changed']);

const isDesignerMode = ref(false);

const toggleDesignerMode = () => {
  emit('mode-changed', isDesignerMode.value);
};

onMounted(() => {
  // Check if designer mode was previously enabled
  const savedMode = localStorage.getItem('designerMode');
  if (savedMode === 'true') {
    isDesignerMode.value = true;
    emit('mode-changed', true);
  }
});

const toggleDesignerMode = () => {
  localStorage.setItem('designerMode', isDesignerMode.value.toString());
  emit('mode-changed', isDesignerMode.value);
};
</script>
