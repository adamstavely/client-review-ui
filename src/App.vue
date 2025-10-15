<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Client Review UI</v-toolbar-title>
      <v-spacer />
      <v-chip color="orange" variant="outlined" class="mr-2">
        <v-icon start>mdi-test-tube</v-icon>
        Demo Mode
      </v-chip>
      <v-btn icon @click="$router.push('/')">
        <v-icon>mdi-upload</v-icon>
      </v-btn>
      <v-btn icon @click="$router.push('/admin')">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
