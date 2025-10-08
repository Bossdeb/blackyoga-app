import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'

import HomePage from './pages/HomePage.vue'
import BookingPage from './pages/BookingPage.vue'
import PointsPage from './pages/PointsPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import AdminPage from './pages/AdminPage.vue'
import AdminUsersPage from './pages/AdminUsersPage.vue'
import AdminUserDetailPage from './pages/AdminUserDetailPage.vue'
import AdminClassDetailPage from './pages/AdminClassDetailPage.vue'
import OnboardingPage from './pages/OnboardingPage.vue'
import ClassDetailPage from './pages/ClassDetailPage.vue'
import EditProfilePage from './pages/EditProfilePage.vue'
import HelpPage from './pages/HelpPage.vue'

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
    path: '/profile/edit', 
    name: 'EditProfile', 
    component: EditProfilePage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/help', 
    name: 'Help', 
    component: HelpPage,
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
    path: '/admin/users/:id', 
    name: 'AdminUserDetail', 
    component: AdminUserDetailPage,
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
  { 
    path: '/class/:id', 
    name: 'ClassDetail', 
    component: ClassDetailPage,
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
      
      // Ensure onboarding redirect happens before admin check (new users should see onboarding)
      if (to.path !== '/onboarding' && userNeedsOnboarding) {
        next('/onboarding')
        return
      } else if (to.meta.requiresAdmin && !isUserAdmin) {
        next('/')
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
        let unwatch = null
        const timeout = setTimeout(() => {
          if (unwatch) unwatch()
          reject(new Error('Auth timeout'))
        }, 1000) // 1 second timeout - much faster
        
        unwatch = watch(loading, (newLoading) => {
          if (!newLoading) {
            clearTimeout(timeout)
            if (unwatch) unwatch()
            resolve()
          }
        })
      })
    }
    
    // If authenticated and needs onboarding, send to onboarding first
    if (to.path !== '/onboarding' && isAuthenticated.value && needsOnboarding.value) {
      next('/onboarding')
    } else if (to.meta.requiresAdmin && !isAdmin.value) {
      next('/')
    } else if (to.meta.requiresAuth && !isAuthenticated.value) {
      next()
    } else {
      next()
    }
  } catch (error) {
    console.error('Router error:', error)
    next()
  }
})

export default router