import { ref, computed, watch, reactive } from 'vue'
import { useFirebase } from './useFirebase.js'
import { smartCache, invalidateCache, CACHE_CONFIG } from './useCache.js'
import { useLoading } from './useLoading.js'

// Global state store
const globalState = reactive({
  classes: [],
  userBookings: [],
  bookingHistory: [],
  users: [], // Admin only
  lastUpdated: null,
  offlineMode: false
})

// State management composable
export function useAppState() {
  const { 
    user, 
    isAuthenticated, 
    isAdmin,
    getClasses: fetchClasses,
    getUserBookings: fetchUserBookings,
    getBookingHistory: fetchBookingHistory,
    getAllUsers: fetchAllUsers
  } = useFirebase()
  
  const { 
    setLoading, 
    isLoading, 
    clearLoading,
    batchLoading 
  } = useLoading()

  // Computed properties
  const classes = computed(() => globalState.classes)
  const userBookings = computed(() => globalState.userBookings)
  const bookingHistory = computed(() => globalState.bookingHistory)
  const users = computed(() => globalState.users)
  const lastUpdated = computed(() => globalState.lastUpdated)
  const offlineMode = computed(() => globalState.offlineMode)

  // Data freshness check
  const isDataFresh = computed(() => {
    if (!lastUpdated.value) return false
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    return (now - lastUpdated.value) < fiveMinutes
  })

  // Load classes with caching
  const loadClasses = async (forceRefresh = false) => {
    const cacheKey = 'app_classes'
    
    if (!forceRefresh && isDataFresh.value && classes.value.length > 0) {
      return classes.value
    }

    try {
      setLoading('classes', true)
      
      const data = await smartCache(cacheKey, async () => {
        return await fetchClasses()
      }, 'CLASSES_DATA')
      
      globalState.classes = data
      globalState.lastUpdated = Date.now()
      
      return data
    } catch (error) {
      console.error('Failed to load classes:', error)
      throw error
    } finally {
      clearLoading('classes')
    }
  }

  // Load user bookings with caching
  const loadUserBookings = async (forceRefresh = false) => {
    if (!isAuthenticated.value) return []

    const cacheKey = `app_user_bookings_${user.value?.lineId}`
    
    if (!forceRefresh && isDataFresh.value && userBookings.value.length > 0) {
      return userBookings.value
    }

    try {
      setLoading('userBookings', true)
      
      const data = await smartCache(cacheKey, async () => {
        return await fetchUserBookings()
      }, 'BOOKINGS_DATA')
      
      globalState.userBookings = data
      globalState.lastUpdated = Date.now()
      
      return data
    } catch (error) {
      console.error('Failed to load user bookings:', error)
      throw error
    } finally {
      clearLoading('userBookings')
    }
  }

  // Load booking history with caching
  const loadBookingHistory = async (forceRefresh = false) => {
    if (!isAuthenticated.value) return []

    const cacheKey = `app_booking_history_${user.value?.lineId}`
    
    if (!forceRefresh && isDataFresh.value && bookingHistory.value.length > 0) {
      return bookingHistory.value
    }

    try {
      setLoading('bookingHistory', true)
      
      const data = await smartCache(cacheKey, async () => {
        return await fetchBookingHistory()
      }, 'BOOKINGS_DATA')
      
      globalState.bookingHistory = data
      globalState.lastUpdated = Date.now()
      
      return data
    } catch (error) {
      console.error('Failed to load booking history:', error)
      throw error
    } finally {
      clearLoading('bookingHistory')
    }
  }

  // Load all users (Admin only)
  const loadAllUsers = async (forceRefresh = false) => {
    if (!isAdmin.value) return []

    const cacheKey = 'app_all_users'
    
    if (!forceRefresh && isDataFresh.value && users.value.length > 0) {
      return users.value
    }

    try {
      setLoading('allUsers', true)
      
      const data = await smartCache(cacheKey, async () => {
        return await fetchAllUsers()
      }, 'ADMIN_DATA')
      
      globalState.users = data
      globalState.lastUpdated = Date.now()
      
      return data
    } catch (error) {
      console.error('Failed to load all users:', error)
      throw error
    } finally {
      clearLoading('allUsers')
    }
  }

  // Batch load all data
  const loadAllData = async (forceRefresh = false) => {
    if (!isAuthenticated.value) return

    const operations = [loadClasses(forceRefresh)]
    
    if (isAuthenticated.value) {
      operations.push(loadUserBookings(forceRefresh))
      operations.push(loadBookingHistory(forceRefresh))
    }
    
    if (isAdmin.value) {
      operations.push(loadAllUsers(forceRefresh))
    }

    try {
      setLoading('allData', true)
      await batchLoading(operations)
    } catch (error) {
      console.error('Failed to load all data:', error)
      throw error
    } finally {
      clearLoading('allData')
    }
  }

  // Refresh specific data
  const refreshClasses = () => loadClasses(true)
  const refreshUserBookings = () => loadUserBookings(true)
  const refreshBookingHistory = () => loadBookingHistory(true)
  const refreshAllUsers = () => loadAllUsers(true)
  const refreshAllData = () => loadAllData(true)

  // Clear all cached data
  const clearAllData = () => {
    globalState.classes = []
    globalState.userBookings = []
    globalState.bookingHistory = []
    globalState.users = []
    globalState.lastUpdated = null
    
    // Clear cache
    invalidateCache('app_classes')
    invalidateCache('app_user_bookings')
    invalidateCache('app_booking_history')
    invalidateCache('app_all_users')
  }

  // Update specific data in state
  const updateClasses = (newClasses) => {
    globalState.classes = newClasses
    globalState.lastUpdated = Date.now()
  }

  const updateUserBookings = (newBookings) => {
    globalState.userBookings = newBookings
    globalState.lastUpdated = Date.now()
  }

  const updateBookingHistory = (newHistory) => {
    globalState.bookingHistory = newHistory
    globalState.lastUpdated = Date.now()
  }

  const updateUsers = (newUsers) => {
    globalState.users = newUsers
    globalState.lastUpdated = Date.now()
  }

  // Add new item to state
  const addClass = (newClass) => {
    globalState.classes.push(newClass)
    globalState.lastUpdated = Date.now()
  }

  const addUserBooking = (newBooking) => {
    globalState.userBookings.unshift(newBooking)
    globalState.lastUpdated = Date.now()
  }

  const addBookingHistory = (newHistory) => {
    globalState.bookingHistory.unshift(newHistory)
    globalState.lastUpdated = Date.now()
  }

  // Remove item from state
  const removeClass = (classId) => {
    globalState.classes = globalState.classes.filter(c => c.id !== classId)
    globalState.lastUpdated = Date.now()
  }

  const removeUserBooking = (bookingId) => {
    globalState.userBookings = globalState.userBookings.filter(b => b.id !== bookingId)
    globalState.lastUpdated = Date.now()
  }

  // Update item in state
  const updateClass = (classId, updates) => {
    const index = globalState.classes.findIndex(c => c.id === classId)
    if (index !== -1) {
      globalState.classes[index] = { ...globalState.classes[index], ...updates }
      globalState.lastUpdated = Date.now()
    }
  }

  const updateUserBooking = (bookingId, updates) => {
    const index = globalState.userBookings.findIndex(b => b.id === bookingId)
    if (index !== -1) {
      globalState.userBookings[index] = { ...globalState.userBookings[index], ...updates }
      globalState.lastUpdated = Date.now()
    }
  }

  // Offline mode management
  const setOfflineMode = (isOffline) => {
    globalState.offlineMode = isOffline
  }

  // Watch for network status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOfflineMode(false))
    window.addEventListener('offline', () => setOfflineMode(true))
    
    // Set initial offline state
    setOfflineMode(!navigator.onLine)
  }

  // Auto-refresh data when user changes
  watch(isAuthenticated, (newAuth) => {
    if (newAuth) {
      loadAllData()
    } else {
      clearAllData()
    }
  }, { immediate: true })

  return {
    // State
    classes,
    userBookings,
    bookingHistory,
    users,
    lastUpdated,
    offlineMode,
    isDataFresh,
    
    // Loading states
    isLoading,
    
    // Load functions
    loadClasses,
    loadUserBookings,
    loadBookingHistory,
    loadAllUsers,
    loadAllData,
    
    // Refresh functions
    refreshClasses,
    refreshUserBookings,
    refreshBookingHistory,
    refreshAllUsers,
    refreshAllData,
    
    // Update functions
    updateClasses,
    updateUserBookings,
    updateBookingHistory,
    updateUsers,
    
    // Add functions
    addClass,
    addUserBooking,
    addBookingHistory,
    
    // Remove functions
    removeClass,
    removeUserBooking,
    
    // Update specific items
    updateClass,
    updateUserBooking,
    
    // Utility functions
    clearAllData,
    setOfflineMode
  }
}
