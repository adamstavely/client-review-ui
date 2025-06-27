<template>
  <v-dialog v-model="modelValue" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6">Enter Password</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          outlined
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="submitPassword">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue', 'submit']);

const password = ref('');

const submitPassword = () => {
  emit('submit', password.value);
  emit('update:modelValue', false);
};
</script>
