import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '../auth/auth.js'
import AuthView from '../views/AuthView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/SimulatorView.vue'), meta: { auth: true } },
    { path: '/login', name: 'login', component: AuthView, meta: { guest: true } },
    { path: '/signup', name: 'signup', component: AuthView, meta: { guest: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(to => {
  if (to.meta.auth && !auth.user) return { name: 'login' }
  if (to.meta.guest && auth.user) return { name: 'home' }
})

export default router
