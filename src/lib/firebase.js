import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCOcGz-aYwtPTKe4HvK36mOrb-8HhkXEhQ",
  authDomain: "prode2026-ed283.firebaseapp.com",
  projectId: "prode2026-ed283",
  storageBucket: "prode2026-ed283.firebasestorage.app",
  messagingSenderId: "589779172002",
  appId: "1:589779172002:web:a97537e7b6eb86f87675fb"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
