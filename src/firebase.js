import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCd9S0rvxs8i2hKZ3iNj_ILHeCIMk5ARc",
  authDomain: "demo2-f1c97.firebaseapp.com",
  projectId: "demo2-f1c97",
  storageBucket: "demo2-f1c97.firebasestorage.app",
  messagingSenderId: "561462620151",
  appId: "1:561462620151:web:a1561cf854b0fff0c108f2",
  measurementId: "G-46L04PSRHD"
};

// // 2nd Demo Project
// const firebaseConfig = {
//   apiKey: "AIzaSyDVAZFRD3LdV3ZBFWJQozlVOWaRkEoEDxM",
//   authDomain: "fir-6561e.firebaseapp.com",
//   projectId: "fir-6561e",
//   storageBucket: "fir-6561e.firebasestorage.app",
//   messagingSenderId: "982148730376",
//   appId: "1:982148730376:web:3476ef0855d3259ad2cbbd",
//   measurementId: "G-X4JS0HCEH5",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const db = getFirestore();

export { collection, doc, setDoc };
