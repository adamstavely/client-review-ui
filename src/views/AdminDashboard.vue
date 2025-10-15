<template>
  <v-container class="pa-4">
    <v-card>
      <v-card-title>Admin Dashboard</v-card-title>
      <v-card-text>
        <v-tooltip text="Toggle to show/hide expired links">
          <template #activator="{ props }">
            <v-switch
              v-model="showExpired"
              label="Show Expired"
              inset
              v-bind="props"
              @change="loadLinks"
            />
          </template>
        </v-tooltip>
        <v-data-table
          :items="links"
          :headers="headers"
          item-value="id"
          show-select
          v-model="selectedIds"
          class="mt-4"
        >
          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-tooltip text="Extend expiration by 7 days">
                <template #activator="{ props }">
                  <v-btn icon color="blue" v-bind="props" @click="extend(item.id)">
                    <v-icon>mdi-clock-plus</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Override expiration date">
                <template #activator="{ props }">
                  <v-btn icon color="amber" v-bind="props" @click="override(item.id)">
                    <v-icon>mdi-calendar-edit</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Reset password">
                <template #activator="{ props }">
                  <v-btn icon color="green" v-bind="props" @click="resetPassword(item.id)">
                    <v-icon>mdi-key-variant</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete this link">
                <template #activator="{ props }">
                  <v-btn icon color="red" v-bind="props" @click="remove(item.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <v-tooltip text="Delete all selected links">
          <template #activator="{ props }">
            <v-btn
              class="mt-4"
              color="red"
              variant="elevated"
              :disabled="!selectedIds.length"
              v-bind="props"
              @click="batchDelete"
            >
              Delete Selected
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { mockAPI, isMockMode } from '@/mockData.js';

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
  try {
    if (isMockMode()) {
      const res = await mockAPI.getAdminLinks(showExpired.value);
      links.value = res;
    } else {
      const res = await axios.get('/admin', {
        params: { expired: showExpired.value },
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
      links.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load links:', error);
  }
};

const extend = async (id) => {
  try {
    if (isMockMode()) {
      await mockAPI.extendLink(id);
    } else {
      await axios.post(`/admin/${id}/extend`, {}, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    loadLinks();
  } catch (error) {
    console.error('Failed to extend link:', error);
  }
};

const override = async (id) => {
  const days = prompt('Enter new duration in days:');
  if (!days) return;
  
  try {
    if (isMockMode()) {
      await mockAPI.overrideLink(id, Number(days));
    } else {
      await axios.post(`/admin/${id}/override`, { days: Number(days) }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    loadLinks();
  } catch (error) {
    console.error('Failed to override link:', error);
  }
};

const resetPassword = async (id) => {
  const newPassword = prompt('Enter new password (leave empty to remove password):');
  if (newPassword === null) return; // User cancelled
  
  try {
    if (isMockMode()) {
      await mockAPI.resetPassword(id, newPassword);
    } else {
      await axios.post(`/admin/${id}/reset-password`, { password: newPassword || null }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    alert('Password updated successfully!');
    loadLinks();
  } catch (error) {
    console.error('Failed to reset password:', error);
    alert('Failed to update password. Please try again.');
  }
};

const remove = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    if (isMockMode()) {
      await mockAPI.deleteLink(id);
    } else {
      await axios.delete(`/admin/${id}`, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    loadLinks();
  } catch (error) {
    console.error('Failed to delete link:', error);
  }
};

const batchDelete = async () => {
  if (!confirm('Delete all selected?')) return;
  
  try {
    if (isMockMode()) {
      await mockAPI.batchDelete(selectedIds.value);
    } else {
      await axios.post('/admin/batch-delete', { ids: selectedIds.value }, {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') },
      });
    }
    selectedIds.value = [];
    loadLinks();
  } catch (error) {
    console.error('Failed to batch delete:', error);
  }
};

onMounted(loadLinks);
</script>
