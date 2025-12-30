import { initializeApp } from "firebase/app"

// TODO: Replace with your Firebase project config
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyA9pUBrGUDb77r0LuJ-BLweoTAN6f8e5RA",
  authDomain: "ll-fullstack-react.firebaseapp.com",
  projectId: "ll-fullstack-react",
  storageBucket: "ll-fullstack-react.firebasestorage.app",
  messagingSenderId: "910886681467",
  appId: "1:910886681467:web:64b1f9002a6023ff395bde",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export default app
