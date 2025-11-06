<template>
  <div class="space-y-6">
    <!-- Teams Header -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Teams</h2>
          </div>
          <button
            @click="showCreateTeamModal = true"
            class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Team
          </button>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage your teams and collaborate on design reviews</p>
      </div>
      
      <!-- Teams List -->
      <div class="p-8">
        <div v-if="teams.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-2">No teams yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Create your first team to start collaborating</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="team in teams"
            :key="team.id"
            class="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ team.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ team.description || 'No description' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="editTeam(team)"
                  class="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Edit Team"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDeleteTeam(team)"
                  class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete Team"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">Members</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ team.members.length }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">Reviews</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ team.reviews?.length || 0 }}</span>
              </div>
              
              <!-- Team Members Preview -->
              <div class="mt-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Members:</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="member in team.members.slice(0, 5)"
                    :key="member.email"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                    :class="member.role === 'Art Director' 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                      : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'"
                  >
                    {{ member.name || member.email }}
                    <span class="text-xs opacity-75">({{ member.role || 'Designer' }})</span>
                  </span>
                  <span
                    v-if="team.members.length > 5"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                  >
                    +{{ team.members.length - 5 }} more
                  </span>
                </div>
              </div>
              
              <button
                @click="manageTeamMembers(team)"
                class="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors shadow-sm"
              >
                Manage Members
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Team Modal -->
    <PromptModal
      v-model="showCreateTeamModal"
      title="Create New Team"
      label="Team Name"
      placeholder="Enter team name"
      type="text"
      :required="true"
      @submit="handleCreateTeam"
      @cancel="newTeamName = ''"
    />

    <!-- Edit Team Modal -->
    <TeamEditModal
      v-model="showEditTeamModal"
      :team="editingTeam"
      @team-updated="handleTeamUpdated"
    />

    <!-- Manage Members Modal -->
    <TeamMembersModal
      v-model="showMembersModal"
      :team="selectedTeam"
      @members-updated="handleMembersUpdated"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Delete Team"
      :message="`Are you sure you want to delete '${deletingTeam?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-color="red"
      @confirm="handleDeleteTeam"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-model="showAlert"
      :title="alertTitle"
      :message="alertMessage"
      :type="alertType"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { mockAPI, isMockMode } from '@/mockData.js';
import PromptModal from '@/components/PromptModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import AlertModal from '@/components/AlertModal.vue';
import TeamEditModal from '@/components/TeamEditModal.vue';
import TeamMembersModal from '@/components/TeamMembersModal.vue';

const teams = ref([]);
const showCreateTeamModal = ref(false);
const showEditTeamModal = ref(false);
const showMembersModal = ref(false);
const showDeleteConfirm = ref(false);
const showAlert = ref(false);
const editingTeam = ref(null);
const selectedTeam = ref(null);
const deletingTeam = ref(null);
const newTeamName = ref('');
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('success');

const loadTeams = async () => {
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      teams.value = await mockAPI.getTeams();
    } else {
      const res = await axios.get('/teams');
      teams.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load teams:', error);
    showAlertMessage('Error', 'Failed to load teams', 'error');
  }
};

const handleCreateTeam = async (teamName) => {
  if (!teamName.trim()) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.createTeam(teamName.trim());
    } else {
      await axios.post('/teams', { name: teamName.trim() });
    }
    showCreateTeamModal.value = false;
    newTeamName.value = '';
    showAlertMessage('Success', 'Team created successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to create team:', error);
    showAlertMessage('Error', 'Failed to create team. Please try again.', 'error');
  }
};

const editTeam = (team) => {
  editingTeam.value = team;
  showEditTeamModal.value = true;
};

const handleTeamUpdated = () => {
  showEditTeamModal.value = false;
  editingTeam.value = null;
  loadTeams();
  showAlertMessage('Success', 'Team updated successfully!', 'success');
};

const manageTeamMembers = (team) => {
  selectedTeam.value = team;
  showMembersModal.value = true;
};

const handleMembersUpdated = () => {
  showMembersModal.value = false;
  selectedTeam.value = null;
  loadTeams();
  showAlertMessage('Success', 'Team members updated successfully!', 'success');
};

const confirmDeleteTeam = (team) => {
  deletingTeam.value = team;
  showDeleteConfirm.value = true;
};

const handleDeleteTeam = async () => {
  if (!deletingTeam.value) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.deleteTeam(deletingTeam.value.id);
    } else {
      await axios.delete(`/teams/${deletingTeam.value.id}`);
    }
    showDeleteConfirm.value = false;
    deletingTeam.value = null;
    showAlertMessage('Success', 'Team deleted successfully!', 'success');
    await loadTeams();
  } catch (error) {
    console.error('Failed to delete team:', error);
    showAlertMessage('Error', 'Failed to delete team. Please try again.', 'error');
  }
};

const showAlertMessage = (title, message, type = 'success') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

onMounted(loadTeams);
</script>

