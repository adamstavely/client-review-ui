<template>
  <div :class="isFullScreenPreview ? '' : 'min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'">
    <!-- Header -->
    <header v-if="!isFullScreenPreview" class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
            <svg class="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Design Review</h1>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <button
              @click="$router.push('/kanban')"
              class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="Kanban Board"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
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
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    @click="showUserMenu = false"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/mockData.js';
import DarkModeToggle from '@/components/DarkModeToggle.vue';

const route = useRoute();
const isFullScreenPreview = computed(() => route.path.includes('/preview'));

const showUserMenu = ref(false);
const userMenuRef = ref(null);
const currentUser = computed(() => getCurrentUser());

// Handle click outside to close menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
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
