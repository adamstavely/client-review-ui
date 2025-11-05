import { createRouter, createWebHistory } from 'vue-router';
import UploadPage from '../views/UploadPage.vue';
import ReviewPage from '../views/ReviewPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import FullScreenPreview from '../views/FullScreenPreview.vue';
import TeamsPage from '../views/TeamsPage.vue';
import KanbanBoard from '../views/KanbanBoard.vue';

const routes = [
  { path: '/', component: UploadPage },
  { path: '/review/:id', component: ReviewPage },
  { path: '/review/:id/preview', component: FullScreenPreview },
  { path: '/admin', component: AdminDashboard },
  { path: '/teams', component: TeamsPage },
  { path: '/kanban', component: KanbanBoard },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
