import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TheHomeView from '../views/TheHomeView.vue'
import TheShopView from '../views/TheShopView.vue'
import TheContactsView from '../views/TheContactsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TheHomeView,
    },
    {
      path: '/shop',
      name: 'shop',
      component: TheShopView,
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: TheContactsView,
    },
    {
      path: '/info',
      name: 'info',
      component: () => import('../views/TheInfoView.vue'),
    },
    {
      path: '/info/:type/:slug',
      name: 'infoDetails',
      component: () => import('../views/TheInfoDetailsView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/TheAdminView.vue'),
    },
    {
      path: '/admin/item/new',
      name: 'uploadItem',
      component: () => import('../components/ItemUploadForm.vue'),
    },
    {
      path: '/admin/item/:id',
      name: 'editItem',
      component: () => import('../components/ItemUploadForm.vue'),
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
      path: '/admin/technology',
      name: 'uploadTechnology',
      component: () => import('../components/TechnologyUploadForm.vue'),
    },
    {
      path: '/admin/materials',
      name: 'materials',
      component: () => import('../components/MaterialUploadForm.vue'),
    },
    {
      path: '/admin/materials/add',
      name: 'addMaterial',
      component: () => import('../components/MaterialAddForm.vue'),
    },
    {
      path: '/admin/materials/:id',
      name: 'editMaterial',
      component: () => import('../components/MaterialAddForm.vue'),
    },
    {
      path: '/admin/technologies',
      name: 'technologies',
      component: () => import('../components/TechnologyUploadForm.vue'),
    },
    {
      path: '/admin/technologies/add',
      name: 'addTechnology',
      component: () => import('../components/TechnologyAddForm.vue'),
    },
    {
      path: '/admin/technologies/:id',
      name: 'editTechnology',
      component: () => import('../components/TechnologyAddForm.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/TheAuthView.vue'),
    },
    {
      path: '/admin/items',
      name: 'items',
      component: () => import('../components/ItemChooseToUploadForm.vue'),
    }
  ],
})

// Global guard: protect admin route
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (to.name === 'admin') {
    if (!auth.token) return next({ name: 'auth' });
    // re-verify token with backend (handles blacklist changes)
    await auth.verifyToken();
    if (!auth.allowed) return next({ name: 'home' });
  }
  next();
});

export default router
