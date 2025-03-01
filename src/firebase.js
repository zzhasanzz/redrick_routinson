import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { collection, doc, setDoc } from "firebase/firestore";


// const firebaseConfig = {
//   apiKey: "AIzaSyBCd9S0rvxs8i2hKZ3iNj_ILHeCIMk5ARc",
//   authDomain: "demo2-f1c97.firebaseapp.com",
//   projectId: "demo2-f1c97",
//   storageBucket: "demo2-f1c97.firebasestorage.app",
//   messagingSenderId: "561462620151",
//   appId: "1:561462620151:web:be1c0090915bbc9fc108f2",
//   measurementId: "G-BWJ3DYHWJB"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDCosrkaHw0gNZAVO4XBiAPP94_XPN3BME",
  authDomain: "redrickroutinson.firebaseapp.com",
  projectId: "redrickroutinson",
  storageBucket: "redrickroutinson.firebasestorage.app",
  messagingSenderId: "22132766859",
  appId: "1:22132766859:web:f13a268ecd5dac634cfc8e"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const db = getFirestore()

export { collection, doc, setDoc };
