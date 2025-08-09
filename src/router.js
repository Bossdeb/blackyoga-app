import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'

import HomePage from './pages/HomePage.vue'
import BookingPage from './pages/BookingPage.vue'
import PointsPage from './pages/PointsPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import AdminPage from './pages/AdminPage.vue'
import AdminUsersPage from './pages/AdminUsersPage.vue'
import AdminClassDetailPage from './pages/AdminClassDetailPage.vue'
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
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/users', 
    name: 'AdminUsers', 
    component: AdminUsersPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin/classes/:id', 
    name: 'AdminClassDetail', 
    component: AdminClassDetailPage,
    meta: { requiresAuth: true, requiresAdmin: true }
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
router.beforeEach(async (to, from, next) => {
  try {
    // Import here to avoid circular dependency
    const { useFirebase } = await import('./composables/useFirebase.js')
    const { isAuthenticated, needsOnboarding, loading, isAdmin } = useFirebase()
    
    // Wait for auth state to be determined
    if (loading.value) {
      await new Promise(resolve => {
        const unwatch = watch(loading, (newLoading) => {
          if (!newLoading) {
            unwatch()
            resolve()
          }
        })
      })
    }
    
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      // For LINE LIFF, we don't redirect to login, just show the page
      // The useFirebase will handle LINE login automatically
      next()
    } else if (to.meta.requiresAdmin && !isAdmin.value) {
      // Redirect to home if trying to access admin route without admin role
      next('/')
    } else if (to.path !== '/onboarding' && needsOnboarding.value) {
      // Redirect to onboarding if user needs to complete profile
      next('/onboarding')
    } else {
      next()
    }
  } catch (error) {
    console.error('Router error:', error)
    // If there's an error, just continue to the requested page
    next()
  }
})

export default router