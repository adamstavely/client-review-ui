<template>
  <v-responsive aspect-ratio="16/9">
    <iframe
      v-if="url"
      :src="url"
      width="100%"
      height="600"
      frameborder="0"
    ></iframe>
  </v-responsive>
</template>

<script setup>
defineProps({
  url: String,
});
</script>
