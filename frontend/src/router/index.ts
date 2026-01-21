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
      children: [
        {
          path: 'materials',
          name: 'materials',
          component: () => import('../components/materials/MaterialUploadForm.vue'),
        },
        {
          path: 'materials/add',
          name: 'addMaterial',
          component: () => import('../components/materials/MaterialAddForm.vue'),
        },
        {
          path: 'materials/:id',
          name: 'editMaterial',
          component: () => import('../components/materials/MaterialAddForm.vue'),
        },
        {
          path: 'technologies',
          name: 'technologies',
          component: () => import('../components/technologies/TechnologyUploadForm.vue'),
        },
        {
          path: 'technologies/add',
          name: 'addTechnology',
          component: () => import('../components/technologies/TechnologyAddForm.vue'),
        },
        {
          path: 'technologies/:id',
          name: 'editTechnology',
          component: () => import('../components/technologies/TechnologyAddForm.vue'),
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('../components/categories/CategoryUploadForm.vue'),
        },
        {
          path: 'categories/add',
          name: 'addCategory',
          component: () => import('../components/categories/CategoryAddForm.vue'),
        },
        {
          path: 'categories/:id',
          name: 'editCategory',
          component: () => import('../components/categories/CategoryAddForm.vue'),
        },
        {
          path: 'items',
          name: 'items',
          component: () => import('../components/items/ItemChooseToUploadForm.vue'),
        },
        {
          path: 'item/new',
          name: 'uploadItem',
          component: () => import('../components/items/ItemUploadForm.vue'),
        },
        {
          path: 'item/:id',
          name: 'editItem',
          component: () => import('../components/items/ItemUploadForm.vue'),
        },
      ],
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/TheAuthView.vue'),
    },
    {
      path: '/admin/items',
      name: 'items',
      component: () => import('../components/items/ItemChooseToUploadForm.vue'),
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
