import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAfp5qCdFiNSrSCIYLmWS2kqe3xdkvVXs4",
    authDomain: "blackfitness-5f727.firebaseapp.com",
    projectId: "blackfitness-5f727",
    storageBucket: "blackfitness-5f727.firebasestorage.app",
    messagingSenderId: "86036027396",
    appId: "1:86036027396:web:b685645ad6fa711c34fd51",
    measurementId: "G-5V9J8ZFZHY"
  };

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
