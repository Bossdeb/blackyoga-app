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
  increment
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
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
      await window.liff.init({ liffId: '2007882550-Zv9vY1Ln' })
      
      if (window.liff.isLoggedIn()) {
        // Get LINE profile
        const profile = await window.liff.getProfile()
        const lineId = profile.userId
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', lineId))
        
        if (userDoc.exists()) {
          // Existing user
          user.value = { 
            lineId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
            ...userDoc.data()
          }
          // cache
          window.localStorage.setItem('by_user', JSON.stringify(user.value))
        } else {
          // New user - create profile with valid data
          const newUser = {
            lineId: lineId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
            role: 'member',
            points: 0, // Initial points
            createdAt: serverTimestamp(),
            isNewUser: true,
            // Initialize additional fields
            nickname: '',
            firstName: '',
            lastName: '',
            phone: ''
          }
          
          // Validate data before saving
          const validUser = Object.fromEntries(
            Object.entries(newUser).filter(([key, value]) => {
              if (key === 'createdAt') return true // serverTimestamp is valid
              return value !== null && value !== undefined
            })
          )
          
          await setDoc(doc(db, 'users', lineId), validUser)
          user.value = newUser
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

  // Update user profile
  const updateUserProfile = async (userData) => {
    if (!user.value || !user.value.lineId) throw new Error('No user logged in')
    
    // Validate userData before updating
    const validUserData = Object.fromEntries(
      Object.entries(userData).filter(([key, value]) => {
        return value !== null && value !== undefined && value !== ''
      })
    )
    
    const userRef = doc(db, 'users', user.value.lineId)
    await updateDoc(userRef, {
      ...validUserData,
      isNewUser: false,
      updatedAt: serverTimestamp()
    })
    
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
  const COST_PER_BOOKING = 10

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
    
    // Check if user has enough points
    const currentPoints = await getUserPoints()
    if (currentPoints < COST_PER_BOOKING) throw new Error('เครดิตไม่พอ (ต้องมีอย่างน้อย 10 พอยต์)')
    
    // Check if class is full
    const classDoc = await getDoc(doc(db, 'classes', classId))
    if (!classDoc.exists()) throw new Error('Class not found')
    
    const classData = classDoc.data()
    if (classData.isFull || classData.bookedCount >= classData.capacity) {
      throw new Error('Class is full')
    }
    
    // Disallow duplicate booking for the same class (confirmed/pending)
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

    // Enforce booking window: can only book up to 1 day in advance (by calendar day)
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
    
    // Create booking with valid data
    const bookingData = {
      userId: user.value.lineId,
      classId: classId,
      status: 'confirmed',
      createdAt: serverTimestamp()
    }
    
    const bookingRef = await addDoc(collection(db, 'bookings'), bookingData)
    
    // Update class booked count
    await updateDoc(doc(db, 'classes', classId), {
      bookedCount: classData.bookedCount + 1,
      isFull: (classData.bookedCount + 1) >= classData.capacity
    })
    
    // Deduct points (wallet style)
    console.log('Deducting points for booking...')
    await updateUserPoints(user.value.lineId, -COST_PER_BOOKING, `จองคลาส ${classData.name}`)
    
    return bookingRef
  }

  const getUserBookings = async () => {
    // Return empty when user is not ready
    if (!user.value || !user.value.lineId) return []

    // Avoid composite index by removing orderBy here; we'll sort on client
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.value.lineId)
    )

    const snapshot = await getDocs(q)
    const bookings = []

    for (const bookingDoc of snapshot.docs) {
      const booking = { id: bookingDoc.id, ...bookingDoc.data() }

      // Get class data if classId exists
      if (booking.classId) {
        const classDoc = await getDoc(doc(db, 'classes', booking.classId))
        if (classDoc.exists()) {
          booking.classData = { id: classDoc.id, ...classDoc.data() }
        }
      }

      bookings.push(booking)
    }

    // Sort by createdAt desc on client
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
    
    console.log('Getting points history for user:', user.value.lineId)
    
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.lineId)
    )
    
    const snapshot = await getDocs(q)
    console.log('Firestore snapshot size:', snapshot.size)
    
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log('Raw transactions:', transactions)
    
    // Sort by createdAt desc on client side
    transactions.sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bMs - aMs
    })
    
    console.log('Sorted transactions:', transactions)
    return transactions
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
    addPointsToUser,
    getAllUsers,
    updateUserRole
  }
}
