import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vuetify/styles';
import './style.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#4f46e5', // indigo-600
          secondary: '#6366f1', // indigo-500
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
