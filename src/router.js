import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'
import BookingPage from './pages/BookingPage.vue'
import PointsPage from './pages/PointsPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import AdminPage from './pages/AdminPage.vue'
import LoginPage from './pages/LoginPage.vue'
import OnboardingPage from './pages/OnboardingPage.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: HomePage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/booking', 
    name: 'Booking', 
    component: BookingPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/points', 
    name: 'Points', 
    component: PointsPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: AdminPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  { 
    path: '/onboarding', 
    name: 'Onboarding', 
    component: OnboardingPage,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('black-yoga-user')
  const hasToken = !!localStorage.getItem('black-yoga-token')
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('black-yoga-user')) : null
  const needsOnboarding = isAuthenticated && (!user?.firstName || !user?.phone)
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next('/login')
  } else if (to.path !== '/onboarding' && needsOnboarding) {
    next('/onboarding')
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to home if trying to access login while authenticated
    next('/')
  } else {
    next()
  }
})

export default router