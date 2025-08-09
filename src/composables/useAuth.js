import { ref } from 'vue'
import { LIFF_CONFIG, isLiffAvailable, isInLineApp } from '../config/liff.js'

const user = ref(null)
const loading = ref(true)
const isLiffInitialized = ref(false)

export function useAuth() {
  const isAuthenticated = () => {
    return !!user.value
  }

  const isGuest = () => {
    return false // No guest mode when using LIFF
  }

  const getUser = () => {
    return user.value
  }

  const initializeLiff = async () => {
    try {
      loading.value = true
      console.log('Initializing LIFF...')
      
      // Check if LIFF is available
      if (!isLiffAvailable()) {
        console.log('LIFF not available, using demo mode')
        await loginAsDemo()
        return
      }
      
      // Initialize LIFF with proper error handling
      try {
        console.log('Initializing LIFF with Channel ID:', LIFF_CONFIG.CHANNEL_ID)
        await window.liff.init({ liffId: LIFF_CONFIG.CHANNEL_ID })
        isLiffInitialized.value = true
        console.log('LIFF initialized successfully')
        
        // Check if user is logged in
        if (window.liff.isLoggedIn()) {
          console.log('User is already logged in, getting profile...')
          await loginWithLine()
        } else {
          console.log('User not logged in, redirecting to LINE login...')
          // If not logged in, redirect to LINE Login
          window.liff.login()
        }
      } catch (liffError) {
        console.error('LIFF initialization failed:', liffError)
        // Fallback to demo mode
        await loginAsDemo()
      }
    } catch (error) {
      console.error('General initialization error:', error)
      // Fallback to demo mode if anything fails
      await loginAsDemo()
    } finally {
      loading.value = false
    }
  }

  const loginWithLine = async () => {
    try {
      console.log('Starting LINE login process...')
      
      // Check if LIFF is properly initialized
      if (!isLiffInitialized.value || !window.liff) {
        console.log('LIFF not initialized, trying to initialize first...')
        // Try to initialize LIFF first
        try {
          await window.liff.init({ liffId: LIFF_CONFIG.CHANNEL_ID })
          isLiffInitialized.value = true
          console.log('LIFF initialized in loginWithLine')
        } catch (initError) {
          console.error('Failed to initialize LIFF in loginWithLine:', initError)
          return await loginAsDemo()
        }
      }
      
      // Check if user is logged in before getting profile
      if (!window.liff.isLoggedIn()) {
        console.log('User not logged in, redirecting to LINE login...')
        window.liff.login()
        return false // Don't proceed until login is complete
      }
      
      console.log('Getting LINE profile...')
      // Get LINE profile
      const profile = await window.liff.getProfile()
      console.log('LINE profile received:', profile)
      
      // Create user object from LINE data
      const lineUser = {
        id: profile.userId,
        name: profile.displayName,
        email: profile.email || `${profile.userId}@line.me`,
        points: 150, // Default points
        avatar: profile.pictureUrl || '👤',
        isAdmin: false,
        lineId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      }
      
      console.log('Created LINE user object:', lineUser)
      user.value = lineUser
      localStorage.setItem('black-yoga-user', JSON.stringify(lineUser))
      console.log('LINE login successful')
      return true
    } catch (error) {
      console.error('LINE login error:', error)
      // Fallback to demo mode
      return await loginAsDemo()
    }
  }

  const loginAsDemo = async () => {
    console.log('Using demo login...')
    // Fallback demo login
    const demoUser = {
      id: 'demo-user-001',
      lineId: 'demo-user-001',
      name: 'Demo User',
      displayName: 'Demo User',
      email: 'demo@blackyoga.com',
      points: 150,
      avatar: '👤',
      isAdmin: true,
      role: 'admin'
    }
    
    user.value = demoUser
    localStorage.setItem('black-yoga-user', JSON.stringify(demoUser))
    console.log('Demo login successful')
    return true
  }

  const login = async (email, password) => {
    // For demo purposes, still allow manual login
    return await loginAsDemo()
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      if (isLiffInitialized.value && window.liff && window.liff.isLoggedIn()) {
        console.log('Logging out from LIFF...')
        window.liff.logout()
      }
      user.value = null
      localStorage.removeItem('black-yoga-user')
      console.log('Sign out successful')
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      return false
    }
  }

  const initAuth = () => {
    console.log('Initializing auth...')
    
    // Check URL parameters for LIFF callback
    const urlParams = new URLSearchParams(window.location.search)
    const liffState = urlParams.get('liff.state')
    const liffCode = urlParams.get('liff.referrer')
    
    console.log('URL params - liff.state:', liffState, 'liff.referrer:', liffCode)
    
    // Check if we're in LINE environment
    if (isInLineApp()) {
      console.log('In LINE app, initializing LIFF...')
      initializeLiff()
    } else {
      al
      console.log('Not in LINE app, checking saved user...')
      // If not in LINE, check for saved user or use demo
      const savedUser = localStorage.getItem('black-yoga-user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
        console.log('Loaded saved user:', user.value)
      }
      loading.value = false
    }
  }

  // Manual trigger for LINE login (for debugging)
  const forceLineLogin = async () => {
    console.log('Force triggering LINE login...')
    if (isLiffAvailable()) {
      try {
        await window.liff.init({ liffId: LIFF_CONFIG.CHANNEL_ID })
        isLiffInitialized.value = true
        
        if (window.liff.isLoggedIn()) {
          return await loginWithLine()
        } else {
          console.log('Redirecting to LINE login...')
          window.liff.login()
          return false // Will redirect, so return false
        }
      } catch (error) {
        console.error('Force LINE login failed:', error)
        return await loginAsDemo()
      }
    } else {
      return await loginAsDemo()
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isGuest,
    getUser,
    login,
    loginWithLine,
    signOut,
    initAuth,
    isLiffInitialized,
    forceLineLogin
  }
}
