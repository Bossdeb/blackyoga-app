import { ref, computed } from 'vue'
import { useFirebase } from './useFirebase.js'
import { smartCache, invalidateCache, CACHE_CONFIG } from './useCache.js'

// User data caching composable
export function useUserCache() {
  const { user, refreshCurrentUser } = useFirebase()
  
  // Cache user data with smart TTL
  const getUserData = async (forceRefresh = false) => {
    if (!user.value?.lineId) return null
    
    const cacheKey = `user_data_${user.value.lineId}`
    
    if (!forceRefresh) {
      // Try to get from cache first
      const cachedData = await smartCache(cacheKey, async () => {
        return user.value
      }, 'USER_DATA')
      
      if (cachedData) {
        return cachedData
      }
    }
    
    // Fetch fresh data
    try {
      const freshData = await refreshCurrentUser()
      return freshData
    } catch (error) {
      console.error('Failed to fetch fresh user data:', error)
      // Return cached data if available
      return user.value
    }
  }
  
  // Update user data in cache
  const updateUserCache = (newData) => {
    if (!user.value?.lineId) return
    
    const cacheKey = `user_data_${user.value.lineId}`
    invalidateCache(cacheKey)
    
    // Update local user data
    user.value = { ...user.value, ...newData }
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('by_user', JSON.stringify(user.value))
    }
  }
  
  // Clear user cache
  const clearUserCache = () => {
    if (!user.value?.lineId) return
    
    const cacheKey = `user_data_${user.value.lineId}`
    invalidateCache(cacheKey)
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('by_user')
    }
  }
  
  // Check if user data is fresh
  const isUserDataFresh = computed(() => {
    if (!user.value) return false
    
    // Check if we have cached data
    const cachedUser = typeof window !== 'undefined' ? window.localStorage.getItem('by_user') : null
    if (!cachedUser) return false
    
    try {
      const userData = JSON.parse(cachedUser)
      const now = Date.now()
      const cacheTime = userData._cacheTime || 0
      const fiveMinutes = 5 * 60 * 1000
      
      return (now - cacheTime) < fiveMinutes
    } catch {
      return false
    }
  })
  
  // Get user data with automatic refresh
  const getUserDataWithRefresh = async () => {
    const isFresh = isUserDataFresh.value
    
    if (isFresh) {
      // Return cached data immediately
      return user.value
    } else {
      // Fetch fresh data in background
      const freshData = await getUserData(true)
      return freshData
    }
  }
  
  return {
    getUserData,
    updateUserCache,
    clearUserCache,
    isUserDataFresh,
    getUserDataWithRefresh
  }
}
