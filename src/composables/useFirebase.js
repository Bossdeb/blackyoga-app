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
  deleteDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { isInLineApp, isLiffAvailable } from '../config/liff.js'

export function useFirebase() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Initialize LINE LIFF and get user data
  const initializeLiff = async () => {
    try {
      if (!isLiffAvailable()) {
        console.log('LIFF not available, skipping initialization')
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
        } else {
          // New user - create profile with valid data
          const newUser = {
            lineId: lineId,
            displayName: profile.displayName || '',
            pictureUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
            role: 'member',
            points: 10, // Initial points
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
        }
      } else {
        // Not logged in - redirect to LINE login
        window.liff.login()
        return
      }
    } catch (err) {
      console.error('LIFF initialization error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
    // For demo purposes, make the demo user an admin
    if (user.value?.id === 'demo-user-001') return true
    return user.value?.role === 'admin'
  })
  const needsOnboarding = computed(() => user.value?.isNewUser || !user.value?.firstName || !user.value?.phone)

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
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (userData) => {
    if (!user.value?.lineId) throw new Error('No user logged in')
    
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
    // If demo user, return demo classes
    if (user.value?.id === 'demo-user-001') {
      return [
        {
          id: 'demo-class-1',
          name: 'Hatha Yoga',
          teacher: 'ครูสมใจ',
          startTime: '09:00',
          endTime: '10:00',
          date: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
          description: 'คลาสโยคะเบื้องต้นสำหรับผู้เริ่มต้น',
          emoji: '🧘‍♀️',
          capacity: 10,
          bookedCount: 3,
          isFull: false,
          durationMinutes: 60
        },
        {
          id: 'demo-class-2',
          name: 'Vinyasa Flow',
          teacher: 'ครูสมหญิง',
          startTime: '18:00',
          endTime: '19:00',
          date: { toDate: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
          description: 'คลาสโยคะแบบไหลลื่นสำหรับระดับกลาง',
          emoji: '🌊',
          capacity: 8,
          bookedCount: 5,
          isFull: false,
          durationMinutes: 60
        }
      ]
    }
    
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
  const createBooking = async (classId) => {
    if (!user.value?.lineId) throw new Error('No user logged in')
    
    // Check if user has enough points
    const currentPoints = await getUserPoints()
    if (currentPoints < 1) throw new Error('Not enough points')
    
    // Check if class is full
    const classDoc = await getDoc(doc(db, 'classes', classId))
    if (!classDoc.exists()) throw new Error('Class not found')
    
    const classData = classDoc.data()
    if (classData.isFull || classData.bookedCount >= classData.capacity) {
      throw new Error('Class is full')
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
    
    // Deduct points
    await addPointsTransaction('used', 1, `จองคลาส ${classData.name}`)
    
    return bookingRef
  }

  const getUserBookings = async () => {
    if (!user.value?.lineId) return []
    
    // If demo user, return demo bookings
    if (user.value?.id === 'demo-user-001') {
      return [
        {
          id: 'demo-booking-1',
          userId: 'demo-user-001',
          classId: 'demo-class-1',
          status: 'confirmed',
          createdAt: { toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          classData: {
            id: 'demo-class-1',
            name: 'Hatha Yoga',
            teacher: 'ครูสมใจ',
            startTime: '09:00',
            endTime: '10:00',
            date: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
            emoji: '🧘‍♀️',
            capacity: 10,
            bookedCount: 3
          }
        }
      ]
    }
    
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.value.lineId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const bookings = []
    
    for (const bookingDoc of snapshot.docs) {
      const booking = { id: bookingDoc.id, ...bookingDoc.data() }
      
      // Get class data
      const classDoc = await getDoc(doc(db, 'classes', booking.classId))
      if (classDoc.exists()) {
        booking.classData = { id: classDoc.id, ...classDoc.data() }
      }
      
      bookings.push(booking)
    }
    
    return bookings
  }

  const cancelBooking = async (bookingId) => {
    if (!user.value?.lineId) throw new Error('No user logged in')
    
    const bookingRef = doc(db, 'bookings', bookingId)
    const bookingDoc = await getDoc(bookingRef)
    
    if (!bookingDoc.exists()) throw new Error('Booking not found')
    if (bookingDoc.data().userId !== user.value.lineId) throw new Error('Not your booking')
    if (bookingDoc.data().status === 'cancelled') throw new Error('Already cancelled')
    
    // Update booking status
    await updateDoc(bookingRef, { status: 'cancelled' })
    
    // Get class data for refund
    const classDoc = await getDoc(doc(db, 'classes', bookingDoc.data().classId))
    if (classDoc.exists()) {
      const classData = classDoc.data()
      
      // Update class booked count
      await updateDoc(doc(db, 'classes', bookingDoc.data().classId), {
        bookedCount: Math.max(0, classData.bookedCount - 1),
        isFull: false
      })
      
      // Refund points
      await addPointsTransaction('added', 1, `คืนเครดิตจากการยกเลิกคลาส ${classData.name}`)
    }
  }

  // Points
  const addPointsTransaction = async (type, points, description) => {
    if (!user.value?.lineId) throw new Error('No user logged in')
    
    const transactionData = {
      userId: user.value.lineId,
      type: type,
      points: parseInt(points) || 0,
      description: description || '',
      emoji: type === 'added' ? '💰' : '📅',
      createdAt: serverTimestamp()
    }
    
    await addDoc(collection(db, 'pointsTransactions'), transactionData)
  }

  const getUserPoints = async () => {
    if (!user.value?.lineId) return 0
    
    // If demo user, return demo points
    if (user.value?.id === 'demo-user-001') {
      return 10
    }
    
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.lineId)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.reduce((total, doc) => {
      const data = doc.data()
      return total + (data.type === 'added' ? data.points : -data.points)
    }, 0)
  }

  const getPointsHistory = async () => {
    if (!user.value?.lineId) return []
    
    // If demo user, return demo history
    if (user.value?.id === 'demo-user-001') {
      return [
        {
          id: 'demo-tx-1',
          type: 'added',
          points: 10,
          description: 'สมาชิกใหม่',
          emoji: '💰',
          createdAt: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      ]
    }
    
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.lineId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  // Admin functions
  const addPointsToUser = async (userId, points, description) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const transactionData = {
      userId: userId,
      type: 'added',
      points: parseInt(points) || 0,
      description: description || 'แอดมินเพิ่มเครดิต',
      emoji: '💰',
      createdAt: serverTimestamp()
    }
    
    await addDoc(collection(db, 'pointsTransactions'), transactionData)
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
    
    // If demo user, return demo data
    if (user.value?.id === 'demo-user-001') {
      return [
        {
          id: 'demo-user-001',
          lineId: 'demo-user-001',
          displayName: 'Demo Admin',
          role: 'admin',
          points: 150
        },
        {
          id: 'demo-user-002',
          lineId: 'demo-user-002',
          displayName: 'สมชาย ใจดี',
          role: 'member',
          points: 25
        },
        {
          id: 'demo-user-003',
          lineId: 'demo-user-003',
          displayName: 'สมหญิง สวยใส',
          role: 'member',
          points: 8
        }
      ]
    }
    
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  // Initialize on mount
  const init = async () => {
    if (isInLineApp()) {
      await initializeLiff()
    } else {
      console.log('Not in LINE app, using demo user')
      // Set demo user for non-LINE environments
      user.value = {
        lineId: 'demo-user-001',
        id: 'demo-user-001',
        displayName: 'Demo Admin',
        pictureUrl: '',
        statusMessage: '',
        role: 'admin',
        points: 10,
        isNewUser: false,
        nickname: 'Demo',
        firstName: 'Demo',
        lastName: 'Admin',
        phone: '0800000000'
      }
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
    deleteClass,
    createBooking,
    getUserBookings,
    cancelBooking,
    getUserPoints,
    getPointsHistory,
    addPointsToUser,
    getAllUsers,
    updateUserRole
  }
}
