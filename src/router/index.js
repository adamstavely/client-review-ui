import { createRouter, createWebHistory } from 'vue-router';
import UploadPage from '../views/UploadPage.vue';
import ReviewPage from '../views/ReviewPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes = [
  { path: '/', component: UploadPage },
  { path: '/review/:id', component: ReviewPage },
  { path: '/admin', component: AdminDashboard },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
