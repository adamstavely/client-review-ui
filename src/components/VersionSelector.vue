<template>
  <div class="version-selector-wrapper mb-4">
    <div class="relative">
      <label 
        for="version-select" 
        class="version-select-label"
      >
        Select Version
      </label>
      <v-menu
        v-model="menuOpen"
        :close-on-content-click="true"
        location="bottom"
        :offset="0"
        class="version-select-menu"
        :width="menuWidth"
      >
        <template #activator="{ props }">
          <button
            ref="buttonRef"
            v-bind="props"
            class="version-select-button"
            :class="{ 'version-select-button--focused': menuOpen }"
          >
            <span class="version-select-button-text">{{ selectedLabel }}</span>
            <div class="version-select-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </template>
        <v-list class="version-select-dropdown">
          <v-list-item
            v-for="version in versions"
            :key="version.id"
            :value="version.id"
            :active="modelValue === version.id"
            @click="handleSelect(version.id)"
            class="version-select-option"
          >
            <v-list-item-title>{{ version.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: String,
  versions: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

const menuOpen = ref(false);
const menuWidth = ref(0);
const buttonRef = ref(null);

const selectedLabel = computed(() => {
  const selected = props.versions.find(v => v.id === props.modelValue);
  return selected ? selected.label : 'Select Version';
});

const updateMenuWidth = () => {
  if (buttonRef.value) {
    // Get the actual width including padding and borders
    const rect = buttonRef.value.getBoundingClientRect();
    menuWidth.value = rect.width;
  }
};

// Watch for menu opening to update width
watch(menuOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    updateMenuWidth();
  }
});

onMounted(() => {
  updateMenuWidth();
  window.addEventListener('resize', updateMenuWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMenuWidth);
});

const handleSelect = (value) => {
  emit('update:modelValue', value);
  menuOpen.value = false;
};
</script>
