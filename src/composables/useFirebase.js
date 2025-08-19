import { ref, computed } from 'vue'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  increment,
  runTransaction,
  Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
// caching removed per request
import { isInLineApp, isLiffAvailable } from '../config/liff.js'

export function useFirebase() {
  // Hydrate user quickly from localStorage for instant UI while waiting for LIFF
  const cachedUser = typeof window !== 'undefined' ? window.localStorage.getItem('by_user') : null
  const user = ref(cachedUser ? JSON.parse(cachedUser) : null)
  const loading = ref(true)
  const error = ref(null)

  // Initialize LINE LIFF and get user data
  const initializeLiff = async () => {
    try {
      if (!isLiffAvailable()) {
        console.log('LIFF not available, skipping initialization')
        // Clear any cached user data when LIFF is not available
        user.value = null
        window.localStorage.removeItem('by_user')
        loading.value = false
        return
      }

      // Initialize LIFF
      await window.liff.init({ liffId: '2007882550-gB0lXQvK' })
      
      if (window.liff.isLoggedIn()) {
        // Get LINE profile
        const profile = await window.liff.getProfile()
        const lineId = profile.userId
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', lineId))
        
        if (userDoc.exists()) {
          // Existing user: prefer latest LIFF profile for displayName/pictureUrl/statusMessage
          const dbData = userDoc.data()
          const merged = {
            ...dbData,
            lineId,
            displayName: profile.displayName || dbData.displayName || '',
            pictureUrl: profile.pictureUrl || dbData.pictureUrl || '',
            statusMessage: profile.statusMessage || dbData.statusMessage || ''
          }

          user.value = merged
          window.localStorage.setItem('by_user', JSON.stringify(user.value))

          // If profile fields changed from DB, update Firestore to keep in sync
          const needsUpdate = (
            (dbData.displayName || '') !== (merged.displayName || '') ||
            (dbData.pictureUrl || '') !== (merged.pictureUrl || '') ||
            (dbData.statusMessage || '') !== (merged.statusMessage || '')
          )
          if (needsUpdate) {
            try {
              await updateDoc(doc(db, 'users', lineId), {
                displayName: merged.displayName,
                pictureUrl: merged.pictureUrl,
                statusMessage: merged.statusMessage,
                updatedAt: serverTimestamp()
              })
            } catch (_) {
              // non-fatal; ignore sync failures
            }
          }
        } else {
          // New user - do NOT create Firestore doc yet. Wait until onboarding completes.
          // Keep minimal profile in local state for routing and onboarding.
          user.value = {
            lineId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
            role: 'member',
            isNewUser: true
          }
          window.localStorage.setItem('by_user', JSON.stringify(user.value))
        }
              } else {
          // Not logged in - redirect to LINE login
          user.value = null
          window.localStorage.removeItem('by_user')
          window.liff.login()
          return
        }
    } catch (err) {
      console.error('LIFF initialization error:', err)
      error.value = err.message
      // Clear user state on error
      user.value = null
      window.localStorage.removeItem('by_user')
    } finally {
      loading.value = false
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value && user.value.role === 'admin')
  const needsOnboarding = computed(() => user.value && (user.value.isNewUser || !user.value.firstName || !user.value.phone))

  // Sign in with LINE
  const signInWithLine = async () => {
    try {
      await initializeLiff()
    } catch (error) {
      console.error('LINE sign in error:', error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      if (window.liff && window.liff.isLoggedIn()) {
        window.liff.logout()
      }
      user.value = null
      window.localStorage.removeItem('by_user')
    } catch (error) {
      console.error('Sign out error:', error)
      // Don't throw error on sign out, just clear user state
      user.value = null
      window.localStorage.removeItem('by_user')
    }
  }

  // Update user profile (creates Firestore user if missing after onboarding)
  const updateUserProfile = async (userData) => {
    if (!user.value || !user.value.lineId) throw new Error('No user logged in')
    
    // Validate userData before updating
    const validUserData = Object.fromEntries(
      Object.entries(userData).filter(([key, value]) => {
        return value !== null && value !== undefined && value !== ''
      })
    )
    
    const userRef = doc(db, 'users', user.value.lineId)
    const existing = await getDoc(userRef)
    if (existing.exists()) {
      await updateDoc(userRef, {
        ...validUserData,
        isNewUser: false,
        updatedAt: serverTimestamp()
      })
    } else {
      // First-time save after onboarding: create the document
      const toCreate = {
        lineId: user.value.lineId,
        displayName: user.value.displayName || '',
        pictureUrl: user.value.pictureUrl || '',
        statusMessage: user.value.statusMessage || '',
        role: user.value.role || 'member',
        points: 0,
        ...validUserData,
        isNewUser: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(userRef, toCreate)
    }
    
    // Update local user state
    user.value = { ...user.value, ...validUserData, isNewUser: false }
    window.localStorage.setItem('by_user', JSON.stringify(user.value))
  }

  // Classes
  const createClass = async (classData) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    // Validate classData
    const validClassData = {
      name: classData.name || '',
      teacher: classData.teacher || '',
      startTime: classData.startTime || '',
      endTime: classData.endTime || '',
      date: new Date(classData.date || new Date()),
      description: classData.description || '',
      emoji: classData.emoji || '🧘‍♀️',
      capacity: parseInt(classData.capacity) || 10,
      durationMinutes: parseInt(classData.durationMinutes) || 60,
      createdAt: serverTimestamp(),
      bookedCount: 0,
      isFull: false
    }
    
    const classRef = await addDoc(collection(db, 'classes'), validClassData)
    return classRef
  }

  const getClasses = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const q = query(
      collection(db, 'classes'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const getClassById = async (classId) => {
    const classDoc = await getDoc(doc(db, 'classes', classId))
    if (!classDoc.exists()) throw new Error('Class not found')
    return { id: classDoc.id, ...classDoc.data() }
  }

  const updateClass = async (classId, updates) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    // Validate updates
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => {
        return value !== null && value !== undefined
      })
    )
    
    const classRef = doc(db, 'classes', classId)
    await updateDoc(classRef, {
      ...validUpdates,
      updatedAt: serverTimestamp()
    })
  }

  const deleteClass = async (classId) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    await deleteDoc(doc(db, 'classes', classId))
  }

  // Bookings
  const COST_PER_BOOKING = 1

  // Update points on a user document and keep local state in sync. Also log a transaction for history.
  const updateUserPoints = async (targetUserId, delta, description) => {
    // Validate parameters
    if (!targetUserId) {
      console.error('updateUserPoints: targetUserId is required')
      return
    }
    
    console.log('Updating user points:', { targetUserId, delta, description })
    
    const userRef = doc(db, 'users', targetUserId)
    await updateDoc(userRef, { points: increment(delta) })

    // If we're updating the current user, keep local state in sync
    if (user.value && user.value.lineId === targetUserId) {
      const current = parseInt(user.value.points || 0, 10)
      user.value = { ...user.value, points: current + delta }
      window.localStorage.setItem('by_user', JSON.stringify(user.value))
      console.log('Updated local user points:', user.value.points)
    }

    // Record transaction for history (optional but useful)
    console.log('Recording transaction for history...')
    await addPointsTransaction(targetUserId, delta >= 0 ? 'added' : 'used', Math.abs(delta), description)
  }

  const getBookingsByClass = async (classId) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    if (!classId) {
      console.error('getBookingsByClass: classId is required')
      return []
    }
    
    const q = query(
      collection(db, 'bookings'),
      where('classId', '==', classId)
    )
    const snapshot = await getDocs(q)
    const bookings = []
    for (const bookingDoc of snapshot.docs) {
      const data = bookingDoc.data()
      if (data && data.userId) {
        const userDoc = await getDoc(doc(db, 'users', data.userId))
        const userInfo = userDoc.exists() ? userDoc.data() : {}
        bookings.push({ 
          id: bookingDoc.id, 
          ...data, 
          user: { 
            id: data.userId, 
            displayName: userInfo.displayName || '-', 
            nickname: userInfo.nickname || '',
            firstName: userInfo.firstName || '',
            pictureUrl: userInfo.pictureUrl || '' 
          } 
        })
      }
    }
    // Sort by createdAt desc client-side
    bookings.sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bMs - aMs
    })
    return bookings
  }

  const createBooking = async (classId) => {
    if (!user.value || !user.value.lineId) throw new Error('No user logged in')
    
    // Check if user has enough points first
    const currentPoints = await getUserPoints()
    if (currentPoints < COST_PER_BOOKING) throw new Error('เครดิตไม่พอ (ต้องมีอย่างน้อย 1 พอยต์)')

    // Enforce points expiry: if points have expired, disallow usage
    try {
      const currentUserRef = doc(db, 'users', user.value.lineId)
      const currentUserDoc = await getDoc(currentUserRef)
      const data = currentUserDoc.exists() ? currentUserDoc.data() : null
      const expireAt = data?.pointsExpireAt
      if (expireAt && typeof expireAt.toDate === 'function') {
        const now = new Date()
        if (now > expireAt.toDate()) {
          throw new Error('พอยต์ของคุณหมดอายุแล้ว ไม่สามารถใช้งานได้')
        }
      }
    } catch (e) {
      if (e && e.message && e.message.includes('หมดอายุ')) throw e
      // if any unexpected error occurs during expiry check, fail closed with a generic message
      // to avoid allowing usage when policy should block
    }
    
    // Use transaction to prevent concurrent booking issues
    return await runTransaction(db, async (transaction) => {
      // Get fresh class data within transaction
      const classRef = doc(db, 'classes', classId)
      const classDoc = await transaction.get(classRef)
      
      if (!classDoc.exists()) throw new Error('Class not found')
      
      const classData = classDoc.data()
      
      // Check if class is full
      if (classData.isFull || classData.bookedCount >= classData.capacity) {
        throw new Error('คลาสเต็มแล้ว กรุณาลองใหม่')
      }
      
      // Check for duplicate booking within transaction
      const duplicateQ = query(
        collection(db, 'bookings'),
        where('userId', '==', user.value.lineId),
        where('classId', '==', classId)
      )
      const duplicateSnap = await getDocs(duplicateQ)
      const hasActiveBooking = duplicateSnap.docs.some(d => {
        const data = d.data()
        return data.status !== 'cancelled'
      })
      if (hasActiveBooking) {
        throw new Error('คุณได้จองคลาสนี้แล้ว')
      }

      // Enforce booking window: can only book up to 1 day in advance
      const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date)
      const [startHour = 0, startMinute = 0] = (classData.startTime || '00:00').split(':').map(n => parseInt(n, 10))
      const classStart = new Date(classDate)
      classStart.setHours(startHour, startMinute, 0, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const maxBookDate = new Date(today)
      maxBookDate.setDate(maxBookDate.getDate() + 1)
      maxBookDate.setHours(23, 59, 59, 999)

      if (classStart > maxBookDate) {
        throw new Error('สามารถจองล่วงหน้าได้ไม่เกิน 1 วัน')
      }
      
      // Create booking
      const bookingData = {
        userId: user.value.lineId,
        classId: classId,
        status: 'confirmed',
        createdAt: serverTimestamp()
      }
      
      const bookingRef = doc(collection(db, 'bookings'))
      transaction.set(bookingRef, bookingData)
      
      // Update class booked count atomically
      const newBookedCount = classData.bookedCount + 1
      transaction.update(classRef, {
        bookedCount: newBookedCount,
        isFull: newBookedCount >= classData.capacity
      })
      
      // Update user points
      const userRef = doc(db, 'users', user.value.lineId)
      transaction.update(userRef, { 
        points: increment(-COST_PER_BOOKING) 
      })
      
      // Update local user state
      if (user.value && user.value.lineId) {
        const current = parseInt(user.value.points || 0, 10)
        user.value = { ...user.value, points: current - COST_PER_BOOKING }
        window.localStorage.setItem('by_user', JSON.stringify(user.value))
      }
      
      // Record transaction for history (outside transaction for better performance)
      setTimeout(async () => {
        try {
          await addPointsTransaction(user.value.lineId, 'used', COST_PER_BOOKING, `จองคลาส ${classData.name}`)
        } catch (error) {
          console.error('Failed to record points transaction:', error)
        }
      }, 0)
      
      return bookingRef
    })
  }

  const getUserBookings = async () => {
    // Return empty when user is not ready
    if (!user.value || !user.value.lineId) return []

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.value.lineId)
    )
    const snapshot = await getDocs(q)
    const bookings = []
    for (const bookingDoc of snapshot.docs) {
      const booking = { id: bookingDoc.id, ...bookingDoc.data() }
      if (booking.classId) {
        const classDoc = await getDoc(doc(db, 'classes', booking.classId))
        if (classDoc.exists()) {
          booking.classData = { id: classDoc.id, ...classDoc.data() }
        }
      }
      bookings.push(booking)
    }
    bookings.sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bMs - aMs
    })
    return bookings
  }

  const cancelBooking = async (bookingId) => {
    if (!user.value || !user.value.lineId) throw new Error('No user logged in')
    if (!bookingId) throw new Error('Booking ID is required')
    
    const bookingRef = doc(db, 'bookings', bookingId)
    const bookingDoc = await getDoc(bookingRef)
    
    if (!bookingDoc.exists()) throw new Error('Booking not found')
    
    const bookingData = bookingDoc.data()
    if (!bookingData) throw new Error('Invalid booking data')
    
    if (bookingData.userId !== user.value.lineId) throw new Error('Not your booking')
    if (bookingData.status === 'cancelled') throw new Error('Already cancelled')
    
    // Check cancellation window: only allowed until 3 hours before class start
    if (!bookingData.classId) throw new Error('Invalid booking: missing class ID')
    
    const classDoc = await getDoc(doc(db, 'classes', bookingData.classId))
    if (!classDoc.exists()) throw new Error('Class not found')
    const classData = classDoc.data()
    if (!classData) throw new Error('Invalid class data')
    const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date)
    const [startHour = 0, startMinute = 0] = (classData.startTime || '00:00').split(':').map(n => parseInt(n, 10))
    const classStart = new Date(classDate)
    classStart.setHours(startHour, startMinute, 0, 0)

    const now = new Date()
    const threeHoursMs = 3 * 60 * 60 * 1000
    if (now >= new Date(classStart.getTime() - threeHoursMs)) {
      throw new Error('ยกเลิกได้ก่อนเวลาเริ่ม 3 ชั่วโมงเท่านั้น')
    }

    // Update booking status
    await updateDoc(bookingRef, { status: 'cancelled' })
    
    // Update class booked count
    await updateDoc(doc(db, 'classes', bookingData.classId), {
      bookedCount: Math.max(0, (classData.bookedCount || 0) - 1),
      isFull: false
    })
    
    // Refund points (wallet style)
    if (user.value && user.value.lineId && classData) {
      const className = classData.name || 'คลาสโยคะ'
      await updateUserPoints(user.value.lineId, COST_PER_BOOKING, `คืนพอยต์จากการยกเลิกคลาส ${className}`)
    }
  }

  // Points
  const addPointsTransaction = async (targetUserId, type, points, description) => {
    // Validate parameters
    if (!targetUserId) {
      console.error('addPointsTransaction: targetUserId is required')
      return
    }
    
    console.log('Adding points transaction:', { targetUserId, type, points, description })
    
    const transactionData = {
      userId: targetUserId, // ใช้ userId ของคนที่ได้รับ/ใช้พอยต์
      type: type || 'used',
      points: parseInt(points) || 0,
      description: description || '',
      emoji: type === 'added' ? '💰' : '📅',
      createdAt: serverTimestamp()
    }
    
    console.log('Transaction data:', transactionData)
    const docRef = await addDoc(collection(db, 'pointsTransactions'), transactionData)
    console.log('Transaction added with ID:', docRef.id)
  }

  const getUserPoints = async () => {
    if (!user.value || !user.value.lineId) return 0
    // Prefer local state for speed; fallback to Firestore read for latest
    if (typeof user.value.points === 'number') return user.value.points
    const userDoc = await getDoc(doc(db, 'users', user.value.lineId))
    return userDoc.exists() ? (userDoc.data().points || 0) : 0
  }

  const getPointsHistory = async () => {
    if (!user.value || !user.value.lineId) {
      console.log('No user lineId, returning empty array')
      return []
    }
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.lineId)
    )
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    transactions.sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bMs - aMs
    })
    return transactions
  }

  // Admin helpers: user lookup, cross-user history, and expiry management
  const getUserById = async (userId) => {
    if (!userId) return null
    const userDoc = await getDoc(doc(db, 'users', userId))
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null
  }

  const getPointsHistoryByUser = async (targetUserId) => {
    if (!targetUserId) return []
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', targetUserId)
    )
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    transactions.sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bMs - aMs
    })
    return transactions
  }

  const setUserPointsExpiry = async (targetUserId, expireDateOrNull) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    const userRef = doc(db, 'users', targetUserId)
    const update = {
      updatedAt: serverTimestamp()
    }
    if (expireDateOrNull) {
      const dateObj = expireDateOrNull instanceof Date ? expireDateOrNull : new Date(expireDateOrNull)
      update.pointsExpireAt = Timestamp.fromDate(dateObj)
    } else {
      update.pointsExpireAt = null
    }
    await updateDoc(userRef, update)
    // update local cache if the current user is the one updated
    if (user.value && user.value.lineId === targetUserId) {
      user.value = { ...user.value, pointsExpireAt: update.pointsExpireAt || null }
      window.localStorage.setItem('by_user', JSON.stringify(user.value))
    }
  }

  const refreshCurrentUser = async () => {
    if (!user.value || !user.value.lineId) return null
    const userDoc = await getDoc(doc(db, 'users', user.value.lineId))
    if (userDoc.exists()) {
      user.value = { ...user.value, ...userDoc.data() }
      window.localStorage.setItem('by_user', JSON.stringify(user.value))
      return user.value
    }
    return null
  }

  // Admin functions
  const addPointsToUser = async (userId, points, description) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    const amount = parseInt(points) || 0
    await updateUserPoints(userId, amount, description || 'แอดมินเพิ่มพอยต์')
  }

  const updateUserRole = async (userId, newRole) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    })
  }

  const getAllUsers = async () => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  // Initialize on mount
  const init = async () => {
    try {
      if (isInLineApp()) {
        await initializeLiff()
      } else {
        console.log('Not in LINE app, skipping LIFF initialization')
        // Clear any cached user data when not in LINE app
        user.value = null
        window.localStorage.removeItem('by_user')
        loading.value = false
      }
    } catch (error) {
      console.error('Init error:', error)
      // Clear user state on error
      user.value = null
      window.localStorage.removeItem('by_user')
      loading.value = false
    }
  }

  // Call init immediately
  init()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    needsOnboarding,
    signInWithLine,
    signOut,
    updateUserProfile,
    createClass,
    getClasses,
    updateClass,
    getClassById,
    deleteClass,
    createBooking,
    getUserBookings,
    getBookingsByClass,
    cancelBooking,
    getUserPoints,
    getPointsHistory,
    getPointsHistoryByUser,
    addPointsToUser,
    getAllUsers,
    updateUserRole,
    getUserById,
    setUserPointsExpiry,
    refreshCurrentUser
  }
}
