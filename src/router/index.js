import { createRouter, createWebHistory } from 'vue-router';
import UploadPage from '../views/UploadPage.vue';
import ReviewPage from '../views/ReviewPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import FullScreenPreview from '../views/FullScreenPreview.vue';
import KanbanBoard from '../views/KanbanBoard.vue';
import ReviewHistory from '../views/ReviewHistory.vue';

const routes = [
  { path: '/', component: UploadPage },
  { path: '/review/:id', component: ReviewPage },
  { path: '/review/:id/preview', component: FullScreenPreview },
  { path: '/admin', component: AdminDashboard },
  { path: '/teams', redirect: '/admin' }, // Redirect teams to admin dashboard
  { path: '/kanban', component: KanbanBoard },
  { path: '/history', component: ReviewHistory },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
