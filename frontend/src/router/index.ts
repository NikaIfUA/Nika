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
    },
    {
      path: '/admin/image',
      name: 'uploadImage',
      component: () => import('../components/ImageUploadForm.vue'),
    },
    {
      path: '/admin/category',
      name: 'uploadCategory',
      component: () => import('../components/CategoryUploadForm.vue'),
    },
    {
      path: '/admin/material',
      name: 'uploadMaterial',
      component: () => import('../components/MaterialUploadForm.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/TheAuthView.vue'),
    }
  ],
})

export default router
