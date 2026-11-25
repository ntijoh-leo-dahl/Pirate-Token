import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '../auth/auth.js'
import AuthView from '../views/AuthView.vue'
import { api } from '../api/api.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/SimulatorView.vue'),
      meta: { auth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: AuthView,
      meta: { guest: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: AuthView,
      meta: { guest: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach(async to => {
  const token = localStorage.getItem('token')

  let authenticated = false

  if (token) {
    authenticated = await api.validateToken(token)
  }

  if (to.meta.auth && !authenticated) {
    return { name: 'login' }
  }

  if (to.meta.guest && authenticated) {
    return { name: 'home' }
  }
})

export default router