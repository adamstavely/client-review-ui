<template>
  <div :class="isFullScreenPreview ? '' : 'min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'">
    <!-- Header -->
    <header v-if="!isFullScreenPreview" class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
              <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400" style="font-size: 32px;">stylus_note</span>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Design Review</h1>
            </div>
            <div class="flex items-center gap-3">
              <!-- Request Review Menu Item -->
              <button
                @click="showRequestReviewModal = true"
                class="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span class="text-gray-900 dark:text-gray-100">Request Review</span>
              </button>
              <!-- Review Status Menu Item -->
              <button
                @click="$router.push('/kanban')"
                class="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span class="text-gray-900 dark:text-gray-100">Review Status</span>
              </button>
              <!-- Review History Menu Item -->
              <button
                @click="$router.push('/history')"
                class="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-900 dark:text-gray-100">Review History</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Role switcher for demo/testing (remove in production) -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Role:</span>
              <select 
                v-model="currentUserRole" 
                @change="switchRole(currentUserRole)"
                class="text-sm border border-gray-300 dark:border-slate-600 rounded px-3 py-1.5 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:border-indigo-500 dark:hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              >
                <option value="designer">Designer</option>
                <option value="art_director">Art Director</option>
                <option value="creative_director">Creative Director</option>
              </select>
            </div>
            <DarkModeToggle />
            <button
              @click="$router.push('/admin')"
              class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="Admin"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <!-- User Avatar -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 p-1 hover:opacity-80 transition-opacity"
                title="User Menu"
              >
                <div class="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {{ userInitials }}
                </div>
              </button>
              
              <!-- User Menu Dropdown -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50"
              >
                <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-semibold">
                      {{ userInitials }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ currentUser.name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ currentUser.email }}</p>
                    </div>
                  </div>
                </div>
                <div class="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getRoleBadgeClass(currentUser.role)">
                    {{ getRoleLabel(currentUser.role) }}
                  </span>
                </div>
                <div class="py-1">
                  <button
                    @click="showUserMenu = false"
                    class="user-menu-button w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    @click="showUserMenu = false"
                    class="user-menu-button w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            <!-- App Picker -->
            <button
              @click="showAppPicker = !showAppPicker"
              class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors relative"
              title="App Picker"
              ref="appPickerRef"
            >
              <span class="material-symbols-outlined text-gray-600 dark:text-gray-300" style="font-size: 32px;">apps</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <v-app class="bg-transparent">
      <v-main class="bg-transparent">
        <div v-if="!isFullScreenPreview" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <router-view />
        </div>
        <div v-else>
          <router-view />
        </div>
      </v-main>
    </v-app>

    <!-- Request Review Modal -->
    <v-dialog :model-value="showRequestReviewModal" @update:model-value="(val) => showRequestReviewModal = val" persistent max-width="800">
      <v-card class="bg-white dark:bg-slate-800">
        <v-card-title class="d-flex align-center justify-space-between bg-white dark:bg-slate-800 px-6 pt-10 pb-4" style="font-family: inherit; font-weight: 600;">
          <div class="d-flex align-center">
            <svg class="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="text-gray-900 dark:text-gray-100 font-bold text-2xl">Design Review Request</span>
          </div>
          <button @click.stop="showRequestReviewModal = false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-0 bg-white dark:bg-slate-800 px-6">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">Upload design files or link to a website under development for client review</p>
          <FileUpload @uploaded="handleRequestReviewUpload" />
          <div
            v-if="requestReviewResultUrl"
            class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-green-800 dark:text-green-300">Upload successful!</p>
                <a :href="requestReviewResultUrl" target="_blank" class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline mt-1 block">{{ requestReviewResultUrl }}</a>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentUser } from '@/mockData.js';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
import FileUpload from '@/components/FileUpload.vue';

const route = useRoute();
const router = useRouter();
const isFullScreenPreview = computed(() => route.path.includes('/preview'));

const showUserMenu = ref(false);
const userMenuRef = ref(null);
const showAppPicker = ref(false);
const appPickerRef = ref(null);
const currentUser = computed(() => getCurrentUser());
const showRequestReviewModal = ref(false);
const requestReviewResultUrl = ref('');
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer'); // 'designer', 'art_director', 'creative_director'

const switchRole = (role) => {
  localStorage.setItem('userRole', role);
  currentUserRole.value = role;
  // Reload page to apply role changes across all components
  window.location.reload();
};

const handleRequestReviewUpload = (url) => {
  requestReviewResultUrl.value = url;
  // Optionally close modal after a delay or navigate to the review
  setTimeout(() => {
    showRequestReviewModal.value = false;
    router.push(url.replace(window.location.origin, ''));
  }, 2000);
};

// Handle click outside to close menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
  }
  if (appPickerRef.value && !appPickerRef.value.contains(event.target)) {
    showAppPicker.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const userInitials = computed(() => {
  const name = currentUser.value.name || currentUser.value.email;
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name[0].toUpperCase();
});

const getRoleLabel = (role) => {
  const labels = {
    'designer': 'Designer',
    'art_director': 'Art Director',
    'creative_director': 'Creative Director',
    'client': 'Client'
  };
  return labels[role] || 'User';
};

const getRoleBadgeClass = (role) => {
  if (role === 'creative_director') {
    return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
  } else if (role === 'art_director') {
    return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  }
  return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200';
};

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>
