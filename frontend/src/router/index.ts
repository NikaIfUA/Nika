import { createRouter, createWebHistory } from 'vue-router'
import TheHomeView from '../views/TheHomeView.vue'
import TheAboutView from '../views/TheAboutView.vue'
import TheInfoView from '../views/TheInfoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TheHomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: TheAboutView,
    },
    {
      path: '/info',
      name: 'info',
      component: TheInfoView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/TheAdminView.vue'),
    }
  ],
})

export default router
