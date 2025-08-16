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

// Navigation guard - ultra fast
router.beforeEach(async (to, from, next) => {
  try {
    // Quick check - if we have cached user data, proceed immediately
    const cachedUser = typeof window !== 'undefined' ? window.localStorage.getItem('by_user') : null
    if (cachedUser) {
      const userData = JSON.parse(cachedUser)
      const isUserAdmin = userData.role === 'admin'
      const userNeedsOnboarding = userData.isNewUser || !userData.firstName || !userData.phone
      
      if (to.meta.requiresAdmin && !isUserAdmin) {
        next('/')
        return
      } else if (to.path !== '/onboarding' && userNeedsOnboarding) {
        next('/onboarding')
        return
      } else {
        next()
        return
      }
    }
    
    // Only import Firebase if we don't have cached data
    const { useFirebase } = await import('./composables/useFirebase.js')
    const { isAuthenticated, needsOnboarding, loading, isAdmin } = useFirebase()
    
    // Quick timeout for auth check
    if (loading.value) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unwatch()
          reject(new Error('Auth timeout'))
        }, 1000) // 1 second timeout - much faster
        
        const unwatch = watch(loading, (newLoading) => {
          if (!newLoading) {
            clearTimeout(timeout)
            unwatch()
            resolve()
          }
        })
      })
    }
    
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      next()
    } else if (to.meta.requiresAdmin && !isAdmin.value) {
      next('/')
    } else if (to.path !== '/onboarding' && needsOnboarding.value) {
      next('/onboarding')
    } else {
      next()
    }
  } catch (error) {
    console.error('Router error:', error)
    next()
  }
})

export default router