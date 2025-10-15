<template>
  <v-select
    :model-value="modelValue"
    :items="versions"
    item-title="label"
    item-value="id"
    label="Select Version"
    outlined
    class="mb-4"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
defineProps({
  modelValue: String,
  versions: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);
</script>
