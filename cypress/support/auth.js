import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth"

// Firebase config (matches frontend/src/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyA9pUBrGUDb77r0LuJ-BLweoTAN6f8e5RA",
  authDomain: "ll-fullstack-react.firebaseapp.com",
  projectId: "ll-fullstack-react",
  storageBucket: "ll-fullstack-react.firebasestorage.app",
  messagingSenderId: "910886681467",
  appId: "1:910886681467:web:64b1f9002a6023ff395bde",
}

let app
let auth

function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp()
    auth = initializeAuth(firebaseApp, {
      persistence: indexedDBLocalPersistence,
    })
  }
  return auth
}

export function signInProgrammatically({ email, password }) {
  const auth = getFirebaseAuth()

  return signInWithEmailAndPassword(auth, email, password).catch((error) => {
    console.error("Firebase auth error - User could not sign in programmatically:", error)
    throw error
  })
}
