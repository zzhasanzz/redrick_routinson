import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { collection, doc, setDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDVAZFRD3LdV3ZBFWJQozlVOWaRkEoEDxM",
  authDomain: "fir-6561e.firebaseapp.com",
  projectId: "fir-6561e",
  storageBucket: "fir-6561e.firebasestorage.app",
  messagingSenderId: "982148730376",
  appId: "1:982148730376:web:3476ef0855d3259ad2cbbd",
  measurementId: "G-X4JS0HCEH5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const db = getFirestore()

export { collection, doc, setDoc };
