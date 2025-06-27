<template>
  <v-container class="pa-4">
    <v-card>
      <v-card-title>Admin Dashboard</v-card-title>
      <v-card-text>
        <v-switch
          v-model="showExpired"
          label="Show Expired"
          inset
          @change="loadLinks"
        />
        <v-data-table
          :items="links"
          :headers="headers"
          item-value="id"
          show-select
          v-model="selectedIds"
          class="mt-4"
        >
          <template #item.actions="{ item }">
            <v-btn icon color="blue" @click="extend(item.id)">
              <v-icon>mdi-clock-plus</v-icon>
            </v-btn>
            <v-btn icon color="amber" @click="override(item.id)">
              <v-icon>mdi-calendar-edit</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="remove(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <v-btn
          class="mt-4"
          color="red"
          variant="elevated"
          :disabled="!selectedIds.length"
          @click="batchDelete"
        >
          Delete Selected
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const showExpired = ref(false);
const links = ref([]);
const selectedIds = ref([]);

const headers = [
  { title: 'Filename', key: 'filename' },
  { title: 'Expires', key: 'expiresAt' },
  { title: 'Extended', key: 'extended' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const loadLinks = async () => {
  const res = await axios.get('/admin', {
    params: { expired: showExpired.value },
    headers: { 'x-admin-token': localStorage.getItem('adminToken') },
  });
  links.value = res.data;
};

const extend = async (id) => {
  await axios.post(`/admin/${id}/extend`, {}, {
    headers: { 'x-admin-token': localStorage.getItem('adminToken') },
  });
  loadLinks();
};

const override = async (id) => {
  const days = prompt('Enter new duration in days:');
  if (!days) return;
  await axios.post(`/admin/${id}/override`, { days: Number(days) }, {
    headers: { 'x-admin-token': localStorage.getItem('adminToken') },
  });
  loadLinks();
};

const remove = async (id) => {
  if (!confirm('Are you sure?')) return;
  await axios.delete(`/admin/${id}`, {
    headers: { 'x-admin-token': localStorage.getItem('adminToken') },
  });
  loadLinks();
};

const batchDelete = async () => {
  if (!confirm('Delete all selected?')) return;
  await axios.post('/admin/batch-delete', { ids: selectedIds.value }, {
    headers: { 'x-admin-token': localStorage.getItem('adminToken') },
  });
  selectedIds.value = [];
  loadLinks();
};

onMounted(loadLinks);
</script>
