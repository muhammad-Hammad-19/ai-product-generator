// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyOdiygydaSrTQ4-vOa1Q4cD7TkzbGI3w",
  authDomain: "ai-product-generator-51a28.firebaseapp.com",
  projectId: "ai-product-generator-51a28",
  storageBucket: "ai-product-generator-51a28.firebasestorage.app",
  messagingSenderId: "864184668702",
  appId: "1:864184668702:web:55b26bde522c71b815540f",
  measurementId: "G-KYMFME669Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
