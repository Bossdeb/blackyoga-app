import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
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
import { auth, db } from '../lib/firebase.js'

export function useFirebase() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Auth state listener with error handling
  onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          user.value = { ...firebaseUser, ...userDoc.data() }
        } else {
          // New user - create profile
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'member',
            points: 10, // Initial points
            createdAt: serverTimestamp(),
            isNewUser: true
          }
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
          user.value = newUser
        }
      } else {
        user.value = null
      }
    } catch (err) {
      console.error('Firebase auth error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  })

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const needsOnboarding = computed(() => user.value?.isNewUser || !user.value?.firstName || !user.value?.phone)

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (userData) => {
    if (!user.value?.uid) throw new Error('No user logged in')
    
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      ...userData,
      isNewUser: false,
      updatedAt: serverTimestamp()
    })
    
    // Update local user state
    user.value = { ...user.value, ...userData, isNewUser: false }
  }

  // Classes
  const createClass = async (classData) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const classRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      date: new Date(classData.date),
      createdAt: serverTimestamp(),
      bookedCount: 0,
      isFull: false
    })
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

  const updateClass = async (classId, updates) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const classRef = doc(db, 'classes', classId)
    await updateDoc(classRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  const deleteClass = async (classId) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    await deleteDoc(doc(db, 'classes', classId))
  }

  // Bookings
  const createBooking = async (classId) => {
    if (!user.value?.uid) throw new Error('No user logged in')
    
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
    
    // Create booking
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      userId: user.value.uid,
      classId,
      status: 'confirmed',
      createdAt: serverTimestamp()
    })
    
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
    if (!user.value?.uid) return []
    
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.value.uid),
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
    if (!user.value?.uid) throw new Error('No user logged in')
    
    const bookingRef = doc(db, 'bookings', bookingId)
    const bookingDoc = await getDoc(bookingRef)
    
    if (!bookingDoc.exists()) throw new Error('Booking not found')
    if (bookingDoc.data().userId !== user.value.uid) throw new Error('Not your booking')
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
    if (!user.value?.uid) throw new Error('No user logged in')
    
    await addDoc(collection(db, 'pointsTransactions'), {
      userId: user.value.uid,
      type,
      points,
      description,
      emoji: type === 'added' ? '💰' : '📅',
      createdAt: serverTimestamp()
    })
  }

  const getUserPoints = async () => {
    if (!user.value?.uid) return 0
    
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.uid)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.reduce((total, doc) => {
      const data = doc.data()
      return total + (data.type === 'added' ? data.points : -data.points)
    }, 0)
  }

  const getPointsHistory = async () => {
    if (!user.value?.uid) return []
    
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  // Admin functions
  const addPointsToUser = async (userId, points, description) => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    await addDoc(collection(db, 'pointsTransactions'), {
      userId,
      type: 'added',
      points,
      description: description || 'แอดมินเพิ่มเครดิต',
      emoji: '💰',
      createdAt: serverTimestamp()
    })
  }

  const getAllUsers = async () => {
    if (!isAdmin.value) throw new Error('Admin access required')
    
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    needsOnboarding,
    signInWithGoogle,
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
    getAllUsers
  }
}
