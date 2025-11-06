import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vuetify/styles';
import './style.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

// Initialize dark mode before creating Vuetify
const initDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  let isDark = false;
  
  if (saved !== null) {
    isDark = saved === 'true';
  } else {
    // Check system preference
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  
  return isDark ? 'dark' : 'light';
};

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initDarkMode(),
    themes: {
      light: {
        colors: {
          primary: '#4f46e5', // indigo-600
          secondary: '#6366f1', // indigo-500
          background: '#ffffff',
          surface: '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#818cf8', // indigo-400 (lighter for dark mode)
          secondary: '#6366f1', // indigo-500
          background: '#0f172a', // slate-900
          surface: '#1e293b', // slate-800
        },
      },
    },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VMain: {
      style: 'background: transparent;',
    },
    VApp: {
      style: 'background: transparent;',
    },
    VSwitch: {
      color: 'primary',
    },
    VCheckbox: {
      color: 'primary',
    },
  },
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');
