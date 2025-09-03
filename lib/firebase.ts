
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
  apiKey: "AIzaSyAfmx0tyuqmnKVv5Jk55Dh4et_vQ5ZjISA",
  authDomain: "fonoayuda.firebaseapp.com",
  projectId: "fonoayuda",
  storageBucket: "fonoayuda.appspot.com",
  messagingSenderId: "736718604348",
  appId: "1:736718604348:web:e58105d3264b07fc4a9b39"
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();


// Set session persistence to avoid issues with redirects on mobile browsers
if (typeof window !== 'undefined') {
    setPersistence(auth, browserSessionPersistence).catch((error) => {
        console.error("Error setting session persistence:", error);
    });
}

export { app, auth, db, functions, googleProvider };
