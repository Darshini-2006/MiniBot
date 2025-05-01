import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  getDoc,
  updateDoc, 
  query, 
  orderBy,
  arrayUnion
} from 'firebase/firestore';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCbjIdJB2Z9-u5WbeVMZxyKbkcsk0pRWnk",
  authDomain: "minibot-7d488.firebaseapp.com",
  projectId: "minibot-7d488",
  storageBucket: "minibot-7d488.appspot.com",
  messagingSenderId: "271055495571",
  appId: "1:271055495571:web:f4cbb392521568415d4866"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export Firebase authentication services and Firestore utilities
export { 
  auth,             // Authentication object
  provider,         // Google Auth Provider for login
  signInWithPopup,  // Function to sign in with Google popup
  signOut,          // Function to sign out
  db,               // Firestore database object
  collection,       // Collection reference
  doc,              // Document reference
  setDoc,           // Function to set document data
  addDoc,           // Function to add document data
  getDocs,          // Function to get multiple documents
  getDoc,           // Function to get a single document
  updateDoc,        // Function to update document data
  query,            // Function to create Firestore queries
  orderBy,          // Function to order Firestore queries
  arrayUnion        // ArrayUnion function to update array fields
};
